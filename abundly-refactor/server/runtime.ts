import type {
  AppData,
  ApprovalRequest,
  AuditLog,
  Channel,
  ChatRequest,
  EvalRun,
  Message,
  RuntimeStage,
  RuntimeTrace,
  ToolCallPlan,
} from '../src/shared/types.ts'
import { id, latestInstructions } from './data.ts'
import { credentialInjectionSummary } from './vault.ts'

const untrustedChannels: Channel[] = ['email', 'sms', 'api', 'webhook']

const attackPatterns = [
  'ignore previous',
  'system prompt',
  'developer message',
  'jailbreak',
  'exfiltrate',
  'send secrets',
  'bypass',
  'reveal credentials',
]

export function runAgentTurn(
  data: AppData,
  agentId: string,
  request: ChatRequest,
  actor = 'usr_rob',
) {
  const agent = data.agents.find((item) => item.id === agentId)
  if (!agent) {
    throw new Error(`Agent ${agentId} not found`)
  }

  const now = new Date().toISOString()
  const traceId = id('trace')
  const stages: RuntimeStage[] = []
  const plan: ToolCallPlan[] = []

  const userMessage: Message = {
    id: id('msg'),
    agentId,
    role: 'user',
    channel: request.channel,
    content: request.message,
    createdAt: now,
    traceId,
  }
  data.messages.push(userMessage)

  const attackScore = scoreAttack(request.message, request.channel)
  if (untrustedChannels.includes(request.channel)) {
    stages.push({
      id: id('stage'),
      name: 'Attack detection',
      status: attackScore >= 70 ? 'blocked' : 'passed',
      detail:
        attackScore >= 70
          ? `Blocked before context assembly. Risk score ${attackScore}/100 from isolated detector.`
          : `Untrusted ${request.channel} screened in isolated context. Risk score ${attackScore}/100.`,
      reliability: 74,
    })
  } else {
    stages.push({
      id: id('stage'),
      name: 'Attack detection',
      status: 'skipped',
      detail: `Skipped for trusted ${request.channel} turn. Authenticated sources still go through tool guardrails.`,
      reliability: 86,
    })
  }

  if (attackScore >= 70 && untrustedChannels.includes(request.channel)) {
    const trace = finishTrace(data, agentId, request.channel, traceId, attackScore, true, plan, stages, 2)
    const assistantMessage = appendAssistant(
      data,
      agentId,
      request.channel,
      traceId,
      `Blocked by the security pipeline before I could read this as agent context. Reason: suspected prompt injection or data exfiltration attempt.`,
    )
    appendAudit(data, trace, actor, 'security.blocked', 'Attack detector blocked untrusted input.')
    return { trace, assistantMessage }
  }

  const instructions = latestInstructions(agent)
  stages.push({
    id: id('stage'),
    name: 'Context assembly',
    status: 'passed',
    detail: `Loaded instruction v${instructions.version}, ${agent.documents.filter((doc) => doc.visibility === 'Full').length} full documents and ${agent.documents.filter((doc) => doc.visibility === 'Summary').length} summary documents. Credentials excluded.`,
    reliability: 91,
  })

  plan.push(...inferToolPlans(data, agentId, request.message))
  stages.push({
    id: id('stage'),
    name: 'LLM planning',
    status: 'passed',
    detail:
      plan.length === 0
        ? 'Deterministic local LLM simulator produced a direct response with no tool calls.'
        : `Deterministic local LLM simulator proposed ${plan.length} tool call(s): ${plan.map((item) => item.toolName).join(', ')}.`,
    reliability: 65,
  })

  const executionSummaries: string[] = []
  let credits = estimateRuntimeCredits(request.message, request.channel)

  for (const call of plan) {
    const capability = data.capabilityCatalog.find((item) => item.id === call.capabilityId)
    const grant = agent.capabilities.find((item) => item.capabilityId === call.capabilityId)

    if (!capability || !grant || grant.status !== 'enabled') {
      stages.push({
        id: id('stage'),
        name: `Capability request: ${call.capabilityId}`,
        status: 'pending-approval',
        detail: `Agent needs ${call.capabilityId}, but it is not enabled. An on-demand capability request is now visible in the capability panel.`,
        reliability: 88,
      })
      if (grant) {
        grant.status = 'requested'
        grant.requestedReason = call.intent
      } else {
        agent.capabilities.push({
          capabilityId: call.capabilityId,
          status: 'requested',
          requestedReason: call.intent,
          guardrails: {
            emailDomains: ['example.com'],
            outsideEmailMode: 'approve',
            httpMode: 'approve',
            smsMode: 'block',
          },
        })
      }
      continue
    }

    const guardrail = guardrailCheck(call, grant.guardrails)
    stages.push({
      id: id('stage'),
      name: `Guardrail: ${call.toolName}`,
      status: guardrail.status,
      detail: guardrail.detail,
      reliability: guardrail.reliability,
    })

    if (guardrail.status === 'blocked') {
      executionSummaries.push(`${call.toolName} blocked by code-level guardrail`)
      continue
    }

    if (guardrail.status === 'pending-approval') {
      const approval = createApproval(data, agentId, traceId, call.toolName, guardrail.detail)
      executionSummaries.push(`${call.toolName} parked for approval ${approval.id}`)
      continue
    }

    const provider = providerForCapability(call.capabilityId)
    const injection =
      capability.authType === 'none' || capability.authType === 'platform'
        ? {
            available: true,
            detail:
              capability.authType === 'platform'
                ? `${capability.name} uses platform credentials. No secret was sent to the planning context.`
                : `${capability.name} does not require credentials.`,
          }
        : credentialInjectionSummary(data, provider, agentId)

    stages.push({
      id: id('stage'),
      name: `Credential injection: ${capability.name}`,
      status: injection.available ? 'passed' : 'blocked',
      detail: injection.detail,
      reliability: 86,
    })

    if (!injection.available) {
      executionSummaries.push(`${call.toolName} skipped because ${provider} credentials are missing`)
      continue
    }

    const dispatchDetail = dispatchTool(call)
    stages.push({
      id: id('stage'),
      name: `Tool dispatch: ${call.toolName}`,
      status: 'executed',
      detail: dispatchDetail,
      reliability: 70,
    })
    executionSummaries.push(dispatchDetail)
    credits += capability.creditCost
  }

  const content = composeAssistantResponse(agent.name, request.message, executionSummaries, plan.length)
  const assistantMessage = appendAssistant(data, agentId, request.channel, traceId, content)
  const trace = finishTrace(data, agentId, request.channel, traceId, attackScore, false, plan, stages, credits)
  appendAudit(data, trace, actor, 'agent.turn.completed', summarizeAudit(trace, executionSummaries))
  appendCredit(data, agentId, 'runtime', credits)
  agent.creditsUsedToday += credits

  const team = data.teams.find((item) => item.id === agent.teamId)
  if (team) {
    team.monthlyCreditsUsed += credits
  }
  data.workspace.monthlyCreditsUsed += credits

  return { trace, assistantMessage }
}

export function runEval(data: AppData, evalId: string) {
  const definition = data.evals.find((item) => item.id === evalId)
  if (!definition) {
    throw new Error(`Eval ${evalId} not found`)
  }

  const channel: Channel = definition.id.includes('prompt_injection') ? 'email' : 'chat'
  const { trace } = runAgentTurn(
    data,
    definition.agentId,
    { message: definition.triggerPrompt, channel },
    'eval-runner',
  )

  const executedTools = trace.stages
    .filter((stage) => stage.name.startsWith('Tool dispatch') && stage.status === 'executed')
    .map((stage) => stage.name.replace('Tool dispatch: ', ''))

  const missingRequired = definition.validation.mustCall.filter((tool) => !executedTools.includes(tool))
  const forbiddenUsed = definition.validation.mustNotCall.filter((tool) => executedTools.includes(tool))
  const passed =
    missingRequired.length === 0 &&
    forbiddenUsed.length === 0 &&
    (!definition.id.includes('prompt_injection') || trace.blocked)

  const run: EvalRun = {
    id: id('evalrun'),
    evalId,
    agentId: definition.agentId,
    status: passed ? 'passed' : 'failed',
    score: passed ? 100 : Math.max(0, 60 - missingRequired.length * 20 - forbiddenUsed.length * 20),
    reasoning: passed
      ? `Passed. Expected behavior: ${definition.expected}`
      : `Failed. Missing required tools: ${missingRequired.join(', ') || 'none'}. Forbidden executed tools: ${forbiddenUsed.join(', ') || 'none'}.`,
    traceId: trace.id,
    createdAt: new Date().toISOString(),
  }
  data.evalRuns.unshift(run)
  appendCredit(data, definition.agentId, 'grader', 4)
  return run
}

function scoreAttack(message: string, channel: Channel) {
  const lowered = message.toLowerCase()
  const hits = attackPatterns.filter((pattern) => lowered.includes(pattern)).length
  const channelRisk = untrustedChannels.includes(channel) ? 20 : 0
  return Math.min(100, channelRisk + hits * 35)
}

function inferToolPlans(data: AppData, agentId: string, message: string): ToolCallPlan[] {
  const lowered = message.toLowerCase()
  const plans: ToolCallPlan[] = []

  const add = (capabilityId: string, toolName: string, intent: string, args: Record<string, string | number | boolean>) => {
    const capability = data.capabilityCatalog.find((item) => item.id === capabilityId)
    plans.push({
      id: id('call'),
      capabilityId,
      toolName,
      intent,
      args,
      risk: capability?.risk || 'read',
    })
  }

  if (/(research|search|find|latest|screen|evaluate)/.test(lowered)) {
    add('web_search', 'search_web', 'Gather external evidence before answering', {
      query: message.slice(0, 180),
    })
  }

  if (/(email|mail|send to|notify)/.test(lowered)) {
    add('send_email', 'send_email', 'Communicate result to a recipient', {
      to: extractEmail(message) || 'stakeholder@example.com',
      subject: 'Agent update',
    })
  }

  if (/(http|api|webhook|cursor)/.test(lowered)) {
    add(
      lowered.includes('cursor') ? 'cursor_api' : 'http_request',
      lowered.includes('cursor') ? 'cursor_launch_agent' : 'http_request',
      'Call an external API after approval and credential injection',
      { endpoint: lowered.includes('cursor') ? 'https://api.cursor.com/agents' : 'https://api.example.com/run' },
    )
  }

  if (/(slack|channel|#dev)/.test(lowered)) {
    add('slack', 'post_slack_message', 'Post a governed collaboration update', {
      channel: '#dev',
    })
  }

  if (/(instruction|improve yourself|retro|remember)/.test(lowered)) {
    add('update_instructions', 'update_instructions', 'Propose an instruction update based on feedback', {
      mode: 'proposal',
    })
  }

  if (/(database|record|ticket|errand|kanban)/.test(lowered)) {
    add('agent_database', 'write_agent_db', 'Write structured agent-owned memory', {
      agentId,
      collection: 'Agent records',
    })
  }

  return dedupePlans(plans)
}

function dedupePlans(plans: ToolCallPlan[]) {
  const seen = new Set<string>()
  return plans.filter((plan) => {
    const key = `${plan.capabilityId}:${plan.toolName}`
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function extractEmail(message: string) {
  return message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
}

function guardrailCheck(call: ToolCallPlan, guardrails: { emailDomains: string[]; outsideEmailMode: string; httpMode: string; smsMode: string }) {
  if (call.toolName === 'send_email') {
    const recipient = String(call.args.to || '')
    const domain = recipient.split('@')[1] || ''
    const isAllowed = guardrails.emailDomains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`))

    if (!isAllowed && guardrails.outsideEmailMode === 'block') {
      return {
        status: 'blocked' as const,
        detail: `Recipient ${recipient} is outside the allow-list. Code-level policy blocked the send.`,
        reliability: 92,
      }
    }

    if (!isAllowed && guardrails.outsideEmailMode === 'approve') {
      return {
        status: 'pending-approval' as const,
        detail: `Recipient ${recipient} is outside the allow-list. Human approval required before SMTP dispatch.`,
        reliability: 92,
      }
    }
  }

  if ((call.toolName === 'http_request' || call.toolName === 'cursor_launch_agent') && guardrails.httpMode === 'approve') {
    return {
      status: 'pending-approval' as const,
      detail: `${call.toolName} is configured for approval before external HTTP side effects.`,
      reliability: 88,
    }
  }

  return {
    status: 'passed' as const,
    detail: `${call.toolName} allowed by current capability guardrails.`,
    reliability: 88,
  }
}

function providerForCapability(capabilityId: string) {
  const providers: Record<string, string> = {
    github: 'github',
    slack: 'slack',
    cursor_api: 'cursor_api',
    http_request: 'http_request',
    mcp_client: 'mcp_client',
  }
  return providers[capabilityId] || capabilityId
}

function dispatchTool(call: ToolCallPlan) {
  if (call.toolName === 'search_web') {
    return `search_web executed against query "${String(call.args.query).slice(0, 80)}" and returned a governed research summary.`
  }

  if (call.toolName === 'send_email') {
    return `send_email dispatched to ${String(call.args.to)} after policy checks.`
  }

  if (call.toolName === 'update_instructions') {
    return 'update_instructions created a proposal. Owner approval is required before it becomes an instruction version.'
  }

  if (call.toolName === 'write_agent_db') {
    return 'write_agent_db wrote a structured record to the agent-owned JSON database.'
  }

  return `${call.toolName} executed in simulated adapter mode. Replace this adapter with the real vendor API before production.`
}

function estimateRuntimeCredits(message: string, channel: Channel) {
  const base = Math.max(2, Math.ceil(message.length / 80))
  return base + (untrustedChannels.includes(channel) ? 2 : 0)
}

function composeAssistantResponse(agentName: string, message: string, executionSummaries: string[], planLength: number) {
  if (executionSummaries.length === 0 && planLength > 0) {
    return `${agentName}: I planned the requested action, but execution is waiting on capability enablement, approval or credentials. The trace shows the blocked step.`
  }

  if (executionSummaries.length === 0) {
    return `${agentName}: I can handle this as a governed chat response. No tool call was necessary for: "${message.slice(0, 140)}".`
  }

  return `${agentName}: Completed the turn through the governed runtime. ${executionSummaries.join(' ')}`
}

function appendAssistant(data: AppData, agentId: string, channel: Channel, traceId: string, content: string): Message {
  const assistantMessage: Message = {
    id: id('msg'),
    agentId,
    role: 'assistant',
    channel,
    content,
    createdAt: new Date().toISOString(),
    traceId,
  }
  data.messages.push(assistantMessage)
  return assistantMessage
}

function finishTrace(
  data: AppData,
  agentId: string,
  channel: Channel,
  traceId: string,
  attackScore: number,
  blocked: boolean,
  plan: ToolCallPlan[],
  stages: RuntimeStage[],
  credits: number,
): RuntimeTrace {
  const trace: RuntimeTrace = {
    id: traceId,
    agentId,
    channel,
    createdAt: new Date().toISOString(),
    attackScore,
    blocked,
    plan,
    stages,
    credits,
  }
  data.traces.unshift(trace)
  return trace
}

function createApproval(data: AppData, agentId: string, traceId: string, toolName: string, reason: string): ApprovalRequest {
  const approval: ApprovalRequest = {
    id: id('apr'),
    agentId,
    traceId,
    toolName,
    reason,
    status: 'open',
    createdAt: new Date().toISOString(),
  }
  data.approvals.unshift(approval)
  return approval
}

function appendAudit(data: AppData, trace: RuntimeTrace, actor: string, event: string, detail: string): AuditLog {
  const audit: AuditLog = {
    id: id('audit'),
    traceId: trace.id,
    agentId: trace.agentId,
    actor,
    event,
    channel: trace.channel,
    detail,
    createdAt: new Date().toISOString(),
    credits: trace.credits,
  }
  data.auditLogs.unshift(audit)
  return audit
}

function appendCredit(data: AppData, agentId: string, phase: 'runtime' | 'tool' | 'grader' | 'attack-detection', credits: number) {
  data.creditLedger.unshift({
    id: id('credit'),
    workspaceId: data.workspace.id,
    agentId,
    phase,
    credits,
    createdAt: new Date().toISOString(),
  })
}

function summarizeAudit(trace: RuntimeTrace, executionSummaries: string[]) {
  const status = trace.blocked ? 'blocked' : 'completed'
  const sideEffects = executionSummaries.length === 0 ? 'No side effects executed.' : executionSummaries.join(' ')
  return `Turn ${status}. Planned tools: ${trace.plan.map((item) => item.toolName).join(', ') || 'none'}. ${sideEffects}`
}
