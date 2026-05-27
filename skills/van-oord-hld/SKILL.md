---
name: van-oord-hld
description: >
  Generate or fill in a Van Oord High Level Design (HLD) document using the official Van Oord HLD template (Template v3.0).
  Use this skill whenever the user asks to create, fill in, update, or generate a High Level Design document, HLD, system design document, or architecture document for a Van Oord project or system.
  Also trigger when the user asks to document architecture, solution design, system context, IAM design, security design, infrastructure design, or any section of the HLD for a system.
  The skill extracts known context from the conversation, asks targeted questions for missing required fields, generates architecture diagrams as images where needed, and produces a fully formatted .docx output matching the Van Oord template.
  Always use this skill — do not attempt to produce an HLD document without it.
---

# Van Oord High Level Design Skill

## Overview

Produces a fully filled Van Oord HLD `.docx` based on Template v3.0.

**Template asset:** `assets/HLD_template_van_oord.dotx`
**Docx skill:** Read `/mnt/skills/public/docx/SKILL.md` before writing any document code.

---

## Step 1 — Context Extraction

Before asking any questions, scan the current conversation for known facts. Extract:

| Field | Look for |
|---|---|
| System Name | explicit name, product name, integration name |
| Business Domain | project context, department, domain |
| Author | user's name if known |
| Date | current date or project date |
| Project type | new system, upgrade, integration, SaaS onboarding |
| Environments | DEV / TEST / ACC / PROD mentions |
| Integrations | any system names, APIs, connectors |
| Hosting model | Azure / on-prem / SaaS / hybrid |
| IAM approach | SSO, EntraID, SailPoint, SCIM |
| Security requirements | GDPR, ISO 27001, NIS2, criticality level |
| RTO / RPO | any continuity/recovery values |

---

## Step 2 — Gap Assessment & Targeted Questions

After extraction, determine which sections have insufficient content to fill in meaningfully.
Group missing info into a single structured question block. Never ask more than 8 questions at once.

### Required fields (always needed)
- System Name
- Business Domain
- Author name
- Initial version date
- Brief system purpose (2-3 sentences)

### Section-specific gaps to check

| Section | Key gaps to fill |
|---|---|
| 2.1 System Introduction | What does the system do? Who uses it? Why now? |
| 2.2 Process Context | Which business process does it support? |
| 2.3 Solution Concept | High-level architecture concept (SaaS/custom/hybrid?) |
| 3.1 Business Information Flows | What data flows in/out? Which systems? |
| 4.1-4.2 Application Architecture | Functional blocks? Tech stack? |
| 4.3 Environments | Which environments are needed? Topology differences? |
| 5.1-5.2 Interfaces | Inbound/outbound integrations, protocols, formats |
| 6.1 Continuity | Business Criticality Level (CL1-4), RTO, RPO |
| 7.x IAM | Identity types in scope, auth protocol, MFA |
| 8.x Compliance | GDPR applicability, ISO 27001, NIS2, other |
| 9.x Security | Data classification, encryption requirements |
| 10.x Infrastructure | Hosting model, Azure regions, network security |

---

## Step 3 — Diagram Generation

For sections requiring diagrams, generate them as PNG images using Python (matplotlib, Pillow, or SVG-to-PNG).
Save to `/home/claude/hld_diagrams/`.

### Diagrams to generate (where content is available)

| Section | Diagram type | Notes |
|---|---|---|
| 2.2 Process Context | Swim-lane or simple flowchart | Show process steps and actors |
| 2.3 Solution Concept | Whiteboard-style architecture sketch | Boxes and arrows: actors to system to integrations |
| 3.1 Business Information Flows | Data flow diagram | Source to system to destination with data labels |
| 3.2 Data Store | Data store diagram | Which system owns which business concept |
| 4.1 Logical Application Architecture | Functional block diagram | Functional groupings, not technical |
| 4.2 Technical Application Architecture | Technical stack diagram | Technologies, layers, databases, cloud components |
| 10.1 Infrastructure Architecture | Infrastructure diagram | Network zones, FW, LB, WAF, hosting |
| 10.3 Solution & Cloud Topology | Geographic topology | User locations, WAN/Internet flows, SaaS vendors |

### Diagram style guidance
- Van Oord color palette: primary #253A79 (dark blue), accent #FF8702 (orange), neutral #605E5C
- Clean, professional, labeled boxes with arrows
- Include a title and legend where needed
- Output size: 1600x900 px minimum, 150 dpi

If content for a diagram is insufficient: insert a placeholder box in the document with the text
`<Insert [Diagram Type] Diagram>` and a note listing what info is needed.

---

## Step 4 — Document Generation

Read `/mnt/skills/public/docx/SKILL.md` fully before writing code.

Use the edit existing document approach:
1. Copy `assets/HLD_template_van_oord.dotx` to `/home/claude/hld_template_work.docx`
2. Unpack: `python3 /mnt/skills/public/docx/scripts/office/unpack.py /home/claude/hld_template_work.docx /home/claude/hld_work/`
3. Edit `document.xml` to replace all placeholders with actual content
4. Insert generated diagram images into the appropriate sections
5. Pack: `python3 /mnt/skills/public/docx/scripts/office/pack.py /home/claude/hld_work/ /mnt/user-data/outputs/HLD_<SystemName>_v<Version>.docx --original /home/claude/hld_template_work.docx`
6. Validate

### Placeholder replacement map

| Template placeholder | Replace with |
|---|---|
| `<System Name>` | Actual system name |
| `<Business domain>` | Actual domain |
| `<Author>` | Author name |
| `<Date>` | Date string |
| `<MMM DD, YYYY>` | Formatted date |
| `<Initials>` | Author initials |
| `<Reason>` | Initial version reason |
| `HLD <System Name> Version 1.0` | Updated version string |
| All BA:, EA:, SA: guidance text | Remove or replace with actual content |
| All `<Insert ... Diagram>` placeholders | Embedded diagram image or kept as placeholder |

### Content population rules

- Tables: Fill rows with known data; leave example rows as-is if no data available; add TBD for unknown cells
- Narrative sections: Write concise, professional prose using context and answers. No filler text.
- Sections with no available data: Keep header and add: `Content to be provided by [responsible role]. See template guidance.`
- Remove all BA/SA/EA role guidance text from final sections — it is authoring guidance, not output
- Revision History: Populate row 1 with current date, version 0.1, author, "Initial draft"
- Approvals table: Leave initials/dates blank; names are fixed in template

---

## Step 5 — Output & Delivery

Present the file with `present_files`.

Provide a fill status summary alongside the file:

```
## HLD Fill Status — <System Name>

| Section | Status | Notes |
|---|---|---|
| Cover / Doc Control | Complete | |
| 1. About this Document | Complete | |
| 2. System & Solution Context | Partial | Process diagram is placeholder |
| 3. Information Architecture | Empty | No data flow info provided |
| ... | | |
```

---

## Section Responsibilities Reference

| Section | Primary Role |
|---|---|
| 1. About this Document | BA |
| 2. System & Solution Context | BA + EA |
| 3. Information Architecture | BA + EA |
| 4. Application Architecture | ICA + SA |
| 5. Communication & Interfacing | BA + IA |
| 6. System Continuity & Resilience | BA + SEC |
| 7. IAM | BA + SEC |
| 8. Compliance | BA + SEC |
| 9. Security & Privacy | BA + SEC |
| 10. Infrastructure Architecture | ICA + SA |
| Appendix A | SEC |

---

## Van Oord HLD Template Structure (v3.0)

1. About this Document (Purpose, Audience, Related Docs, Abbreviations)
2. System & Solution Context (Intro, Process Context, Solution Concept)
3. Information Architecture (Business Info Flows, Data Store Diagram)
4. Application Architecture (Logical, Technical, Environments Overview)
5. Communication & Interfacing (Exposed Services, Interfaces, Specifics)
6. System Continuity & Resilience (Objectives, Risks, DR Strategy, Backup, DR Infrastructure)
7. Identity & Access Management (Identity Types, Account Types, Lifecycle, Federation, Authentication, Authorization)
8. Legal, Regulatory & Contractual Compliance (Overview, Design)
9. Security & Privacy (Objectives, Controls, Classification, Logging, Encryption, Privacy)
10. Infrastructure Architecture (Architecture, Environment Spec, Solution Topology)
Appendix A: Security Control Mapping (ISO 27001:2022 Annex A)

---

## Error Handling

- If template asset is missing: abort and ask user to re-upload `High_Level_Design_template_van_oord.dotx`
- If diagram generation fails: insert placeholder text, note the failure, continue with document
- If pack/validate fails: unpack again, inspect XML errors, fix, retry
