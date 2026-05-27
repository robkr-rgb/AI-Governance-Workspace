# Claude Skills Extraction

Extraction date: 2026-05-27

## Claude UI Personal Skills

| Claude source | Git-backed source | Installed Codex copy | Notes |
|---|---|---|---|
| `/Users/rob/.claude/skills/skills-auto-improver` | `skills/skills-auto-improver` | `/Users/rob/.codex/skills/skills-auto-improver` | Extracted from Claude and installed for Codex. `__pycache__` files and Claude README were excluded. |
| Claude skills plugin storage: `calendar-analysis` | `skills/calendar-analysis` | `/Users/rob/.codex/skills/calendar-analysis` | Extracted from Claude UI personal skills. |
| Claude skills plugin storage: `csdm-pptx` | `skills/csdm-pptx` | `/Users/rob/.codex/skills/csdm-pptx` | Extracted from Claude UI personal skills. |
| Claude skills plugin storage: `pptx` | `skills/pptx` | `/Users/rob/.codex/skills/pptx` | Extracted from Claude UI personal skills. |
| Claude skills plugin storage: `reverse-engineer` | `skills/reverse-engineer` | `/Users/rob/.codex/skills/reverse-engineer` | Extracted from Claude UI personal skills. |
| Claude skills plugin storage: `skill-creator` | `skills/skill-creator` | `/Users/rob/.codex/skills/skill-creator` | Extracted from Claude UI personal skills. |
| Claude skills plugin storage: `van-oord-hld` | `skills/van-oord-hld` | `/Users/rob/.codex/skills/van-oord-hld` | Extracted from Claude UI personal skills. |
| Claude generated skill artifact: `vanoord-pptx` | `skills/vanoord-pptx` | `/Users/rob/.codex/skills/vanoord-pptx` | Extracted from Claude local session output; this corresponds to the greyed UI item. |

`/Users/rob/.claude/user-skills/skills-auto-improver/SKILL.md` was checked and matched the global Claude skill.

## Project-Scoped Claude/BMAD Skills

The Minions project contains a larger project-scoped skill library:

| Location | Count | Source of truth |
|---|---:|---|
| `/Users/rob/Documents/Ai governance/minions/.agents/skills` | 59 | `https://github.com/robkr-rgb/minions`, branch `v0.5` |
| `/Users/rob/Documents/Ai governance/minions/.claude/skills` | 59 | `https://github.com/robkr-rgb/minions`, branch `v0.5` |

Those skills were already committed and pushed with the Minions project. They are not duplicated in this control repo to avoid split ownership.

## Extracted Skill Names

Global:

- `skills-auto-improver`
- `calendar-analysis`
- `csdm-pptx`
- `pptx`
- `reverse-engineer`
- `skill-creator`
- `van-oord-hld`
- `vanoord-pptx`

Project-scoped in Minions:

- `bmad-advanced-elicitation`
- `bmad-agent-analyst`
- `bmad-agent-architect`
- `bmad-agent-builder`
- `bmad-agent-dev`
- `bmad-agent-pm`
- `bmad-agent-tech-writer`
- `bmad-agent-ux-designer`
- `bmad-bmb-setup`
- `bmad-brainstorming`
- `bmad-check-implementation-readiness`
- `bmad-checkpoint-preview`
- `bmad-cis-agent-brainstorming-coach`
- `bmad-cis-agent-creative-problem-solver`
- `bmad-cis-agent-design-thinking-coach`
- `bmad-cis-agent-innovation-strategist`
- `bmad-cis-agent-presentation-master`
- `bmad-cis-agent-storyteller`
- `bmad-cis-design-thinking`
- `bmad-cis-innovation-strategy`
- `bmad-cis-problem-solving`
- `bmad-cis-storytelling`
- `bmad-code-review`
- `bmad-correct-course`
- `bmad-create-architecture`
- `bmad-create-epics-and-stories`
- `bmad-create-prd`
- `bmad-create-story`
- `bmad-create-ux-design`
- `bmad-customize`
- `bmad-dev-story`
- `bmad-distillator`
- `bmad-document-project`
- `bmad-domain-research`
- `bmad-edit-prd`
- `bmad-editorial-review-prose`
- `bmad-editorial-review-structure`
- `bmad-eval-runner`
- `bmad-generate-project-context`
- `bmad-help`
- `bmad-index-docs`
- `bmad-investigate`
- `bmad-market-research`
- `bmad-module-builder`
- `bmad-party-mode`
- `bmad-prd`
- `bmad-prfaq`
- `bmad-product-brief`
- `bmad-qa-generate-e2e-tests`
- `bmad-quick-dev`
- `bmad-retrospective`
- `bmad-review-adversarial-general`
- `bmad-review-edge-case-hunter`
- `bmad-shard-doc`
- `bmad-sprint-planning`
- `bmad-sprint-status`
- `bmad-technical-research`
- `bmad-validate-prd`
- `bmad-workflow-builder`
