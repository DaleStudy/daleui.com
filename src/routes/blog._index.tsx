import { Box, Card, Flex, Heading, Text, VStack } from "daleui";
import { Link } from "react-router";
import type { Route } from "./+types/blog._index";
import { css } from "../../styled-system/css";
import { listBlog } from "../content/blog/loader";
import { UserProfile } from "../components/UserProfile";
import { Navigation } from "../sections/blog/Navigation";

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
    <>
      <Navigation />
      <Box
        as="main"
        className={css({
          flex: 1,
        })}
      >
        <VStack
          as="header"
          className={css({ py: "64", bgColor: "bg.brand", gap: "16" })}
        >
          <Heading level={1}>Dale UI 블로그</Heading>
          <p
            className={css({
              textStyle: "body.lg",
              fontWeight: "semibold",
              color: "fg.neutral.disabled",
            })}
          >
            달레UI 팀이 디자인 시스템을 만들며 쌓은 기록을 공유합니다.
          </p>
        </VStack>

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
                  <Link to={`/blog/${post.slug}`} className="group">
                    <Card
                      outline
                      className={css({
                        _groupHover: {
                          borderColor: "border.brand",
                        },
                      })}
                    >
                      <Card.Body>
                        <Card.Title>
                          <span
                            className={css({
                              _groupHover: {
                                color: "fg.brand",
                              },
                            })}
                          >
                            {post.frontmatter.title}
                          </span>
                        </Card.Title>
                        {post.frontmatter.description ? (
                          <Card.Description>
                            {post.frontmatter.description}
                          </Card.Description>
                        ) : null}

                        <Flex
                          justify="between"
                          align="end"
                          className={css({ mt: "12" })}
                        >
                          <UserProfile
                            authorGithubUrl={
                              post.frontmatter.authorGithubUrl ?? ""
                            }
                            author={post.frontmatter.author}
                            authorAvatar={post.frontmatter.authorAvatar ?? ""}
                          />

                          <Text size="sm" tone="neutral">
                            <time dateTime={post.frontmatter.date}>
                              {post.frontmatter.date}
                            </time>
                          </Text>
                        </Flex>
                      </Card.Body>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </VStack>
      </Box>
    </>
  );
}
