# Rollback decision tree

Used by Phase 5 of the auto-improver. The aim is a deterministic answer for every (baseline_score, candidate_score) pair so an unattended run is safe to leave alone.

## Inputs

- `baseline_score` — eval score for the unchanged SKILL.md (0.0 to 1.0)
- `candidate_score` — eval score for the proposed SKILL.md (0.0 to 1.0)
- `delta = candidate_score - baseline_score`
- `weak_eval` — true if the keyword-overlap fallback was used

## Decision table

| Condition | Action | Rationale |
|---|---|---|
| `delta > +0.03` and not `weak_eval` | apply | Clear improvement under a real eval. |
| `delta > +0.03` and `weak_eval` | apply, flag "weak eval" | The fallback eval is noisier; the gain is large enough to outweigh the noise. |
| `-0.03 <= delta <= +0.03` and diff is pure-clarity (no description trigger changes) | apply | Inside the dead band; clarity edits don't risk routing. |
| `-0.03 <= delta <= +0.03` and diff touches description triggers | skip | Dead-band trigger churn is noise; do not apply. |
| `delta < -0.03` | rollback, do not apply | Regression. Auto-revert per hard constraint #2. |
| `baseline_score < 0` (eval failed) | skip, mark "eval unavailable" | Cannot assert anything safely. |
| `candidate_score < 0` (eval failed) | skip, keep baseline | Same reason. |

## Why ±0.03

20-query keyword-overlap evals show roughly 0.025 standard deviation across reseed runs on stable skills. ±0.03 is one sigma plus a small safety margin. Tightening the band churns more files for no real gain; widening it lets regressions through.

## Rollback mechanics

A rolled-back skill is one where the proposal was drafted and evaluated but never copied over the original. There is nothing to undo on disk because the original SKILL.md was never overwritten.

Mass rollback (revert the whole run) uses the snapshot:

    cp -a <WORK_ROOT>/snapshots/<RUN_ID>/. <SKILLS_ROOT>/

This is the canary procedure if a future run looks corrupt and the per-skill log is unreadable.

## What never gets auto-applied

- Edits to the auto-improver's own SKILL.md. Do not let it improve itself unsupervised; the failure mode is a meta-loop where it edits its own triggers.
- Edits that introduce new external commands the body did not previously call. New side effects need human review.
- Edits that change the `name` field in frontmatter. Renames break references in scheduled tasks and other skills.

## Logging contract

For each evaluated skill, write `WORK_ROOT/evals/<RUN_ID>/<skill-name>.json` with at least:

```json
{
  "skill": "<name>",
  "baseline_score": 0.85,
  "candidate_score": 0.91,
  "delta": 0.06,
  "weak_eval": false,
  "decision": "applied",
  "headline": "Added quoted trigger phrases for 'audit' synonyms",
  "reason": ""
}
```

`decision` is one of `applied`, `rolled_back`, `skipped`, `no_op`, `eval_unavailable`. Every other field is optional but recommended for the morning report.
