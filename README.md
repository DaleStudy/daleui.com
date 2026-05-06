<p align="center">
  <img src="./public/newLogoWithText.svg" alt="달레 UI 로고" width="280" />
</p>

[![Integration 🔀](https://github.com/DaleStudy/daleui.com/actions/workflows/integration.yml/badge.svg)](https://github.com/DaleStudy/daleui.com/actions/workflows/integration.yml)
[![Deployment 🚢](https://github.com/DaleStudy/daleui.com/actions/workflows/deployment.yml/badge.svg)](https://github.com/DaleStudy/daleui.com/actions/workflows/deployment.yml)

# daleui.com

🌐 [달레 UI](https://www.npmjs.com/package/daleui) 디자인 시스템을 소개하는 공식 웹사이트 ([www.daleui.com](https://www.daleui.com))입니다.

> 디자인 시스템 라이브러리 자체의 소스는 [DaleStudy/daleui](https://github.com/DaleStudy/daleui) 저장소에서 관리합니다. 이 저장소는 `daleui` 패키지를 npm에서 가져와 사용하는 마케팅 사이트입니다.

## 기술 스택 (Tech Stack)

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Panda CSS](https://panda-css.com/) — 디자인 토큰과 레이아웃 유틸리티
- [daleui](https://www.npmjs.com/package/daleui) — 실제 UI 컴포넌트
- [Bun](https://bun.sh/) — 패키지 매니저 & 스크립트 런타임
- [GitHub Pages](https://pages.github.com/) — 호스팅

## 개발 (Development)

```sh
# 의존성 설치
bun install

# 로컬 개발 서버 실행
bun run dev

# 프로덕션 빌드
bun run build

# 프리뷰
bun run preview
```

## 검증 (Verification)

```sh
bun run lint        # ESLint
bun run format      # Prettier 포맷 확인
bun run coverage    # Vitest + coverage
```

PR이 열리면 `Integration 🔀` 워크플로우가 위 검증을 실행합니다. `main` 브랜치에 머지되면 `Deployment 🚢` 워크플로우가 GitHub Pages로 배포합니다.
