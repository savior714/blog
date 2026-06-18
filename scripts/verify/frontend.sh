#!/bin/bash

# blog Frontend Verification (Next.js)
set -euo pipefail

run_frontend_steps() {
    if [ "$SKIP_FRONTEND_ALL" -eq 1 ]; then
        skip_step "Frontend: lint + typecheck + build" "SKIP_FRONTEND_ALL=1"
        return
    fi

    if [ "$RUN_FRONTEND" -eq 0 ]; then
        skip_step "Frontend: lint + typecheck + build" "auto-mode: no src changes"
        return
    fi

    local label="Frontend: lint + typecheck + build"
    VERIFY_STEPS+=("$label:true")
    write_step "$label"
    local start_time
    start_time=$(start_timing)

    local status=0

    # 1. ESLint
    echo -e "  \033[0;90m[lint]\033[0m Running ESLint..."
    if ! npx eslint src/ 2>&1 | tee "$STEP_LOG_PATH"; then
        status=$?
    fi

    # 2. TypeScript typecheck
    echo -e "  \033[0;90m[typecheck]\033[0m Running tsc..."
    if ! npx tsc --noEmit 2>&1 | tee -a "$STEP_LOG_PATH"; then
        status=$?
    fi

    # 3. Next.js build (skip in quick mode)
    if [ "$SKIP_FRONTEND_BUILD" -eq 0 ]; then
        echo -e "  \033[0;90m[build]\033[0m Running next build..."
        if ! npx next build 2>&1 | tee -a "$STEP_LOG_PATH"; then
            status=$?
        fi
    else
        echo -e "  \033[0;33m[SKIP]\033[0m Build (SKIP_FRONTEND_BUILD=1)"
    fi

    if [ "$status" -ne 0 ]; then
        stop_timing "$label" "$start_time"
        fail_verify "$status" "$label" ""
    fi

    stop_timing "$label" "$start_time"
    serialize_state
    save_verify_result 0 "" ""
    echo -e "  \033[0;32m[OK]\033[0m Frontend verification passed"
}
