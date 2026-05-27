#!/usr/bin/env python3
"""
Trigger-accuracy eval for a single SKILL.md.

Contract (per skills-auto-improver SKILL.md, Phase 5):
  Score how well a skill triggers on a 20-query auto-generated eval set.
  Prefer skill-creator's `run_loop.py` when available. Fall back to a
  keyword-overlap heuristic and flag the run as "weak eval" so the
  caller can record it in the report.

Output (stdout, JSON):
  {
    "skill": "<name>",
    "skill_path": "<abs path to SKILL.md>",
    "harness": "skill-creator" | "keyword-overlap",
    "score": 0.0..1.0,
    "queries": <int>,
    "hits": <int>,
    "weak_eval": <bool>,
    "notes": "<free text>"
  }

Usage:
  eval_trigger.py --skill <SKILL.md path> [--queries N]
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import random
import re
import sys
from pathlib import Path


STOPWORDS = {
    "a", "an", "the", "and", "or", "of", "to", "for", "in", "on", "with",
    "by", "is", "are", "be", "as", "it", "this", "that", "from", "at",
    "any", "all", "use", "when", "if", "user", "users", "skill", "skills",
    "claude", "anthropic", "trigger", "triggers", "should", "must", "can",
    "do", "does", "not", "no", "into", "via", "using", "over", "across",
    "your", "their", "you", "they", "we", "us", "our", "my", "me", "i",
    "also", "just", "even", "etc", "such",
}


def parse_frontmatter(text: str) -> dict:
    """YAML frontmatter parser; tolerates folded (`>`) and literal (`|`) blocks."""
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end == -1:
        return {}
    block = text[3:end].strip("\n")
    try:
        import yaml  # type: ignore
        loaded = yaml.safe_load(block)
        if isinstance(loaded, dict):
            return {str(k): "" if v is None else str(v).strip() for k, v in loaded.items()}
    except Exception:
        pass
    out: dict[str, str] = {}
    lines = block.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        if ":" not in line:
            i += 1
            continue
        k, _, v = line.partition(":")
        key = k.strip()
        val = v.strip()
        if val in (">", "|", ">-", "|-", ">+", "|+"):
            i += 1
            collected: list[str] = []
            while i < len(lines) and (lines[i].startswith((" ", "\t")) or not lines[i].strip()):
                collected.append(lines[i].strip())
                i += 1
            out[key] = " ".join(s for s in collected if s).strip()
            continue
        out[key] = val
        i += 1
    return out


def extract_keywords(description: str, name: str, top_k: int = 30) -> list[str]:
    """Pull candidate trigger phrases from quoted strings and bag-of-words."""
    quoted = re.findall(r'["“]([^"”]{3,40})["”]', description)
    quoted = [q.strip() for q in quoted if q.strip()]
    tokens = [
        t.lower()
        for t in re.findall(r"[A-Za-z][A-Za-z0-9_\-\.]+", description + " " + name)
        if t.lower() not in STOPWORDS and len(t) > 2
    ]
    # de-dup keeping order
    seen: set[str] = set()
    uniq_tokens: list[str] = []
    for t in tokens:
        if t not in seen:
            seen.add(t)
            uniq_tokens.append(t)
    # quoted phrases first; they're the strongest signal
    return quoted[:top_k] + uniq_tokens[:top_k]


def synth_queries(name: str, description: str, n: int, seed: int = 0) -> list[tuple[str, bool]]:
    """Build N queries: a mix of positives (should trigger) and negatives.

    Positives are paraphrases anchored on quoted trigger phrases / nouns.
    Negatives are unrelated tasks. Returns list of (query, expected_hit).
    """
    rng = random.Random(seed)
    kws = extract_keywords(description, name)
    positives: list[str] = []
    if kws:
        templates = [
            "Help me {kw}",
            "Can you {kw} for me",
            "{kw}",
            "I need to {kw}",
            "Please {kw}",
            "How do I {kw}",
        ]
        for kw in kws:
            for tpl in templates:
                positives.append(tpl.format(kw=kw))
                if len(positives) >= n:
                    break
            if len(positives) >= n:
                break

    distractors = [
        "What's the weather in Berlin",
        "Tell me a joke",
        "Translate hello to French",
        "Recommend a book on stoicism",
        "Convert 5 miles to km",
        "What is the capital of Brazil",
        "Explain dark matter",
        "Write a haiku about coffee",
        "Suggest a vegetarian dinner recipe",
        "Summarise the plot of Hamlet",
    ]

    half = max(1, n // 2)
    pos = positives[:half]
    while len(pos) < half:
        pos.append(name)  # last-ditch positive
    neg = list(distractors)
    rng.shuffle(neg)
    neg = neg[: n - len(pos)]
    out = [(q, True) for q in pos] + [(q, False) for q in neg]
    rng.shuffle(out)
    return out[:n]


def keyword_score(query: str, kws: list[str]) -> float:
    """Hit if any keyword (case-insensitive) appears as a substring."""
    q = query.lower()
    for kw in kws:
        if kw.lower() in q:
            return 1.0
    return 0.0


def find_skill_creator_loop() -> Path | None:
    """Look for skill-creator's run_loop.py near common roots."""
    candidates = [
        Path.home() / ".claude" / "skills" / "skill-creator" / "scripts" / "run_loop.py",
        Path.home() / ".claude" / "skills" / "anthropic-skills" / "skill-creator" / "scripts" / "run_loop.py",
    ]
    for p in candidates:
        if p.is_file():
            return p
    # search hostloop cache (read-only) — last resort
    for base in Path("/var/folders").glob("*/T/claude-hostloop-plugins/*/skills/skill-creator/scripts/run_loop.py"):
        return base
    return None


def try_skill_creator(skill_md: Path, queries: int) -> dict | None:
    loop = find_skill_creator_loop()
    if not loop:
        return None
    try:
        spec = importlib.util.spec_from_file_location("run_loop", loop)
        if spec is None or spec.loader is None:
            return None
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)  # type: ignore[attr-defined]
        if not hasattr(mod, "score_skill"):
            return None
        result = mod.score_skill(str(skill_md), queries=queries)  # type: ignore[attr-defined]
        if not isinstance(result, dict) or "score" not in result:
            return None
        return {
            "harness": "skill-creator",
            "score": float(result["score"]),
            "queries": int(result.get("queries", queries)),
            "hits": int(result.get("hits", 0)),
            "weak_eval": False,
            "notes": result.get("notes", ""),
        }
    except Exception as e:  # pragma: no cover — runtime safety
        return {
            "harness": "skill-creator-failed",
            "score": -1.0,
            "queries": 0,
            "hits": 0,
            "weak_eval": True,
            "notes": f"skill-creator threw: {e}",
        }


def eval_keyword(skill_md: Path, queries: int) -> dict:
    text = skill_md.read_text(encoding="utf-8", errors="replace")
    fm = parse_frontmatter(text)
    name = fm.get("name", skill_md.parent.name)
    description = fm.get("description", "")
    kws = extract_keywords(description, name)
    qs = synth_queries(name, description, queries)
    hits = 0
    for q, expected in qs:
        score = keyword_score(q, kws)
        # hit on positives, miss on negatives
        if expected and score >= 1.0:
            hits += 1
        elif not expected and score < 1.0:
            hits += 1
    return {
        "harness": "keyword-overlap",
        "score": hits / max(1, len(qs)),
        "queries": len(qs),
        "hits": hits,
        "weak_eval": True,
        "notes": "Fallback heuristic. Install skill-creator for a stronger eval.",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--skill", required=True, help="Path to a SKILL.md")
    ap.add_argument("--queries", type=int, default=20)
    args = ap.parse_args()

    skill_md = Path(os.path.expanduser(args.skill)).resolve()
    if not skill_md.is_file():
        print(json.dumps({"error": f"not a file: {skill_md}"}))
        return 1

    fm = parse_frontmatter(skill_md.read_text(encoding="utf-8", errors="replace"))
    name = fm.get("name", skill_md.parent.name)

    result = try_skill_creator(skill_md, args.queries)
    if result is None or result["score"] < 0:
        result = eval_keyword(skill_md, args.queries)

    out = {"skill": name, "skill_path": str(skill_md), **result}
    print(json.dumps(out, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
