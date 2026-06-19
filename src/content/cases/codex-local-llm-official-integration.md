---
tag: "Local LLM"
title: "Codex CLI + LM Studio, 로컬 LLM 연동 가이드"
summary: "API 키 없이 Codex CLI에 LM Studio를 연결하는 방법을 단계별로 안내합니다."
publishedAt: 2026-06-19
---

## Codex CLI + LM Studio, 로컬 LLM 연동하기

Codex CLI가 **로컬 LLM 공식 연동**을 지원하면서, API 키나 비용 없이 내 컴퓨터에서 코딩 에이전트를 돌릴 수 있게 됐습니다. 이 글에서는 **LM Studio**를 기준으로, 5분 안에 연결하는 방법을 안내합니다.

> **중요:** 로컬 LLM 연동은 **Codex CLI**에서만 지원됩니다. Codex Desktop 앱(`codex app`)과 IDE 확장은 현재 OpenAI 모델만 지원합니다.

## 1. 준비물

- **Codex CLI** — `npm install -g @openai/codex`
- **LM Studio** — [lmstudio.ai](https://lmstudio.ai)에서 다운로드

## 2. LM Studio에 모델 다운로드 및 서버 실행

1. LM Studio 실행 후 왼쪽 검색창에서 모델을 검색합니다. (예: `qwen3.6-35b-a3b`)
2. 다운로드한 모델을 선택하고 **Local Server** 탭으로 이동합니다.
3. 상단 드롭다운에서 다운로드한 모델을 선택합니다.
4. **Start Server**를 클릭합니다.

> 기본 포트 `1234`에서 서버가 실행됩니다. 아래 명령어로 확인하세요:
> ```bash
> curl http://localhost:1234/v1/models
> ```
> 다운로드한 모델 ID가 `data` 배열에 표시되면 정상입니다.

## 3. Codex 설정 파일 수정

터미널에서 설정 파일을 직접 생성하거나 편집합니다:

```bash
mkdir -p ~/.codex && nano ~/.codex/config.toml
```

아래 내용을 추가하세요:

```toml
[model_providers.lmstudio]
name = "LM Studio"
base_url = "http://localhost:1234/v1"
wire_api = "responses"

model_provider = "lmstudio"
model = "qwen/qwen3.6-35b-a3b"
```

> `model` 값은 LM Studio **Local Server** 탭 상단 드롭다운에 표시된 모델 ID와 정확히 일치해야 합니다.

저장하고 파일을 닫습니다.

## 4. Codex 실행

터미널에서 다음 명령어를 실행합니다:

```bash
codex
```

TUI가 시작되면 로컬 LM Studio에 연결되어 모델이 로드됩니다. 프롬프트에 자연어로 요청을 입력하면 됩니다:

> "src 폴더의 중복 함수를 정리해줘"

## 모델 추천 (하드웨어에 맞게)

| 모델 | 최소 RAM | 용도 |
|------|----------|------|
| Qwen3.6-27B | 32GB | 일반적인 코드 작성, 버그 수정 |
| Qwen3.6-35B-A3B | 32GB | 복잡한 리팩토링 (MoE, 효율적) |
| Gemma 4 12B | 16GB | 경량 코드 작성, 빠른 응답 |

> Apple Silicon Mac(M4/M5)은 Unified Memory 덕분에 35B-A3B 모델도 충분히 돌릴 수 있습니다.

## 자주 묻는 질문

**Q. Ollama도 쓸 수 있나요?**
A. 네, `model_providers` 테이블을 아래처럼 바꾸세요:

```toml
[model_providers.ollama]
name = "Ollama"
base_url = "http://localhost:11434/v1"
wire_api = "responses"

model_provider = "ollama"
model = "qwen3.6-35b-a3b"  # ollama list로 모델명 확인
```

**Q. API 키가 필요 없나요?**
A. 로컬 모델 연동에는 API 키가 필요 없습니다.

**Q. Codex Desktop 앱에서도 되나요?**
A. **아니요.** 현재는 Codex CLI에서만 로컬 LLM을 지원합니다.

## 기대 효과

- **비용 제로** — API 호출 비용 없음
- **프라이버시** — 코드와 프로젝트 정보가 외부로 나가지 않음
- **오프라인** — 인터넷 연결 없이도 작동

## 한계

- **정확도** — GPT-5.5급 성능은 기대하기 어려움
- **속도** — 큰 모델은 추론에 시간이 걸림 (GPU 가속 권장)
- **검증 필요** — 출력을 항상 확인하세요
