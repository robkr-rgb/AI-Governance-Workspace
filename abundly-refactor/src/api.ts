import type { AppData, Channel, ChatResponse, EvalRun } from './shared/types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({ error: response.statusText }))) as { error?: string }
    throw new Error(body.error || response.statusText)
  }

  return response.json() as Promise<T>
}

export const api = {
  state: () => request<AppData>('/api/state'),
  reset: () =>
    request<AppData>('/api/reset', {
      method: 'POST',
      body: '{}',
    }),
  chat: (agentId: string, message: string, channel: Channel) =>
    request<ChatResponse>(`/api/agents/${agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, channel }),
    }),
  updateInstructions: (agentId: string, body: string, summary: string) =>
    request<AppData>(`/api/agents/${agentId}/instructions`, {
      method: 'POST',
      body: JSON.stringify({ body, summary, author: 'user', approved: true }),
    }),
  setCapability: (agentId: string, capabilityId: string, status: 'enabled' | 'disabled' | 'requested') =>
    request<AppData>(`/api/agents/${agentId}/capabilities/${capabilityId}`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  addSecret: (provider: string, scope: 'workspace' | 'team' | 'agent', scopeId: string, value: string) =>
    request<AppData>('/api/secrets', {
      method: 'POST',
      body: JSON.stringify({ provider, scope, scopeId, value }),
    }),
  runEval: (evalId: string) =>
    request<{ data: AppData; run: EvalRun }>(`/api/evals/${evalId}/run`, {
      method: 'POST',
      body: '{}',
    }),
  resolveApproval: (approvalId: string, status: 'approved' | 'denied') =>
    request<AppData>(`/api/approvals/${approvalId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
  createAgent: (input: { name: string; role: string; description: string; teamId: string }) =>
    request<AppData>('/api/agents', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
}
