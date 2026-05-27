# Codex Sync Policy

## Goal

Git is the source of truth for Codex configuration and project operating rules, while secrets and volatile runtime state remain local.

## Tracked In Git

| Runtime path | Git-backed source | Notes |
|---|---|---|
| `/Users/rob/.codex/config.toml` | `codex/config.toml` | Sanitized. Secret values are placeholders. |
| `/Users/rob/.codex/rules/default.rules` | `codex/rules/default.rules` | Safe to sync. |
| `/Users/rob/.codex/skills/project-source-of-truth/SKILL.md` | `skills/project-source-of-truth/SKILL.md` | Safe to sync. |

## Not Tracked In Git

| Runtime path | Reason |
|---|---|
| `/Users/rob/.codex/auth.json` | Contains OpenAI auth tokens/API key material. |
| `/Users/rob/.codex/config.toml` secret values | Contains ServiceNow and Obsidian credentials locally. |
| `/Users/rob/.codex/*.sqlite*` | Runtime databases. |
| `/Users/rob/.codex/sessions/` | Conversation/session history. |
| `/Users/rob/.codex/logs_*.sqlite*` | Runtime logs. |
| `/Users/rob/.codex/shell_snapshots/` | Runtime shell state. |
| `/Users/rob/.codex/cache/` | Rebuildable cache. |
| `/Users/rob/.codex/plugins/cache/` | Installed plugin cache. |
| `/Users/rob/.codex/vendor_imports/` | Imported vendor content/cache. |
| `/Users/rob/.codex/computer-use/Codex Computer Use.app` | Installed application bundle. |
| `/Users/rob/.codex/.tmp/` | Temporary files. |

## Secret Handling

Current local Codex configuration uses inline MCP credentials. The Git-backed `codex/config.toml` replaces those values with placeholders.

Required local secret values are listed in `codex/secrets.example.env`. Store real values in a password manager or local-only file, not Git.

## Restore Model

On a fresh machine:

1. Clone `AI-Governance-Workspace`.
2. Install Codex.
3. Copy or merge safe config from `codex/`.
4. Install personal skills from `skills/`.
5. Restore secrets manually from the password manager/local vault.
6. Run a project validation pass.
