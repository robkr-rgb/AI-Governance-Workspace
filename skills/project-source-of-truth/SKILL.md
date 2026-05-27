---
name: project-source-of-truth
description: Use when the user wants Git/GitHub to be the single source of truth across local files, Claude projects, Cursor workspaces, Codex workspaces, GitHub repos, or scattered project folders. Trigger for requests to scan all projects, validate whether work is in Git, migrate local/Claude/Cursor folders to repos, reconcile dirty clones, update a project registry, or explain the forward operating model.
metadata:
  short-description: Keep projects unified in Git
---

# Project Source Of Truth

Use this skill to make Git/GitHub the durable source of truth for projects scattered across local folders, Claude, Cursor, Codex, and existing repositories.

## Default Workspace

For Rob's current setup, use:

```text
/Users/rob/Documents/Ai governance
```

Expected control files:

```text
PROJECTS.md
REPO_VALIDATION.md
README.md
```

Treat that folder as the control plane. Nested project folders are separate Git repositories and should be ignored by the control-plane repo.

## Operating Rules

- Git is the durable source of truth.
- AI tools are working surfaces, not the permanent record.
- Durable output must land in project files and be committed.
- Prefer one canonical clone under the control workspace for active work.
- Older Claude/Cursor/local copies may be kept temporarily, but should not remain the active working copy after migration.
- Never delete duplicate folders during migration unless the user explicitly asks.
- Never commit secrets, `.env`, local settings, caches, build outputs, or OS noise.
- Use private GitHub repos by default for migrated personal/local projects.

## Inventory Workflow

When asked to scan or validate project coverage:

1. List authenticated GitHub repos:

```bash
gh repo list robkr-rgb --limit 200 --json name,url,visibility,isPrivate,updatedAt,primaryLanguage,description
```

2. Scan likely local project surfaces:

```bash
find /Users/rob/Documents/Claude/Projects -maxdepth 3 -type d -print
find /Users/rob/Documents/Claude/Projects -maxdepth 3 -type d -name .git -print
find /Users/rob -maxdepth 4 \( -path '/Users/rob/Library' -o -path '/Users/rob/.Trash' -o -path '/Users/rob/Applications' \) -prune -o \( -name .git -o -name package.json -o -name pyproject.toml -o -name Cargo.toml -o -name README.md -o -name AGENTS.md -o -name CLAUDE.md \) -print 2>/dev/null
```

3. Check Cursor-specific locations when the user mentions Cursor:

```bash
find /Users/rob -maxdepth 3 -type d \( -name '*Cursor*' -o -name '*cursor*' -o -name 'Cursortest' \) -print 2>/dev/null
```

4. For each candidate folder, classify:

- Clean Git repo with remote
- Dirty Git repo with local-only work
- Git repo without remote
- Project-like folder without Git
- Duplicate clone
- Tool/application state, not project source

## Validation Commands

For a repo:

```bash
git status --short --untracked-files=all
git branch --show-current
git remote -v
git ls-files | wc -l
```

For many known project folders:

```bash
for d in /path/to/projects/*; do
  [ -d "$d" ] || continue
  if git -C "$d" rev-parse --show-toplevel >/dev/null 2>&1; then
    printf '%s|' "$d"
    git -C "$d" branch --show-current
    printf '|'
    git -C "$d" status --short --untracked-files=all | wc -l | tr -d ' '
    printf '|'
    git -C "$d" remote -v | tr '\n' ' '
    printf '\n'
  fi
done
```

## Migration Workflow

For a project-like folder without its own Git repo:

1. Inspect for generated files and secrets.
2. Add a local `.gitignore` before `git add`.
3. Initialize Git.
4. Commit.
5. Create a private GitHub repo.
6. Push.
7. Clone or pull it into the control workspace.
8. Update `PROJECTS.md` and `REPO_VALIDATION.md`.

Suggested `.gitignore` baseline:

```gitignore
.DS_Store
.env
.env.*
!.env.example
.claude/settings.local.json
__pycache__/
*.pyc
node_modules/
.venv/
venv/
dist/
build/
*.log
.~lock*
```

Private repo creation pattern:

```bash
git init -b main
git add .
git commit -m "Initial commit: <project name>"
gh repo create robkr-rgb/<repo-name> --private --source . --remote origin --push
```

## Reconciliation Workflow

For dirty repos that already have a remote:

1. Inspect `git status --short --untracked-files=all`.
2. Inspect `git diff --stat`.
3. Commit local work with a clear message.
4. Push the current branch.
5. If push is rejected because remote moved, fetch and rebase on the remote branch, then push.
6. If push is denied to an upstream org repo, preserve work in a private personal mirror under `robkr-rgb`.

Do not force-push unless the user explicitly asks and the risk is clear.

## Large Files

If GitHub rejects a push because a file is over 100 MB:

1. Install Git LFS if needed.
2. Run `git lfs install`.
3. Track or migrate the large file type.
4. Push again.

Example:

```bash
git lfs install
git lfs migrate import --include='*.mov' --include-ref=refs/heads/main
git push -u origin main
```

## Registry Updates

Keep `PROJECTS.md` concise:

- project name
- local path in the control workspace
- GitHub remote
- status
- source of truth
- important notes such as non-main branch or Git LFS

Keep `REPO_VALIDATION.md` factual:

- validation date
- scan scope
- repositories found
- branches
- clean/dirty state
- migrations performed
- duplicate clones
- tool state intentionally not migrated
- remaining cleanup

Commit and push registry changes after each migration pass.

## Forward Operating Model

When explaining the way forward:

1. Use `/Users/rob/Documents/Ai governance` as the launch point.
2. Work from canonical clones there.
3. Before work: `git pull` and `git status`.
4. During work: write durable outputs to files.
5. After work: commit and push.
6. Periodically validate old Claude/Cursor/local folders until duplicates can be archived.

## Final Verification

Before reporting completion:

```bash
git status --short
for d in /Users/rob/Documents/Ai\ governance/*; do
  [ -d "$d/.git" ] || continue
  c=$(git -C "$d" status --short --untracked-files=all | wc -l | tr -d ' ')
  if [ "$c" != "0" ]; then echo "$d has $c changes"; fi
done
```

Report clearly:

- what was migrated
- what was reconciled
- what remains intentionally unmigrated
- any repos with non-main branches
- any Git LFS use
- any duplicate local clones
