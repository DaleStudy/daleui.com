/**
 * Satori용 OG 이미지 템플릿.
 *
 * Satori는 React 엘리먼트 또는 `{ type, props }` 형태의 트리를 받습니다. 빌드
 * 스크립트(.mts)에서 JSX 트랜스폼 없이 쓰기 위해 작은 하이퍼스크립트 헬퍼 `h`로
 * 트리를 구성합니다. 색상은 브랜드 토큰(violet/teal)을 직접 인용합니다.
 */
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "./ogImage";

/** Satori가 이해하는 최소 엘리먼트 노드. */
export interface OgNode {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: OgNode | string | (OgNode | string)[];
    [key: string]: unknown;
  };
}

function h(
  type: string,
  style: Record<string, unknown>,
  children?: OgNode | string | (OgNode | string)[],
): OgNode {
  return {
    type,
    props: { style, ...(children !== undefined && { children }) },
  };
}

/** 브랜드 토큰 (src/tokens/colors.ts). */
const BRAND = "#5333E1"; // violet.9
const BRAND_LOGO_FROM = "#24EACA";
const BRAND_LOGO_TO = "#846DE9";
const FG = "#1C2024"; // slate.12
const FG_MUTED = "#5D727D"; // slate.7
const BG = "#FFFFFF";

export interface OgTemplateInput {
  title: string;
  /** 작성자 표시명(선택). */
  author?: string;
  /** YYYY-MM-DD(선택). */
  date?: string;
  /** 우상단 라벨(예: "블로그"). */
  eyebrow?: string;
  /**
   * 브랜드 로고 SVG의 data URI
   */
  logoDataUri?: string;
  /**
   * 배경 이미지(`public/og-background.png`)의 data URI. 있으면 카드 전체
   * 배경으로 깔고, 없으면 기존 흰 배경 + 라디얼 그라데이션으로 폴백합니다.
   */
  backgroundDataUri?: string;
}

/** 브랜드 워드마크. 실제 로고 SVG가 있으면 이미지로, 없으면 텍스트로 렌더. */
function wordmark(logoDataUri?: string): OgNode {
  if (logoDataUri) {
    // 원본 SVG 비율 123:41 기준으로 높이 48px에 맞춰 폭 계산.
    // img는 src/width/height가 style이 아니라 props여야 하므로 직접 구성.
    return {
      type: "img",
      props: { src: logoDataUri, width: 144, height: 48 },
    };
  }

  // 폴백: 그라데이션 마크 + 텍스트.
  return h(
    "div",
    {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    [
      h("div", {
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: `linear-gradient(135deg, ${BRAND_LOGO_FROM}, ${BRAND_LOGO_TO})`,
      }),
      h(
        "div",
        {
          fontSize: "32px",
          fontWeight: 700,
          color: BRAND,
          letterSpacing: "-0.02em",
        },
        "Dale UI",
      ),
    ],
  );
}

/**
 * OG 이미지 트리를 생성합니다. 1200x630, 좌측 정렬 카드 레이아웃.
 * 제목은 길이에 따라 폰트 크기를 조정해 3줄 이내로 맞춥니다.
 */
export function createOgTemplate(input: OgTemplateInput): OgNode {
  const { title, author, date, eyebrow, logoDataUri, backgroundDataUri } =
    input;

  // 제목 길이에 따른 폰트 스케일. 한글은 글자 폭이 넓어 영문보다 임계값을 낮게 둠.
  const titleFontSize = title.length > 22 ? 56 : title.length > 14 ? 64 : 72;

  // 배경 이미지가 있으면 카드 전체에 깔고, 없으면 흰 배경 + 라디얼 그라데이션.
  const backgroundStyle = backgroundDataUri
    ? {
        backgroundImage: `url(${backgroundDataUri})`,
        backgroundSize: `${OG_IMAGE_WIDTH}px ${OG_IMAGE_HEIGHT}px`,
        backgroundColor: BG,
      }
    : {
        backgroundColor: BG,
        backgroundImage: `radial-gradient(circle at 100% 0%, ${BRAND_LOGO_FROM}22, transparent 45%)`,
      };

  return h(
    "div",
    {
      width: `${OG_IMAGE_WIDTH}px`,
      height: `${OG_IMAGE_HEIGHT}px`,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "56px",
      borderTop: `12px solid ${BRAND}`,
      fontFamily: "Pretendard",
      ...backgroundStyle,
    },
    [
      // 상단 그룹: 헤더 + 본문을 묶어 흰 영역 안으로 끌어올립니다.
      // (썸네일이 깔린 하단과 겹치지 않도록 space-between으로 분산하지 않음)
      h(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        },
        [
          // 헤더: 워드마크 + eyebrow
          h(
            "div",
            {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            },
            [
              wordmark(logoDataUri),
              eyebrow
                ? h(
                    "div",
                    {
                      fontSize: "26px",
                      fontWeight: 600,
                      color: BRAND,
                      padding: "8px 20px",
                      borderRadius: "999px",
                      backgroundColor: "#EFF1FF", // violet.3
                    },
                    eyebrow,
                  )
                : h("div", {}),
            ],
          ),
          // 본문: 제목. 디자인 시스템 display 스타일과 동일하게 bold(700) +
          // tight 행간/자간을 사용합니다(src/tokens/typography.ts).
          h(
            "div",
            {
              fontSize: `${titleFontSize}px`,
              fontWeight: 700,
              color: FG,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              // 3줄 이내로 제한.
              display: "block",
              lineClamp: 3,
            },
            title,
          ),
        ],
      ),
      // 푸터: 작성자 · 날짜
      h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: "28px",
          fontWeight: 600,
          color: FG_MUTED,
        },
        [
          author ? h("div", { display: "flex" }, author) : h("div", {}),
          author && date ? h("div", { display: "flex" }, "·") : h("div", {}),
          date ? h("div", { display: "flex" }, date) : h("div", {}),
        ],
      ),
    ],
  );
}
