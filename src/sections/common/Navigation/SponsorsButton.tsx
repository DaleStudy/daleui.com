import { Box, Button, Icon } from "daleui";
import { css } from "../../../../styled-system/css";
import { SPONSOR_URL } from "./links";

export function SponsorsButton() {
  return (
    <Box
      className={css({
        display: { base: "none", lg: "flex" },
      })}
    >
      <a
        href={SPONSOR_URL}
        aria-label="후원하기"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline">
          <Icon name="handHeart" />
          후원하기
        </Button>
      </a>
    </Box>
  );
}
