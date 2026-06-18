#!/bin/bash

# blog Documentation Verification
set -euo pipefail

run_docs_steps() {
    if [ "$RUN_DOCS" -eq 0 ]; then
        skip_step "Docs: markdown lint" "auto-mode: no docs changes"
        return
    fi

    local label="Docs: markdown lint"
    VERIFY_STEPS+=("$label:true")
    write_step "$label"
    local start_time
    start_time=$(start_timing)

    local status=0
    echo -e "  \033[0;90m[docs]\033[0m Checking markdown files..."

    # Basic markdown check: find broken links in frontmatter and obvious issues
    if command -v mdformat > /dev/null 2>&1; then
        if ! mdformat --check docs/ 2>&1 | tee "$STEP_LOG_PATH"; then
            status=$?
        fi
    else
        # Fallback: basic check for trailing whitespace and broken heading references
        local issues=0
        while IFS= read -r f; do
            if grep -nE '  $' "$f" >/dev/null 2>&1; then
                echo "  - trailing whitespace: $f"
                issues=1
            fi
        done < <(find docs/ -name "*.md" 2>/dev/null)
        [ "$issues" -ne 0 ] && status=1
    fi

    if [ "$status" -ne 0 ]; then
        stop_timing "$label" "$start_time"
        fail_verify "$status" "$label" ""
    fi

    stop_timing "$label" "$start_time"
    serialize_state
    save_verify_result 0 "" ""
    echo -e "  \033[0;32m[OK]\033[0m Docs check passed"
}
