import { Box, Flex, Icon, Text } from "daleui";
import { Link } from "react-router";
import { css } from "../../styled-system/css";

interface PostNavigationProps {
  to: string;
  label: string;
}

export default function PostNavigation({ to, label }: PostNavigationProps) {
  return (
    <Link to={to} className={postLinkStyle} style={{ textAlign: "left" }}>
      <Flex align="center" gap="8">
        <Icon name="chevronLeft" size="sm" />
        <Box>
          <Text size="sm" as="p" tone="neutral">
            이전 글
          </Text>
          <Text size="sm" as="p" className={css({ fontWeight: "bold" })}>
            {label}
          </Text>
        </Box>
      </Flex>
    </Link>
  );
}

const postLinkStyle = css({
  flex: 1,
  display: "block",
  p: "16",
  borderRadius: "md",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.neutral",
  color: "fg.neutral",
  textDecoration: "none",
  _hover: { borderColor: "border.brand", color: "fg.brand" },
});
