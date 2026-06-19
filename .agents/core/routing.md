---
scope:
- '*'
always_apply: false
priority: 2
domain: core
verify_with:
- just prevent-tech-debt
---
<!-- Language: ko -->
# 도구 라우팅 및 파일 접근 규칙

이 문서는 에이전트의 도구 선택·라우팅 정책과 편집 전 컨텍스트 라우팅 절차를 규정합니다.
핵심 실행 원칙은 [execution.md](./execution.md) 를 참조.

---

## 1. File Edit Tool Schema & Editing Rules

> **AGENTS.md §1.10, §1.11 요약본 포함** — 메인 에이전트 컨텍스트 lazy-load. 상세·WRONG/CORRECT 예시: 본 문서, [runtime_edit_tools.md](./runtime_edit_tools.md), [error_patterns/detail/editing.md](error_patterns/detail/editing.md).

> **Cursor IDE SSOT**: 본 절 §1.1–§1.4의 도구 이름·키 스키마는 **Cursor** 기준이다. 보조 도구·MCP `repo_*`·한글 우회: [runtime_edit_tools.md](./runtime_edit_tools.md).

저장소, 코드베이스, 파일시스템, 개발, 디버깅 관련 작업 시 다음 원칙을 반드시 준수한다.

1. **파일 I/O**: Cursor 내장 도구(`Read` / `Write` / `StrReplace` / `Grep` / `Glob` / `SemanticSearch`)를 사용한다.
2. **터미널·검증·런타임 조사**: 내장 Shell로 **실측**한다. prior knowledge·추측으로 대체하지 않는다.
3. **Never assume** file contents, project structure, configs, APIs, or implementation details without inspection (`Read` 등).

### 1.1 File Edit Tool Schema (편집 도구 SSOT)

부분 수정과 신규/전체 쓰기를 **반드시** 분기한다.

| 작업 | Cursor 내장 | 필수 인자 |
| :--- | :--- | :--- |
| 읽기 | `Read` | `path` |
| 신규·전체 | `Write` | `path`, `contents` |
| 부분 수정 | `StrReplace` | `path`, `old_string`, `new_string` |

**흐름**: `Read` → 디스크 본문에서 old 문자열 추출(줄 번호 제외) → `StrReplace`. 신규 파일은 `Write`만 사용.

### 1.1.1 Cursor Edit Rules

- **StrReplace**: `path`(프로젝트 루트 **상대**), `old_string`/`new_string`(snake_case). `old_string`은 파일 내 **정확히 1번** 매칭.
- **Write**: 신규 파일 생성 및 전체 덮어쓰기만. `replace_all: true` **금지**.

### 1.2 Patch Preconditions (메타 금지 1·2)

- **Disk State First**: 파일 수정 전 디스크 최신본을 `Read`로 확보한다. 읽기 도구 출력(줄 번호·프롬프트)을 파일 본문이나 `old_string`에 넣지 않는다.
- **단일 매칭 (유일성 보장)**: `StrReplace` 호출 전 대상이 디스크에 존재하고 `content.count(old_string) == 1`이어야 한다.
- **편집 전 필수 읽기**: `Read` → 디스크 본문에서 치환 대상을 **그대로** 복사(byte-identical) → `StrReplace`.
- **치환 대상과 결과의 차별성 (old ≠ new)**: `old_string == new_string`이면 호출하지 않는다.
- **CLI 검증 (선택)**: `just route-gate-check <paths> --file <path> --old-string '<snippet>' [--new-string '<snippet>']`

❌✅ 세션 사례·증상별 예시: [error_patterns §1](error_patterns.md#1-파일-편집-실수) lazy-load. AGENTS.md §2.1 pointer는 본 절로 위임한다.

### 1.3 Line Number Safety Rule

라인 번호는 탐색용 정보일 뿐이며 수정 기준이 될 수 없다.

**금지**: `lines[i]` · `lines[i-1]` · `grep -n` 결과만으로 patch · 특정 행 번호 기반 수정.

구조 기반 탐색(`Grep`, `SemanticSearch`, 심볼·블록 단위)을 우선한다.

### Mandatory Behavior
- Always inspect relevant files before proposing modifications (`Read`).
- MUST use the platform-appropriate read/edit tool before quoting or modifying file contents.
- Prefer Shell/`just` for executable verification instead of theoretical assumptions.
- Avoid broad regex/string replacement tools (`sed`, `perl -pi`, `mass replace`) unless explicitly requested. Prefer symbol-aware or AST-aware edits with minimal scoped diffs.
- Never use `sed -i` across multiple files.

### 1.4 Editing Rules (replace / write discipline)
세션의 활성 편집 도구(Cursor `StrReplace` / `Write`)로 저장소를 수정할 때 다음을 **MUST**로 따른다.

1. **No broad retry after pattern failure**: 치환 도구가 패턴 불일치로 실패하면, **더 넓은 old_string / 더 큰 블록 / 더 넓은 라인 범위**로 즉시 재시도하지 않는다.
2. **Failure recovery sequence**: 실패 시 (a) 대상 구간 **재읽기** (b) 치환 범위 및 `StartLine`/`EndLine` **축소** (c) **정확히 일치하는 단일 줄**만으로 재시도한다.
3. **No automatic tool hopping**: 한 도구 실패만으로 부분 수정 도구 ↔ 전체 쓰기 도구(`Write` / `write_to_file`)를 **자동 전환하지 않는다**. 전환은 재읽기·원인 파악 후 **명시적 판단**이 있을 때만 수행한다.
4. **Validate parameters first**: 도구 호출 전 (a) 대상 파일 최신본 확인 (b) 치환 대상이 디스크 본문에 존재 (c) **치환 대상 ≠ 치환 결과** (동일할 시 호출 금지) (d) 스키마 필수 매개변수·타입 검증. 누락·오류 상태로 호출하지 않는다.
5. **신규 vs 부분 수정 분기**:
  - 신규 파일 및 전체 재작성 → `Write`
  - 단일 연속 블록 수정 → `StrReplace`

**MUST NOT**
- 패턴 실패 직후 "혹시 모르니" 전체 파일 `Write`로 덮어쓰기.
- 디스크 재읽기 없이 추측 치환 대상 문자열로 연속 수정 시도.
- 동일 실패에 대해 서로 다른 편집 도구를 무작위 순환 호출.

**Reasoning Policy:**
- Prioritize root-cause analysis over workarounds.
- Verify assumptions through tools whenever possible.
- Avoid hallucinating APIs, file paths, configs, or command outputs.
- When uncertain, inspect first rather than infer.

### 1.5 Atomic Edit Granularity (원자 편집 단위)

**목적**: 기존 파일을 한 번에 통째로 덮어쓰거나, 여러 함수·컴포넌트를 한 번의 부분 수정으로 묶어 바꾸는 실수를 방지한다.

#### 적용 순서

| 순서 | 조건 | 행동 |
| :--- | :--- | :--- |
| 1 | [예외](#154-write-허용-예외) 해당 | `Write` 허용 |
| 2 | 디스크에 **이미 존재**하는 소스·설정·문서 | **부분 수정만** — §1.5.1~1.5.3 |
| 3 | 부분 수정 2회 연속 실패 | 범위 **축소**·재읽기 — **기존 파일 전체 쓰기로 에스컬레이션 금지** |

#### 1.5.1 한 번에 하나의 편집 단위

**MUST**: 부분 수정 도구 1회 호출 = 아래 **하나**만 변경한다.

| 편집 단위 (택 1) | 범위 |
| :--- | :--- |
| 함수·메서드·훅·arrow handler | 시그니처 ~ 닫는 `}` (본문 전체) |
| React 컴포넌트 | `function`/`const` 선언 ~ 해당 컴포넌트 닫는 `}` |
| 타입·interface·enum | 선언 블록 1개 |
| import / export 줄 | 연속 import 블록 또는 export 1줄 |
| 상수·설정 필드 | 단일 키·단일 필드 |

**MUST NOT**
- **서로 다른 함수 2개 이상**을 하나의 `old_string` / `TargetContent`에 넣기
- 파일 절반 이상을 한 번에 치환
- «리팩터링» 명목으로 인접 무관 코드까지 같은 패치에 포함

**여러 단위가 필요할 때**: 단위마다 **별도 `StrReplace` 호출** — 호출 사이 `Read`로 디스크 재확인.

#### 1.5.2 기존 파일 — Write 금지

디스크에 **이미 존재**하는 파일에 대해 `Write`로 **전체 내용을 다시 쓰는 것**을 **금지**한다.

- 부분 수정 실패·2회 연속 실패·JSX 까다로움도 **예외 아님** — [§1.4](#14-editing-rules-replace--write-discipline) recovery + 범위 축소.
- `replace_all: true`로 파일 전역 치환 **금지**.

#### 1.5.3 신규 파일 — 최소 골격 후 증분

신규 파일 생성 시:

1. **1차 `Write`**: 최소 골격만 (빈 export, stub, 템플릿 수준) — **가능하면 80줄 미만**
2. **이후**: 로직·UI·문장은 **부분 수정으로 증분** — 함수·섹션 단위 §1.5.1

대형 신규 파일을 한 번에 `Write`로 채우지 않는다. Blueprint가 «신규 파일 전체» Task여도 **골격 Write 1회 + 함수 단위 증분**으로 쪼갠다.

#### 1.5.4 Write 허용 예외

| 예외 | 조건 |
| :--- | :--- |
| **신규 파일 1차 골격** | 경로가 디스크에 없음 · §1.5.3 |
| **한글 대량** | [korean_llm_artifacts.md](../domains/frontend/korean_llm_artifacts.md) · [runtime_edit_tools.md §4](runtime_edit_tools.md) 터미널 우회 |
| **기계 생성물** | `just`·codemod·scaffold CLI가 파일을 쓴 뒤 에이전트는 **증분만** |
| **사용자 명시 전체 재작성** | 채팅에서 «파일 통째로 다시 써» 등 **명시** — 그 파일만 |

예외 없이 기존 파일 `Write` 시 **Workaround** — close turn에 보고 ([principles.md §1.6](principles.md#16-workaround-accountability--close-turn-reflection)).

#### 1.5.5 Subagent · Orchestration

O2 Strengthened 실행 subagent도 본 절을 따른다 — handoff: [orchestration.md §4](orchestration.md#4-handoff-계약-task-prompt-필수).

### Repeated Tool Failure Rule (extends Editing Rules)

동일한 도구 호출 + 동일한 에러 + 2회 반복 → **retry 금지**

```
same tool + same args + same non-transient error + 2 occurrences
=> retry prohibited
   (unless Editing Rules recovery path is exhausted)
```

**Required next steps:**

1. inspect arguments (verify required fields are populated)
2. inspect schema (check field names, types)
3. compare behavior across action variants of same tool
4. generate root-cause hypothesis (adapter defect, server validation, etc.)
5. alternative workflow (e.g., `Write` for **new file only** — [§1.5](routing.md#15-atomic-edit-granularity-원자-편집-단위); existing file: shrink scope, split edits)

Applies to all tool calls, not just file edits.

**예시:**

```
ToolFoo(action='patch', id='x') → Not found

=> retry prohibited
=> inspect: why does id become ''?
=> compare: alternate action variant with same id → OK?
=> hypothesis: adapter/implementation defect for action='patch'
=> strategy: use session-native partial-edit tool ([runtime_edit_tools.md §1](./runtime_edit_tools.md)), or report to user
```

### Terminal Response Rule (무한 루프 방지)

특정 도구 응답은 **재시도가 아닌 종료 신호**이다. 이 응답을 보고 동일 도구를 다시 호출하면 무한 루프가 발생한다.

**터미널/도구 응답 3종** (재시도 금지, 즉시 중단):

| 응답 | 도구 | 행동 |
|------|------|------|
| `"No changes to apply: oldString and newString are identical"` 또는 변화 없음 에러 | `StrReplace` | **동일 old/new 재호출 금지** → `Read` → 목표 내용 있으면 완료·없으면 입력값 변경 후 1회 |
| `"PASS"` (lint/test/verify) | `just plan-lint`, `pytest`, `just route-gate-check` 등 | 게이트 통과. 다음 단계로 진행. |
| 동일 stdout 재출력 (bash) | `bash` | 명령이 이미 성공했거나 상태 변경 없음. 다음 작업으로 진행. |

```
❌ WRONG: 동일 StrReplace 재호출
StrReplace(old_string="status: handed-off", new_string="status: handed-off")
# → "No changes to apply"
StrReplace(old_string="status: handed-off", new_string="status: handed-off")
# → 무한 루프

✅ CORRECT: "No changes to apply" 분기
Read(path)  # 디스크 재확인
# 목표 내용이 이미 있으면 → 편집 완료, 다음 단계
# 없으면 → old_string(TargetContent)·범위·new_string(ReplacementContent) 중 하나 이상 변경 후 1회 시도

✅ CORRECT: 기타 터미널 종료 신호
# "PASS" → 게이트 통과, 다음 Task로 진행
# 동일 stdout 재출력 → 상태 변경 없음, 다음 작업으로 진행
```

**`"No changes to apply"` (또는 동등한 변화 없음 상태) 수신 시 분기** (normative):

1. 같은 `old_string`/`new_string`으로 **재호출하지 않는다**.
2. `Read`로 파일을 다시 확인한다.
3. 목표 내용이 **이미 있으면** → 편집 완료 처리, 다음 단계.
4. **없으면** → 입력값·범위 중 하나 이상을 바꿔 **새 `StrReplace` 1회**만 시도.

**부분 수정 도구 호출 전 필수 검증**:

1. `Read`로 파일 최신본 확보.
2. `content.count(old_string) == 1` 확인.
3. `old_string != new_string` — 동일하면 호출 금지.
4. 한글/인코딩 문제 시 `Shell` + `cat << 'EOF'` 또는 `python3 -c` 사용.

**규범**: [error_patterns.md §메타 금지 8-9](error_patterns.md) — 동일 입력 무한 재시도 금지, 터미널 응답 종료 신호 인식.

### Successful Variant Comparison

동일 도구의 다른 action 이 성공했다면, 먼저 "내 프롬프트 문제"보다
"tool 구현 차이"를 의심합니다.

```
tool X(action='A') → 성공
tool X(action='B') → 실패

=> 내 argument 가 잘못된 것이 아님
=> action B 의 구현에 특수 조건이 있을 가능성 높음
```

**Action:**

1. 성공한 action 과 실패한 action 의 차이 확인
2. 실패한 action 의 스키마/필수 인자 재확인
3. 동일 argument 로 다른 action 이 성공했다면 retry 하지 말고 대체 action 사용

---

## 2. Context Route Gate (편집 전 강제, IDE 공통)

**적용**: 저장소 내 파일을 **생성·수정·삭제**하기 전. (Read-only 조사·`just route` 자체 실행은 제외.)

**금지 (정책 위반)**:
- `just route` 없이 도메인 규칙·베스트 프랙티스 스킬을 "알고 있다"고 가정하고 패치하는 것
- `must_read` 일부만 읽고 나머지를 생략하는 것
- `must_read` 미완료 상태에서 완료 선언·PR 제출

**필수 절차 (순서 고정)**:
1. 이번 턴에 건드릴 **모든** 대상 경로를 repo-relative 로 나열한다.
2. 터미널에서 실행한다 (`route` 직후에 `--` 넣지 않음):
   ```bash
   just route <path1> <path2> ... --write-manifest
   ```
3. 터미널 **`[Next Action for Agent]`** 블록을 **JSON 파싱 없이 순서대로 복붙 실행**한다:
   - **`just route-read …`** — 나열된 must_read 경로를 Read 직후 1회 실행
   - **`just route-gate-check <paths>`** — exit 0 확인 후에만 호스트 쓰기·부분 수정·삭제 ([runtime_edit_tools.md §1](./runtime_edit_tools.md))
   - **lazy Read 각주** — Next Action 블록 하단 2줄을 따른다. 상세: [.agents/registry/CONTEXT_ROUTING.md](../registry/CONTEXT_ROUTING.md) 「2단계 스킬 lazy-load」
4. 의도(리뷰·리팩터·UI 등)가 있으면 `--intent` 를 붙인다. 예: `just route src/foo.tsx --intent 리뷰 --write-manifest`

### 초경량·의도 라우팅 (선택)
- `just route <paths> --tight` — Always Load 생략, 프로젝트 스킬 cap=2.
- `just route-smart '<query>' <paths>` 또는 `python3 scripts/agent/route_smart.py "<query>" <paths>` — 쿼리 의도 분류 + 짧은 쿼리 시 tight 자동 제안. 쿼리에 공백이 있으면 **쉘에서 쿼리 전체를 한 인자로** 인용한다.

### 해석 SSOT
- 도메인 규칙: [.agents/registry/CONTEXT_ROUTING.md](../registry/CONTEXT_ROUTING.md)
- 프로젝트 스킬: [.agents/registry/PROJECT_SKILL_ROUTING.json](../registry/PROJECT_SKILL_ROUTING.json)
- 엔진: `scripts/agent/route_context.py` (`get_route_bundle`)

### 검증
편집 직전 턴 로그에 `just route` 출력(가이드라인) 또는 `must_read_paths` 목록이 있어야 한다. 없으면 게이트 미통과.

### 세션 매니페스트 (멀티 에이전트·IDE 공통, SSOT: `scripts/agent/route_gate.py`)
Cursor 훅이 아닌 **`just` 명령**으로 "필독 완료"를 기록·검증한다. 매니페스트 기본 경로: `.agent/route/session-manifest.json` (gitignore). 환경 변수: `ROUTE_MANIFEST_PATH`, `ROUTE_SESSION_KEY`, `ROUTE_AGENT_ID`.

| 시점 | 명령 (예) |
| :--- | :--- |
| **첫 턴** (선읽기) | `just route-smart '<사용자 메시지 요약>' <paths…> --full --write-manifest --phase turn1` |
| **편집 준비** | `just route-prep <paths>` (= `route … --write-manifest --phase pre_edit`) |
| **턴 종료** | `just route-gate-check-touched` — git 변경 경로에 대해 manifest 검증(매니페스트 없으면 skip). `ROUTE_GATE_SKIP=1` 로 생략. 편집 경로 합집합이 마지막 번들과 다를 때 live route heal 을 실행하고, stale 즉시 차단 대신 `healed` 플래그와 Δmust_read 만 반환한다. |

- **질문·심문·리뷰만**(저장소 미편집): `route-gate-check` **호출하지 않음**.
- **실패(exit 1)**: 해당 턴에서 편집 도구 중단; 누락 경로를 Read 한 뒤 `route-read` 재실행.
- **상태 확인**: `just route-manifest-status`
- **Renderer TSX**: `{{FRONTEND_APP_PATH}}/**/*.tsx` 편집 시 lazy `detail_path` 도 gate 대상(자동).
- **번들 heal**: 편집 경로 집합이 바뀌면 `route-gate-check` 가 **live route** 로 번들을 자동 갱신하고, **현재 번들의 `reads`** 에 없는 must_read 만 추가로 요구한다(stale 즉시 차단 없음). 세션 `all_reads` 만으로는 통과하지 않는다.
- **편집 직전 strict**: `route-gate-check` 통과에는 **해당 편집 경로의 pre_edit 번들**에 `route-read` 기록이 있어야 한다. 번들이 없거나 번들 `reads` 가 비어 있으면 FAIL이며, session-reads-only 우회는 없다.

---

## 3. File Access Priority

1. **Built-in File I/O**: `Read` / `Write` / `StrReplace` / `Grep` / `Glob` / `SemanticSearch`. 부분 수정은 §1.1 `StrReplace` + `old_string`.
2. **Command orchestration**: Justfile (`just <command>`)을 통해 복잡한 쉘 파이프라인 및 도구 체인을 추상화해 실행한다. (권장)
3. **Shell direct**: batch / system-level / permissions 필요 시에만 직접 호출한다.
