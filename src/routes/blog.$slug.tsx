import { Box, Flex, Heading, Text, VStack } from "daleui";
import { useEffect, useRef } from "react";
import type { Route } from "./+types/blog.$slug";
import { css } from "../../styled-system/css";
import { findBlog } from "../content/blog/loader";

// eslint-disable-next-line react-refresh/only-export-components
export async function loader({ params }: Route.LoaderArgs) {
  const post = findBlog(params.slug);
  if (!post) throw new Response("Not Found", { status: 404 });
  return { frontmatter: post.frontmatter, slug: post.slug };
}

export default function BlogSlug({ loaderData }: Route.ComponentProps) {
  const { frontmatter, slug } = loaderData;
  /**
   * @todo loader에서는 컴포넌트를 직렬화할 수 없어서 불가피하게 findBlog 함수를 다시 호출합니다.
   */
  const post = findBlog(slug);
  const Component = post!.default;
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nodes = articleRef.current?.querySelectorAll("pre.mermaid");
    if (!nodes?.length) return;

    void import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false });
      void mermaid.run({ nodes: Array.from(nodes) as HTMLElement[] });
    });
  }, [slug]);

  return (
    <VStack as="main" className={css({ flex: 1, backgroundColor: "bg.brand" })}>
      <meta property="og:title" content={`${frontmatter.title} | Dale UI`} />
      <meta name="description" content={frontmatter.description ?? ""} />
      <Box
        as="article"
        ref={articleRef}
        width="100%"
        className={`prose ${css({
          maxWidth: "768px",
          px: { base: "16", md: "24" },
          py: { base: "40", md: "48" },
        })}`}
      >
        <Box as="header" className={css({ mb: "24" })}>
          <Heading level={1}>{frontmatter.title}</Heading>
          {frontmatter.description ? (
            <Text>{frontmatter.description}</Text>
          ) : null}
          <Flex align="end" direction="column">
            <Text size="sm" tone="neutral">
              <time dateTime={frontmatter.date}>{frontmatter.date}</time>
            </Text>
            <Text size="sm" tone="neutral">
              {frontmatter.author}
            </Text>
          </Flex>
        </Box>
        <Component />
      </Box>
    </VStack>
  );
}
