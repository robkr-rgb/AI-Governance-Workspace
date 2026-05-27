# API Research Patterns by Platform Type

When reverse-engineering a product, Phase 2 requires deep research into the external
platforms the product connects to. This reference provides checklists for common platform
types so you know exactly what to look for.

## Table of Contents

1. [ServiceNow](#servicenow)
2. [Salesforce](#salesforce)
3. [Jira / Atlassian](#jira-atlassian)
4. [AWS / Cloud Infrastructure](#aws-cloud)
5. [GitHub / GitLab](#github-gitlab)
6. [Slack / Teams](#slack-teams)
7. [Generic REST API Platform](#generic-rest)
8. [Database-backed Products](#database)
9. [AI/LLM-powered Products](#ai-llm)

---

## ServiceNow <a id="servicenow"></a>

### Authentication
- Basic Auth (username + password) -- still common
- OAuth2 Password Grant (client_id + client_secret + user/pass)
- OAuth2 Authorization Code (for SSO-enabled instances)
- Service accounts with specific roles

### Core APIs
| API | Endpoint Pattern | Use Case |
|-----|-----------------|----------|
| Table API | GET /api/now/table/{table} | Query any table |
| Aggregate API | GET /api/now/stats/{table} | Counts, averages |
| CMDB API | GET /api/now/cmdb/instance/{class} | CI queries with relationships |
| Meta/Schema API | GET /api/now/doc/table/schema | Table/field discovery |
| Attachment API | GET /api/now/attachment/{sys_id} | File attachments |
| Import Set API | POST /api/now/import/{table} | Bulk data import |

### Key System Tables
- sys_db_object (table definitions)
- sys_dictionary (field definitions)
- sys_security_acl (access controls)
- sys_user_has_role (role assignments)
- sys_script (business rules)
- sys_update_xml (customization tracking)
- sys_metadata_customization (OOB deviation detection, Washington DC+)
- sys_upgrade_history (version detection)
- sys_plugins (installed plugins)

### Constraints
- Per-user transaction quotas (rate limiting)
- Default 10,000 record pagination limit
- ACL enforcement on all table queries
- GlideRecord vs GlideRecordSecure (ACL bypass risk)

### CSDM Data Model
- Foundation: Companies, Locations, Users, Groups
- Crawl: Business Applications, Application Services
- Walk: Technical Services, Technical Service Offerings
- Run: Full service maps, automated discovery

---

## Salesforce <a id="salesforce"></a>

### Authentication
- OAuth2 Web Server Flow (authorization code)
- OAuth2 JWT Bearer Flow (server-to-server)
- Username-Password Flow (legacy)

### Core APIs
| API | Use Case |
|-----|----------|
| REST API (/services/data/vXX.X/sobjects/) | CRUD on standard/custom objects |
| SOQL Query (/services/data/vXX.X/query/) | Structured queries |
| Bulk API 2.0 | Large data operations |
| Metadata API | Schema introspection |
| Streaming API (CometD) | Real-time change events |
| Composite API | Batch multiple operations |

### Key Objects
- Account, Contact, Lead, Opportunity (Sales Cloud)
- Case, Knowledge (Service Cloud)
- Custom objects (__c suffix)
- PermissionSet, Profile (security)

### Constraints
- API call limits per 24-hour period (varies by edition)
- Governor limits on SOQL queries (100 records default, 2000 max per query)
- Bulk API has 15,000 batches per 24 hours

---

## Jira / Atlassian <a id="jira-atlassian"></a>

### Authentication
- API tokens (Atlassian account email + token)
- OAuth 2.0 (3LO) for Atlassian Cloud
- Personal Access Tokens for Data Center

### Core APIs
| API | Endpoint Pattern | Use Case |
|-----|-----------------|----------|
| Issue API | GET /rest/api/3/issue/{key} | Read/write issues |
| Search (JQL) | POST /rest/api/3/search | Query with JQL |
| Project API | GET /rest/api/3/project | Project metadata |
| Board API | GET /rest/agile/1.0/board | Agile boards |
| Sprint API | GET /rest/agile/1.0/sprint | Sprint management |

### Constraints
- Rate limiting: ~10 requests/second for Cloud
- JQL complexity limits
- Attachment size limits (10MB default)
- Pagination via startAt + maxResults

---

## AWS / Cloud Infrastructure <a id="aws-cloud"></a>

### Authentication
- IAM Access Keys (access key ID + secret)
- IAM Roles (for service-to-service)
- STS Assume Role (cross-account)
- SSO / Identity Center

### Key Services to Research
- What compute? (EC2, ECS, Lambda, Fargate)
- What storage? (S3, RDS, DynamoDB, ElastiCache)
- What networking? (VPC, ALB, CloudFront, Route53)
- What messaging? (SQS, SNS, EventBridge)
- What monitoring? (CloudWatch, X-Ray)

### Constraints
- Service quotas (vary per service and region)
- Cold start latency (Lambda)
- S3 request rate limits (5,500 GET/s per prefix)

---

## GitHub / GitLab <a id="github-gitlab"></a>

### Authentication
- Personal Access Tokens (classic or fine-grained)
- GitHub Apps (JWT + installation tokens)
- OAuth Apps

### Core APIs
| API | Use Case |
|-----|----------|
| REST API v3 | CRUD on repos, issues, PRs, etc. |
| GraphQL API v4 | Efficient queries, nested data |
| Webhooks | Event-driven integrations |
| Git Data API | Low-level git operations |

### Constraints
- Rate limits: 5,000/hour (authenticated), 60/hour (unauthenticated)
- GraphQL: 5,000 points/hour
- Secondary rate limits on content creation

---

## Slack / Teams <a id="slack-teams"></a>

### Slack
- Bot tokens (xoxb-) for app actions
- User tokens (xoxp-) for user-scoped actions
- Web API (chat.postMessage, conversations.list, etc.)
- Events API or Socket Mode for real-time
- Rate limits: Tier 1 (1/min) through Tier 4 (100+/min) per method

### Microsoft Teams
- Microsoft Graph API (/v1.0/teams/, /v1.0/chats/)
- Application permissions vs delegated permissions
- Webhooks for notifications
- Rate limits: 30 requests/10 seconds per app per tenant

---

## Generic REST API Platform <a id="generic-rest"></a>

When researching any unfamiliar platform API, look for:

1. **Authentication**: What auth methods? Token-based? OAuth? API key in header?
2. **Base URL pattern**: Versioned? Instance-specific?
3. **CRUD operations**: Which HTTP methods supported?
4. **Filtering/querying**: Query parameter syntax? OData? GraphQL?
5. **Pagination**: Offset-based? Cursor-based? Link headers?
6. **Rate limits**: Per-minute? Per-hour? Per-endpoint?
7. **Webhooks/events**: Push notifications available?
8. **Bulk operations**: Batch endpoints? Import/export?
9. **Schema introspection**: Can you discover the data model via API?
10. **SDKs**: Official client libraries in which languages?

---

## Database-backed Products <a id="database"></a>

For products that primarily involve data storage and querying:

### Questions to answer
- What database type? (Relational, Document, Graph, Time-series, Vector)
- What query language? (SQL, MQL, Cypher, PromQL, etc.)
- What is the schema / data model?
- How is multi-tenancy handled? (shared DB, schema-per-tenant, DB-per-tenant)
- What indexing strategy?
- What caching layer? (Redis, Memcached, application-level)
- What is the write path? (synchronous, write-ahead log, event sourcing)
- What is the read path? (direct query, materialized views, CQRS)

---

## AI/LLM-powered Products <a id="ai-llm"></a>

For products with AI/LLM components:

### LLM Integration Pattern
- Which LLM provider(s)? (OpenAI, Anthropic, open-source)
- Function/tool calling or free-form generation?
- Streaming responses?
- What's in the system prompt?
- What tools are exposed to the LLM?

### RAG Architecture (if applicable)
- What data is embedded? (docs, code, conversations)
- Embedding model? (text-embedding-3-small, etc.)
- Vector store? (pgvector, Pinecone, Qdrant, Chroma)
- Chunk size and overlap strategy?
- Retrieval: top-k, reranking, hybrid search?

### Agent Architecture (if applicable)
- What actions can the agent take?
- What external APIs does it call via tools?
- How is session/memory managed?
- Human-in-the-loop checkpoints?
- How are multi-step workflows orchestrated? (LangGraph, custom, etc.)

### Cost and Performance
- Estimated tokens per request?
- Caching strategy for repeated queries?
- Fallback model for cost optimization?
- Evaluation/quality measurement approach?
