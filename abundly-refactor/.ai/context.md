# Abundly Refactor Context

## Purpose

Local full-stack prototype of an Abundly-style governed AI agent platform, reverse-engineered from public Abundly material plus the attached architecture dossier.

## Current Scope

- React and TypeScript frontend
- Express API
- JSON-backed local state
- Governed agent runtime trace
- Instruction versioning
- Capability catalogue
- Credential vault
- Code-level guardrails
- Approval queue
- Audit log and credit ledger
- Eval runner

## Important Boundaries

This project is not a production-certified Abundly clone. The following remain outside the current local implementation:

- ISO 27001, SOC 2 and DPA evidence
- Real Slack, Teams, Mailgun, Twilio, MCP and provider LLM adapters
- Production prompt-injection detection
- Private Abundly internals

## Run

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`. API runs on `http://localhost:8787`.

## Source Basis

- `/Users/rob/Downloads/abundly-architecture-dossier_1.html`
- `https://www.abundly.ai/`
- `https://www.abundly.ai/agent-platform`
- `https://docs.abundly.ai/features/instructions`
- `https://docs.abundly.ai/features/capabilities`

## Next Recommended Work

1. Implement a real Slack adapter for Botzilla.
2. Add Slack signing-secret verification.
3. Map Slack channels to agents.
4. Replace the deterministic runtime simulator with a real LLM gateway.
5. Move state from JSON to Postgres plus pgvector.
