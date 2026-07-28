import { Box, Heading, Text } from "daleui";
import { useNavigate, useParams } from "react-router";
import { css } from "../../styled-system/css";
import { DocsLayout } from "../sections/docs/DocsLayout";
import type { TocItem } from "../sections/docs/DocsToc";
import { DOCS_FLAT_ITEMS, findCategoryTitle } from "../sections/docs/docsNav";

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

  const toc: TocItem[] = [
    { id: "overview", label: "개요", depth: 2 },
    { id: "usage", label: "사용법", depth: 2 },
    { id: "props", label: "Props", depth: 2 },
    { id: "a11y", label: "접근성", depth: 2 },
  ];

  return (
    <>
      <title>{`${item.title} | Dale UI`}</title>
      <meta
        name="description"
        content={`${item.title} 문서 - 달레UI 디자인 시스템`}
      />
      <DocsLayout currentId={item.id} toc={toc}>
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

        <Heading
          level={2}
          id="overview"
          className={css({ mt: "48", mb: "16" })}
        >
          개요
        </Heading>
        <Text tone="neutral">본문 콘텐츠 영역입니다.</Text>

        <Heading level={2} id="usage" className={css({ mt: "48", mb: "16" })}>
          사용법
        </Heading>
        <Text tone="neutral">본문 콘텐츠 영역입니다.</Text>

        <Heading level={2} id="props" className={css({ mt: "48", mb: "16" })}>
          Props
        </Heading>
        <Text tone="neutral">본문 콘텐츠 영역입니다.</Text>

        <Heading level={2} id="a11y" className={css({ mt: "48", mb: "16" })}>
          접근성
        </Heading>
        <Text tone="neutral">본문 콘텐츠 영역입니다.</Text>
      </DocsLayout>
    </>
  );
}

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
