# Codex Environment Source

This folder is the Git-backed source for the portable parts of the local Codex environment.

Installed runtime location:

```text
/Users/rob/.codex
```

Git-backed source location:

```text
/Users/rob/Documents/Ai governance/codex
```

## What Is Tracked

- `config.toml`: sanitized Codex configuration with plugins, MCP servers, trusted projects, and placeholder secrets.
- `rules/default.rules`: command approval rules.
- `secrets.example.env`: names of required local secrets.
- `SYNC_POLICY.md`: what is and is not safe to sync.

Personal skills are tracked separately under:

```text
skills/
```

## What Is Not Tracked

The following Codex runtime files are intentionally not tracked:

- `auth.json`
- `*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`
- `sessions/`
- `logs_*.sqlite*`
- `shell_snapshots/`
- `cache/`
- `plugins/cache/`
- `.tmp/`
- `computer-use/Codex Computer Use.app`

Those are runtime state, credentials, caches, or app bundles, not portable source configuration.

## Updating Codex Config

1. Edit the Git-backed files in this folder first.
2. Apply safe files to `/Users/rob/.codex`.
3. Keep secrets out of Git.
4. Commit and push changes to `AI-Governance-Workspace`.

Do not copy `codex/config.toml` directly over `/Users/rob/.codex/config.toml` without restoring local secret values.
