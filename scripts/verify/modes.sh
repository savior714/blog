#!/bin/bash

# blog Verification Mode Configuration
set -euo pipefail

configure_verify_mode() {
    if [ -z "${VERIFY_MODE:-}" ]; then
        if [ "${CI:-}" = "true" ] || [ "${GITHUB_ACTIONS:-}" = "true" ]; then
            export VERIFY_MODE="full"
        else
            export VERIFY_MODE="auto"
        fi
    fi

    RUN_FRONTEND=${RUN_FRONTEND:-1}
    RUN_DOCS=${RUN_DOCS:-1}
    SKIP_FRONTEND_BUILD=${VERIFY_SKIP_FRONTEND_BUILD:-0}
    SKIP_FRONTEND_ALL=${VERIFY_SKIP_FRONTEND_ALL:-0}

    if [ "$VERIFY_MODE" = "quick" ]; then
        SKIP_FRONTEND_BUILD=1
    fi

    if [ "$VERIFY_MODE" = "auto" ]; then
        local changed
        changed="$(git status --porcelain 2>/dev/null || true)"

        if [ -n "$changed" ]; then
            local has_src=0
            local has_docs=0
            local has_shared=0

            while IFS= read -r line; do
                [ -z "$line" ] && continue
                local path="${line:3}"
                if [[ "$path" == src/* ]] || [[ "$path" == *.ts ]] || [[ "$path" == *.tsx ]] || [[ "$path" == *.js ]] || [[ "$path" == *.jsx ]]; then
                    has_src=1
                elif [[ "$path" == docs/* ]] || [[ "$path" == *.md ]]; then
                    has_docs=1
                elif [[ "$path" == package.json ]] || [[ "$path" == next.config.* ]] || [[ "$path" == tsconfig.json ]] || [[ "$path" == eslint.config.* ]] || [[ "$path" == verify.sh ]] || [[ "$path" == scripts/verify/* ]]; then
                    has_shared=1
                fi
            done <<< "$changed"

            RUN_FRONTEND=$has_src
            RUN_DOCS=$has_docs

            if [ "$RUN_FRONTEND" -eq 0 ]; then SKIP_FRONTEND_ALL=1; fi
        else
            echo -e "  \033[0;93m[AUTO]\033[0m No changes detected; running full verification."
        fi
    fi

    if [ "${CI:-}" = "true" ] || [ "${GITHUB_ACTIONS:-}" = "true" ]; then
        RUN_FRONTEND=1
        SKIP_FRONTEND_ALL=0
    fi
}
