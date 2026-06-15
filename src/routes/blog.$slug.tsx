import { Box, Button, Flex, Heading, Icon, Text, VStack } from "daleui";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/blog.$slug";
import { css } from "../../styled-system/css";
import { findBlog, listBlog } from "../content/blog/loader";
import { UserProfile } from "../components/UserProfile";
import PostNavigation from "../components/PostNaviage";

// eslint-disable-next-line react-refresh/only-export-components
export async function loader({ params }: Route.LoaderArgs) {
  const posts = listBlog();
  const index = posts.findIndex((p) => p.slug === params.slug);
  if (index === -1) throw new Response("Not Found", { status: 404 });

  const post = posts[index];
  const newer = posts[index - 1];
  const older = posts[index + 1];
  const toNav = (p?: (typeof posts)[number]) =>
    p ? { slug: p.slug, title: p.frontmatter.title } : null;

  return {
    frontmatter: post.frontmatter,
    slug: post.slug,
    newer: toNav(newer),
    older: toNav(older),
  };
}

export default function BlogSlug({ loaderData }: Route.ComponentProps) {
  const { frontmatter, slug, newer, older } = loaderData;
  const navigate = useNavigate();
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
          <Button
            variant="ghost"
            tone="neutral"
            size="sm"
            onClick={() => navigate("/blog")}
          >
            <Icon name="chevronLeft" size="sm" />
            목록으로
          </Button>
          <Heading level={1}>{frontmatter.title}</Heading>
          <Flex justify="between" align="end" className={css({ mt: "16" })}>
            <UserProfile
              authorGithubUrl={frontmatter.authorGithubUrl ?? ""}
              author={frontmatter.author}
              authorAvatar={frontmatter.authorAvatar ?? ""}
            />
            <Text size="sm" tone="neutral">
              <time dateTime={frontmatter.date}>{frontmatter.date}</time>
            </Text>
          </Flex>
        </Box>
        <Component />

        <Box
          as="nav"
          aria-label="글 이동"
          className={css({
            mt: "48",
            pt: "24",
            borderTopWidth: "1px",
            borderTopStyle: "solid",
            borderColor: "border.neutral",
          })}
        >
          <div
            className={css({
              display: "flex",
              gap: "16",
              flexDirection: { base: "column", sm: "row" },
              alignItems: "stretch",
            })}
          >
            {older ? (
              <PostNavigation
                to={`/blog/${older.slug}`}
                label={older.title}
                direction="left"
              />
            ) : (
              <Box className={css({ flex: 1 })} />
            )}
            {newer ? (
              <PostNavigation
                to={`/blog/${newer.slug}`}
                label={newer.title}
                direction="right"
              />
            ) : (
              <Box className={css({ flex: 1 })} />
            )}
          </div>
        </Box>
      </Box>
    </VStack>
  );
}
