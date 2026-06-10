import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import type { AppData, SecretRecord, SecretScope } from '../src/shared/types.ts'
import { id } from './data.ts'

const algorithm = 'aes-256-gcm'
const fallbackKeyMaterial = 'local-dev-only-abundly-refactor-vault-key'

function masterKey() {
  const material = process.env.VAULT_MASTER_KEY || fallbackKeyMaterial
  return createHash('sha256').update(material).digest()
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv(algorithm, masterKey(), iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64')}.${tag.toString('base64')}.${encrypted.toString('base64')}`
}

export function decryptSecret(encryptedValue: string) {
  const [ivRaw, tagRaw, encryptedRaw] = encryptedValue.split('.')
  if (!ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error('Invalid encrypted secret format')
  }

  const decipher = createDecipheriv(algorithm, masterKey(), Buffer.from(ivRaw, 'base64'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, 'base64')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

export function addSecret(
  data: AppData,
  input: { provider: string; scope: SecretScope; scopeId: string; value: string },
): SecretRecord {
  const secret: SecretRecord = {
    id: id('sec'),
    provider: input.provider,
    scope: input.scope,
    scopeId: input.scopeId,
    encryptedValue: encryptSecret(input.value),
    keyHint: process.env.VAULT_MASTER_KEY ? 'env:VAULT_MASTER_KEY' : 'dev-fallback-key',
    last4: input.value.slice(-4),
    createdAt: new Date().toISOString(),
  }

  data.secrets.push(secret)
  return secret
}

export function findUsableSecret(data: AppData, provider: string, agentId: string) {
  const agent = data.agents.find((item) => item.id === agentId)
  if (!agent) {
    return undefined
  }

  return data.secrets.find((secret) => {
    if (secret.provider !== provider) {
      return false
    }
    if (secret.scope === 'workspace' && secret.scopeId === data.workspace.id) {
      return true
    }
    if (secret.scope === 'team' && secret.scopeId === agent.teamId) {
      return true
    }
    return secret.scope === 'agent' && secret.scopeId === agentId
  })
}

export function credentialInjectionSummary(data: AppData, provider: string, agentId: string) {
  const secret = findUsableSecret(data, provider, agentId)
  if (!secret) {
    return {
      available: false,
      detail: `No ${provider} credential available at workspace, team or agent scope.`,
    }
  }

  return {
    available: true,
    detail: `Injected ${provider} credential ref ${secret.id} after planning. Secret value stayed out of model context and audit logs. Last4=${secret.last4}.`,
  }
}
