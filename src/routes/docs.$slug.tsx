import { Box, Heading, Text } from "daleui";
import { useNavigate, useParams } from "react-router";
import { css } from "../../styled-system/css";
import { DocsLayout } from "../sections/docs/DocsLayout";
import type { TocItem } from "../sections/docs/DocsToc";
import { DOCS_FLAT_ITEMS, findCategoryTitle } from "../sections/docs/docsNav";

interface PlaceholderSection {
  id: string;
  label: string;
  paragraphs: number;
  children?: PlaceholderSection[];
}

/**
 * 실제 문서 본문(MDX)이 붙으면 제거합니다.
 */
const SECTIONS: PlaceholderSection[] = [
  { id: "overview", label: "개요", paragraphs: 10 },
  {
    id: "usage",
    label: "사용법",
    paragraphs: 8,
    children: [
      { id: "usage-basic", label: "기본 사용", paragraphs: 10 },
      { id: "usage-variants", label: "변형", paragraphs: 12 },
      { id: "usage-composition", label: "조합", paragraphs: 10 },
    ],
  },
  {
    id: "props",
    label: "Props",
    paragraphs: 8,
    children: [
      { id: "props-required", label: "필수 Props", paragraphs: 10 },
      { id: "props-optional", label: "선택 Props", paragraphs: 12 },
    ],
  },
  { id: "a11y", label: "접근성", paragraphs: 14 },
  { id: "related", label: "관련 문서", paragraphs: 6 },
];

const DOCS_TOC: TocItem[] = SECTIONS.flatMap((section) => [
  { id: section.id, label: section.label, depth: 2 },
  ...(section.children ?? []).map((child) => ({
    id: child.id,
    label: child.label,
    depth: 3 as const,
  })),
]);

function Placeholder({ paragraphs }: { paragraphs: number }) {
  return (
    <>
      {Array.from({ length: paragraphs }, (_, index) => (
        <Text key={index} as="p" tone="neutral" className={paragraph}>
          본문 콘텐츠 영역입니다. 목차 활성 상태와 sticky 레이아웃을 확인하기
          위해 스크롤 분량을 채운 플레이스홀더 단락입니다. 실제 문서에서는 이
          자리에 설명·예제·표가 들어갑니다.
        </Text>
      ))}
    </>
  );
}

export default function DocsSlug() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const item = DOCS_FLAT_ITEMS.find((doc) => doc.id === slug);

  // 정의되지 않은 문서는 첫 문서로 안내합니다.
  if (!item) {
    return (
      <DocsLayout currentId={DOCS_FLAT_ITEMS[0].id}>
        <Heading level={1}>문서를 찾을 수 없어요</Heading>
        <Text tone="neutral" size="lg" className={css({ mt: "16" })}>
          요청하신 문서가 이동되었거나 아직 준비되지 않았습니다.
        </Text>
        <button
          type="button"
          onClick={() => navigate(`/docs/${DOCS_FLAT_ITEMS[0].id}`)}
          className={css({
            mt: "24",
            textStyle: "label.md",
            color: "fg.brand",
            cursor: "pointer",
          })}
        >
          소개 문서로 이동
        </button>
      </DocsLayout>
    );
  }

  const category = findCategoryTitle(item.id);

  return (
    <>
      <title>{`${item.title} | Dale UI`}</title>
      <meta
        name="description"
        content={`${item.title} 문서 - 달레UI 디자인 시스템`}
      />
      <DocsLayout currentId={item.id} toc={DOCS_TOC}>
        <Heading level={1}>{item.title}</Heading>
        <Text tone="neutral" size="lg" className={css({ mt: "16" })}>
          {category
            ? `${category} 카테고리의 ${item.title} 문서입니다.`
            : `${item.title} 문서입니다.`}
        </Text>

        <Box className={placeholderNotice}>
          이 영역에는 문서 본문(Props 표 · 라이브 데모 · 사용 가이드 · 접근성)이
          들어갑니다. 공통 레이아웃 골격을 검증하기 위한 플레이스홀더입니다.
        </Box>

        {SECTIONS.map((section) => (
          <Box key={section.id}>
            <Heading level={2} id={section.id} className={sectionHeading}>
              {section.label}
            </Heading>
            <Placeholder paragraphs={section.paragraphs} />

            {section.children?.map((child) => (
              <Box key={child.id}>
                <Heading level={3} id={child.id} className={subHeading}>
                  {child.label}
                </Heading>
                <Placeholder paragraphs={child.paragraphs} />
              </Box>
            ))}
          </Box>
        ))}
      </DocsLayout>
    </>
  );
}

const sectionHeading = css({ mt: "48", mb: "16" });

const subHeading = css({ mt: "32", mb: "12" });

const paragraph = css({ mb: "16" });

const placeholderNotice = css({
  mt: "24",
  p: "16",
  borderRadius: "md",
  borderWidth: "1px",
  borderStyle: "dashed",
  borderColor: "border.neutral",
  backgroundColor: "bg.neutral.hover",
  textStyle: "body.sm",
  color: "fg.neutral",
});
