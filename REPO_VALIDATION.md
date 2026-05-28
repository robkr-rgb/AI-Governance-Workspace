# Repository Validation

Validation date: 2026-05-28

## Scope

This validation compares authenticated GitHub repositories under `robkr-rgb` with local project folders found in:

- `/Users/rob/Documents/Ai governance`
- `/Users/rob/Documents/Claude/Projects`
- `/Users/rob/code`
- `/Users/rob`

The goal is to make Git the durable source of truth for work created through Codex, Claude, Cursor, GitHub, and local project folders.

This pass also covers portable Codex environment configuration from `/Users/rob/.codex`.

## Result

All discovered standalone Claude project folders have now been migrated to Git or reconciled with an existing GitHub repository.

The central AI Governance workspace contains clean local clones for all `robkr-rgb` repositories found during this pass. The top-level workspace repository tracks only registry/control files and intentionally ignores nested project repositories.

## Central Workspace Repositories

| Repository | Local path | Branch | Git state | README | Tracked files |
|---|---|---:|---|---|---:|
| `AI-Governance-Workspace` | `./` | `main` | Clean | Yes | 4 |
| `appy-runs-servicenow-integration` | `appy-runs-servicenow-integration/` | `main` | Clean | Yes | 7 |
| `ServiceNow-Agentic-Architect` | `ServiceNow-Agentic-Architect/` | `main` | Clean | Yes | 22 |
| `van-oord-it-intake` | `van-oord-it-intake/` | `main` | Clean | Yes | 11 |
| `minions` | `minions/` | `v0.5` | Clean | Yes | 759 |
| `STT` | `STT/` | `main` | Clean | Yes | 27 |
| `sonar` | `sonar/` | `main` | Clean | Yes | 90 |
| `servicenow-architect-agent` | `servicenow-architect-agent/` | `main` | Clean | Yes | 52 |
| `tictactoe-game` | `tictactoe-game/` | `TicTacToe` | Clean | Yes | 3 |
| `claude-config` | `claude-config/` | `main` | Clean | Yes | 19 |
| `cursor-test` | `cursor-test/` | `main` | Clean | No | 2 |
| `happy-platform-mcp-local` | `happy-platform-mcp-local/` | `main` | Clean | Yes | 115 |
| `home-agent` | `home-agent/` | `main` | Clean | No | 2 |
| `homelab` | `homelab/` | `main` | Clean | No | 3 |
| `qualityscan-servicenow` | `qualityscan-servicenow/` | `main` | Clean | No | 65 |
| `qualityscan-servicenow-scanner` | `qualityscan-servicenow-scanner/` | `main` | Clean | Yes | 4 |
| `reverse-engineer-solar` | `reverse-engineer-solar/` | `main` | Clean | No | 26 |
| `robot` | `robot/` | `main` | Clean | No | 3 |
| `sonar-v2` | `sonar-v2/` | `main` | Clean | No | 25 |
| `timetracker` | `timetracker/` | `main` | Clean | No | 3 |
| `unifi-network-audit-hardening` | `unifi-network-audit-hardening/` | `main` | Clean | No | 3 |

## Migrated Claude Project Folders

The following folders under `/Users/rob/Documents/Claude/Projects` were initialized as standalone Git repositories and pushed to private GitHub repositories:

| Claude folder | Repository | Notes |
|---|---|---|
| `Home Agent` | `https://github.com/robkr-rgb/home-agent` | Private repo created. |
| `Homelab` | `https://github.com/robkr-rgb/homelab` | Private repo created. |
| `QualityScan ServiceNow` | `https://github.com/robkr-rgb/qualityscan-servicenow` | Private repo created. Generated caches and lock files ignored. |
| `QualityScan\ ServiceNow` | `https://github.com/robkr-rgb/qualityscan-servicenow-scanner` | Private repo created for the separate folder whose name contains a literal backslash. |
| `ROBot` | `https://github.com/robkr-rgb/robot` | Private repo created. |
| `Reverse engineer SOLAR` | `https://github.com/robkr-rgb/reverse-engineer-solar` | Private repo created. Git LFS enabled for the 171 MB `.mov` file. |
| `SONAR-v2` | `https://github.com/robkr-rgb/sonar-v2` | Private repo created. `.env` ignored. |
| `TimeTracker` | `https://github.com/robkr-rgb/timetracker` | Private repo created. |
| `UniFi Network Audit & Hardening` | `https://github.com/robkr-rgb/unifi-network-audit-hardening` | Private repo created. |

## Migrated Cursor Project Folders

| Local folder | Repository | Notes |
|---|---|---|
| `/Users/rob/Documents/Cursortest` | `https://github.com/robkr-rgb/cursor-test` | Private repo created. `.claude/settings.local.json` ignored as local tool state. |

## Reconciled Existing Claude Repos

The following existing Claude project folders had local-only work. That work is now committed and pushed:

| Claude folder | Repository | Branch | Result |
|---|---|---:|---|
| `ServiceNow_Architect_Agent` | `https://github.com/robkr-rgb/servicenow-architect-agent` | `main` | Local changes committed and pushed. |
| `SONAR` | `https://github.com/robkr-rgb/sonar` | `main` | Local changes and `AGENTS.md` committed and pushed. |
| `IT Demand Intake` | `https://github.com/robkr-rgb/van-oord-it-intake` | `main` | Local commit rebased on latest remote and pushed. |
| `Minions` | `https://github.com/robkr-rgb/minions` | `v0.5` | `.agents/` and `.codex/` workspace content committed and pushed to branch `v0.5`. |
| `Happy-Platform-MCP` | `https://github.com/robkr-rgb/happy-platform-mcp-local` | `main` | Upstream org denied push access, so local changes were preserved in a private personal mirror. |

## Known Duplicate Local Clones

These folders are clean clones of repositories that are also represented in the AI Governance workspace:

| Local folder | Remote | State |
|---|---|---|
| `/Users/rob/code/claude-config` | `git@github.com:robkr-rgb/claude-config.git` | Clean duplicate clone. |
| `/Users/rob/tictactoe-game` | `https://github.com/robkr-rgb/tictactoe-game.git` | Clean duplicate clone. |

## Local Tool State Not Migrated

The following paths were discovered but intentionally not migrated as project source:

| Path | Reason |
|---|---|
| `/Users/rob/.claude/projects/-Users-rob-Documents-Cursortest` | Claude transcript/state storage, not canonical project source. |
| `/Users/rob/Library/Application Support/Cursor` | Cursor application state, not project source. |
| `/Users/rob/Documents/ObsidianVault` | Personal vault; contains `CLAUDE.md`, but was not treated as a project repo in this pass. |

## Notes

- `ServiceNow-Agentic-Architect` is now private; all newly created repositories are private by default.
- `appy-runs-servicenow-integration` was created as a private documentation workspace for the Appy Runs to ServiceNow integration document.
- Going forward, new GitHub repositories should be private by default unless Rob explicitly asks for public visibility.
- `tictactoe-game` uses branch `TicTacToe`.
- `minions` has important local work on branch `v0.5`.
- `reverse-engineer-solar` requires Git LFS for full fidelity because it includes a large video file.
- The broad `/Users/rob/Documents` parent repo still exists and may show changes because nested projects are now standalone repositories. It should no longer be treated as the source of truth for these projects.

## Codex Environment

Portable Codex configuration is now represented in Git under `codex/`.

| Runtime item | Git-backed source | Status |
|---|---|---|
| `/Users/rob/.codex/config.toml` | `codex/config.toml` | Tracked as sanitized source with placeholders for secrets. |
| `/Users/rob/.codex/rules/default.rules` | `codex/rules/default.rules` | Tracked. |
| `/Users/rob/.codex/skills/project-source-of-truth/SKILL.md` | `skills/project-source-of-truth/SKILL.md` | Tracked and installed copy synced. |
| Codex sync policy | `codex/SYNC_POLICY.md` | Tracked. |
| Required secret names | `codex/secrets.example.env` | Tracked without values. |

Codex runtime files intentionally not tracked include `auth.json`, SQLite databases, sessions, logs, shell snapshots, plugin caches, temporary files, and app bundles.

Live credentials were found in the local runtime Codex config and were not committed. They should be stored outside Git and rotated if exposed.

## Claude Skills

Claude skills were inventoried and extracted where appropriate.

| Source | Result |
|---|---|
| `/Users/rob/.claude/skills/skills-auto-improver` | Extracted to `skills/skills-auto-improver` and installed to `/Users/rob/.codex/skills/skills-auto-improver`. |
| `/Users/rob/.claude/user-skills/skills-auto-improver/SKILL.md` | Verified as identical to the global Claude skill. |
| Claude UI personal skills plugin storage | Extracted `calendar-analysis`, `csdm-pptx`, `pptx`, `reverse-engineer`, `skill-creator`, and `van-oord-hld` to `skills/` and installed them to `/Users/rob/.codex/skills/`. |
| Claude generated `vanoord-pptx` skill artifact | Extracted to `skills/vanoord-pptx` and installed to `/Users/rob/.codex/skills/vanoord-pptx`. |
| Minions `.agents/skills` and `.claude/skills` | 59 project-scoped BMAD skills are already tracked in `minions` on branch `v0.5`; not duplicated here. |

See `claude/SKILLS_MANIFEST.md`.

## Remaining Cleanup

- Decide whether to archive or remove duplicate local clones after a cooling-off period.
- Add `README.md` files to migrated repos that do not yet have one.
- Add `.ai/` context folders to active repos as they become current work.
- Revoke any exposed GitHub personal access token and rotate it if not already done.

## 2026-05-28 Update: Aspiresolutions

Created a new Git-backed project using the AI Governance workspace standard.

| Project | Local path | Repository | Branch | Result |
|---|---|---|---|---|
| Aspiresolutions | `/Users/rob/Documents/Ai governance/aspiresolutions` | `https://github.com/robkr-rgb/aspiresolutions` | `main` | Private repository created, initial scaffold committed, and branch pushed. |

The project includes `README.md`, `PROJECT.md`, `.ai/context.md`, `.ai/tasks.md`, `.ai/decisions.md`, `.ai/prompts.md`, `docs/`, and `src/`.
