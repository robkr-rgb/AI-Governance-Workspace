---
name: skills-auto-improver
description: Research, propose, apply, and verify improvements to all installed Claude skills. Use this skill whenever the user asks to improve, audit, update, upgrade, optimize, refresh, or auto-update their skills, skill library, skill collection, or SKILL.md files. Trigger on "improve my skills", "update all skills", "audit my skills", "keep skills current", "skill health check", "refresh skill descriptions", "tune skill triggers", or when running the nightly skills-auto-improver scheduled task. Always trigger this skill for any meta-level skill maintenance request, not just when the user explicitly names it.
---

# Skills Auto-Improver

Meta-skill that keeps a user's full skill library healthy without manual curation. Runs on demand or from a nightly schedule, writes a morning report, rolls back edits that regress trigger accuracy.

## Objective

Given the set of SKILL.md files on disk, produce a measurably better set by the next morning. "Better" means: higher trigger accuracy, clearer descriptions, stronger instructions, fewer dead references, alignment with current Anthropic skill-authoring guidance. All changes must be auditable and reversible.

## Hard constraints

Read these first. They shape every decision below.

1. **Edits must be reversible.** Before touching any SKILL.md, snapshot the entire skills tree to a timestamped backup directory. The rollback path must be trivial.
2. **Regressions are auto-reverted.** An edit that lowers trigger accuracy on the eval harness is reverted without asking. Report it but do not keep it.
3. **Plugin-managed skills may be overwritten on plugin update.** The user has accepted this risk. Record which skills are plugin-managed in the report so the user knows re-installation may undo edits.
4. **No network writes.** Web research is read-only. The only writes are to the local filesystem.
5. **Fail safe, not silent.** If a step cannot complete (missing tool, read-only FS, eval harness broken), record it in the morning report. Do not silently skip.

## Workflow

Execute these phases in order. Each phase has an explicit exit condition.

### Phase 0 — Setup

- Resolve `SKILLS_ROOT` by checking, in order, these paths and picking the first that contains at least one `SKILL.md` descendant:
  1. `~/.claude/skills`
  2. `~/Library/Application Support/Claude/skills`
  3. Any path returned by `find ~ -type d -name skills -maxdepth 6 2>/dev/null | xargs -I {} sh -c 'ls {}/*/SKILL.md 2>/dev/null >/dev/null && echo {}' | head -1`
  4. The hostloop plugin cache under `/var/folders/*/T/claude-hostloop-plugins/*/skills` (read-only — only usable for the research phase, not for writes)
- Resolve `WORK_ROOT` = `~/.claude/skill-auto-improver`. Create if missing. Subdirs: `snapshots/`, `reports/`, `proposals/`, `evals/`.
- Record the run timestamp as `RUN_ID` (format `YYYY-MM-DD-HHMM`).

Exit when both roots resolved and writable. If `SKILLS_ROOT` is read-only, fork every target skill into `~/.claude/skills/<name>/` before editing and continue from there; note the fork in the report.

### Phase 1 — Discover

Run `scripts/discover.py`. It returns a JSON array of skills with fields: `name`, `path`, `source` (`user` | `plugin`), `writable` (bool), `frontmatter_valid` (bool), `lines`, `last_modified`. Skip skills where `frontmatter_valid` is false; flag them in the report as broken, don't try to improve them.

Exit when the discovery JSON is written to `WORK_ROOT/reports/<RUN_ID>/discovery.json`.

### Phase 2 — Snapshot

Run `scripts/snapshot.py <SKILLS_ROOT> <WORK_ROOT>/snapshots/<RUN_ID>`. This is a plain `cp -a` of the tree. No git required.

Exit when the snapshot directory exists and contains a copy of every SKILL.md found in Phase 1.

### Phase 3 — Research

Gather current Anthropic skill-authoring guidance. Cache it so subsequent skills in the same run reuse the result; do not re-fetch per skill.

- Use `WebSearch` (or `WebFetch` if a URL is known) to pull the latest public skill-authoring docs. Seed queries: `Anthropic skill authoring best practices 2026`, `Claude skills SKILL.md frontmatter triggers`, `skill-creator description optimization`.
- Also read `references/best_practices.md` in this skill as a fallback baseline. Merge anything new from the web into an in-memory checklist.
- Persist the merged checklist to `WORK_ROOT/reports/<RUN_ID>/research.md`.

Exit when `research.md` exists and contains at least 10 discrete, actionable rules (e.g. "descriptions should include concrete trigger phrases").

### Phase 4 — Propose

For each skill from Phase 1 (writable=true only):

1. Read its current SKILL.md.
2. Compare against the checklist from Phase 3.
3. Draft a proposed SKILL.md. Focus on:
   - Description: cover more trigger phrasings, add a "use even when" clause if the skill undertriggers, remove dead keywords.
   - Body: collapse redundancy, add missing "why" rationale, reduce ALL-CAPS MUSTs where reasoning can replace them.
   - References: verify any file paths the skill mentions still exist; remove dead links.
4. Write the draft to `WORK_ROOT/proposals/<RUN_ID>/<skill-name>/SKILL.md` alongside a `diff.txt` versus the original and a `rationale.md` stating the top 3 changes.

Exit when every writable skill has a proposal directory. Skills whose proposed draft is byte-identical to the original are marked "no-op" and skipped in later phases.

### Phase 5 — Eval & apply

This is the crux. Do each skill independently so one failure does not block others.

For each skill with a non-no-op proposal:

1. **Baseline eval.** Run `scripts/eval_trigger.py --skill <original-path>`. This uses the skill-creator's trigger optimization mechanism (`run_loop.py` or a minimal re-implementation) with a 20-query eval set auto-generated from the skill's description and name. Record `baseline_score` (0.0–1.0).
2. **Candidate eval.** Run the same harness against the proposal. Record `candidate_score`.
3. **Decision:**
   - `candidate_score > baseline_score + 0.03` → apply (copy proposal over the original)
   - `candidate_score` within ±0.03 of baseline → apply only if the diff is a pure clarity improvement (no trigger changes); otherwise skip
   - `candidate_score < baseline_score - 0.03` → **rollback**, do not apply, record as regression
4. Log the decision, both scores, and the applied-or-not flag to `WORK_ROOT/evals/<RUN_ID>/<skill-name>.json`.

If the eval harness itself fails for a skill (timeout, missing API access, malformed eval set), skip the apply step for that skill and mark it "eval-unavailable" in the report. Do not apply a change without a successful eval.

Exit when every proposal has either a decision logged or a skip reason.

### Phase 6 — Report

Write `WORK_ROOT/reports/<RUN_ID>/report.md` with the structure below. This is the artefact the user reads in the morning.

```
# Skills auto-improver report — <RUN_ID>

## Summary

- Skills scanned: <n>
- Proposals drafted: <n>
- Applied: <n>
- Rolled back (regression): <n>
- Skipped (eval unavailable / read-only / no-op): <n>
- Broken frontmatter detected: <n>

## Applied changes

| Skill | Baseline | Candidate | Δ | Headline change |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## Rolled back

| Skill | Baseline | Candidate | Δ | Reason |
| ... | ... | ... | ... | ... |

## Skipped

| Skill | Reason |
| ... | ... |

## Research sources consulted

- <url or path>
- ...

## Rollback instructions

To undo this entire run:

    cp -a <WORK_ROOT>/snapshots/<RUN_ID>/. <SKILLS_ROOT>/

## Next actions suggested

- ...
```

Exit when the report exists and the Summary section is populated.

### Phase 7 — Deliver

If invoked interactively, surface the report path and open it. If invoked by the nightly scheduled task, leave the report at the canonical path and rely on the morning notification from the scheduled-tasks MCP to tell the user where it is.

## Failure modes and recovery

| Symptom | Likely cause | Action |
|---|---|---|
| `SKILLS_ROOT` not found | User's Claude config moved | Fall back to `find ~ -maxdepth 6`. If still nothing, write an error-only report and exit cleanly. |
| All skills read-only | Hostloop cache is the only source | Fork each skill to `~/.claude/skills/<name>/` and continue. |
| WebSearch blocked | Offline or rate-limited | Use `references/best_practices.md` as the only research input. Flag in report. |
| Eval harness missing | skill-creator not installed | Use the minimal trigger-scorer in `scripts/eval_trigger.py` (keyword-overlap baseline). Flag as "weak eval" in report. |
| Edit fails mid-run | Disk full, permissions flip | Restore from `snapshots/<RUN_ID>` immediately. Report the partial state. |

## Why each phase exists

- **Snapshot before proposal** because the eval harness itself might flake; you must be able to unwind regardless of what happens later.
- **Research once per run** because Anthropic's guidance does not change across skills within a single night. Fetching 15 times is waste.
- **Draft before eval** because the eval is the expensive step; cheap changes should survive drafting or be discarded before you pay for a benchmark.
- **±0.03 dead band** because small fluctuations in trigger scores are noise. Applying in the noise range inflates churn without improving the skill.

## Extending this skill

If you need to add a new signal (e.g. usage telemetry, source-doc drift checks), add a new script under `scripts/` and a new section to the Phase 3 / Phase 4 instructions above. Keep the contract simple: scripts emit JSON to `WORK_ROOT/...`, the skill body decides what to do with it.

## Reference files

- `references/best_practices.md` — distilled Anthropic skill-authoring rules. Always read if the network is unavailable.
- `references/rollback.md` — decision tree for when to roll back vs. keep an edit.
- `scripts/discover.py` — skill discovery.
- `scripts/snapshot.py` — snapshot the skills tree.
- `scripts/eval_trigger.py` — trigger-accuracy eval, with a graceful fallback if skill-creator's `run_loop.py` is unavailable.
- `scripts/report.py` — morning report generator.
