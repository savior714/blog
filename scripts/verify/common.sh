#!/bin/bash

# blog Verification Common Utilities
set -euo pipefail

export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
ROOT="${ROOT:-$(pwd)}"
export ROOT
RESULT_JSON_PATH="$ROOT/artifacts/verify/verify-last-result.json"
STEP_LOG_PATH="$ROOT/artifacts/verify/.verify-step-last.log"
mkdir -p "$ROOT/artifacts/verify"
export VERIFY_TMP_DIR=""

verify_timeout_cmd() {
    local secs="$1"
    shift
    if command -v timeout >/dev/null 2>&1; then
        timeout "$secs" "$@"
    elif command -v gtimeout >/dev/null 2>&1; then
        gtimeout "$secs" "$@"
    else
        echo -e "\033[0;31m[FAIL] timeout/gtimeout not found\033[0m" >&2
        return 127
    fi
}

VERIFY_STEPS=()
TIMINGS=()

write_step() {
    echo -e "\n\033[0;36m=== $1 ===\033[0m"
}

start_timing() {
    python3 -c "import time; print(int(time.time() * 1000))"
}

stop_timing() {
    local step_name="$1"
    local start_time="$2"
    local end_time
    end_time=$(start_timing)
    local diff=$((end_time - start_time))
    TIMINGS+=("$step_name:$diff")
    echo -e "  \033[0;90m[${diff}ms] $step_name\033[0m"
}

get_step_log_path() {
    local label="$1"
    local safe_name="${label//[^a-zA-Z0-9]/_}"
    echo "$ROOT/artifacts/verify/.verify-step-${safe_name}.log"
}

skip_step() {
    local step_name="$1"
    local reason="$2"
    VERIFY_STEPS+=("$step_name (skipped):true")
    echo -e "  \033[0;33m[SKIP] $step_name ($reason)\033[0m"
}

serialize_state() {
    VERIFY_STEPS_STR=$(printf "%s|" "${VERIFY_STEPS[@]}")
    TIMINGS_STR=$(printf "%s|" "${TIMINGS[@]}")
}

fail_verify() {
    local exit_code="$1"
    local step_name="$2"
    local last_idx=$((${#VERIFY_STEPS[@]} - 1))
    if [ "$last_idx" -ge 0 ]; then
        VERIFY_STEPS["$last_idx"]="${step_name}:false"
    fi
    serialize_state
    if command -v save_verify_result >/dev/null; then
        save_verify_result "$exit_code" "$step_name" ""
    fi
    exit "$exit_code"
}

save_verify_result() {
    local exit_code="$1"
    local step_name="$2"
    local pytest_failed_tests="${3:-}"
    cat > "$RESULT_JSON_PATH" <<EOF
{"exit_code": $exit_code, "step": "$step_name", "tests_failed": $pytest_failed_tests, "steps": $(printf '%s,' "${VERIFY_STEPS[@]}" | sed 's/,$//'), "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF
}

should_run_env_check() {
    if [ "${VERIFY_ENV_CHECK}" = "0" ]; then
        return 1
    fi
    if [ "${VERIFY_ENV_CHECK}" = "1" ]; then
        return 0
    fi
    # auto: check if node_modules exists
    if [ -d "$ROOT/node_modules" ]; then
        return 1
    fi
    return 0
}

verify_dependencies() {
    echo -e "\033[0;90m[DEPS] Checking node_modules...\033[0m"
    if [ ! -d "$ROOT/node_modules" ]; then
        echo -e "\033[0;33m[node] Installing dependencies...\033[0m"
        npm install --prefer-offline 2>&1 | tail -5
    fi
    echo -e "\033[0;32m[DEPS] OK\033[0m"
}
