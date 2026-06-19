# AGENTS.md — Unified Execution Constitution (Bootstrap Kernel)

에이전트 **헌법 요약**입니다. 우선순위·게이트·메타 금지만 둡니다. 상세 lazy-load: `.agents/core/`, `.agents/registry/`, `.agents/workflows/`.

---

## 0. Priority / Rule Precedence

우선순위는 아래와 같습니다.

1. `PROJECT_RULES.md`
2. 본 문서 (`AGENTS.md`)
3. `.agents/core/*.md`
4. `.agents/domains/**/*.md` (프로젝트가 추가한 경우)
5. 기타 명세 및 가이드라인

충돌 시 위 순서를 따르며, 불명확하면 질문합니다.

---

## 1. Core Operating Principles (always-on)

### 1.1 Think Before Coding
- 구현 전 가정은 명시한다. 불확실하면 묻는다.
- **Information Integrity**: 실측하지 않은 정보 단정 금지. "아마 ~일 것"으로 완료 선언 금지.
- **Quick Pick**: 모호할 때 `AskQuestion`/`question` 도구로 구조화 선택. 옵션마다 기대 결과 한 줄 + (권장) 태그.

### 1.2 Simplicity First
- 요청받지 않은 기능 추가 금지. 단일 용도 코드에 추상화 과잉 금지.
- 200 줄이면 50 줄로 가능하지 않은지 검토. 시니어 엔지니어가 과설계라고 판단하면 단순화.

### 1.3 Surgical Changes
- 기존 코드 수정 시 인접 코드/주석/포맷 함부로 손대지 않음. 깨진 부분만 고침.
- 관련 없는 dead code 는 삭제하지 말고 언급만 함.

### 1.4 Secrets ZERO-LEAK
- API 키·액세스 토큰·비밀번호·`.env` 등 비밀값 원문 노출 절대 금지.
- 비밀값 필요 시 사용자에게 안전한 제공 경로 먼저 묻는다.

### 1.5 O2 Orchestration
- 메인 에이전트는 **지휘·의사결정·합성**만 담당. 탐색·구현·검증은 Task subagent 에 위임.
- **연속 작업 2+** (서로 다른 종류 작업 단계 2 개 이상 연속) → **Task subagent 필수**. 메인 연속 직접 수행 금지.
- **Chunk 단위**: 1 Task = 파일 1 + 함수·컴포넌트 1 변경. 턴당 spawn 1 개·순차 handoff.

### 1.6 Turn 0 Triage
메인은 구현·편집·테스트·코드베이스 탐색 전 아래만 수행:
1. 요청 유형: 질문만 / 단일 수정 / 복합·플랜 / 디버그 / 리뷰
2. 범위: 예상 터치 파일 수·레이어 수
3. 게이트: Blueprint 필요, `just route` 필요, HITL 필요 여부

**이관 트리거** (하나라도 해당 → 즉시 서브에이전트 Task):
- 연속 작업 2+
- 파일 편집·구현 요청 (파일 1 개·함수 1 개 포함)
- 수정·조사 대상 파일 2 개 이상, 또는 레이어 2 개 이상
- `plan` / `blueprint` / `/discover` / PLAN 순차 실행
- 원인 불명 버그·회귀 (`/diagnose` · `/investigate`)

### 1.7 Handoff 계약
서브에이전트 `prompt` 에는 아래 블록 필수 포함:

```markdown
## Mission
<한 문장 목표>

## Success criteria
- verify: `<단일 명령>`

## Bounded scope
- Allowed paths: ...
- Out of scope: ...

## Gates (subagent MUST)
1. `just route <paths> --json --write-manifest`
2. `must_read` 전량 Read
3. `just route-read` → `just route-gate-check`
4. verify 실행 후 결과 보고
5. **원자 편집** — 기존 파일 `Write` 금지 · 1 회 부분 수정 = 함수·컴포넌트 1 개
```

### 1.8 메타 금지 11
1. **디스크 SSOT** — 수정·판단 전 디스크 최신본 읽기
2. **단일 매칭** — 부분 수정 전 대상 문자열이 파일에 정확히 1 번인지 확인
3. **실패 후 동일 입력 금지** — 부분 수정 도구 실패 후 같은 old/target 재시도 금지
4. **2 회 실패 → 전략 전환** — 같은 파일·같은 작업에서 편집이 2 회 연속 실패하면 부분 수정 멈춤
5. **게이트 PASS 전 다음 단계 금지** — plan-lint·route-gate·해당 Verify PASS 전에 구현·Task 완료 처리 금지
6. **종료는 선택 필수** — discuss/plan 등 종료·핸드오프는 사용자 선택 없이 마무리하지 않음
7. **격리·완전성** — 테스트·mock·공유 저장소는 사용처가 기대하는 export·초기값·cleanup 맞춤
8. **patterns ID 정렬** — `patterns.yaml` SSOT 는 ID 숫자 순 유지
9. **동일 입력 무한 재시도 금지** — old 와 new 가 같으면 부분 수정 도구 호출 금지
10. **커밋 게이트 실패 시 `--no-verify` 금지** — 린트/타입 오류 수정 후 재시도
11. **부분 수정 후 검증 누락** — 성공 응답 후 반드시 grep/read 로 실제 변경 검증

---

## 2. Execution Gates (pointer)

상세: `.agents/core/execution.md`, `.agents/core/routing.md`, `.agents/core/orchestration.md`.

### 2.1 Editing / Routing
`just route <paths> --json --write-manifest` → `must_read` Read → `just route-read` → `just route-gate-check`.

### 2.2 Plan / Blueprint
- **Plan First**: 복합 작업은 `just plan-lint` PASS 전 구현 착수 금지.
- **Task closeout**: Blueprint Task `Status`/`Conclusion` 은 **`just plan-task-close` CLI 만** — 에디터 직접 수정 절대 금지.
- **DoD 재귀 금지**: DoD 섹션에 `just plan-close` 를 verify 명령어로 포함하지 않음.
- **Archive**: `docs/plans/` 파일 이동 시 `.agents/workflows/archive.md` 먼저 Read → `scripts/archive_plans.py` 실행 — 수동 복사/삭제 절대 금지.

### 2.3 Dynamic Rules & Loading
세션 시작: `PROJECT_RULES.md`. lazy (편집·route 직전): `.agents/registry/LOAD_ORDER.md`, `.agents/registry/CONTEXT_ROUTING.md`.

### 2.4 Verification
검증 수준·게이트: `.agents/core/verification.md`. 저장소 수정 있었을 때 세션 종료 검증은 `just lint-turn-end`.

---

## 3. Reference Index

- **Policy / Core**: `PROJECT_RULES.md`, `.agents/core/`
- **Registry**: `.agents/registry/RULE_INDEX.md`, `LOAD_ORDER.md`, `CONTEXT_ROUTING.md`
- **Workflows**: `.agents/workflows/`
- **Specs**: `docs/specs/` (프로젝트가 추가한 경우)

에이전트 규칙 SSOT 는 `PROJECT_RULES.md`, `.agents/core/` 및 `AGENTS.md` 입니다.

중복 방지: `.cursor/rules/` 미사용. **`.cursor/commands/*.md` 는 workflow pointer 만** (본문 SSOT: `.agents/workflows/`). 슬래시·키워드 카탈로그: [WORKFLOW_AND_SKILL_INDEX.md](.agents/registry/WORKFLOW_AND_SKILL_INDEX.md).
