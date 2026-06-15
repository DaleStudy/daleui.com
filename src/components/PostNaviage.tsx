import { Flex, Icon } from "daleui";
import { Link } from "react-router";
import { css } from "../../styled-system/css";

interface PostNavigationProps {
  to: string;
  label: string;
  direction: "left" | "right";
}

export default function PostNavigation({
  to,
  label,
  direction,
}: PostNavigationProps) {
  return (
    <Link to={to} className={postLinkStyle}>
      {direction === "left" && <Icon name="chevronLeft" size="sm" />}
      <Flex
        direction="column"
        justify="start"
        className={css({ height: "100%", width: "100%" })}
      >
        <p
          className={css({
            textAlign: direction === "left" ? "left" : "right",
            fontWeight: "bold",
            fontSize: "xs",
            color: "fg.neutral",
          })}
        >
          {direction === "left" ? "이전 글" : "다음 글"}
        </p>
        <p className={css({ fontWeight: "bold", flex: 1 })}>{label}</p>
      </Flex>
      {direction === "right" && <Icon name="chevronRight" size="sm" />}
    </Link>
  );
}

const postLinkStyle = css({
  flex: 1,
  display: "flex",
  gap: "8",
  alignItems: "center",
  p: "16",
  borderRadius: "md",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "border.neutral",
  color: "fg.neutral",
  textDecoration: "none",
  _hover: { borderColor: "border.brand", color: "fg.brand" },
});
