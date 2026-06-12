# AI Governance Project Registry

This file is the local map of active projects. Each project should have one canonical folder or repository, with AI tools treated as working surfaces rather than sources of truth.

## Operating Rules

- Git is the durable source of truth for project code, docs, and decisions.
- The local workspace is the navigation layer across tools and repositories.
- Cloud AI projects, Claude Code sessions, Codex threads, and chat histories are temporary workbenches.
- Anything worth keeping should be written back to the relevant project repo.
- Each active project should include a `.ai/` folder for portable context.
- New GitHub repositories are private by default unless Rob explicitly asks for public visibility.

## Projects

| Project | Local path | Remote | Status | Source of truth | Notes |
|---|---|---|---|---|---|
| AI Governance Workspace | `./` | `https://github.com/robkr-rgb/AI-Governance-Workspace` | Active | GitHub repo + local clone | Private registry and operating layer for AI-assisted projects. |
| Abundly Refactor | `abundly-refactor/` | `https://github.com/robkr-rgb/AI-Governance-Workspace/tree/main/abundly-refactor` | Active | GitHub repo subfolder | Governed AI agent platform prototype reverse-engineered from Abundly public docs and attached architecture dossier. |
| Appy Runs ServiceNow Integration | `appy-runs-servicenow-integration/` | `https://github.com/robkr-rgb/appy-runs-servicenow-integration` | Active | GitHub repo + local clone | Private documentation workspace for the Appy Runs to ServiceNow integration document. |
| ServiceNow Agentic Architect | `ServiceNow-Agentic-Architect/` | `https://github.com/robkr-rgb/ServiceNow-Agentic-Architect` | Active | GitHub repo + local clone | ServiceNow-native autonomous optimization agent. |
| Van Oord IT Intake | `van-oord-it-intake/` | `https://github.com/robkr-rgb/van-oord-it-intake` | Active | GitHub repo + local clone | Private HTML project. |
| Minions | `minions/` | `https://github.com/robkr-rgb/minions` | Active | GitHub repo + local clone | Private Python project. Current workspace checkout uses branch `v0.5`. |
| STT | `STT/` | `https://github.com/robkr-rgb/STT` | Active | GitHub repo + local clone | Private Python project. |
| Sonar | `sonar/` | `https://github.com/robkr-rgb/sonar` | Active | GitHub repo + local clone | Private Python project. |
| ServiceNow Architect Agent | `servicenow-architect-agent/` | `https://github.com/robkr-rgb/servicenow-architect-agent` | Active | GitHub repo + local clone | Private JavaScript project. |
| Tic Tac Toe Game | `tictactoe-game/` | `https://github.com/robkr-rgb/tictactoe-game` | Active | GitHub repo + local clone | Private HTML project. Uses branch `TicTacToe`. |
| Claude Config | `claude-config/` | `https://github.com/robkr-rgb/claude-config` | Active | GitHub repo + local clone | Private Python/config project. |
| Cursor Test | `cursor-test/` | `https://github.com/robkr-rgb/cursor-test` | Active | GitHub repo + local clone | Migrated from `/Users/rob/Documents/Cursortest`. |
| Happy Platform MCP Local | `happy-platform-mcp-local/` | `https://github.com/robkr-rgb/happy-platform-mcp-local` | Active | GitHub repo + local clone | Private personal mirror because upstream org repo denied push access. |
| Home Agent | `home-agent/` | `https://github.com/robkr-rgb/home-agent` | Active | GitHub repo + local clone | Migrated from Claude project folder. |
| Homelab | `homelab/` | `https://github.com/robkr-rgb/homelab` | Active | GitHub repo + local clone | Migrated from Claude project folder. |
| QualityScan ServiceNow | `qualityscan-servicenow/` | `https://github.com/robkr-rgb/qualityscan-servicenow` | Active | GitHub repo + local clone | Migrated from Claude project folder. |
| QualityScan ServiceNow Scanner | `qualityscan-servicenow-scanner/` | `https://github.com/robkr-rgb/qualityscan-servicenow-scanner` | Active | GitHub repo + local clone | Migrated from Claude folder with a literal backslash in its name. |
| Reverse Engineer SOLAR | `reverse-engineer-solar/` | `https://github.com/robkr-rgb/reverse-engineer-solar` | Active | GitHub repo + local clone | Uses Git LFS for a large `.mov` asset. |
| ROBot | `robot/` | `https://github.com/robkr-rgb/robot` | Active | GitHub repo + local clone | Migrated from Claude project folder. |
| SONAR v2 | `sonar-v2/` | `https://github.com/robkr-rgb/sonar-v2` | Active | GitHub repo + local clone | Migrated from Claude project folder; `.env` ignored. |
| TimeTracker | `timetracker/` | `https://github.com/robkr-rgb/timetracker` | Active | GitHub repo + local clone | Migrated from Claude project folder. |
| UniFi Network Audit & Hardening | `unifi-network-audit-hardening/` | `https://github.com/robkr-rgb/unifi-network-audit-hardening` | Active | GitHub repo + local clone | Migrated from Claude project folder. |
| Aspiresolutions | `aspiresolutions/` | `https://github.com/robkr-rgb/aspiresolutions` | Active | GitHub repo + local clone | Private project scaffold using the standard `.ai/` context setup. |
| Bruiloft Planner | `bruiloft-planner/` | `https://github.com/robkr-rgb/bruiloft-planner` | Active | GitHub repo + local clone | Private personal wedding-planning single-page React app (HTML/JSX, client-side, localStorage). |
| Networth Tracker | `networth-tracker/` | `https://github.com/robkr-rgb/networth-tracker` | Active | GitHub repo + local clone | Private personal net-worth tracker (Vite + React, client-side, localStorage). Per-asset-per-month ledger; seeded with historical xlsx data. |

| Wedding Website | `Wedding-website/` | `https://github.com/robkr-rgb/Wedding-website` | Active | GitHub repo | **Public** (governance deviation — made public to work around PAT scope limit; should be made private). Static HTML/CSS/JS wedding site for Marcela & Rob, 23 April 2027. |
## Standard Project Shape

```text
project/
  README.md
  PROJECT.md
  .ai/
    context.md
    tasks.md
    decisions.md
    prompts.md
  docs/
  src/
```

## Tool Handoff Checklist

Before starting work in any AI tool:

1. Open the canonical local project folder.
2. Check Git status and pull the latest remote changes.
3. Read `README.md`, `PROJECT.md` if present, and `.ai/context.md`.
4. Put durable outputs into project files, not only into chat.
5. Commit meaningful checkpoints.
6. Push when the result should be available to other tools or machines.
