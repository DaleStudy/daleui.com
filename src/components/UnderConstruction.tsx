import { Box, Heading, Text, VStack } from "daleui";
import { Link } from "react-router";
import { css } from "../../styled-system/css";

interface UnderConstructionProps {
  /** 페이지 이름 (예: "문서", "모범사례") */
  title: string;
}

/**
 * 아직 개발 중인 페이지에 표시하는 안내 화면입니다.
 */
export function UnderConstruction({ title }: UnderConstructionProps) {
  return (
    <Box
      as="main"
      className={css({
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { base: "40", md: "48" },
        px: { base: "16", md: "24" },
      })}
    >
      <VStack gap="16" className={css({ textAlign: "center" })}>
        <Heading level={1}>{title}</Heading>
        <Text tone="neutral" size="lg">
          이 페이지는 현재 개발 중입니다. 곧 찾아뵙겠습니다.
        </Text>
        <Link
          to="/"
          className={css({
            textStyle: "body.md",
            fontWeight: "semibold",
            color: "fg.brand",
          })}
        >
          홈으로 돌아가기
        </Link>
      </VStack>
    </Box>
  );
}
