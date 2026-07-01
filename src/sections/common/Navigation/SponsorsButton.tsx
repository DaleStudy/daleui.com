import { Box, Button, Icon, Link } from "daleui";
import { css } from "../../../../styled-system/css";
import { SPONSOR_URL } from "./links";

export function SponsorsButton() {
  return (
    <Box
      className={css({
        display: { base: "none", lg: "flex" },
      })}
    >
      <Link
        href={SPONSOR_URL}
        external
        underline={false}
        tone="neutral"
        size="lg"
        aria-label="후원하기"
      >
        <Button variant="outline">
          <Icon name="handHeart" />
          후원하기
        </Button>
      </Link>
    </Box>
  );
}
