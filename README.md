# AI Governance Workspace

This repository is the local control layer for AI-assisted work. It is intentionally small: use it to track the project registry, workspace conventions, and cross-tool operating notes.

Project source files should live in their own repositories beneath this folder, such as `ServiceNow-Agentic-Architect/`.

Start with:

- `PROJECTS.md` for the project map
- each project's `.ai/context.md` for portable AI context
- each project's Git history for durable work

## Codex Skills

Git-backed skill source lives under `skills/`. Installed runtime skills live under `~/.codex/skills/`.

Current installed skill:

- Source: `skills/project-source-of-truth/SKILL.md`
- Installed copy: `/Users/rob/.codex/skills/project-source-of-truth/SKILL.md`

When updating a skill, edit the Git-backed source first, then copy or sync it to the installed Codex skill path.
