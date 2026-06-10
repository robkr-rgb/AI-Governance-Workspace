# Abundly Implementation Notes

## Scope Decision

The request was to build the app in full. A literal full build is not possible inside a local coding task because Abundly's value includes audited security posture, real provider contracts, production integrations and private platform internals.

The implemented scope is the highest-value local slice:

- Governed multi-agent workspace
- Natural-language instructions with version history
- Capability catalogue with on-demand requests
- Runtime trace that separates model planning from platform enforcement
- Guardrail checks before side effects
- Local encrypted vault and post-planning credential injection summaries
- Approval queue
- Audit log and credit ledger
- Eval definitions and runs
- Architecture constraints and recommendation panel

## Product Pattern

The architecture follows this control split:

```text
Untrusted input
  -> isolated attack detection
  -> context assembly without credentials
  -> model/tool planning
  -> code-level guardrails
  -> credential injection
  -> adapter dispatch
  -> audit and metering
```

The important pattern is not "agent calls tools". The important pattern is "the model proposes and platform code disposes". That is the core enterprise control surface.

## Implemented Modules

| File | Responsibility |
| --- | --- |
| `src/shared/types.ts` | Shared domain model for workspace, teams, agents, capabilities, traces, evals and audit |
| `server/data.ts` | Seed data, JSON persistence and domain helpers |
| `server/runtime.ts` | Agent turn pipeline, attack detection, planning, guardrails, approvals, dispatch, evals and metering |
| `server/vault.ts` | Local AES-GCM vault and credential lookup |
| `server/index.ts` | Express API routes |
| `src/App.tsx` | Operations console, governance panel, evals and architecture decision view |
| `src/api.ts` | Frontend API client |

## Deliberate Simplifications

| Simplification | Better production answer |
| --- | --- |
| JSON state store | Postgres with row-level tenant keys, pgvector for lightweight semantic search |
| Deterministic "LLM simulator" | Provider gateway with tool-use support, metering hooks and eval harness |
| Keyword attack detector | Isolated detector model plus curated prompt-injection test corpus and red-team reports |
| Simulated tool adapters | OAuth/API-key adapters with webhook verification, retries and rate limiting |
| Approval records do not resume work | Durable workflow engine that parks and resumes executions |
| Local AES-GCM vault | KMS envelope encryption with separate key custody and rotation |

## Better Way Forward

1. Do not build 45 integrations first. Build three integrations and prove governance.
2. Do not put security policy in prompts. Keep side-effect policy below the model.
3. Do not introduce a separate document database until Postgres has failed under real load.
4. Do not claim enterprise readiness before red-team evidence exists.
5. Do use the "agent operating system" pattern: memories, sources of truth, skills, scripts and evals.

## Open Decisions

| Decision | Recommended default |
| --- | --- |
| First production integrations | Web search, email, HTTP API |
| Real workflow engine | Temporal |
| First production database | Postgres plus pgvector |
| LLM provider order | Claude for reasoning, GPT for realtime or audio when needed, Gemini for cheap bulk tasks |
| Security acceptance test | Prompt-injection suite with false-negative and false-positive reporting |

## Reliability

| Claim class | Reliability |
| --- | --- |
| Public feature inventory | 90-95% |
| Reconstructed subsystem boundaries | 80-90% |
| Local implementation fit to architecture | 85% |
| Production effort estimates | 60-70% |

Most logical next step: choose the first real integration and replace one simulated adapter with production OAuth or API-key handling while keeping the same guardrail and vault path.
