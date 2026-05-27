---
name: reverse-engineer
description: >
  Reverse-engineer any SaaS product from its public surface into a full buildable system design.
  Use this skill whenever someone shares a product URL and wants to understand how it works
  internally, how to rebuild it, or what its architecture looks like. Also trigger when the user
  says things like "how would I build this", "reverse engineer this", "decompose this product",
  "what tech stack does this use", "analyze this SaaS", "clone this product", "how does this
  platform work under the hood", "what would it take to build something like this", or any
  variation of "I want to build this myself". Even if the user just drops a URL and asks
  "break this down" or "go deep on this", use this skill. The skill covers website teardowns,
  product decomposition, system design, and build planning. If someone is looking at a competitor
  or a product they admire and wants to understand the engineering behind it, this is the skill.
---

# SaaS Product Reverse-Engineering

Turn any product's public surface into a complete, buildable system design.

## Why this skill exists

Most reverse-engineering attempts stop at "it's built with React and uses an API." That's
useless. The real value is understanding what subsystems exist, what external APIs they connect
to, what the data model looks like, and how you'd actually build it from scratch. This skill
enforces that depth systematically.

## The Three Phases

Every reverse-engineering engagement follows three phases in order. Do not skip phases or
combine them. Each phase produces a distinct deliverable.

### Phase 1: Surface Extraction

**Goal:** Extract every functional capability from the product's public surface without
marketing inflation.

**How to execute:**

1. Navigate to the target URL using browser tools (Chrome MCP preferred) or WebFetch
2. Extract the complete page structure, text content, all links, images and metadata
3. If the product has multiple pages (pricing, features, docs, FAQ), visit each one
4. Run JavaScript extraction to identify:
   - Tech stack (framework detection, CSS approach, JS libraries)
   - All CSS custom properties / design tokens
   - Full DOM tree structure
   - External scripts and stylesheets
   - Font families and loading strategy
5. If there's a public API doc, demo, or changelog, extract from those too

**What to produce:**

A structured inventory of:
- Every feature the product claims (stripped of marketing language)
- Target persona and industry
- Pricing model and tiers (if visible)
- Integrations and connected platforms
- Data the product consumes and produces
- User journey from signup to value delivery
- Tech stack of the marketing site itself (this is separate from the product)

**Specificity standard:** Not "connects to Salesforce" but "uses Salesforce Web-to-Lead
forms with hidden fields for plan tracking and Cloudflare Turnstile for bot protection."

### Phase 2: Technical Decomposition

**Goal:** Break the product into subsystems and research the underlying platform APIs
at implementation depth.

**How to execute:**

1. From the feature inventory, identify every external system the product interacts with
2. For each external system, research via web search:
   - Authentication methods (OAuth2, API key, basic auth, etc.)
   - Exact REST/GraphQL endpoints needed
   - Data model of the target platform (tables, fields, relationships)
   - Rate limits and pagination constraints
   - Write-back capabilities and restrictions
3. Group features into subsystems with clear boundaries
4. For each subsystem, define:
   - Functional requirements (what it does)
   - External dependencies (what APIs it calls)
   - Data it reads and writes
   - Hard technical problems
   - Domain expertise required

**Specificity standard:** Not "queries the database" but "GET /api/now/table/sys_security_acl
with encoded query filters, requires read ACL on the table, paginated via sysparm_offset
with 10k record limit per request."

**Research depth:** For the primary platform the product integrates with, produce a table
of every API endpoint / table / resource the product would need to query, along with the
purpose and which subsystem uses it.

### Phase 3: System Design

**Goal:** Produce a complete architecture that someone could implement.

**What to produce (all of these, not a subset):**

1. **High-level architecture diagram** (ASCII art in a pre block)
   - All services, data stores, external systems
   - Communication patterns (sync REST, async queues, WebSocket)
   - Clear service boundaries

2. **Data model / ERD** (ASCII art in a pre block)
   - Every entity with key fields
   - Relationships and cardinality
   - Multi-tenancy approach
   - JSONB vs normalized decisions

3. **Core engine design** (the thing that makes the product valuable)
   - Input/output schema with code-level pseudocode
   - Execution pipeline step by step
   - Parallelism and performance strategy
   - Example instances of the core abstraction (e.g., example "checks" if it's a check engine)

4. **AI/ML components** (if applicable)
   - What the LLM does vs what is deterministic
   - Tool/function definitions for any AI agent
   - RAG architecture if knowledge retrieval is involved
   - Session and memory management

5. **Integration layer**
   - Connector interface (pseudocode with methods and return types)
   - Auth flow
   - Credential storage approach
   - Retry, rate limiting, pagination patterns

6. **Write-back / mutation flows** (if the product modifies external systems)
   - Human-in-the-loop approval patterns
   - Verification and rollback mechanisms
   - Audit logging

7. **Reporting / output layer**
   - Report types and their contents
   - Generation pipeline
   - Export formats

8. **Tech stack recommendation**
   - Concrete technology per layer with rationale
   - Build vs buy decisions with trade-off analysis

9. **Phased build plan**
   - Ordered phases with dependencies
   - Effort estimate per phase (weeks, assuming 1-2 developers)
   - Critical path identification
   - MVP definition (what ships first)

10. **Trade-offs table**
    - Every major architectural decision
    - Option A vs Option B with recommendation
    - What you'd revisit as the system grows

11. **Biggest risk callout**
    - What is the hardest part of building this product?
    - Where is the moat? (usually domain expertise, not code)

## Output Format

Each phase produces an HTML file saved to the outputs directory. The HTML should use a dark
theme consistent with technical documentation (dark bg, monospace for code, color-coded
diagrams). Specifically:

- Phase 1 output: `[product]-surface-analysis.html`
- Phase 2 output: `[product]-technical-decomposition.html`  
- Phase 3 output: `[product]-system-design.html`

If the user asks for everything at once (which is the common case), you can combine phases
or produce them in sequence. The key is that all three layers of analysis are present in the
final deliverable.

For architecture diagrams, use ASCII art inside `<pre>` blocks with syntax highlighting
via `<span>` elements. Use color coding: blue for services, gold for data stores, green for
external systems, purple for AI components, red for risk areas.

## Quality Standards

Every output must include:

- **Reliability score** (percentage) on every major claim. 90%+ for things directly observed.
  70-85% for things inferred from public information. Below 70% should be flagged as
  speculative.
- **Specificity over generality.** "Use microservices" is worthless. "Three services: Core API
  (Fastify), Scan Worker (Python, BullMQ consumer), AI Agent (Python, WebSocket + LLM
  orchestration)" is useful.
- **Domain expertise callouts.** Name exactly what knowledge is needed that isn't generic
  software engineering. This is often the real moat.
- **Next step.** Every deliverable ends with a concrete, actionable next step.

## What to Avoid

- Marketing language or feature descriptions copied verbatim from the target site
- Vague architecture ("use a modern stack")
- Treating AI/LLM as magic (always specify: what prompt, what tools, what comes back)
- Skipping the data model (the data model IS the architecture)
- Ignoring multi-tenancy, auth, billing, credential management
- Producing only one phase when the user clearly wants the full picture

## Adapting to Different Product Types

The three-phase structure stays the same. What changes is where Phase 2 research focuses:

- **Platform connector products** (like a ServiceNow/Salesforce/Jira tool): Deep dive into
  the target platform's API surface, data model, auth methods, rate limits.
- **Data/analytics products:** Focus on data pipeline architecture, storage layer, query
  engine, visualization, caching, data freshness.
- **AI-native products** (copilots, agents): Focus on LLM orchestration, tool definitions,
  RAG, context management, eval/quality, cost per query.
- **Marketplaces / platforms:** Focus on two-sided data model, transaction flow, matching
  algorithm, trust/safety, payments.
- **Developer tools / API products:** Focus on SDK design, API surface area, rate limiting,
  DX, documentation, versioning.

Identify which category the target falls into early in Phase 1, then adjust Phase 2 research
accordingly. See `references/api-research-patterns.md` for platform-specific research
checklists.
