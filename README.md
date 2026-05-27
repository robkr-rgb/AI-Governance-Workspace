# AI Governance Workspace

This repository is the local control layer for AI-assisted work. It is intentionally small: use it to track the project registry, workspace conventions, and cross-tool operating notes.

Project source files should live in their own repositories beneath this folder, such as `ServiceNow-Agentic-Architect/`.

Repository visibility default: create all new GitHub repositories as private unless Rob explicitly asks for a public repository.

Start with:

- `PROJECTS.md` for the project map
- each project's `.ai/context.md` for portable AI context
- each project's Git history for durable work

## Codex Skills

Git-backed skill source lives under `skills/`. Installed runtime skills live under `~/.codex/skills/`.

Current installed skill:

- Source: `skills/project-source-of-truth/SKILL.md`
- Installed copy: `/Users/rob/.codex/skills/project-source-of-truth/SKILL.md`

Extracted Claude skill:

- Source: `skills/skills-auto-improver/`
- Installed copy: `/Users/rob/.codex/skills/skills-auto-improver/`
- Manifest: `claude/SKILLS_MANIFEST.md`

When updating a skill, edit the Git-backed source first, then copy or sync it to the installed Codex skill path.

## Codex Environment

Git-backed Codex environment source lives under `codex/`.

Runtime config remains installed under `/Users/rob/.codex`, but only portable, sanitized configuration is tracked here. Secrets, tokens, SQLite databases, session history, logs, plugin caches, and app bundles stay local.

Start with:

- `codex/config.toml` for sanitized Codex configuration
- `codex/rules/default.rules` for command approval rules
- `codex/SYNC_POLICY.md` for what is intentionally excluded
- `codex/secrets.example.env` for required local secret names
