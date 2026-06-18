#!/bin/bash

# blog Agentic env: EditorConfig + text hygiene
set -euo pipefail

run_agentic_env_steps() {
    if [ "${VERIFY_SKIP_AGENTIC_ENV:-0}" = "1" ]; then
        skip_step "Agentic env: EditorConfig & text hygiene" "VERIFY_SKIP_AGENTIC_ENV=1"
        return
    fi

    local label="Agentic env: EditorConfig & text hygiene"
    VERIFY_STEPS+=("$label:true")
    write_step "$label"
    local start_time
    start_time=$(start_timing)

    local status=0

    # Check .editorconfig exists
    if [ ! -f "$ROOT/.editorconfig" ]; then
        echo "  - [WARN] .editorconfig not found"
    fi

    # Check for smart quotes in code files
    local smart_quotes=0
    while IFS= read -r f; do
        if [[ "$f" == *.ts ]] || [[ "$f" == *.tsx ]] || [[ "$f" == *.js ]] || [[ "$f" == *.jsx ]] || [[ "$f" == *.json ]]; then
            if grep -Pln '[\x{2018}\x{2019}\x{201C}\x{201D}]' "$f" >/dev/null 2>&1; then
                echo "  - [WARN] smart quotes in: $f"
                smart_quotes=1
            fi
        fi
    done < <(find src/ -type f 2>/dev/null)

    if [ "$smart_quotes" -ne 0 ]; then
        status=1
    fi

    if [ "$status" -ne 0 ]; then
        stop_timing "$label" "$start_time"
        fail_verify "$status" "$label" ""
    fi

    stop_timing "$label" "$start_time"
    serialize_state
    save_verify_result 0 "" ""
    echo -e "  \033[0;32m[OK]\033[0m Agentic env check passed"
}
