# Abundly Refactor

## Objective

Build and evolve a local governed-agent platform prototype inspired by Abundly's public product surface and architecture dossier.

## Product Direction

The product should demonstrate enterprise-grade agent governance patterns:

- Long-lived agents with owned instructions and documents
- Capability grants per agent
- Credential injection below the model
- Guardrails in code
- Approval workflows for side effects
- Audit and credit metering
- Eval-based validation

## Near-Term Roadmap

1. Slack adapter for Botzilla to Architect Agent.
2. Slack event endpoint and request signature verification.
3. Channel-to-agent routing.
4. Real `chat.postMessage` response path.
5. Real LLM gateway.
6. Postgres persistence.

## Definition of Done For Next Slice

- Botzilla can be invited to a Slack channel.
- Slack `app_mention` events reach the local API through a tunnel.
- Requests are signature-verified.
- Mentions are routed to Architect Agent.
- Architect Agent response is posted back to Slack.
- Runtime trace records the Slack turn, guardrails and audit event.
