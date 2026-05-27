import { Box, Flex, Heading, Text, VStack } from "daleui";
import { useEffect, useRef } from "react";
import { css } from "../../styled-system/css";
import type { BlogFrontmatter } from "../content/blog/schema";
import type { MdxDoc } from "../mdx/types";

type BlogPageProps = {
  post: MdxDoc<BlogFrontmatter>;
};

export function BlogPage({ post }: BlogPageProps) {
  const { default: Component, frontmatter } = post;
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nodes = articleRef.current?.querySelectorAll("pre.mermaid");
    if (!nodes?.length) return;

    void import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false });
      void mermaid.run({ nodes: Array.from(nodes) as HTMLElement[] });
    });
  }, [Component]);

  return (
    <VStack as="main">
      <Box
        as="article"
        ref={articleRef}
        width="100%"
        className={`prose ${css({
          maxWidth: "768px",
          px: { base: "16", md: "24" },
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
