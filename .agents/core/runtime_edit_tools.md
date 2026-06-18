---
id: runtime_edit_tools
scope:
- .agents/core/**
- AGENTS.md
domain: core
status: active
last_verified: 2026-06-17
---
<!-- Language: ko -->

# Cursor 편집 도구 스키마 SSOT

`AGENTS.md`·[routing.md §1](./routing.md)과 함께 읽는 **Cursor IDE** 전용 편집·보조 도구 계약이다. 공통 원칙(편집 전 읽기·단일 매칭·old≠new·실패 후 재읽기)은 [routing.md §1.2](./routing.md#12-patch-preconditions-메타-금지-12)에 위임한다.

**SSOT 범위**: (1) Cursor 도구명·키·path 규칙 (2) 공통 패치 전제 요약 (3) 증상별 에러 디코더 (4) 한글/특수문자 우회 (5) MCP `repo_*` 전환기.

---

## 0. 런타임 판별

본 저장소 에이전트 런타임 SSOT는 **Cursor IDE**다. 세션 도구 목록에 `Read`/`StrReplace`/`Write`가 보이면 본 문서와 [routing.md §1](./routing.md)를 따른다.

| 도구 목록에 보이면 | 따를 절 |
| :--- | :--- |
| `Read` / `Write` / `StrReplace` | §1 |
| `AskQuestion` | §1.2 |
| `Shell` / `Grep` / `Glob` / `SemanticSearch` / `Task` / `TodoWrite` 등 | §1.2 |
| `repo_patch` + `old_text` | §5 MCP |

`read_file`, `edit`, `view_file`, `replace_file_content` 등 **레거시·타 런타임 별칭**은 사용하지 않는다.

---

## 1. Cursor 편집 스키마

### 1.1 핵심 I/O

| 작업 | 도구 | 키 | path 형식 |
| :--- | :--- | :--- | :--- |
| 읽기 | `Read` | `path` | 프로젝트 루트 **상대** |
| 부분 수정 | `StrReplace` | `old_string`, `new_string` (snake) | `path` 상대 |
| 신규·전체 | `Write` | `contents` | `path` 상대 |
| MCP 부분 수정 | `repo_patch` | `old_text`, `new_text` (snake) | `path` 상대 |

Normative: [routing.md §1.1](./routing.md#11-file-edit-tool-schema-편집-도구-ssot)

### 1.2 보조 도구

| 기능 | Cursor |
| :--- | :--- |
| 터미널 | `Shell` |
| regex 검색 | `Grep` |
| 경로 탐색 | `Glob` |
| 의미 검색 | `SemanticSearch` |
| 파일 삭제 | `Delete` |
| 구조화 선택 | `AskQuestion` |
| 웹 메타 검색 | `WebSearch` |
| URL 본문 | `WebFetch` |
| 서브에이전트 | `Task` |
| 할 일 목록 | `TodoWrite` |
| 스킬 로드 | `Read` (SKILL 경로) |
| 린트·진단 | `ReadLints` |
| MCP | `CallMcpTool` · `FetchMcpResource` (§5 `repo_*`) |

Golden Log `--tools`: [ai-log.md §도구명](../workflows/ai-log.md) · [normalize_tool_syntax.py](../../projects/ai-log/tools/normalize_tool_syntax.py).

### 1.3 공통 패치 전제조건

| MUST | MUST NOT |
| :--- | :--- |
| `Read`로 디스크 최신본 확보 → `old_string`을 본문에서 **그대로** 복사 | `Read` 출력의 줄 번호를 `old_string`에 포함 |
| 치환 대상이 디스크에 **정확히 1번** 존재 | 매칭 0·2+ 상태에서 `StrReplace` 호출 |
| **old ≠ new** — 같으면 호출 금지 | `"No changes to apply"` 수신 후 **동일 쌍** 재호출 |
| 패턴 실패 시 **재읽기 → 범위 축소 → 1회** 재시도 | 실패 직후 더 넓은 블록·전체 `Write` 덮어쓰기 |
| 신규·전체 → `Write` · 단일 블록 → `StrReplace` | 부분 수정 ↔ 전체 쓰기 **자동 전환** |
| `replace_all`은 **반드시 `false`** | `true`로 파일 전역 무차별 치환 |

### 1.4 `StrReplace` 예시

```json
{
  "path": "src/foo.ts",
  "old_string": "const x = 1",
  "new_string": "const x = 2",
  "replace_all": false
}
```

---

## 2. 에러 디코더

| 에러·증상 | 원인 | 조치 |
| :--- | :--- | :--- |
| `Missing key at ["old_string"]` | `oldString` 등 잘못된 키 | snake_case `old_string`/`new_string`/`path` |
| `unavailable tool 'edit'` / `'view_file'` | 타 런타임 도구 호출 | `StrReplace`/`Read`/`Write` 사용 |
| `JSON parsing failed` | 한글·특수문자를 JSON 인자에 직접 삽입 | [§4](#4-한글특수문자-본문-우회) |
| `Found N matches` | `old_string`이 2+ 회 | 블록을 넓혀 유일 구문으로 조정 |
| `No changes to apply` | old=new 또는 이미 반영됨 | **동일 쌍 재호출 금지** → `Read` → §1.3 분기 |
| old not found | 추측 문자열·CRLF·공백 불일치 | 재읽기 → byte-identical 복사 |

상세: [routing.md §1.4](./routing.md#14-editing-rules-replace--write-discipline) · [editing.md §1.6](error_patterns/detail/editing.md)

### MCP `repo_patch` code

| code | 조치 |
| :--- | :--- |
| `INVALID_ARGS` | `path`·`old_text`/`new_text` snake_case 재확인 |
| `NO_CHANGE` | old===new — 호출 금지 |
| `NOT_FOUND` / `NOT_UNIQUE` | 재읽기 → 범위·유일성 조정 |

상세: [SPEC_TECH_repo_mcp_tools.md §4](../../docs/specs/technical/SPEC_TECH_repo_mcp_tools.md)

---

## 3. 레거시 별칭 금지

`read_file`, `write_file`, `patch`, `apply_diff`, `codebase_search`, `terminal` 등은 **호스트 정식 도구가 아님**. Cursor `Read`/`Write`/`StrReplace`/`Shell`/`Grep`/`Glob`/`SemanticSearch`만 사용 — [tools.md §4.5](error_patterns/detail/tools.md).

---

## 4. 한글/특수문자 본문 우회

부분 수정 도구는 ASCII-only JSON 파싱에 최적화되어, 한글 본문을 JSON 인자에 그대로 넣으면 `JSON parsing failed`가 날 수 있다.

| 상황 | 권장 |
| :--- | :--- |
| 영문·코드만 변경 | `StrReplace` (§1) |
| 한글 포함 **대량** 콘텐츠 | `Shell` + `cat << 'EOF'` 또는 `python3 -c` |
| macOS 금지 | `sed -i ''` + 한글 본문 |

---

## 5. stdio MCP `repo_*` (선택)

세션에 `repo_read`/`repo_patch`/`repo_write`가 노출되면 Cursor 네이티브 대신 MCP 계약을 우선한다. 장기 SSOT: [SPEC_TECH_repo_mcp_tools.md](../../docs/specs/technical/SPEC_TECH_repo_mcp_tools.md).

### 5.1 선택 기준

| 조건 | 사용 |
| :--- | :--- |
| `repo_*` 노출 | MCP (snake_case, 상대 `path`) |
| MCP 미노출 | §1 Cursor 네이티브 |
| 한글 대량 본문 | §4 터미널 우회 |

### 5.2 로컬 등록 (`.mcp.json`)

```json
{
  "mcpServers": {
    "emr-repo": {
      "command": "uv",
      "args": ["run", "python", "scripts/mcp_repo_server.py"]
    }
  }
}
```

### 5.3 계약 요약

- **읽기**: `repo_read` — `{ "path": "src/foo.ts" }`
- **부분 수정**: `repo_patch` — `{ "path": "src/foo.ts", "old_text": "…", "new_text": "…", "replace_all": false }`
- **신규·전체**: `repo_write` — `{ "path": "src/new.ts", "content": "…" }`

---

## 6. 관련 문서

- [routing.md §1](./routing.md) — Cursor 편집 규칙·Editing Rules
- [editing.md §1.6](error_patterns/detail/editing.md) — 세션 사례
- [SPEC_TECH_repo_mcp_tools.md](../../docs/specs/technical/SPEC_TECH_repo_mcp_tools.md) — MCP canonical repo I/O
