import { Box, Card, Flex, Heading, Text, VStack } from "daleui";
import { Link } from "react-router";
import type { Route } from "./+types/blog._index";
import { css } from "../../styled-system/css";
import { listBlog } from "../content/blog/loader";

// eslint-disable-next-line react-refresh/only-export-components
export function meta() {
  return [
    { title: "블로그 | Dale UI" },
    {
      name: "description",
      content: "달레UI 팀이 디자인 시스템을 만들며 쌓은 기록을 공유합니다.",
    },
  ];
}

// eslint-disable-next-line react-refresh/only-export-components
export function loader() {
  const posts = listBlog().map((post) => ({
    slug: post.slug,
    frontmatter: post.frontmatter,
  }));
  return { posts };
}

export default function BlogIndex({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <Box as="main" className={css({ flex: 1, backgroundColor: "bg.brand" })}>
      <VStack
        align="stretch"
        gap="32"
        className={css({
          width: "100%",
          maxWidth: "768px",
          mx: "auto",
          px: { base: "16", md: "24" },
          py: { base: "40", md: "48" },
        })}
      >
        <Box as="header">
          <Heading level={1}>블로그</Heading>
          <Text tone="neutral">
            달레UI 팀이 디자인 시스템을 만들며 쌓은 기록을 공유합니다.
          </Text>
        </Box>

        {posts.length === 0 ? (
          <Text tone="neutral">아직 게시된 글이 없습니다.</Text>
        ) : (
          <ul
            className={css({
              display: "flex",
              flexDirection: "column",
              gap: "16",
              listStyle: "none",
            })}
          >
            {posts.map((post) => (
              <li key={post.slug}>
                <Card outline>
                  <Card.Body>
                    <Card.Title>
                      <Link
                        to={`/blog/${post.slug}`}
                        className={css({
                          color: "fg.neutral",
                          textDecoration: "none",
                          _hover: { color: "fg.brand" },
                        })}
                      >
                        {post.frontmatter.title}
                      </Link>
                    </Card.Title>
                    {post.frontmatter.description ? (
                      <Card.Description>
                        {post.frontmatter.description}
                      </Card.Description>
                    ) : null}
                  </Card.Body>
                  <Flex gap="8" align="center" className={css({ mt: "12" })}>
                    <Text size="sm" tone="neutral">
                      <time dateTime={post.frontmatter.date}>
                        {post.frontmatter.date}
                      </time>
                    </Text>
                    <Text size="sm" tone="neutral">
                      ·
                    </Text>
                    <Text size="sm" tone="neutral">
                      {post.frontmatter.author}
                    </Text>
                  </Flex>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </VStack>
    </Box>
  );
}
