import {
  Activity,
  AlertTriangle,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  Flag,
  KeyRound,
  Lock,
  MessageSquare,
  Play,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  TerminalSquare,
  Users,
  Workflow,
  Zap,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { api } from './api'
import type {
  Agent,
  AppData,
  Capability,
  Channel,
  EvalDefinition,
  RuntimeStage,
  RuntimeTrace,
} from './shared/types'
import './App.css'

const tabs = ['Operate', 'Govern', 'Evals', 'Architecture'] as const
const channels: Channel[] = ['chat', 'email', 'slack', 'api', 'webhook', 'schedule']

function App() {
  const [data, setData] = useState<AppData | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState('agt_grace')
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Operate')
  const [prompt, setPrompt] = useState('Research prompt-injection risk and email legal@outside-vendor.com a summary')
  const [channel, setChannel] = useState<Channel>('chat')
  const [instructionDrafts, setInstructionDrafts] = useState<Record<string, string>>({})
  const [secretValue, setSecretValue] = useState('')
  const [secretProvider, setSecretProvider] = useState('github')
  const [newAgent, setNewAgent] = useState({ name: '', role: '', description: '', teamId: 'team_platform' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .state()
      .then((nextData) => {
        setData(nextData)
        setSelectedAgentId(nextData.agents[0]?.id || 'agt_grace')
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  const selectedAgent = useMemo(
    () => data?.agents.find((agent) => agent.id === selectedAgentId) || data?.agents[0],
    [data, selectedAgentId],
  )

  const instructionDraft = selectedAgent
    ? instructionDrafts[selectedAgent.id] || latestInstruction(selectedAgent).body
    : ''

  if (!data || !selectedAgent) {
    return (
      <main className="loading">
        <BrainCircuit />
        <span>Loading governed agent platform...</span>
      </main>
    )
  }

  const selectedTeam = data.teams.find((team) => team.id === selectedAgent.teamId)
  const messages = data.messages
    .filter((message) => message.agentId === selectedAgent.id)
    .slice(-10)
  const latestTrace = data.traces.find((trace) => trace.agentId === selectedAgent.id)
  const agentEvals = data.evals.filter((definition) => definition.agentId === selectedAgent.id)
  const openApprovals = data.approvals.filter((approval) => approval.agentId === selectedAgent.id && approval.status === 'open')

  async function handle<T>(action: () => Promise<T>, after: (result: T) => void) {
    setBusy(true)
    setError('')
    try {
      after(await action())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setBusy(false)
    }
  }

  const runPrompt = () =>
    handle(() => api.chat(selectedAgent.id, prompt, channel), (result) => {
      setData(result.data)
      setPrompt('')
    })

  const updateInstruction = () =>
    handle(
      () => api.updateInstructions(selectedAgent.id, instructionDraft, 'Updated from governance panel'),
      (nextData) => {
        setData(nextData)
        setInstructionDrafts((drafts) => {
          const nextDrafts = { ...drafts }
          delete nextDrafts[selectedAgent.id]
          return nextDrafts
        })
      },
    )

  const addSecret = () =>
    handle(
      () =>
        api.addSecret(
          secretProvider,
          'agent',
          selectedAgent.id,
          secretValue || `${secretProvider}-demo-secret`,
        ),
      (nextData) => {
        setData(nextData)
        setSecretValue('')
      },
    )

  const setInstructionDraft = (value: string) => {
    setInstructionDrafts((drafts) => ({ ...drafts, [selectedAgent.id]: value }))
  }

  const createAgent = () =>
    handle(() => api.createAgent(newAgent), (nextData) => {
      setData(nextData)
      setSelectedAgentId(nextData.agents[0].id)
      setNewAgent({ name: '', role: '', description: '', teamId: 'team_platform' })
    })

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <strong>Abundly Refactor</strong>
            <span>Governed agent platform clone</span>
          </div>
        </div>

        <section className="workspace-card">
          <span className="eyebrow">Workspace</span>
          <h2>{data.workspace.name}</h2>
          <p>{data.workspace.dataResidency}</p>
          <Meter value={data.workspace.monthlyCreditsUsed} max={data.workspace.monthlyCreditLimit} />
        </section>

        <section>
          <div className="section-heading">
            <span>Agents</span>
            <button onClick={() => handle(api.reset, setData)} disabled={busy} title="Reset demo data">
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="agent-list">
            {data.agents.map((agent) => (
              <button
                className={clsx('agent-row', agent.id === selectedAgent.id && 'active')}
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <span className="avatar">{agent.avatar}</span>
                <span>
                  <strong>{agent.name}</strong>
                  <small>{agent.role}</small>
                </span>
                <StatusPill value={agent.status} />
              </button>
            ))}
          </div>
        </section>

        <section className="create-agent">
          <span className="eyebrow">New agent</span>
          <input
            placeholder="Name"
            value={newAgent.name}
            onChange={(event) => setNewAgent({ ...newAgent, name: event.target.value })}
          />
          <input
            placeholder="Role"
            value={newAgent.role}
            onChange={(event) => setNewAgent({ ...newAgent, role: event.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newAgent.description}
            onChange={(event) => setNewAgent({ ...newAgent, description: event.target.value })}
          />
          <select
            value={newAgent.teamId}
            onChange={(event) => setNewAgent({ ...newAgent, teamId: event.target.value })}
          >
            {data.teams.map((team) => (
              <option value={team.id} key={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          <button className="primary full" onClick={createAgent} disabled={busy || newAgent.name.length < 2}>
            Create
          </button>
        </section>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">Selected agent</span>
            <h1>{selectedAgent.name}</h1>
            <p>{selectedAgent.description}</p>
          </div>
          <div className="top-actions">
            <Metric icon={<Users size={18} />} label="Team" value={selectedTeam?.name || 'Global'} />
            <Metric icon={<Zap size={18} />} label="Credits today" value={`${selectedAgent.creditsUsedToday}/${selectedAgent.dailyCreditLimit}`} />
            <Metric icon={<ShieldCheck size={18} />} label="Model" value={selectedAgent.modelPrefs.chat} />
          </div>
        </header>

        {error && (
          <div className="error">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <nav className="tabs">
          {tabs.map((tab) => (
            <button className={clsx(tab === activeTab && 'active')} onClick={() => setActiveTab(tab)} key={tab}>
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === 'Operate' && (
          <OperateTab
            agent={selectedAgent}
            busy={busy}
            channel={channel}
            latestTrace={latestTrace}
            messages={messages}
            prompt={prompt}
            setChannel={setChannel}
            setPrompt={setPrompt}
            runPrompt={runPrompt}
          />
        )}

        {activeTab === 'Govern' && (
          <GovernTab
            addSecret={addSecret}
            agent={selectedAgent}
            approvals={openApprovals}
            busy={busy}
            catalog={data.capabilityCatalog}
            data={data}
            instructionDraft={instructionDraft}
            secretProvider={secretProvider}
            secretValue={secretValue}
            setData={setData}
            setInstructionDraft={setInstructionDraft}
            setSecretProvider={setSecretProvider}
            setSecretValue={setSecretValue}
            updateInstruction={updateInstruction}
          />
        )}

        {activeTab === 'Evals' && (
          <EvalsTab busy={busy} data={data} definitions={agentEvals} setData={setData} />
        )}

        {activeTab === 'Architecture' && <ArchitectureTab data={data} />}
      </main>
    </div>
  )
}

function OperateTab({
  agent,
  busy,
  channel,
  latestTrace,
  messages,
  prompt,
  runPrompt,
  setChannel,
  setPrompt,
}: {
  agent: Agent
  busy: boolean
  channel: Channel
  latestTrace?: RuntimeTrace
  messages: AppData['messages']
  prompt: string
  runPrompt: () => void
  setChannel: (channel: Channel) => void
  setPrompt: (prompt: string) => void
}) {
  return (
    <div className="two-column">
      <section className="panel chat-panel">
        <PanelTitle icon={<MessageSquare />} title="Runtime Console" detail="Chat, trigger and API turns all run through the same policy path." />
        <div className="message-list">
          {messages.map((message) => (
            <article className={clsx('message', message.role)} key={message.id}>
              <span>{message.role}</span>
              <p>{message.content}</p>
              <small>{formatAge(message.createdAt)} via {message.channel}</small>
            </article>
          ))}
        </div>
        <div className="composer">
          <select value={channel} onChange={(event) => setChannel(event.target.value as Channel)}>
            {channels.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
          <button className="primary" onClick={runPrompt} disabled={busy || prompt.length === 0}>
            <Play size={16} />
            Run turn
          </button>
        </div>
      </section>

      <section className="panel">
        <PanelTitle icon={<Workflow />} title="Execution Trace" detail={`Agent: ${agent.name}`} />
        {latestTrace ? <Trace trace={latestTrace} /> : <EmptyState text="Run a turn to generate attack, planning, vault and audit trace data." />}
      </section>
    </div>
  )
}

function GovernTab({
  addSecret,
  agent,
  approvals,
  busy,
  catalog,
  data,
  instructionDraft,
  secretProvider,
  secretValue,
  setData,
  setInstructionDraft,
  setSecretProvider,
  setSecretValue,
  updateInstruction,
}: {
  addSecret: () => void
  agent: Agent
  approvals: AppData['approvals']
  busy: boolean
  catalog: Capability[]
  data: AppData
  instructionDraft: string
  secretProvider: string
  secretValue: string
  setData: (data: AppData) => void
  setInstructionDraft: (value: string) => void
  setSecretProvider: (value: string) => void
  setSecretValue: (value: string) => void
  updateInstruction: () => void
}) {
  return (
    <div className="govern-grid">
      <section className="panel wide">
        <PanelTitle icon={<SlidersHorizontal />} title="Instruction Versioning" detail={`${agent.instructions.length} versions. Latest v${latestInstruction(agent).version}.`} />
        <textarea className="instruction-editor" value={instructionDraft} onChange={(event) => setInstructionDraft(event.target.value)} />
        <div className="row-actions">
          <button className="primary" onClick={updateInstruction} disabled={busy || instructionDraft.length < 20}>
            Save new version
          </button>
          <span className="hint">Agent self-edits should land here as proposed versions before approval.</span>
        </div>
        <div className="version-list">
          {agent.instructions.map((version) => (
            <div className="version-item" key={version.id}>
              <strong>v{version.version}</strong>
              <span>{version.summary}</span>
              <small>{version.author} · {formatAge(version.createdAt)}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelTitle icon={<Lock />} title="Credential Vault" detail="AES-GCM local demo. Production needs KMS envelope encryption." />
        <select value={secretProvider} onChange={(event) => setSecretProvider(event.target.value)}>
          {['github', 'slack', 'cursor_api', 'http_request', 'mcp_client'].map((provider) => (
            <option value={provider} key={provider}>
              {provider}
            </option>
          ))}
        </select>
        <input
          placeholder="Secret value"
          type="password"
          value={secretValue}
          onChange={(event) => setSecretValue(event.target.value)}
        />
        <button className="primary full" onClick={addSecret} disabled={busy}>
          <KeyRound size={16} />
          Add agent secret
        </button>
        <div className="secret-list">
          {data.secrets
            .filter((secret) => secret.scopeId === agent.id)
            .map((secret) => (
              <span key={secret.id}>
                {secret.provider} · last4 {secret.last4} · {secret.keyHint}
              </span>
            ))}
        </div>
      </section>

      <section className="panel wide">
        <PanelTitle icon={<Database />} title="Capabilities" detail="Toggle what the agent can do. Risky actions stay governed below the model." />
        <div className="capability-grid">
          {catalog.map((capability) => (
            <CapabilityCard capability={capability} agent={agent} key={capability.id} setData={setData} />
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelTitle icon={<Flag />} title="Approvals" detail={`${approvals.length} open`} />
        {approvals.length === 0 && <EmptyState text="No parked side effects. External sends and HTTP calls will appear here." />}
        {approvals.map((approval) => (
          <div className="approval" key={approval.id}>
            <strong>{approval.toolName}</strong>
            <p>{approval.reason}</p>
            <div className="row-actions">
              <button onClick={() => api.resolveApproval(approval.id, 'approved').then(setData)}>Approve</button>
              <button onClick={() => api.resolveApproval(approval.id, 'denied').then(setData)}>Deny</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

function EvalsTab({
  busy,
  data,
  definitions,
  setData,
}: {
  busy: boolean
  data: AppData
  definitions: EvalDefinition[]
  setData: (data: AppData) => void
}) {
  return (
    <div className="two-column">
      <section className="panel">
        <PanelTitle icon={<CheckCircle2 />} title="Agent Evals" detail="Validation rules plus simulated grader costs." />
        <div className="eval-list">
          {definitions.map((definition) => (
            <article className="eval-card" key={definition.id}>
              <strong>{definition.name}</strong>
              <p>{definition.triggerPrompt}</p>
              <small>{definition.expected}</small>
              <button
                className="primary"
                onClick={() => api.runEval(definition.id).then((result) => setData(result.data))}
                disabled={busy}
              >
                Run eval
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <PanelTitle icon={<Activity />} title="Recent Results" detail={`${data.evalRuns.length} total runs`} />
        <div className="result-list">
          {data.evalRuns.slice(0, 8).map((run) => {
            const definition = data.evals.find((item) => item.id === run.evalId)
            return (
              <article className={clsx('result-card', run.status)} key={run.id}>
                <strong>{definition?.name || run.evalId}</strong>
                <span>{run.status} · score {run.score}</span>
                <p>{run.reasoning}</p>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function ArchitectureTab({ data }: { data: AppData }) {
  return (
    <div className="architecture">
      <section className="panel wide">
        <PanelTitle icon={<AlertTriangle />} title="Not Possible Locally" detail="Items that cannot be honestly completed inside this repo." />
        <div className="constraint-grid">
          {data.constraints.map((constraint) => (
            <article className="constraint" key={constraint.id}>
              <span>{constraint.severity}</span>
              <h3>{constraint.title}</h3>
              <p>{constraint.detail}</p>
              <strong>Decision: {constraint.decisionNeeded}</strong>
              <small>Reliability {constraint.reliability}%</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <PanelTitle icon={<BrainCircuit />} title="Better Way Forward" detail="Recommendations from the dossier and implementation pass." />
        <div className="recommendation-grid">
          {data.recommendations.map((recommendation) => (
            <article className="recommendation" key={recommendation.id}>
              <span>{recommendation.impact}</span>
              <h3>{recommendation.title}</h3>
              <p><b>Assumption:</b> {recommendation.currentAssumption}</p>
              <p><b>Recommendation:</b> {recommendation.recommendation}</p>
              <p><b>Trade-off:</b> {recommendation.tradeoff}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <PanelTitle icon={<TerminalSquare />} title="System Boundary" detail="The model proposes. Platform code disposes." />
        <pre className="diagram">{`Channels -> Security Pipeline -> Agent Runtime -> Tool Layer
              |                    |                  |
              v                    v                  v
      Attack detection       LLM planning      Guardrails in code
                                                   |
                                                   v
                                          Credential injection
                                                   |
                                                   v
                                      Adapter dispatch + audit`}</pre>
      </section>

      <section className="panel wide">
        <PanelTitle icon={<Bot />} title="Sources Used" detail="Public sources plus the attached architecture dossier." />
        <div className="source-list">
          {data.sources.map((source) => (
            <a href={source.url} key={source.id} target="_blank">
              <strong>{source.title}</strong>
              <span>{source.observed}</span>
              <small>Reliability {source.reliability}%</small>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

function CapabilityCard({ agent, capability, setData }: { agent: Agent; capability: Capability; setData: (data: AppData) => void }) {
  const grant = agent.capabilities.find((item) => item.capabilityId === capability.id)
  const status = grant?.status || 'disabled'
  return (
    <article className={clsx('capability-card', status)}>
      <div>
        <strong>{capability.name}</strong>
        <span>{capability.category} · {capability.kind}</span>
      </div>
      <p>{capability.description}</p>
      {grant?.requestedReason && <small>Requested: {grant.requestedReason}</small>}
      <div className="cap-footer">
        <StatusPill value={status} />
        <button
          onClick={() => api.setCapability(agent.id, capability.id, status === 'enabled' ? 'disabled' : 'enabled').then(setData)}
        >
          {status === 'enabled' ? 'Disable' : 'Enable'}
        </button>
      </div>
    </article>
  )
}

function Trace({ trace }: { trace: RuntimeTrace }) {
  return (
    <div className="trace">
      <div className="trace-summary">
        <Metric icon={<ShieldCheck size={18} />} label="Attack score" value={`${trace.attackScore}/100`} />
        <Metric icon={<Zap size={18} />} label="Credits" value={String(trace.credits)} />
        <Metric icon={<Workflow size={18} />} label="Tool calls" value={String(trace.plan.length)} />
      </div>
      <ol className="trace-steps">
        {trace.stages.map((stage) => (
          <TraceStage stage={stage} key={stage.id} />
        ))}
      </ol>
    </div>
  )
}

function TraceStage({ stage }: { stage: RuntimeStage }) {
  return (
    <li className={clsx('trace-stage', stage.status)}>
      <div>
        <strong>{stage.name}</strong>
        <StatusPill value={stage.status} />
      </div>
      <p>{stage.detail}</p>
      <small>Reliability {stage.reliability}%</small>
    </li>
  )
}

function PanelTitle({ detail, icon, title }: { detail: string; icon: ReactNode; title: string }) {
  return (
    <div className="panel-title">
      <div className="panel-icon">{icon}</div>
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Meter({ max, value }: { max: number; value: number }) {
  const width = `${Math.min(100, Math.round((value / max) * 100))}%`
  return (
    <div className="meter">
      <span style={{ width }} />
      <small>{value.toLocaleString()} / {max.toLocaleString()} credits</small>
    </div>
  )
}

function StatusPill({ value }: { value: string }) {
  return <span className={clsx('pill', value)}>{value}</span>
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty">{text}</div>
}

function latestInstruction(agent: Agent) {
  return [...agent.instructions].sort((a, b) => b.version - a.version)[0]
}

function formatAge(value: string) {
  return `${formatDistanceToNow(new Date(value))} ago`
}

export default App
