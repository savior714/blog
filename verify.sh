#!/bin/bash

# blog local verification script for macOS (Next.js)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export ROOT
cd "$ROOT"

echo -e "\033[0;36mStarted verification at $(date) on $(hostname)\033[0m"

source "$ROOT/scripts/verify/common.sh"
source "$ROOT/scripts/verify/modes.sh"
source "$ROOT/scripts/verify/frontend.sh"
source "$ROOT/scripts/verify/docs.sh"
source "$ROOT/scripts/verify/agentic_env.sh"

export VERIFY_ENV_CHECK=${VERIFY_ENV_CHECK:-auto}
export TDD_GATE_ENABLED=${TDD_GATE_ENABLED:-1}
export TDD_GATE_BASE_REF=${TDD_GATE_BASE_REF:-HEAD}

# --- Venv & Python Setup ---
if [ -d "$ROOT/.venv" ]; then
    VENV_BIN="$ROOT/.venv/bin"
    export PATH="$VENV_BIN:$PATH"
elif [ -d "$ROOT/venv" ]; then
    VENV_BIN="$ROOT/venv/bin"
    export PATH="$VENV_BIN:$PATH"
fi

if command -v uv > /dev/null 2>&1; then
    export UV_CACHE_DIR="$ROOT/.uv_cache"
    if [ "${VERIFY_UV_SYNC:-auto}" = "1" ] || [[ "${VERIFY_UV_SYNC:-auto}" = "auto" && "${CI:-}" = "true" ]]; then
        echo -e "\033[0;90m[VENV] uv sync...\033[0m"
        uv sync --no-managed-python --python "$(which python3)" > /dev/null 2>&1 || true
    fi
fi

# --- Execution ---

if should_run_env_check; then
    verify_dependencies || exit 1
fi

echo -e "\n\033[0;36m=== Verify Mode ===\033[0m"
configure_verify_mode
echo -e "  Mode: \033[0;32m$VERIFY_MODE\033[0m"
echo -e "  Run frontend: $RUN_FRONTEND | docs: $RUN_DOCS"

# TDD Gate check for Next.js (TypeScript)
tdd_gate_check() {
    if [[ "$TDD_GATE_ENABLED" != "1" ]]; then
        echo -e "\033[0;90m[TDD Gate] skipped (TDD_GATE_ENABLED=$TDD_GATE_ENABLED)\033[0m"
        return
    fi

    echo -e "\n\033[0;36m=== TDD Gate ===\033[0m"
    local changed_files
    changed_files="$(git diff --name-only "$TDD_GATE_BASE_REF" || true)"

    if [[ -z "$changed_files" ]]; then
        echo -e "\033[0;90m[TDD Gate] no changed files detected; skipping\033[0m"
        return
    fi

    local code_files_changed
    code_files_changed="$(printf '%s\n' "$changed_files" | rg '^(src|app)/.*\.(ts|tsx|js|jsx)$' || true)"

    if [[ -z "$code_files_changed" ]]; then
        echo -e "\033[0;90m[TDD Gate] skipping: only non-code files changed\033[0m"
        return
    fi

    local test_files_changed
    test_files_changed="$(printf '%s\n' "$changed_files" | rg '\.(test|spec)\.(ts|tsx|js|jsx)$' || true)"

    if [[ -n "$code_files_changed" && -z "$test_files_changed" ]]; then
        local existing=""
        while IFS= read -r file; do
            [[ -z "$file" ]] && continue
            [[ -f "$file" ]] && existing+="${file}"$'\n'
        done <<< "$code_files_changed"

        if [[ -n "$existing" ]]; then
            echo "❌ TDD Violation: 코드 변경이 감지되었지만 테스트 파일이 없습니다."
            printf "%s" "$existing"
            exit 1
        fi
    fi

    echo -e "\033[0;32m[TDD Gate] passed\033[0m"
}

tdd_gate_check
run_agentic_env_steps
run_frontend_steps
run_docs_steps

serialize_state
save_verify_result 0 "" ""

echo -e "\n\033[0;32mVerification complete.\033[0m"

if [ ${#TIMINGS[@]} -gt 0 ]; then
    echo -e "\033[0;36m--- Timing Summary ---\033[0m"
    total_ms=0
    for t in "${TIMINGS[@]}"; do
        ms="${t##*:}"
        total_ms=$((total_ms + ms))
    done
    for t in "${TIMINGS[@]}"; do
        name="${t%:*}"
        ms="${t##*:}"
        pct=$(awk "BEGIN {printf \"%.1f\", (100 * $ms / $total_ms)}")
        printf "  %-40s %6dms (%6s%%)\n" "$name" "$ms" "$pct"
    done
    printf "  %-40s %6dms\n" "TOTAL" "$total_ms"
fi

exit 0
