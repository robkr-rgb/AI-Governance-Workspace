# Skill-authoring best practices (fallback baseline)

This file is the offline fallback for Phase 3. It enumerates rules the auto-improver applies when web research is unavailable. Every rule is actionable: a Phase 4 proposer can use it as a checklist against the candidate SKILL.md.

If web research is available, merge anything new from the latest Anthropic public docs on top of these rules; do not replace them.

## Frontmatter

1. `name` is required; lowercase kebab-case; matches the directory name.
2. `description` is required; must read like an instruction to a triage layer, not a marketing line.
3. Keep frontmatter to a single block at the top of the file. No nested YAML.

## Description content

4. Open the description with the verb the user is most likely to say (e.g. "Create", "Generate", "Analyse", "Audit", "Review"). The first verb seeds trigger matching.
5. Include three to seven concrete trigger phrases the user is likely to type, quoted. Quoted phrases are stronger signal than free prose.
6. Cover at least one synonym set per trigger (e.g. "improve / audit / update / refresh" together).
7. Add a "use even when" clause if the skill is at risk of undertriggering on adjacent phrasings (e.g. "use even when the user does not mention X explicitly").
8. Remove dead keywords — phrases that no longer match what the skill actually does. They drag precision down.
9. Avoid promises the body cannot keep ("always returns sub-second"). Triggering is a routing decision; promises are noise.

## Body content

10. State the objective in one paragraph at the top. The orchestrator and the user should agree on the goal before the first heading.
11. List hard constraints early. Reversibility, idempotency, network-write rules belong before any workflow steps.
12. Number workflow phases. Each phase has an explicit exit condition. Unbounded phases are a smell.
13. Replace ALL-CAPS MUSTs with reasoning where possible. "Snapshot first because the eval can flake" is stronger than "MUST snapshot first".
14. Keep tables short. Long markdown tables are skipped by the model under load.
15. Reference scripts and references by relative path. Absolute paths break across hosts.
16. Avoid duplicating instructions across the body and a sub-reference file. Pick one home for each rule.

## Reference and script hygiene

17. Every path the SKILL.md mentions must exist. Dead links erode trust on every read.
18. Scripts must accept arguments and emit JSON to stdout (or a path). The skill body decides what to do with the output; scripts stay decoupled.
19. Each script has a top docstring stating its contract: inputs, outputs, side effects.
20. Reference files are read-only at runtime. They are notes for the model, not configuration.

## Failure modes

21. List the top three failure modes and their recovery actions. Silent skips are forbidden.
22. If a tool the skill depends on may be missing, name the fallback explicitly (e.g. "If skill-creator is not installed, use the keyword-overlap eval and flag weak-eval in the report").

## Trigger accuracy hygiene

23. The auto-improver uses an eval harness to score before/after triggering. Edits that drop the score by more than 0.03 are reverted.
24. Edits inside the ±0.03 dead band are applied only if they are pure clarity improvements (no trigger phrase changes).
25. Re-test after every applied edit; the harness is the source of truth, not the author's intuition.

## Style

26. Imperative voice. "Snapshot the tree" not "We snapshot the tree".
27. Concrete examples beat abstract claims. One worked example > three principles.
28. Keep the file under ~400 lines. Beyond that, factor into references/.
29. Headings are short noun phrases. Avoid full sentences in headings.
30. No emoji, no decorative dividers. Skill files are read by the orchestrator first, the human second.
