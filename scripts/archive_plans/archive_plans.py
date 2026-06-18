#!/usr/bin/env python3
"""Blueprint archive management tool.

Commands:
    check        - Find broken references to plan files missing from both docs/plans/ and docs/plans/archive/
    archive      - Move completed plans to archive/<category>/ and update all references
    sweep        - Reorganize files left at archive/ root into categorized subfolders
    unarchive    - Restore archived plans back to docs/plans/ root
    repair       - Fix broken references to point to archive/ SSOT paths
    guard-deleted - Detect deleted git-tracked archive files and restore them

Usage:
    python scripts/archive_plans.py check
    python scripts/archive_plans.py archive -- PLAN_case_ssg_migration.md PLAN_seo_fundamentals.md
    python scripts/archive_plans.py archive --dry-run PLAN_xxx.md
    python scripts/archive_plans.py sweep
    python scripts/archive_plans.py unarchive PLAN_archived.md
    python scripts/archive_plans.py repair
    python scripts/archive_plans.py guard-deleted
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import NamedTuple

_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
_PLANS_DIR = _REPO_ROOT / "docs" / "plans"
_ARCHIVE_DIR = _PLANS_DIR / "archive"
_PLAN_LOOP_DIR = _REPO_ROOT / "scripts" / "plan_loop"

# File extensions to scan for references
_SCAN_EXTENSIONS = {".md", ".mdx", ".mjs", ".js", ".ts", ".tsx", ".py", ".html", ".json", ".yml", ".yaml"}

# Directories to exclude from scanning
_EXCLUDED_DIRS = {".git", ".venv", "node_modules", "dist", "build", ".astro", "__pycache__"}

# Known plan basename aliases (old names → current names)
_PLAN_BASENAME_ALIASES: dict[str, str] = {
    # Add aliases here if plans were renamed
}


class PlanReference(NamedTuple):
    """A reference to a plan file found in another file."""

    file_path: Path
    line_number: int
    line_content: str
    matched_text: str


class PlanFile(NamedTuple):
    """Metadata about a plan file."""

    basename: str
    full_path: Path
    location: str  # "root" or "archive"


# ─── Color helpers ───────────────────────────────────────────────────────────

COLOR_RED = "\033[91m"
COLOR_GREEN = "\033[92m"
COLOR_YELLOW = "\033[93m"
COLOR_BLUE = "\033[94m"
COLOR_CYAN = "\033[96m"
COLOR_RESET = "\033[0m"


def _color(text: str, color: str) -> str:
    return f"{color}{text}{COLOR_RESET}"


def _green(text: str) -> str:
    return _color(text, COLOR_GREEN)


def _red(text: str) -> str:
    return _color(text, COLOR_RED)


def _yellow(text: str) -> str:
    return _color(text, COLOR_YELLOW)


def _blue(text: str) -> str:
    return _color(text, COLOR_BLUE)


def _cyan(text: str) -> str:
    return _color(text, COLOR_CYAN)


# ─── Plan discovery ──────────────────────────────────────────────────────────


def _discover_plan_files() -> dict[str, PlanFile]:
    """Discover all plan files in docs/plans/ and docs/plans/archive/."""
    plans: dict[str, PlanFile] = {}

    # Root plans
    if _PLANS_DIR.exists():
        for f in _PLANS_DIR.iterdir():
            if f.is_file() and f.name.startswith("PLAN_") and f.suffix == ".md" and f.name != "README.md":
                plans[f.name] = PlanFile(f.name, f, "root")

    # Archive plans
    if _ARCHIVE_DIR.exists():
        for f in _ARCHIVE_DIR.rglob("PLAN_*.md"):
            if f.is_file() and f.name != "README.md":
                plans[f.name] = PlanFile(f.name, f, "archive")

    return plans


def _get_plan_aliases() -> dict[str, str]:
    """Return mapping of known aliases to canonical plan names."""
    aliases: dict[str, str] = dict(_PLAN_BASENAME_ALIASES)
    # Auto-discover: if a plan exists only by alias, add it
    plans = _discover_plan_files()
    for basename in plans:
        stem = basename.replace(".md", "").replace("PLAN_", "")
        # Check for date-suffixed variants
        date_pattern = re.compile(r"^(.+?)_\d{8}$")
        m = date_pattern.match(stem)
        if m:
            base_stem = m.group(1)
            alias_name = f"PLAN_{base_stem}.md"
            if alias_name not in plans:
                aliases[alias_name] = basename
    return aliases


# ─── Reference scanning ──────────────────────────────────────────────────────


def _scan_references(plan_basename: str, plans: dict[str, PlanFile]) -> list[PlanReference]:
    """Scan all relevant files for references to a plan file."""
    references: list[PlanReference] = []

    # Patterns to match in other files
    patterns = [
        # docs/plans/PLAN_xxx.md or /plans/PLAN_xxx.md
        rf"(?:docs/)?plans/{re.escape(plan_basename)}",
        # plans/archive/PLAN_xxx.md
        rf"plans/archive/[^/\s'\"`]+/{re.escape(plan_basename)}",
        # [PLAN_xxx.md](...) markdown links
        rf"\[{re.escape(plan_basename)}\]\([^)]+\)",
    ]

    # Also check aliases
    aliases = _get_plan_aliases()
    for alias in aliases:
        if alias != plan_basename:
            patterns.append(rf"(?:docs/)?plans/{re.escape(alias)}")

    # Walk the repo and scan files
    for root, dirs, files in os.walk(_REPO_ROOT):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in _EXCLUDED_DIRS]

        for fname in files:
            fpath = Path(root) / fname
            if fpath.suffix not in _SCAN_EXTENSIONS:
                continue
            # Skip our own script files
            if "archive_plans" in str(fpath):
                continue
            if "plan_archive_classify" in str(fpath):
                continue

            try:
                text = fpath.read_text(encoding="utf-8", errors="ignore")
            except (OSError, PermissionError):
                continue

            for pattern in patterns:
                for i, line in enumerate(text.splitlines(), 1):
                    if re.search(pattern, line):
                        # Extract the matched text
                        m = re.search(pattern, line)
                        if m:
                            references.append(PlanReference(fpath, i, line.strip(), m.group(0)))

    return references


def _is_test_or_template_reference(ref_name: str) -> bool:
    """Check if a reference is likely a test fixture or template placeholder."""
    # Template placeholders
    if ref_name in {"PLAN_xxx.md", "PLAN_x.md", "PLAN_test.md", "PLAN_fixture.md"}:
        return True
    # Test fixtures
    if ref_name.startswith("PLAN_test_") or ref_name.startswith("PLAN_fixture"):
        return True
    # Examples in documentation
    if "example" in ref_name.lower():
        return True
    return False


def _find_broken_references(plans: dict[str, PlanFile]) -> list[tuple[str, list[PlanReference]]]:
    """Find references to plan files that don't exist in either root or archive."""
    broken: dict[str, list[PlanReference]] = {}
    known_basenames = set(plans.keys()) | set(_get_plan_aliases().keys())

    # Scan all markdown/ts/js files for plan references
    for root, dirs, files in os.walk(_REPO_ROOT):
        dirs[:] = [d for d in dirs if d not in _EXCLUDED_DIRS]

        for fname in files:
            fpath = Path(root) / fname
            if fpath.suffix not in _SCAN_EXTENSIONS:
                continue
            if "archive_plans" in str(fpath) or "plan_archive_classify" in str(fpath):
                continue

            try:
                text = fpath.read_text(encoding="utf-8", errors="ignore")
            except (OSError, PermissionError):
                continue

            # Look for PLAN_XXX.md references
            for m in re.finditer(r"PLAN_[A-Za-z0-9_]+\.md", text):
                ref_name = m.group(0)
                # Skip test fixtures and template placeholders
                if _is_test_or_template_reference(ref_name):
                    continue
                if ref_name not in known_basenames:
                    # Check if it's an alias
                    aliases = _get_plan_aliases()
                    if ref_name not in aliases:
                        line_num = text[:m.start()].count("\n") + 1
                        line_content = text.splitlines()[line_num - 1].strip() if line_num <= len(text.splitlines()) else ""
                        if ref_name not in broken:
                            broken[ref_name] = []
                        broken[ref_name].append(PlanReference(fpath, line_num, line_content, ref_name))

    return list(broken.items())


# ─── Command: check ──────────────────────────────────────────────────────────


def cmd_check(args: argparse.Namespace) -> int:
    """Check for broken references to plan files."""
    plans = _discover_plan_files()
    print(_blue("🔍 Checking plan file references..."))
    print(f"  Root plans: {sum(1 for p in plans.values() if p.location == 'root')}")
    print(f"  Archive plans: {sum(1 for p in plans.values() if p.location == 'archive')}")
    print()

    broken = _find_broken_references(plans)

    if not broken:
        print(_green("✅ No broken links found"))
        return 0

    print(_red(f"❌ Found {len(broken)} broken reference(s):"))
    for ref_name, refs in broken:
        print(f"\n  {_red(ref_name)} referenced in:")
        for ref in refs:
            rel_path = ref.file_path.relative_to(_REPO_ROOT)
            print(f"    - {rel_path}:{ref.line_number}")
            print(f"      {ref.line_content[:100]}")

    return 1


# ─── Command: archive ────────────────────────────────────────────────────────


def _run_plan_lint(plan_path: Path, archive_ready: bool = False) -> tuple[int, str]:
    """Run plan-lint on a file."""
    cmd = [
        sys.executable,
        str(_REPO_ROOT / "scripts" / "plan_loop" / "plan_lint" / "__main__.py"),
        str(plan_path),
    ]
    if archive_ready:
        cmd.append("--archive-ready")

    env = os.environ.copy()
    env["PYTHONPATH"] = str(_REPO_ROOT) + ":" + env.get("PYTHONPATH", "")

    result = subprocess.run(
        cmd,
        cwd=str(_REPO_ROOT),
        capture_output=True,
        text=True,
        env=env,
    )
    return result.returncode, result.stdout + result.stderr


def _run_sync_check() -> tuple[int, str]:
    """Run unified sync check before moving files."""
    sync_script = _REPO_ROOT / "scripts" / "agent" / "sync.py"
    if not sync_script.exists():
        print(_yellow("[SKIP] Unified sync check: sync.py not found"))
        return 0, ""

    result = subprocess.run(
        [sys.executable, str(sync_script), "--check"],
        cwd=str(_REPO_ROOT),
        capture_output=True,
        text=True,
    )
    return result.returncode, result.stdout + result.stderr


def _update_references_in_file(file_path: Path, old_name: str, new_archive_path: str) -> bool:
    """Update references to a plan file in another file."""
    try:
        text = file_path.read_text(encoding="utf-8")
    except (OSError, PermissionError):
        return False

    # Patterns to replace
    new_full_path = f"docs/plans/archive{new_archive_path}"
    replacements = [
        # docs/plans/PLAN_xxx.md → .../archive/<cat>/PLAN_xxx.md
        (rf"(?:docs/)?plans/{re.escape(old_name)}", new_full_path),
        # /plans/PLAN_xxx.md → /plans/archive<cat>/PLAN_xxx.md
        (rf"/plans/{re.escape(old_name)}", f"/plans/archive{new_archive_path}"),
        # Markdown links [PLAN_xxx.md](docs/plans/PLAN_xxx.md)
        (rf"\[{re.escape(old_name)}\]\(docs/plans/{re.escape(old_name)}\)", f"[{old_name}]({new_full_path})"),
    ]

    new_text = text
    for pattern, replacement in replacements:
        new_text = re.sub(pattern, replacement, new_text)

    if new_text != text:
        file_path.write_text(new_text, encoding="utf-8")
        return True

    return False


def cmd_archive(args: argparse.Namespace) -> int:
    """Move plan files to archive and update references."""
    if not args.plan_files:
        print(_red("❌ No plan files specified"), file=sys.stderr)
        print("Usage: python scripts/archive_plans.py archive -- PLAN_xxx.md [PLAN_yyy.md ...]", file=sys.stderr)
        return 1

    # Import classify function
    sys.path.insert(0, str(_REPO_ROOT / "scripts" / "archive_plans"))
    from plan_archive_classify import classify_plan

    plans = _discover_plan_files()
    dry_run = args.dry_run

    for plan_basename in args.plan_files:
        # Resolve plan file
        plan_path = Path(plan_basename)
        if not plan_path.is_absolute():
            plan_path = _PLANS_DIR / plan_basename

        if not plan_path.exists():
            # Try as basename in discovered plans
            if plan_basename in plans:
                plan_path = plans[plan_basename].full_path
            else:
                print(_red(f"❌ Plan file not found: {plan_basename}"), file=sys.stderr)
                return 1

        if plan_path.suffix != ".md" or not plan_basename.startswith("PLAN_"):
            print(_yellow(f"[SKIP] Not a plan file: {plan_basename}"), file=sys.stderr)
            continue

        # Phase 1 & 2: Pre-flight lint check
        print(f"\n{_blue(f'📋 Phase 1-2: Pre-flight lint for {plan_basename}...')}")
        lint_rc, lint_output = _run_plan_lint(plan_path, archive_ready=True)
        print(lint_output)

        if lint_rc != 0:
            print(_red(f"❌ plan-lint failed for {plan_basename} — archive aborted"), file=sys.stderr)
            print(_yellow("Fix lint errors and retry archive."), file=sys.stderr)
            return 1

        # Phase 3: Verify results recorded (check for archive-ready markers)
        print(f"\n{_blue(f'📋 Phase 3: Verification check for {plan_basename}...')}")
        text = plan_path.read_text(encoding="utf-8")

        # Check all tasks are done
        todo_tasks = re.findall(r"Status:\s*(todo|running|blocked)", text, re.IGNORECASE)
        if todo_tasks:
            print(_red(f"❌ {len(todo_tasks)} task(s) not completed — archive aborted"), file=sys.stderr)
            return 1

        # Check spec links exist
        if "docs/specs/" not in text and "[관련 명세]" not in text:
            print(_yellow(f"[WARN] No spec references found in {plan_basename}"), file=sys.stderr)

        # Phase 3.5: Classify and determine archive path
        category = classify_plan(plan_basename)
        archive_subdir = _ARCHIVE_DIR / category
        archive_subdir.mkdir(parents=True, exist_ok=True)

        dest_path = archive_subdir / plan_basename
        new_ref_path = f"/{archive_subdir.relative_to(_REPO_ROOT)}"

        if dest_path.exists() and dest_path.resolve() == plan_path.resolve():
            print(_yellow(f"[SKIP] Already archived at: {dest_path}"), file=sys.stderr)
            continue

        # Dry run mode
        if dry_run:
            print(_cyan(f"[DRY-RUN] Would move: {plan_path} → {dest_path}"))
            print(_cyan(f"[DRY-RUN] Would update references to: {new_ref_path}/{plan_basename}"))
            continue

        # Phase 4: Run unified sync check (before first file move)
        if not args.skip_unified_sync:
            print(f"\n{_blue('📋 Unified sync check before archive...')}")
            sync_rc, sync_output = _run_sync_check()
            if sync_rc != 0:
                print(_red(f"❌ Unified sync check failed — archive aborted"), file=sys.stderr)
                print(sync_output)
                return 1

        # Move file
        shutil.move(str(plan_path), str(dest_path))
        print(_green(f"✅ Moved: {plan_basename} → {archive_subdir}/{plan_basename}"))

        # Update references in other files
        print(_blue(f"  Updating references..."))
        ref_count = 0
        for root, dirs, files in os.walk(_REPO_ROOT):
            dirs[:] = [d for d in dirs if d not in _EXCLUDED_DIRS]
            for fname in files:
                fpath = Path(root) / fname
                if fpath.suffix not in _SCAN_EXTENSIONS:
                    continue
                if "archive_plans" in str(fpath) or "plan_archive_classify" in str(fpath):
                    continue

                updated = _update_references_in_file(fpath, plan_basename, new_ref_path)
                if updated:
                    ref_count += 1

        print(_green(f"  Updated {ref_count} file(s) with new archive path"))

    # Sweep after archive
    if not dry_run and args.sweep_after:
        print(f"\n{_blue('🧹 Running sweep after archive...')}")
        return cmd_sweep(args)

    return 0


# ─── Command: sweep ──────────────────────────────────────────────────────────


def cmd_sweep(args: argparse.Namespace) -> int:
    """Reorganize files left at archive/ root into categorized subfolders."""
    if not _ARCHIVE_DIR.exists():
        print(_green("✅ Archive directory does not exist — nothing to sweep"))
        return 0

    root_files = [f for f in _ARCHIVE_DIR.iterdir()
                  if f.is_file() and f.name.startswith("PLAN_") and f.name != "README.md"]

    if not root_files:
        print(_green("✅ No files at archive/ root to sweep"))
        return 0

    sys.path.insert(0, str(_REPO_ROOT / "scripts" / "archive_plans"))
    from plan_archive_classify import classify_plan

    moved = 0
    for fpath in root_files:
        category = classify_plan(fpath.name)
        dest_dir = _ARCHIVE_DIR / category
        dest_dir.mkdir(parents=True, exist_ok=True)
        dest_path = dest_dir / fpath.name

        # Update references
        sys.path.insert(0, str(_REPO_ROOT / "scripts" / "archive_plans"))
        new_ref_path = f"/{dest_dir.relative_to(_REPO_ROOT)}"
        _update_references_in_file(fpath, fpath.name, new_ref_path)

        shutil.move(str(fpath), str(dest_path))
        print(_green(f"  Swept: {fpath.name} → {category}/{fpath.name}"))
        moved += 1

    print(_green(f"✅ Swept {moved} file(s) into categorized subfolders"))
    return 0


# ─── Command: unarchive ──────────────────────────────────────────────────────


def cmd_unarchive(args: argparse.Namespace) -> int:
    """Restore archived plans back to docs/plans/ root."""
    if not args.plan_files:
        print(_red("❌ No plan files specified"), file=sys.stderr)
        return 1

    plans = _discover_plan_files()
    restored = 0

    for plan_basename in args.plan_files:
        # Search in archive
        found_path = None
        for basename, plan_info in plans.items():
            if basename == plan_basename or plan_basename in basename:
                if plan_info.location == "archive":
                    found_path = plan_info.full_path
                    break

        if not found_path:
            # Try direct path
            found_path = _ARCHIVE_DIR / plan_basename
            if not found_path.exists():
                found_path = _ARCHIVE_DIR.rglob(plan_basename)
                found_path = next(iter(found_path), None)

        if not found_path or not found_path.exists():
            print(_red(f"❌ Plan not found in archive: {plan_basename}"), file=sys.stderr)
            return 1

        dest_path = _PLANS_DIR / plan_basename
        shutil.move(str(found_path), str(dest_path))

        # Update references back to root
        new_ref = "/docs/plans"
        _update_references_in_file(dest_path, plan_basename, new_ref)

        print(_green(f"✅ Restored: {found_path} → {dest_path}"))
        restored += 1

    print(_green(f"✅ Restored {restored} file(s) to docs/plans/"))
    return 0


# ─── Command: repair ─────────────────────────────────────────────────────────


def cmd_repair(args: argparse.Namespace) -> int:
    """Fix broken references to point to archive/ SSOT paths."""
    plans = _discover_plan_files()
    broken = _find_broken_references(plans)

    if not broken:
        print(_green("✅ No broken references to repair"))
        return 0

    print(_blue(f"🔧 Repairing {len(broken)} broken reference(s)..."))

    # Build alias map for repair
    aliases = _get_plan_aliases()
    repaired = 0

    for ref_name, refs in broken:
        # Check if it's an alias
        canonical = aliases.get(ref_name)
        if not canonical:
            # Check if it exists in archive under a different name
            for basename, plan_info in plans.items():
                if ref_name.lower().replace("_", "") in basename.lower().replace("_", ""):
                    canonical = basename
                    break

        if not canonical:
            print(_yellow(f"  [SKIP] No canonical name found for: {ref_name}"))
            continue

        # Find the actual archive path
        if canonical in plans:
            actual_path = plans[canonical].full_path
            archive_rel = f"/{actual_path.relative_to(_REPO_ROOT)}"

            for ref in refs:
                old_text = ref_name
                new_text = archive_rel
                try:
                    text = ref.file_path.read_text(encoding="utf-8")
                    new_text_file = re.sub(re.escape(old_text), new_text, text)
                    if new_text_file != text:
                        ref.file_path.write_text(new_text_file, encoding="utf-8")
                        repaired += 1
                        print(_green(f"  Repaired: {ref.file_path.relative_to(_REPO_ROOT)}:{ref.line_number}"))
                except (OSError, PermissionError):
                    pass

    print(_green(f"✅ Repaired {repaired} reference(s)"))
    return 0


# ─── Command: guard-deleted ──────────────────────────────────────────────────


def cmd_guard_deleted(args: argparse.Namespace) -> int:
    """Detect deleted git-tracked archive files and restore them."""
    try:
        result = subprocess.run(
            ["git", "ls-files", "docs/plans/archive/**/*.md"],
            cwd=str(_REPO_ROOT),
            capture_output=True,
            text=True,
        )
    except FileNotFoundError:
        print(_red("❌ git not found"), file=sys.stderr)
        return 1

    if result.returncode != 0:
        print(_red(f"❌ git command failed: {result.stderr}"), file=sys.stderr)
        return 1

    tracked_files = [Path(f) for f in result.stdout.strip().split("\n") if f]
    deleted = []

    for fpath in tracked_files:
        full_path = _REPO_ROOT / fpath
        if not full_path.exists():
            deleted.append(fpath)

    if not deleted:
        print(_green("✅ All git-tracked archive files exist"))
        return 0

    print(_red(f"❌ {len(deleted)} deleted archive file(s) detected:"))
    for fpath in deleted:
        print(f"  {_red('MISSING')}: {fpath}")

    print(f"\n{_yellow('To restore: git restore docs/plans/archive/')}")
    return 1


# ─── CLI entry point ─────────────────────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Blueprint archive management tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # check
    sub_check = subparsers.add_parser("check", help="Check for broken plan file references")

    # archive
    sub_archive = subparsers.add_parser("archive", help="Move plans to archive and update references")
    sub_archive.add_argument("--dry-run", action="store_true", help="Simulate without making changes")
    sub_archive.add_argument("--skip-unified-sync", action="store_true", help="Skip unified sync check")
    sub_archive.add_argument("--sweep-after", action="store_true", help="Run sweep after archiving")
    sub_archive.add_argument("plan_files", nargs="*", help="Plan files to archive")

    # sweep
    sub_sweep = subparsers.add_parser("sweep", help="Reorganize archive/ root files into subfolders")

    # unarchive
    sub_unarchive = subparsers.add_parser("unarchive", help="Restore archived plans to docs/plans/")
    sub_unarchive.add_argument("plan_files", nargs="+", help="Plan files to restore")

    # repair
    sub_repair = subparsers.add_parser("repair", help="Fix broken references to archive paths")

    # guard-deleted
    sub_guard = subparsers.add_parser("guard-deleted", help="Detect and report deleted archive files")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    commands = {
        "check": cmd_check,
        "archive": cmd_archive,
        "sweep": cmd_sweep,
        "unarchive": cmd_unarchive,
        "repair": cmd_repair,
        "guard-deleted": cmd_guard_deleted,
    }

    handler = commands.get(args.command)
    if handler:
        return handler(args)

    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
