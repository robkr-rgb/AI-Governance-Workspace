#!/usr/bin/env python3
"""
Discover SKILL.md files under SKILLS_ROOT and emit a JSON array.

Contract (per skills-auto-improver SKILL.md, Phase 1):
  Output a JSON array. Each element has fields:
    name, path, source ("user"|"plugin"), writable, frontmatter_valid,
    lines, last_modified

Usage:
  discover.py <SKILLS_ROOT> [--out PATH]

If --out is omitted, JSON is printed to stdout.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


REQUIRED_FRONTMATTER_KEYS = ("name", "description")


def is_plugin_managed(skill_path: Path) -> bool:
    """A skill is plugin-managed if its path contains 'plugins' or
    'hostloop-plugins' or sits under a directory whose parent has a
    `plugin.json`/`manifest.json`. Heuristic — good enough to flag risk."""
    parts = {p.lower() for p in skill_path.parts}
    if "plugins" in parts or "hostloop-plugins" in parts:
        return True
    cur = skill_path.parent
    for _ in range(4):
        if (cur / "plugin.json").exists() or (cur / "manifest.json").exists():
            return True
        if cur.parent == cur:
            break
        cur = cur.parent
    return False


def parse_frontmatter(text: str) -> dict | None:
    """YAML frontmatter parser. Prefer PyYAML; fall back to a parser that
    handles folded (`>`) and literal (`|`) block scalars used by some skills."""
    if not text.startswith("---"):
        return None
    end = text.find("\n---", 3)
    if end == -1:
        return None
    block = text[3:end].strip("\n")

    try:
        import yaml  # type: ignore
        loaded = yaml.safe_load(block)
        if isinstance(loaded, dict):
            return {str(k): "" if v is None else str(v).strip() for k, v in loaded.items()}
        return None
    except Exception:
        pass

    # Fallback: handle simple `key: value` plus `key: >` / `key: |` blocks.
    out: dict[str, str] = {}
    lines = block.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.lstrip().startswith("#"):
            i += 1
            continue
        if ":" not in line:
            return None
        k, _, v = line.partition(":")
        key = k.strip()
        val = v.strip()
        if val in (">", "|", ">-", "|-", ">+", "|+"):
            i += 1
            collected: list[str] = []
            while i < len(lines) and (lines[i].startswith((" ", "\t")) or not lines[i].strip()):
                collected.append(lines[i].strip())
                i += 1
            joined = " ".join(s for s in collected if s) if val.startswith(">") else "\n".join(collected)
            out[key] = joined.strip()
            continue
        out[key] = val
        i += 1
    return out


def inspect(skill_md: Path) -> dict:
    try:
        text = skill_md.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        return {
            "name": skill_md.parent.name,
            "path": str(skill_md),
            "source": "plugin" if is_plugin_managed(skill_md) else "user",
            "writable": False,
            "frontmatter_valid": False,
            "lines": 0,
            "last_modified": None,
            "error": f"read failed: {e}",
        }
    fm = parse_frontmatter(text)
    valid = bool(fm) and all(k in fm for k in REQUIRED_FRONTMATTER_KEYS)
    name = (fm or {}).get("name") or skill_md.parent.name
    try:
        mtime = skill_md.stat().st_mtime
    except OSError:
        mtime = None
    writable = os.access(skill_md, os.W_OK)
    return {
        "name": name,
        "path": str(skill_md),
        "source": "plugin" if is_plugin_managed(skill_md) else "user",
        "writable": writable,
        "frontmatter_valid": valid,
        "lines": text.count("\n") + 1,
        "last_modified": mtime,
    }


def discover(root: Path) -> list[dict]:
    if not root.exists():
        return []
    skills: list[dict] = []
    for path in sorted(root.rglob("SKILL.md")):
        if not path.is_file():
            continue
        skills.append(inspect(path))
    return skills


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("root", help="SKILLS_ROOT directory")
    ap.add_argument("--out", help="Optional output JSON path")
    args = ap.parse_args()

    root = Path(os.path.expanduser(args.root)).resolve()
    skills = discover(root)
    payload = json.dumps(skills, indent=2, ensure_ascii=False)
    if args.out:
        out = Path(os.path.expanduser(args.out))
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(payload, encoding="utf-8")
        print(f"wrote {out} ({len(skills)} skills)")
    else:
        print(payload)
    return 0


if __name__ == "__main__":
    sys.exit(main())
