import { Box, Heading, Text, VStack } from "daleui";
import type { Route } from "./+types/showcase._index";
import { sva } from "../../styled-system/css";
import { listShowcase } from "../content/showcase/loader";
import { ShowcaseCard } from "../components/ShowcaseCard";
import { staticOgImageUrl } from "../og/ogImage";
import { SeoMeta } from "../components/SeoMeta";

const title = "모범사례 | Dale UI";
const description = "DaleUI로 만든 프로젝트들을 소개합니다.";
const image = staticOgImageUrl("showcase");

// eslint-disable-next-line react-refresh/only-export-components
export function loader() {
  return { cards: listShowcase() };
}

export default function ShowcaseIndex({ loaderData }: Route.ComponentProps) {
  const { cards } = loaderData;
  const styles = showcasePage();

  return (
    <>
      <SeoMeta title={title} description={description} image={image} />
      <Box as="main" className={styles.main}>
        <VStack as="header" className={styles.header}>
          <Heading level={1}>모범사례</Heading>
          <p className={styles.tagline}>{description}</p>
        </VStack>

        <Box className={styles.container}>
          {cards.length === 0 ? (
            <Text tone="neutral">아직 등록된 사례가 없습니다.</Text>
          ) : (
            <ul className={styles.grid}>
              {cards.map((card) => (
                <li key={card.url}>
                  <ShowcaseCard card={card} />
                </li>
              ))}
            </ul>
          )}
        </Box>
      </Box>
    </>
  );
}

const showcasePage = sva({
  slots: ["main", "header", "tagline", "container", "grid"],
  base: {
    main: { flex: 1 },
    header: { py: "64", bgColor: "bg.brand", gap: "16" },
    tagline: {
      textStyle: "body.lg",
      fontWeight: "semibold",
      color: "fg.neutral.disabled",
      textAlign: "center",
      px: "16",
    },
    container: {
      width: "100%",
      maxWidth: "1024px",
      mx: "auto",
      px: { base: "16", md: "24" },
      py: { base: "40", md: "48" },
    },
    grid: {
      display: "grid",
      gridTemplateColumns: {
        base: "1fr",
        sm: "repeat(2, 1fr)",
        lg: "repeat(3, 1fr)",
      },
      gap: "24",
      listStyle: "none",
    },
  },
});
