#!/usr/bin/env python3
"""Blueprint archive classification rules.

Determines the subfolder inside docs/plans/archive/ for a given plan file.
Classification is based on the plan filename prefix pattern.

Usage:
    python scripts/archive_plans/plan_archive_classify.py PLAN_case_ssg_migration.md
    # Output: case
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Plan filename → archive subfolder mapping
# Order matters: more specific patterns first
_CLASSIFICATION_RULES: list[tuple[str, str]] = [
    (r"case", "case"),
    (r"content", "content"),
    (r"frontend", "frontend"),
    (r"performance", "performance"),
    (r"seo", "seo"),
    (r"tailwind", "tailwind"),
    (r"zod", "zod"),
    (r"astro|migration|ssg", "migration"),
    (r"docker", "infra"),
    (r"linear|workflow|tooling", "tooling"),
    (r"test|verify|lint", "testing"),
    (r"auth|security|permission", "security"),
    (r"api|backend|server", "backend"),
    (r"ui|component|theme", "frontend"),
    (r"data|schema|db|database", "data"),
]

# Fallback: extract from filename after "PLAN_" prefix
_FILENAME_PATTERN = re.compile(r"PLAN_(.+?)(?:_\d{8})?\.md$")


def classify_plan(plan_path: Path | str) -> str:
    """Classify a plan file into an archive subfolder.

    Args:
        plan_path: Path to the plan markdown file (basename only).

    Returns:
        Archive subfolder name (e.g. 'case', 'migration', 'infra').
    """
    if isinstance(plan_path, str):
        plan_path = Path(plan_path)

    basename = plan_path.name

    # Try explicit rules first
    for pattern, folder in _CLASSIFICATION_RULES:
        if re.search(pattern, basename, re.IGNORECASE):
            return folder

    # Fallback: extract category from filename
    match = _FILENAME_PATTERN.match(basename)
    if match:
        # Use first word after PLAN_ as category
        remainder = match.group(1)
        first_word = re.split(r"[_\s]", remainder)[0]
        return first_word.lower()

    # Last resort: use 'other'
    return "other"


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: plan_archive_classify.py <plan_filename>", file=sys.stderr)
        sys.exit(1)

    plan_file = sys.argv[1]
    folder = classify_plan(plan_file)
    print(folder)


if __name__ == "__main__":
    main()
