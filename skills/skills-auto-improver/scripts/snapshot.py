#!/usr/bin/env python3
"""
Snapshot the skills tree to a timestamped backup directory.

Contract (per skills-auto-improver SKILL.md, Phase 2):
  Plain `cp -a` of <SKILLS_ROOT> into <DEST>. No git required.
  Exit only after every SKILL.md from the source exists in the dest.

Usage:
  snapshot.py <SKILLS_ROOT> <DEST>

Exits non-zero if dest already exists with content, or if the post-copy
verification finds any SKILL.md missing.
"""
from __future__ import annotations

import os
import shutil
import sys
from pathlib import Path


def list_skill_mds(root: Path) -> list[Path]:
    return sorted(p for p in root.rglob("SKILL.md") if p.is_file())


def main() -> int:
    if len(sys.argv) != 3:
        print("usage: snapshot.py <SKILLS_ROOT> <DEST>", file=sys.stderr)
        return 2

    src = Path(os.path.expanduser(sys.argv[1])).resolve()
    dst = Path(os.path.expanduser(sys.argv[2])).resolve()

    if not src.exists():
        print(f"src does not exist: {src}", file=sys.stderr)
        return 1
    if dst.exists() and any(dst.iterdir()):
        print(f"dst already populated: {dst}", file=sys.stderr)
        return 1

    dst.parent.mkdir(parents=True, exist_ok=True)

    # copytree with symlinks preserved, metadata preserved (cp -a behaviour).
    shutil.copytree(src, dst, symlinks=True, dirs_exist_ok=False)

    src_skills = {p.relative_to(src) for p in list_skill_mds(src)}
    dst_skills = {p.relative_to(dst) for p in list_skill_mds(dst)}
    missing = src_skills - dst_skills
    if missing:
        print(f"verify failed; missing in dst: {sorted(missing)}", file=sys.stderr)
        return 1

    print(f"snapshot ok: {len(src_skills)} skills copied to {dst}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
