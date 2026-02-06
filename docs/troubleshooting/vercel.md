# Vercel Deployment Troubleshooting

## 1. Project misidentified as Next.js
- **증상**: 빌드 시 `Error: No Next.js version detected` 에러 발생.
- **원인**: Vercel이 Astro 프로젝트를 Next.js로 오인하여 잘못된 빌드 프리셋을 적용함.
- **해결책**:
    1. **`vercel.json` 추가**: 프로젝트 루트에 아래 내용을 포함한 `vercel.json`을 생성하여 설정을 강제합니다 (조치 완료).
       ```json
       { "framework": "astro" }
       ```
    2. **Vercel 설정 확인**: 대시보드 Settings > General에서 Framework Preset이 `Astro`인지 다시 확인합니다.
    3. **재배포**: `git push` 후 자동으로 시작되는 빌드를 확인합니다.

## 2. Git Submodule 동기화 실패
- **증상**: `Warning: Failed to fetch one or more git submodules` 발생 및 런타임 에러.
- **원인**: Vercel 빌드 환경에서 서브모듈 접근 권한 부족 또는 설정 누락.
- **해결책**:
    - Vercel Settings > Git > **Git Submodules** 설정 활성화.
    - 프라이빗 서브모듈의 경우 Deploy Key 또는 GitHub App 권한 확인 필요.
