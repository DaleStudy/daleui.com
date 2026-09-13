# 기여 가이드

달레UI에 관심을 가져주셔서 감사합니다. 기여는 언제나 환영합니다! 🎉

이 저장소는 문서 사이트([www.daleui.com](https://www.daleui.com))입니다. 컴포넌트와 디자인 토큰 소스는 [DaleStudy/daleui](https://github.com/DaleStudy/daleui)에 있습니다.

## 어디에 PR을 올리나요

| 바꾸려는 것                                                 | 저장소                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| 컴포넌트 동작·스타일·Props, 디자인 토큰 값, Storybook       | [DaleStudy/daleui](https://github.com/DaleStudy/daleui)         |
| 문서 본문, 사이드바 구조, 랜딩·쇼케이스 페이지, 사이트 코드 | [DaleStudy/daleui.com](https://github.com/DaleStudy/daleui.com) |

`/docs/button` 같은 페이지를 예로 들면, 그 페이지에 적힌 설명 문장은 이 저장소에 있고, `Button`이 실제로 받는 Props는 `daleui` 저장소에 있습니다.

블로그 글은 두 저장소 어디에도 커밋하지 않습니다. `daleui` 저장소 [Discussions](https://github.com/DaleStudy/daleui/discussions)의 "블로그" 카테고리에 쓰면 빌드할 때 사이트로 가져옵니다. `src/content/blog/*.md`는 그 결과물이라 직접 고쳐도 다음 빌드에서 덮어써집니다.

브랜치·커밋·PR·코드 스타일 컨벤션은 두 저장소가 같습니다. `daleui` 위키의 [Contributing](https://github.com/DaleStudy/daleui/wiki/Contributing)과 [Conventions](https://github.com/DaleStudy/daleui/wiki/Conventions)를 먼저 읽어주세요.

## 개발 환경 (Development)

[Bun](https://bun.sh/)이 필요합니다.

```sh
# 의존성 설치 — prepare 훅이 panda codegen · react-router typegen · lefthook install을 함께 실행합니다
bun install

# 로컬 개발 서버 — predev가 블로그·OG 이미지·쇼케이스 데이터를 먼저 생성합니다
bun run dev
```

블로그 동기화와 쇼케이스 카드 생성은 네트워크를 사용합니다. 실패해도 경고만 남기고 기존 파일과 fallback 카드로 계속 진행하므로 오프라인에서도 개발 서버는 뜹니다.

## 디렉터리 구조

| 경로                              | 내용                                             |
| --------------------------------- | ------------------------------------------------ |
| `src/routes`                      | 파일 이름이 곧 라우트 (React Router)             |
| `src/sections`                    | 페이지를 구성하는 섹션 컴포넌트                  |
| `src/content/docs`                | 문서 본문 MDX                                    |
| `src/content/blog`                | Discussions에서 동기화된 생성물 (직접 수정 금지) |
| `src/content/showcase/entries.ts` | 쇼케이스에 노출되는 프로젝트 목록                |
| `src/mdx`                         | 목차 추출 등 MDX 플러그인                        |
| `styled-system`                   | `panda codegen` 생성물 (직접 수정 금지)          |

## 문서 페이지 추가하기

1. `src/sections/docs/docsNav.ts`의 `DOCS_NAV`에 `{ id, title }`을 추가합니다. `id`가 곧 `/docs/<id>` 경로입니다.
2. `src/content/docs/<id>.mdx`에 본문을 씁니다.

사이드바에 등록되지 않은 `id`로 MDX 파일만 만들면 테스트가 실패합니다. 본문 없이 사이드바에만 등록된 문서는 플레이스홀더 화면으로 렌더링됩니다.

본문 작성 규칙:

- 사이드바 `title`이 h1으로 렌더링되므로 본문에 제목을 다시 쓰지 않습니다.
- `##`·`###`가 우측 목차가 되고, heading `id`는 자동으로 붙습니다.
- 파운데이션 표·샘플 블록(`SemanticColorTable`, `SpacingTable` 등)은 `import` 없이 바로 쓸 수 있습니다. 목록은 `src/sections/docs/foundations`에 있습니다.
- 코드 블록은 [Expressive Code](https://expressive-code.com/)로 렌더링되어 `title="src/App.tsx"` 같은 속성을 지원하고, ` ```mermaid ` 블록은 다이어그램으로 그려집니다. 외부 링크는 새 탭으로 열립니다.

## 검증 (Verification)

```sh
bun run format      # Prettier 포맷 확인
bun run lint        # ESLint
bun run coverage    # Vitest + coverage
bunx tsc -b         # 타입 검사
```

pre-commit 훅이 staged 파일에 `eslint --fix`와 `prettier --write`를 적용하고, pre-push 훅이 테스트와 타입 검사를 실행합니다 ([lefthook.yml](./lefthook.yml)).

## 브랜치와 PR

- `main`에서 `<이슈 번호>-<요약>` 형식으로 브랜치를 만듭니다 (예: `142-docs-contributing`). `-`, `_` 외의 특수문자는 쓰지 않습니다.
- 커밋 메시지는 Conventional Commits 접두사를 붙인 영어 한 줄로 씁니다 (예: `docs: add contributing page`).
- PR 제목과 본문은 한국어로 쓰고, 연결된 이슈를 사이드바 Development 항목에서 지정합니다.
- 리뷰를 요청하기 전에 `Integration 🔀` 워크플로우가 통과하는지 확인해주세요.
- PR 댓글로 올라오는 Cloudflare Preview URL에서 변경 사항을 직접 확인해주세요. 포크에서 올린 PR에는 프리뷰가 생성되지 않으므로 메인테이너가 대신 확인합니다.
- 승인 1개 이상(권장 2개)을 받으면 `main`에 병합하고, `Deploy 🚀` 워크플로우가 프로덕션에 배포합니다.

## 함께 이야기하기

- [디스코드](https://dales.link/discord) — 편하게 물어보고 논의하는 곳
- [이슈](https://github.com/DaleStudy/daleui.com/issues) — 사이트 버그 신고와 문서 제안
