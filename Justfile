# Bootstrap kernel — merged into blog project Justfile.

default:
    @just --list

verify:
    @bash verify.sh

ci:
    @echo "Running blog CI (bootstrap kernel)..."
    @just verify

test:
    @echo "Running Astro/Vitest tests..."
    @npx vitest --config vitest.config.ts --run

lint-turn-end:
    @echo "Turn-end gate (bootstrap kernel — extend per project)"
    @just verify

# --- Commit gates (adapted from EMR) ---

# hard gate — 보안 관련 검사
commit-gate-hard:
    @echo "🛡️ Hard gate (security)..."
    @uv run python scripts/verify/staged_secret_gate.py

# soft gate — lint + TypeScript strict
commit-gate-soft:
    @echo "🔒 Soft gate (lint + typecheck)..."
    @npx eslint --fix src/ 2>/dev/null || true
    @echo "🔒 TypeScript strict gate (zero tolerance)..."
    @bash -c '\
        TY_ERRORS=$(npx tsc --noEmit 2>&1); \
        MY_FILES=$(git diff --name-only HEAD | grep -E "\\.ts$" || true); \
        if [ -z "$$MY_FILES" ]; then \
            echo "No TypeScript files changed — skipping strict check."; \
        else \
            echo "$$TY_ERRORS" | grep -E "error TS" | while read -r line; do \
                FILE=$(echo "$$line" | grep -oP "^[^:]+") || true; \
                if echo "$$MY_FILES" | grep -q "$$FILE"; then \
                    echo "MY CHANGE: $$line"; \
                    exit 1; \
                else \
                    echo "PRE-EXISTING: $$line"; \
                fi; \
            done; \
        fi'

# commit gate — hard → soft 순차 실행
commit-gate:
    @echo "🔒 Commit gate (hard → soft)..."
    just commit-gate-hard
    just commit-gate-soft

# renderer ship gate — Vercel build SSOT
renderer-ship-gate:
    @echo "🚀 Renderer ship gate (Vercel build)..."
    npm run build

# --- Plan loop (kernel) ---
plan-preread plan="" *args="":
    @if [ -z "{{plan}}" ]; then echo "Usage: just plan-preread docs/plans/<file>.md --write"; exit 1; fi
    @uv run python scripts/plan_loop/plan_preread_manifest.py "{{plan}}" {{args}}

plan-lint plan="" *args="":
    @echo "Verifying plan blueprint files..."
    @if [ -z "{{plan}}" ]; then \
        ls docs/plans/*.md 2>/dev/null | grep -v -E "README.md|ROADMAP.md" | xargs -n 1 uv run python scripts/plan_loop/plan_lint.py {{args}} ; \
    else \
        uv run python scripts/plan_loop/plan_lint.py "{{plan}}" {{args}} ; \
    fi

plan-lint-ci:
    @echo "Verifying all blueprints (no Linear ensure)..."
    @ls docs/plans/*.md 2>/dev/null | grep -v -E "README.md|ROADMAP.md" | xargs -n 1 uv run python scripts/plan_loop/plan_lint.py --skip-linear-ensure

plan-close plan="" verify="":
    @set -e; \
    if [ -z "{{plan}}" ]; then \
        echo "plan 인자가 필요합니다. 예: just plan-close plan=docs/plans/<file>.md"; \
        exit 1; \
    fi; \
    uv run python scripts/verify/plan_close_gate.py --plan "{{plan}}" --verify "{{verify}}"

plan-task-close plan="" task="" conclusion="":
    @if [ -z "{{plan}}" ] || [ -z "{{task}}" ] || [ -z "{{conclusion}}" ]; then \
        echo "plan, task, conclusion 인자가 모두 필요합니다."; \
        exit 1; \
    fi
    @uv run python scripts/plan_loop/plan_task_close.py --plan "{{plan}}" --task "{{task}}" --conclusion "{{conclusion}}"

# --- Route (kernel) ---
route *files:
    @uv run python scripts/agent/route_context.py {{files}}

route-touched *args="":
    @uv run python scripts/agent/route_touched.py {{args}}

route-read *paths:
    @uv run python scripts/agent/route_gate.py record-read {{paths}}

route-gate-check *paths:
    @uv run python scripts/agent/route_gate.py check {{paths}}

# --- Agent lint + bootstrap drift ---
agent-lint:
    @echo "Verifying agent rule files..."
    uv run python scripts/agent/verify_rules.py
    @echo "Doc content quality..."
    uv run python scripts/agent/doc_content_lint.py
    @echo "Agent secret policy..."
    uv run python scripts/agent/verify_agent_secret_policy.py
    @echo "Bootstrap template drift..."
    just bootstrap-sync check=1

bootstrap-sync *args:
    @MODE="dry-run"; REMOVE=""; \
    for arg in {{args}}; do \
        case "$arg" in \
            check=1|check=*) MODE="check" ;; \
            apply=1|apply=*) MODE="apply" ;; \
            remove_stale=1|remove_stale=*) REMOVE="1" ;; \
        esac; \
    done; \
    if [ "$MODE" = "check" ]; then \
        uv run python scripts/bootstrap/sync.py --check; \
    elif [ "$MODE" = "apply" ]; then \
        if [ -n "$REMOVE" ]; then \
            uv run python scripts/bootstrap/sync.py --apply --remove-stale; \
        else \
            uv run python scripts/bootstrap/sync.py --apply; \
        fi; \
    else \
        uv run python scripts/bootstrap/sync.py --dry-run; \
    fi
