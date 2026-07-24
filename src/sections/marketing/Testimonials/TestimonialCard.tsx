import { Card, HStack, Heading, Text, VStack } from "daleui";
import { sva } from "../../../../styled-system/css";
import { Avatar } from "../../../components/Avatar";
import type { Testimonial } from "../../../constants/testimonials";

interface TestimonialCardProps {
  /** 카드에 표시할 후기 데이터 */
  testimonial: Testimonial;
  /** 무한 스크롤용으로 복제된 카드는 스크린리더에서 숨긴다. */
  ariaHidden?: boolean;
}

export function TestimonialCard({
  testimonial,
  ariaHidden,
}: TestimonialCardProps) {
  const { name, affiliation, quote, avatar } = testimonial;
  const classes = styles();

  return (
    <Card aria-hidden={ariaHidden} className={classes.card}>
      <Card.Body className={classes.cardBody}>
        <Text size="md" className={classes.quote}>
          “{quote}”
        </Text>
        <HStack gap="12" align="center">
          <Avatar src={avatar} alt={`${name}의 프로필 사진`} size="md" />
          <VStack gap="2" align="left" className={classes.authorMeta}>
            <Heading level={5} className={classes.name}>
              {name}
            </Heading>
            <Text size="sm" muted className={classes.affiliation}>
              {affiliation}
            </Text>
          </VStack>
        </HStack>
      </Card.Body>
    </Card>
  );
}

const styles = sva({
  slots: ["card", "cardBody", "quote", "authorMeta", "name", "affiliation"],
  base: {
    card: {
      padding: "24",
      borderRadius: "sm",
      width: { base: "280px", sm: "360px" },
      flexShrink: 0,
      whiteSpace: "normal",
      marginRight: "24",
    },
    cardBody: {
      gap: "16",
      height: "100%",
    },
    quote: {
      color: "fg.neutral.active",
      lineHeight: "1.6",
      wordBreak: "keep-all",
      flex: 1,
    },
    authorMeta: {
      minWidth: 0,
    },
    name: {
      color: "fg.neutral.active",
      wordBreak: "keep-all",
    },
    affiliation: {
      lineHeight: "1.2",
      wordBreak: "keep-all",
    },
  },
});
