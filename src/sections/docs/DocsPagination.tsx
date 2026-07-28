import { Box } from "daleui";
import { sva } from "../../../styled-system/css";
import DirectionalLink from "../../components/DirectionalLink";
import { DOCS_FLAT_ITEMS } from "./docsNav";

interface DocsPaginationProps {
  /** 현재 문서 id */
  currentId: string;
}

export function DocsPagination({ currentId }: DocsPaginationProps) {
  const index = DOCS_FLAT_ITEMS.findIndex((item) => item.id === currentId);
  if (index === -1) {
    return null;
  }

  const prev = DOCS_FLAT_ITEMS[index - 1];
  const next = DOCS_FLAT_ITEMS[index + 1];
  const styles = docsPagination();

  return (
    <Box as="nav" aria-label="문서 이동" className={styles.root}>
      {prev ? (
        <DirectionalLink
          to={`/docs/${prev.id}`}
          caption="이전"
          label={prev.title}
          direction="left"
        />
      ) : (
        <Box className={styles.spacer} />
      )}
      {next ? (
        <DirectionalLink
          to={`/docs/${next.id}`}
          caption="다음"
          label={next.title}
          direction="right"
        />
      ) : (
        <Box className={styles.spacer} />
      )}
    </Box>
  );
}

const docsPagination = sva({
  slots: ["root", "spacer"],
  base: {
    root: {
      display: "flex",
      gap: "16",
      flexDirection: { base: "column", sm: "row" },
      alignItems: "stretch",
    },
    spacer: {
      flex: 1,
    },
  },
});
