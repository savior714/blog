#!/usr/bin/env python3
"""Integration tests for archive_plans.py commands."""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

# Add scripts to path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent.resolve()

sys.path.insert(0, str(REPO_ROOT))


class TestArchivePlansCheck(unittest.TestCase):
    """Test the check command for broken references."""

    def setUp(self):
        """Create temporary directory structure."""
        self.tmpdir = tempfile.mkdtemp()
        self.plans_dir = Path(self.tmpdir) / "docs" / "plans"
        self.plans_dir.mkdir(parents=True)
        
        # Create a valid plan file
        self.valid_plan = self.plans_dir / "PLAN_test_valid.md"
        self.valid_plan.write_text(
            "# Test Plan\n\n"
            "## 🛠️ Step-by-Step Execution Plan\n\n"
            "#### Task 1.1: Test task [Unit: Atomic]\n"
            "- Task-ID: [TEST-001] | Status: done | Priority: 1\n"
            "- **Goal**: test goal\n"
            "- **Conclusion**: [PASS] Test completed successfully.\n",
            encoding="utf-8",
        )

    def tearDown(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_check_finds_broken_references(self):
        """Check command should report broken references."""
        # Create a file referencing a non-existent plan
        ref_file = Path(self.tmpdir) / "reference.md"
        ref_file.write_text(
            "# Reference Doc\n\n"
            "See PLAN_nonexistent_plan.md for details.\n",
            encoding="utf-8",
        )

        env = os.environ.copy()
        env["PYTHONPATH"] = str(REPO_ROOT)
        env["ARCHIVE_PLANS_REPO_ROOT"] = self.tmpdir
        
        result = subprocess.run(
            [sys.executable, str(REPO_ROOT / "scripts" / "archive_plans" / "archive_plans.py"), "check"],
            cwd=self.tmpdir,
            capture_output=True,
            text=True,
            env=env,
        )

        self.assertEqual(result.returncode, 1)
        self.assertIn("broken reference", result.stdout.lower() or result.stderr.lower())


class TestArchivePlansSweep(unittest.TestCase):
    """Test the sweep command for reorganizing archive root."""

    def setUp(self):
        """Create temporary directory structure with files at archive root."""
        self.tmpdir = tempfile.mkdtemp()
        self.plans_dir = Path(self.tmpdir) / "docs" / "plans"
        self.archive_dir = self.plans_dir / "archive"
        self.archive_dir.mkdir(parents=True)

        # Create plan files at archive root (uncategorized)
        self.case_plan = self.archive_dir / "PLAN_case_test.md"
        self.case_plan.write_text("# Case Plan\n", encoding="utf-8")

        self.seo_plan = self.archive_dir / "PLAN_seo_test.md"
        self.seo_plan.write_text("# SEO Plan\n", encoding="utf-8")

    def tearDown(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_sweep_organizes_root_files(self):
        """Sweep should move root files to categorized subfolders."""
        env = os.environ.copy()
        env["PYTHONPATH"] = str(REPO_ROOT)
        env["ARCHIVE_PLANS_REPO_ROOT"] = self.tmpdir
        
        result = subprocess.run(
            [sys.executable, str(REPO_ROOT / "scripts" / "archive_plans" / "archive_plans.py"), "sweep"],
            cwd=self.tmpdir,
            capture_output=True,
            text=True,
            env=env,
        )

        self.assertEqual(result.returncode, 0)
        self.assertTrue((self.archive_dir / "case" / "PLAN_case_test.md").exists())
        self.assertTrue((self.archive_dir / "seo" / "PLAN_seo_test.md").exists())


class TestArchivePlansUnarchive(unittest.TestCase):
    """Test the unarchive command for restoring plans."""

    def setUp(self):
        """Create temporary directory with archived plan."""
        self.tmpdir = tempfile.mkdtemp()
        self.plans_dir = Path(self.tmpdir) / "docs" / "plans"
        self.archive_dir = self.plans_dir / "archive" / "test"
        self.archive_dir.mkdir(parents=True)

        # Create an archived plan
        self.archived_plan = self.archive_dir / "PLAN_test_unarchive.md"
        self.archived_plan.write_text(
            "# Test Plan\n\n"
            "#### Task 1.1: Test task [Unit: Atomic]\n"
            "- Task-ID: [TEST-001] | Status: done | Priority: 1\n"
            "- **Goal**: test goal\n"
            "- **Conclusion**: [PASS] Completed.\n",
            encoding="utf-8",
        )

    def tearDown(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_unarchive_restores_to_root(self):
        """Unarchive should move plan back to docs/plans/ root."""
        env = os.environ.copy()
        env["PYTHONPATH"] = str(REPO_ROOT)
        env["ARCHIVE_PLANS_REPO_ROOT"] = self.tmpdir
        
        result = subprocess.run(
            [sys.executable, str(REPO_ROOT / "scripts" / "archive_plans" / "archive_plans.py"), "unarchive", "PLAN_test_unarchive.md"],
            cwd=self.tmpdir,
            capture_output=True,
            text=True,
            env=env,
        )

        self.assertEqual(result.returncode, 0)
        restored = self.plans_dir / "PLAN_test_unarchive.md"
        self.assertTrue(restored.exists())


class TestArchivePlansGuardDeleted(unittest.TestCase):
    """Test the guard-deleted command."""

    def setUp(self):
        """Create temporary git repo with archived files."""
        self.tmpdir = tempfile.mkdtemp()
        self.plans_dir = Path(self.tmpdir) / "docs" / "plans" / "archive"
        self.plans_dir.mkdir(parents=True)

        # Initialize git repo
        subprocess.run(["git", "init"], cwd=self.tmpdir, capture_output=True)
        subprocess.run(
            ["git", "config", "user.email", "test@test.com"],
            cwd=self.tmpdir,
            capture_output=True,
        )
        subprocess.run(
            ["git", "config", "user.name", "Test User"],
            cwd=self.tmpdir,
            capture_output=True,
        )

        # Create and commit an archived file
        self.archived_file = self.plans_dir / "PLAN_test_guard.md"
        self.archived_file.write_text("# Test\n", encoding="utf-8")

        subprocess.run(
            ["git", "add", "."],
            cwd=self.tmpdir,
            capture_output=True,
        )
        subprocess.run(
            ["git", "commit", "-m", "initial"],
            cwd=self.tmpdir,
            capture_output=True,
        )

    def tearDown(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_guard_finds_deleted_files(self):
        """Guard should detect deleted tracked files."""
        # Delete the file
        self.archived_file.unlink()

        env = os.environ.copy()
        env["PYTHONPATH"] = str(REPO_ROOT)
        env["ARCHIVE_PLANS_REPO_ROOT"] = self.tmpdir
        
        result = subprocess.run(
            [sys.executable, str(REPO_ROOT / "scripts" / "archive_plans" / "archive_plans.py"), "guard-deleted"],
            cwd=self.tmpdir,
            capture_output=True,
            text=True,
            env=env,
        )

        self.assertEqual(result.returncode, 1)
        self.assertIn("MISSING", result.stdout)

    def test_guard_passes_when_no_files_deleted(self):
        """Guard should pass when all files exist."""
        env = os.environ.copy()
        env["PYTHONPATH"] = str(REPO_ROOT)
        env["ARCHIVE_PLANS_REPO_ROOT"] = self.tmpdir
        
        result = subprocess.run(
            [sys.executable, str(REPO_ROOT / "scripts" / "archive_plans" / "archive_plans.py"), "guard-deleted"],
            cwd=self.tmpdir,
            capture_output=True,
            text=True,
            env=env,
        )

        self.assertEqual(result.returncode, 0)
        self.assertIn("exist", result.stdout)


class TestArchivePlansUpdateReferences(unittest.TestCase):
    """Test reference updating logic."""

    def setUp(self):
        """Create temporary directory."""
        self.tmpdir = tempfile.mkdtemp()

    def tearDown(self):
        """Clean up temporary directory."""
        shutil.rmtree(self.tmpdir, ignore_errors=True)

    def test_update_references_in_markdown(self):
        """References should be updated to new archive path."""
        from scripts.archive_plans.archive_plans import _update_references_in_file

        # Create a file with old reference
        ref_file = Path(self.tmpdir) / "reference.md"
        ref_file.write_text(
            "# Reference\n\n"
            "See [PLAN_test.md](docs/plans/PLAN_test.md) for details.\n"
            "Also check docs/plans/PLAN_test.md.\n",
            encoding="utf-8",
        )

        updated = _update_references_in_file(
            ref_file,
            "PLAN_test.md",
            "/docs/plans/archive/test/",
        )

        self.assertTrue(updated)
        content = ref_file.read_text(encoding="utf-8")
        self.assertIn("docs/plans/archive/test/", content)
        self.assertNotIn("docs/plans/PLAN_test.md", content)


if __name__ == "__main__":
    unittest.main()
