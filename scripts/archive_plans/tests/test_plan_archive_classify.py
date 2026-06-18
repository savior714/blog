#!/usr/bin/env python3
"""Tests for plan_archive_classify.py classification rules."""

import unittest
from scripts.archive_plans.plan_archive_classify import classify_plan


class TestPlanArchiveClassify(unittest.TestCase):
    """Test archive subfolder classification logic."""

    def test_case_plan_classifies_to_case(self):
        self.assertEqual(classify_plan("PLAN_case_ssg_migration.md"), "case")

    def test_content_plan_classifies_to_content(self):
        self.assertEqual(classify_plan("PLAN_content_rendering_fix.md"), "content")

    def test_frontend_plan_classifies_to_frontend(self):
        self.assertEqual(classify_plan("PLAN_frontend_test_setup.md"), "frontend")

    def test_performance_plan_classifies_to_performance(self):
        self.assertEqual(classify_plan("PLAN_performance_optimization.md"), "performance")

    def test_seo_plan_classifies_to_seo(self):
        self.assertEqual(classify_plan("PLAN_seo_fundamentals.md"), "seo")

    def test_tailwind_plan_classifies_to_tailwind(self):
        self.assertEqual(classify_plan("PLAN_tailwind_theme_integration.md"), "tailwind")

    def test_zod_plan_classifies_to_zod(self):
        self.assertEqual(classify_plan("PLAN_zod_v4_migration.md"), "zod")

    def test_astro_migration_classifies_to_migration(self):
        self.assertEqual(classify_plan("PLAN_astro_migration.md"), "migration")

    def test_ssg_migration_classifies_to_migration(self):
        self.assertEqual(classify_plan("PLAN_ssg_migration.md"), "migration")

    def test_docker_plan_classifies_to_infra(self):
        self.assertEqual(classify_plan("PLAN_docker_setup.md"), "infra")

    def test_linear_workflow_classifies_to_tooling(self):
        self.assertEqual(classify_plan("PLAN_linear_workflow.md"), "tooling")

    def test_test_verify_classifies_to_testing(self):
        self.assertEqual(classify_plan("PLAN_test_setup.md"), "testing")

    def test_auth_security_classifies_to_security(self):
        self.assertEqual(classify_plan("PLAN_auth_flow.md"), "security")

    def test_api_backend_classifies_to_backend(self):
        self.assertEqual(classify_plan("PLAN_api_endpoints.md"), "backend")

    def test_ui_component_classifies_to_frontend(self):
        self.assertEqual(classify_plan("PLAN_ui_components.md"), "frontend")

    def test_data_schema_classifies_to_data(self):
        self.assertEqual(classify_plan("PLAN_data_migration.md"), "data")

    def test_database_plan_classifies_to_data(self):
        self.assertEqual(classify_plan("PLAN_database_setup.md"), "data")

    def test_theme_plan_classifies_to_frontend(self):
        self.assertEqual(classify_plan("PLAN_theme_colors.md"), "frontend")

    def test_unknown_pattern_falls_back_to_first_word(self):
        self.assertEqual(classify_plan("PLAN_random_thing.md"), "random")

    def test_path_object_input(self):
        from pathlib import Path
        self.assertEqual(classify_plan(Path("PLAN_case_ssg_migration.md")), "case")

    def test_date_suffixed_filename(self):
        self.assertEqual(classify_plan("PLAN_case_migration_20260619.md"), "case")


if __name__ == "__main__":
    unittest.main()
