import { Flex, Icon } from "daleui";
import { Link } from "react-router";
import { css, cva } from "../../styled-system/css";

interface DirectionalLinkProps {
  to: string;
  caption: string;
  label: string;
  direction: "left" | "right";
}

export default function DirectionalLink({
  to,
  caption,
  label,
  direction,
}: DirectionalLinkProps) {
  return (
    <Link to={to} className={directionalLinkStyle({ direction })}>
      <span
        className={css({
          display: "inline-block",
          textStyle: "caption",
          color: "fg.neutral.disabled",
        })}
      >
        {caption}
      </span>
      <Flex
        align="start"
        className={css({ height: "100%", width: "100%", minWidth: 0 })}
      >
        {direction === "left" && <Icon name="chevronLeft" size="md" />}
        <p
          className={css({
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textStyle: "label.md",
            fontWeight: "bold",
          })}
        >
          {label}
        </p>
        {direction === "right" && <Icon name="chevronRight" size="md" />}
      </Flex>
    </Link>
  );
}

const directionalLinkStyle = cva({
  base: {
    flex: 1,
    minWidth: 0,
    textAlign: "center",
    pt: "8",
    pb: "16",
    px: "16",
    borderRadius: "md",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "border.neutral",
    color: "fg.neutral",
    textDecoration: "none",
    _hover: { borderColor: "border.brand", color: "fg.brand" },
  },
  variants: {
    direction: {
      left: {
        textAlign: "left",
      },
      right: {
        textAlign: "right",
      },
    },
  },
  defaultVariants: {
    direction: "left",
  },
});
