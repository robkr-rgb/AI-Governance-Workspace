#!/usr/bin/env python3
"""
Generate the morning report at WORK_ROOT/reports/<RUN_ID>/report.md.

Contract (per skills-auto-improver SKILL.md, Phase 6):
  Read discovery.json + evals/<RUN_ID>/*.json + research.md
  Emit report.md with the prescribed structure.

Usage:
  report.py <WORK_ROOT> <RUN_ID> [--skills-root PATH]
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


def safe_load_json(p: Path) -> dict | list | None:
    if not p.is_file():
        return None
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return None


def read_evals(eval_dir: Path) -> list[dict]:
    out: list[dict] = []
    if not eval_dir.is_dir():
        return out
    for jf in sorted(eval_dir.glob("*.json")):
        d = safe_load_json(jf)
        if isinstance(d, dict):
            d.setdefault("file", jf.name)
            out.append(d)
    return out


def fmt_delta(b: float | None, c: float | None) -> str:
    if b is None or c is None:
        return "-"
    return f"{c - b:+.2f}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("work_root")
    ap.add_argument("run_id")
    ap.add_argument("--skills-root", default="~/.claude/skills")
    args = ap.parse_args()

    work = Path(os.path.expanduser(args.work_root)).resolve()
    run_dir = work / "reports" / args.run_id
    run_dir.mkdir(parents=True, exist_ok=True)
    eval_dir = work / "evals" / args.run_id

    discovery = safe_load_json(run_dir / "discovery.json") or []
    research_md = (run_dir / "research.md")
    research_text = research_md.read_text(encoding="utf-8") if research_md.is_file() else ""
    evals = read_evals(eval_dir)

    by_skill = {e.get("skill", e.get("file", "?")): e for e in evals}

    applied = [e for e in evals if e.get("decision") == "applied"]
    rolled_back = [e for e in evals if e.get("decision") == "rolled_back"]
    skipped = [e for e in evals if e.get("decision") in ("no_op", "eval_unavailable", "skipped")]
    broken = [s for s in discovery if isinstance(s, dict) and not s.get("frontmatter_valid", True)]

    out: list[str] = []
    out.append(f"# Skills auto-improver report — {args.run_id}")
    out.append("")
    out.append("## Summary")
    out.append("")
    out.append(f"- Skills scanned: {len(discovery)}")
    out.append(f"- Proposals drafted: {len([e for e in evals if e.get('proposed', True)])}")
    out.append(f"- Applied: {len(applied)}")
    out.append(f"- Rolled back (regression): {len(rolled_back)}")
    out.append(f"- Skipped (eval unavailable / read-only / no-op): {len(skipped)}")
    out.append(f"- Broken frontmatter detected: {len(broken)}")
    out.append("")

    out.append("## Applied changes")
    out.append("")
    out.append("| Skill | Baseline | Candidate | Δ | Headline change |")
    out.append("|---|---|---|---|---|")
    for e in applied:
        out.append(
            f"| {e.get('skill','?')} | {e.get('baseline_score','-')} | "
            f"{e.get('candidate_score','-')} | "
            f"{fmt_delta(e.get('baseline_score'), e.get('candidate_score'))} | "
            f"{e.get('headline','')} |"
        )
    if not applied:
        out.append("| (none) | | | | |")
    out.append("")

    out.append("## Rolled back")
    out.append("")
    out.append("| Skill | Baseline | Candidate | Δ | Reason |")
    out.append("|---|---|---|---|---|")
    for e in rolled_back:
        out.append(
            f"| {e.get('skill','?')} | {e.get('baseline_score','-')} | "
            f"{e.get('candidate_score','-')} | "
            f"{fmt_delta(e.get('baseline_score'), e.get('candidate_score'))} | "
            f"{e.get('reason','regression')} |"
        )
    if not rolled_back:
        out.append("| (none) | | | | |")
    out.append("")

    out.append("## Skipped")
    out.append("")
    out.append("| Skill | Reason |")
    out.append("|---|---|")
    for e in skipped:
        out.append(f"| {e.get('skill','?')} | {e.get('reason','-')} |")
    for s in broken:
        out.append(f"| {s.get('name','?')} | broken frontmatter |")
    if not skipped and not broken:
        out.append("| (none) | |")
    out.append("")

    out.append("## Research sources consulted")
    out.append("")
    if research_text:
        # crude: pull lines that look like URLs or paths
        for line in research_text.splitlines():
            if line.startswith("- "):
                out.append(line)
    else:
        out.append("- references/best_practices.md (web research unavailable)")
    out.append("")

    out.append("## Rollback instructions")
    out.append("")
    out.append("To undo this entire run:")
    out.append("")
    out.append(f"    cp -a {work}/snapshots/{args.run_id}/. {os.path.expanduser(args.skills_root)}/")
    out.append("")

    out.append("## Next actions suggested")
    out.append("")
    if broken:
        out.append(f"- Fix frontmatter for: {', '.join(s.get('name','?') for s in broken)}")
    if rolled_back:
        out.append("- Investigate regressions; the candidates were not strictly better.")
    if not (applied or rolled_back):
        out.append("- Library is stable; nothing changed. Consider expanding research sources.")
    out.append("")

    report_md = run_dir / "report.md"
    report_md.write_text("\n".join(out), encoding="utf-8")
    print(f"wrote {report_md}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
