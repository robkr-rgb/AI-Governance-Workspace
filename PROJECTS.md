# AI Governance Project Registry

This file is the local map of active projects. Each project should have one canonical folder or repository, with AI tools treated as working surfaces rather than sources of truth.

## Operating Rules

- Git is the durable source of truth for project code, docs, and decisions.
- The local workspace is the navigation layer across tools and repositories.
- Cloud AI projects, Claude Code sessions, Codex threads, and chat histories are temporary workbenches.
- Anything worth keeping should be written back to the relevant project repo.
- Each active project should include a `.ai/` folder for portable context.

## Projects

| Project | Local path | Remote | Status | Source of truth | Notes |
|---|---|---|---|---|---|
| AI Governance Workspace | `./` | `https://github.com/robkr-rgb/AI-Governance-Workspace` | Active | GitHub repo + local clone | Private registry and operating layer for AI-assisted projects. |
| ServiceNow Agentic Architect | `ServiceNow-Agentic-Architect/` | `https://github.com/robkr-rgb/ServiceNow-Agentic-Architect` | Active | GitHub repo + local clone | ServiceNow-native autonomous optimization agent. |
| Van Oord IT Intake | `van-oord-it-intake/` | `https://github.com/robkr-rgb/van-oord-it-intake` | Active | GitHub repo + local clone | Private HTML project. |
| Minions | `minions/` | `https://github.com/robkr-rgb/minions` | Active | GitHub repo + local clone | Private Python project. |
| STT | `STT/` | `https://github.com/robkr-rgb/STT` | Active | GitHub repo + local clone | Private Python project. |
| Sonar | `sonar/` | `https://github.com/robkr-rgb/sonar` | Active | GitHub repo + local clone | Private Python project. |
| ServiceNow Architect Agent | `servicenow-architect-agent/` | `https://github.com/robkr-rgb/servicenow-architect-agent` | Active | GitHub repo + local clone | Private JavaScript project. |
| Tic Tac Toe Game | `tictactoe-game/` | `https://github.com/robkr-rgb/tictactoe-game` | Active | GitHub repo + local clone | Private HTML project. Uses branch `TicTacToe`. |
| Claude Config | `claude-config/` | `https://github.com/robkr-rgb/claude-config` | Active | GitHub repo + local clone | Private Python/config project. |

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
