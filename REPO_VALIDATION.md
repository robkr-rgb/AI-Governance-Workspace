# Repository Validation

Validation date: 2026-05-27

## Scope

This validation compares the authenticated GitHub repositories under `robkr-rgb` with the local project folders inside `/Users/rob/Documents/Ai governance`.

## Result

All 9 GitHub repositories are represented locally.

Each project folder is its own Git repository and tracks its corresponding GitHub remote. The top-level workspace repository tracks only the registry/control files and intentionally ignores nested project repositories.

This is not yet the complete source-of-truth picture for all local project work on the Mac. A broader scan found older Claude project folders under `/Users/rob/Documents/Claude/Projects` with local-only changes that are not yet reconciled into the clean workspace clones.

## Repositories

| Repository | Local path | Branch | Git state | README | Tracked files |
|---|---|---:|---|---|---:|
| `AI-Governance-Workspace` | `./` | `main` | Clean | Yes | 4 |
| `ServiceNow-Agentic-Architect` | `ServiceNow-Agentic-Architect/` | `main` | Clean | Yes | 22 |
| `van-oord-it-intake` | `van-oord-it-intake/` | `main` | Clean | Yes | 11 |
| `minions` | `minions/` | `main` | Clean | Yes | 394 |
| `STT` | `STT/` | `main` | Clean | Yes | 27 |
| `sonar` | `sonar/` | `main` | Clean | Yes | 89 |
| `servicenow-architect-agent` | `servicenow-architect-agent/` | `main` | Clean | Yes | 52 |
| `tictactoe-game` | `tictactoe-game/` | `TicTacToe` | Clean | Yes | 3 |
| `claude-config` | `claude-config/` | `main` | Clean | Yes | 19 |

## Notes

- `tictactoe-game` uses branch `TicTacToe`, tracking `origin/TicTacToe`.
- The top-level workspace registry is private on GitHub.
- `ServiceNow-Agentic-Architect` is public; the other project repositories are private.
- No local untracked files were found in the cloned project repositories at validation time.

## Additional Local Project Findings

The following local project folders exist outside the new AI Governance workspace and need reconciliation before GitHub can be treated as the complete source of truth.

| Local folder | Remote/source | State | Action needed |
|---|---|---|---|
| `/Users/rob/Documents/Claude/Projects/ServiceNow_Architect_Agent` | `https://github.com/robkr-rgb/servicenow-architect-agent.git` | 7 modified tracked files | Review, commit, and push or migrate changes into `servicenow-architect-agent/`. |
| `/Users/rob/Documents/Claude/Projects/Happy-Platform-MCP` | `https://github.com/Happy-Technologies-LLC/happy-platform-mcp.git` | 5 modified tracked files, 2 untracked files | Review separately; this is not under `robkr-rgb`. |
| `/Users/rob/Documents/Claude/Projects/SONAR` | `https://github.com/robkr-rgb/sonar.git` | 2 modified tracked files, 1 untracked file | Review, commit, and push or migrate changes into `sonar/`. |
| `/Users/rob/Documents/Claude/Projects/IT Demand Intake` | `https://github.com/robkr-rgb/van-oord-it-intake.git` | 3 modified tracked files | Review, commit, and push or migrate changes into `van-oord-it-intake/`. |
| `/Users/rob/Documents/Claude/Projects/Minions` | `https://github.com/robkr-rgb/minions.git` | Branch `v0.5`, 363 untracked files | Decide whether branch `v0.5` and untracked `.agents/` content should be preserved and pushed. |
| `/Users/rob/Documents/Claude/Projects/STT` | `https://github.com/robkr-rgb/STT.git` | Clean | No reconciliation needed. |
| `/Users/rob/Documents/Claude/Projects/QualityScan ServiceNow` | currently tracked only by `/Users/rob/Documents` parent repo | 80 tracked files in parent repo, 1 untracked local file | Create a dedicated repo or explicitly archive/migrate this project. |

## Exact Local Deltas

### ServiceNow Architect Agent

```text
M web/.env.example
M web/README.md
M web/lib/agent.js
M web/public/app.js
M web/public/index.html
M web/public/style.css
M web/server.js
```

### Happy Platform MCP

```text
M .env.example
M config/servicenow-instances.json
M package-lock.json
M package.json
M src/server.js
?? public/agent.html
?? src/agent.js
```

### SONAR

```text
M sonar-v0.3/mac_app/settings_blueprint.py
M sonar-v0.3/servicenow/api.py
?? AGENTS.md
```

### IT Demand Intake

```text
M backend/app.py
M backend/requirements.txt
M frontend/index.html
```

### Minions

```text
Branch: v0.5
Untracked files: 363
Primary untracked area: .agents/skills/
```

### QualityScan ServiceNow

```text
Dedicated project repo: missing
Tracked in parent repo: 80 files
Untracked file: AGENTS.md
```

## Next Validation Step

Reconcile the local-only Claude project changes into their GitHub repos. After that, the new AI Governance workspace can become the stable launch point for all AI tools.
