export type AgentStatus = 'active' | 'paused' | 'blocked'
export type CapabilityKind = 'platform' | 'integration' | 'custom-api' | 'mcp'
export type CapabilityStatus = 'enabled' | 'disabled' | 'requested'
export type Channel = 'chat' | 'email' | 'sms' | 'slack' | 'teams' | 'api' | 'webhook' | 'schedule'
export type GuardrailMode = 'send' | 'approve' | 'block'
export type MessageRole = 'user' | 'assistant' | 'system'
export type RecommendationImpact = 'critical' | 'high' | 'medium'
export type SecretScope = 'workspace' | 'team' | 'agent'
export type TeamRole = 'Admin' | 'Member' | 'Guest'
export type ToolRisk = 'read' | 'write' | 'external-side-effect'
export type Visibility = 'Full' | 'Summary' | 'Hidden'

export interface Workspace {
  id: string
  name: string
  plan: string
  region: string
  monthlyCreditLimit: number
  monthlyCreditsUsed: number
  modelAllowlist: string[]
  mcpPolicy: 'allowed' | 'restricted' | 'blocked'
  dataResidency: string
}

export interface Team {
  id: string
  name: string
  monthlyCreditLimit: number
  monthlyCreditsUsed: number
  capabilityPolicy: string
  adminUserIds: string[]
}

export interface User {
  id: string
  name: string
  email: string
  workspaceRole: TeamRole
  teamRoles: Record<string, TeamRole>
}

export interface Capability {
  id: string
  name: string
  category: string
  kind: CapabilityKind
  description: string
  tools: string[]
  authType: 'platform' | 'oauth' | 'api-key' | 'none'
  creditCost: number
  risk: ToolRisk
}

export interface GuardrailConfig {
  emailDomains: string[]
  outsideEmailMode: GuardrailMode
  httpMode: GuardrailMode
  smsMode: GuardrailMode
}

export interface AgentCapabilityGrant {
  capabilityId: string
  status: CapabilityStatus
  guardrails: GuardrailConfig
  credentialRef?: string
  requestedReason?: string
}

export interface InstructionVersion {
  id: string
  version: number
  body: string
  author: 'user' | 'agent'
  approved: boolean
  createdAt: string
  summary: string
}

export interface AgentDocument {
  id: string
  name: string
  type: 'markdown' | 'database' | 'script' | 'app' | 'file'
  visibility: Visibility
  body: string
  version: number
  updatedAt: string
}

export interface ScheduledTask {
  id: string
  name: string
  cadence: string
  prompt: string
  channel: Channel
  enabled: boolean
}

export interface DiaryEntry {
  id: string
  createdAt: string
  body: string
}

export interface Agent {
  id: string
  name: string
  avatar: string
  role: string
  description: string
  status: AgentStatus
  teamId: string
  ownerUserId: string
  dailyCreditLimit: number
  creditsUsedToday: number
  modelPrefs: Record<Channel, string>
  thinkingMode: boolean
  discoverability: 'none' | 'team' | 'workspace'
  capabilities: AgentCapabilityGrant[]
  instructions: InstructionVersion[]
  documents: AgentDocument[]
  schedules: ScheduledTask[]
  diary: DiaryEntry[]
  tags: string[]
}

export interface Message {
  id: string
  agentId: string
  role: MessageRole
  channel: Channel
  content: string
  createdAt: string
  traceId?: string
}

export interface SecretRecord {
  id: string
  provider: string
  scope: SecretScope
  scopeId: string
  encryptedValue: string
  keyHint: string
  last4: string
  createdAt: string
}

export interface ToolCallPlan {
  id: string
  capabilityId: string
  toolName: string
  intent: string
  args: Record<string, string | number | boolean>
  risk: ToolRisk
}

export interface RuntimeStage {
  id: string
  name: string
  status: 'passed' | 'blocked' | 'pending-approval' | 'skipped' | 'executed'
  detail: string
  reliability: number
}

export interface RuntimeTrace {
  id: string
  agentId: string
  channel: Channel
  createdAt: string
  attackScore: number
  blocked: boolean
  plan: ToolCallPlan[]
  stages: RuntimeStage[]
  credits: number
}

export interface ApprovalRequest {
  id: string
  agentId: string
  traceId: string
  toolName: string
  reason: string
  status: 'open' | 'approved' | 'denied'
  createdAt: string
  resolvedAt?: string
}

export interface AuditLog {
  id: string
  traceId: string
  agentId: string
  actor: string
  event: string
  channel: Channel
  detail: string
  createdAt: string
  credits: number
}

export interface CreditLedgerEntry {
  id: string
  workspaceId: string
  agentId: string
  phase: 'runtime' | 'tool' | 'grader' | 'attack-detection'
  credits: number
  createdAt: string
}

export interface EvalDefinition {
  id: string
  agentId: string
  name: string
  triggerPrompt: string
  expected: string
  validation: {
    mustCall: string[]
    mustNotCall: string[]
  }
}

export interface EvalRun {
  id: string
  evalId: string
  agentId: string
  status: 'passed' | 'failed'
  score: number
  reasoning: string
  traceId: string
  createdAt: string
}

export interface FlaggedConstraint {
  id: string
  title: string
  severity: 'not-possible-locally' | 'requires-decision' | 'requires-third-party'
  detail: string
  decisionNeeded: string
  reliability: number
}

export interface Recommendation {
  id: string
  title: string
  impact: RecommendationImpact
  currentAssumption: string
  recommendation: string
  tradeoff: string
  reliability: number
}

export interface SourceNote {
  id: string
  title: string
  url: string
  observed: string
  reliability: number
}

export interface AppData {
  workspace: Workspace
  teams: Team[]
  users: User[]
  agents: Agent[]
  capabilityCatalog: Capability[]
  messages: Message[]
  secrets: SecretRecord[]
  traces: RuntimeTrace[]
  approvals: ApprovalRequest[]
  auditLogs: AuditLog[]
  creditLedger: CreditLedgerEntry[]
  evals: EvalDefinition[]
  evalRuns: EvalRun[]
  constraints: FlaggedConstraint[]
  recommendations: Recommendation[]
  sources: SourceNote[]
}

export interface ChatRequest {
  message: string
  channel: Channel
}

export interface ChatResponse {
  data: AppData
  trace: RuntimeTrace
  assistantMessage: Message
}
