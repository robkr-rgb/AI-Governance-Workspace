import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { z } from 'zod'
import type { Agent, AgentCapabilityGrant, AppData, Channel } from '../src/shared/types.ts'
import { id, latestInstructions, loadData, saveData, seedData } from './data.ts'
import { runAgentTurn, runEval } from './runtime.ts'
import { addSecret } from './vault.ts'

const app = express()
const port = Number(process.env.PORT || 8787)

const channels = ['chat', 'email', 'sms', 'slack', 'teams', 'api', 'webhook', 'schedule'] as const

app.use(cors())
app.use(express.json({ limit: '1mb' }))

const asyncRoute =
  (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next)
  }

const chatSchema = z.object({
  message: z.string().min(1),
  channel: z.enum(channels).default('chat'),
})

const instructionSchema = z.object({
  body: z.string().min(20),
  summary: z.string().min(1).default('Manual instruction update'),
  author: z.enum(['user', 'agent']).default('user'),
  approved: z.boolean().default(true),
})

const capabilitySchema = z.object({
  status: z.enum(['enabled', 'disabled', 'requested']),
})

const secretSchema = z.object({
  provider: z.string().min(2),
  scope: z.enum(['workspace', 'team', 'agent']),
  scopeId: z.string().min(2),
  value: z.string().min(4),
})

const createAgentSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  description: z.string().min(5),
  teamId: z.string().min(2),
})

app.get(
  '/api/health',
  asyncRoute(async (_req, res) => {
    res.json({ ok: true, service: 'abundly-refactor-api' })
  }),
)

app.get(
  '/api/state',
  asyncRoute(async (_req, res) => {
    res.json(await loadData())
  }),
)

app.post(
  '/api/reset',
  asyncRoute(async (_req, res) => {
    const data = seedData()
    await saveData(data)
    res.json(data)
  }),
)

app.post(
  '/api/agents',
  asyncRoute(async (req, res) => {
    const input = createAgentSchema.parse(req.body)
    const data = await loadData()
    const now = new Date().toISOString()
    const capabilities: AgentCapabilityGrant[] = ['web_search', 'send_email', 'update_instructions'].map(
      (capabilityId) => ({
        capabilityId,
        status: capabilityId === 'send_email' ? 'disabled' : 'enabled',
        guardrails: {
          emailDomains: ['example.com'],
          outsideEmailMode: 'approve',
          httpMode: 'approve',
          smsMode: 'block',
        },
      }),
    )

    const agent: Agent = {
      id: id('agt'),
      name: input.name,
      avatar: input.name.slice(0, 1).toUpperCase(),
      role: input.role,
      description: input.description,
      status: 'active',
      teamId: input.teamId,
      ownerUserId: 'usr_rob',
      dailyCreditLimit: 500,
      creditsUsedToday: 0,
      modelPrefs: Object.fromEntries(channels.map((channel) => [channel, 'Claude Sonnet Latest'])) as Record<
        Channel,
        string
      >,
      thinkingMode: true,
      discoverability: 'team',
      capabilities,
      instructions: [
        {
          id: id('inst'),
          version: 1,
          body: `You are ${input.name}. Work inside the governed runtime. Ask for missing capabilities, avoid unsafe side effects and keep concise audit-friendly notes.`,
          author: 'user',
          approved: true,
          createdAt: now,
          summary: 'Created through local prototype UI',
        },
      ],
      documents: [],
      schedules: [],
      diary: [],
      tags: ['custom'],
    }

    data.agents.unshift(agent)
    data.messages.push({
      id: id('msg'),
      agentId: agent.id,
      role: 'assistant',
      channel: 'chat',
      content: `${agent.name} created. Enable capabilities before assigning real work.`,
      createdAt: now,
    })
    await saveData(data)
    res.json(data)
  }),
)

app.patch(
  '/api/agents/:agentId',
  asyncRoute(async (req, res) => {
    const data = await loadData()
    const agent = findAgent(data, routeParam(req, 'agentId'))
    const update = z
      .object({
        status: z.enum(['active', 'paused', 'blocked']).optional(),
        dailyCreditLimit: z.number().min(0).optional(),
        thinkingMode: z.boolean().optional(),
      })
      .parse(req.body)
    Object.assign(agent, update)
    await saveData(data)
    res.json(data)
  }),
)

app.post(
  '/api/agents/:agentId/chat',
  asyncRoute(async (req, res) => {
    const data = await loadData()
    const input = chatSchema.parse(req.body)
    const result = runAgentTurn(data, routeParam(req, 'agentId'), input)
    await saveData(data)
    res.json({ data, ...result })
  }),
)

app.post(
  '/api/agents/:agentId/instructions',
  asyncRoute(async (req, res) => {
    const data = await loadData()
    const agent = findAgent(data, routeParam(req, 'agentId'))
    const input = instructionSchema.parse(req.body)
    const latest = latestInstructions(agent)
    agent.instructions.unshift({
      id: id('inst'),
      version: latest.version + 1,
      body: input.body,
      author: input.author,
      approved: input.approved,
      createdAt: new Date().toISOString(),
      summary: input.summary,
    })
    await saveData(data)
    res.json(data)
  }),
)

app.post(
  '/api/agents/:agentId/capabilities/:capabilityId',
  asyncRoute(async (req, res) => {
    const data = await loadData()
    const agent = findAgent(data, routeParam(req, 'agentId'))
    const input = capabilitySchema.parse(req.body)
    const capabilityId = routeParam(req, 'capabilityId')
    const grant = agent.capabilities.find((item) => item.capabilityId === capabilityId)
    if (!grant) {
      agent.capabilities.push({
        capabilityId,
        status: input.status,
        guardrails: {
          emailDomains: ['example.com'],
          outsideEmailMode: 'approve',
          httpMode: 'approve',
          smsMode: 'block',
        },
      })
    } else {
      grant.status = input.status
      delete grant.requestedReason
    }
    await saveData(data)
    res.json(data)
  }),
)

app.post(
  '/api/secrets',
  asyncRoute(async (req, res) => {
    const data = await loadData()
    const input = secretSchema.parse(req.body)
    addSecret(data, input)
    await saveData(data)
    res.json(data)
  }),
)

app.post(
  '/api/evals/:evalId/run',
  asyncRoute(async (req, res) => {
    const data = await loadData()
    const run = runEval(data, routeParam(req, 'evalId'))
    await saveData(data)
    res.json({ data, run })
  }),
)

app.post(
  '/api/approvals/:approvalId/resolve',
  asyncRoute(async (req, res) => {
    const data = await loadData()
    const approval = data.approvals.find((item) => item.id === routeParam(req, 'approvalId'))
    if (!approval) {
      res.status(404).json({ error: 'Approval not found' })
      return
    }
    const input = z.object({ status: z.enum(['approved', 'denied']) }).parse(req.body)
    approval.status = input.status
    approval.resolvedAt = new Date().toISOString()
    data.auditLogs.unshift({
      id: id('audit'),
      traceId: approval.traceId,
      agentId: approval.agentId,
      actor: 'usr_rob',
      event: `approval.${input.status}`,
      channel: 'api',
      detail: `${approval.toolName} approval ${input.status}. This prototype records the decision; production would resume a durable workflow.`,
      createdAt: new Date().toISOString(),
      credits: 0,
    })
    await saveData(data)
    res.json(data)
  }),
)

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  void _next
  res.status(400).json({ error: error.message })
})

app.listen(port, () => {
  console.log(`Abundly refactor API listening on http://localhost:${port}`)
})

function routeParam(req: Request, name: string) {
  const value = req.params[name]
  if (Array.isArray(value)) {
    if (!value[0]) {
      throw new Error(`Missing route parameter ${name}`)
    }
    return value[0]
  }
  if (!value) {
    throw new Error(`Missing route parameter ${name}`)
  }
  return value
}

function findAgent(data: AppData, agentId: string) {
  const agent = data.agents.find((item) => item.id === agentId)
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`)
  }
  return agent
}
