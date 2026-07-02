import { Box, Button, Flex, Heading, Icon, Link, Text, VStack } from "daleui";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/blog.$slug";
import { css } from "../../styled-system/css";
import { findBlog, listBlog } from "../content/blog/loader";
import { UserProfile } from "../components/UserProfile";
import { Giscus } from "../components/Giscus";
import DirectionalLink from "../components/DirectionalLink";
import { SITE_URL, blogOgImageUrl } from "../og/ogImage";
import { SeoMeta } from "../components/SeoMeta";

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
    <>
      <SeoMeta
        title={`${frontmatter.title} | Dale UI`}
        description={frontmatter.description ?? ""}
        image={blogOgImageUrl(slug)}
        type="article"
        url={`${SITE_URL}/blog/${slug}`}
      />
      <VStack as="main" className={css({ flex: 1 })}>
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
              <Link
                href={frontmatter.authorGithubUrl ?? ""}
                external
                size="sm"
                underline={false}
                aria-label={`${frontmatter.author}의 깃허브 프로필`}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "8",
                  fontWeight: "bold",
                })}
              >
                <UserProfile
                  author={frontmatter.author}
                  authorAvatar={frontmatter.authorAvatar ?? ""}
                />
              </Link>
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
                <DirectionalLink
                  to={`/blog/${older.slug}`}
                  caption="이전"
                  label={older.title}
                  direction="left"
                />
              ) : (
                <Box className={css({ flex: 1 })} />
              )}
              {newer ? (
                <DirectionalLink
                  to={`/blog/${newer.slug}`}
                  caption="다음"
                  label={newer.title}
                  direction="right"
                />
              ) : (
                <Box className={css({ flex: 1 })} />
              )}
            </div>
          </Box>

          <Box as="section" aria-label="댓글" className={css({ mt: "48" })}>
            <Giscus term={slug} />
          </Box>
        </Box>
      </VStack>
    </>
  );
}
