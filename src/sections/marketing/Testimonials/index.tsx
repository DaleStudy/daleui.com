import { Heading, Tag, VStack } from "daleui";
import { sva } from "../../../../styled-system/css";
import {
  type Testimonial,
  testimonials as defaultTestimonials,
} from "../../../constants/testimonials";
import { TestimonialCard } from "./TestimonialCard";

export interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export function Testimonials({
  testimonials = defaultTestimonials,
}: TestimonialsProps) {
  const looped = [...testimonials, ...testimonials];
  const classes = styles();

  return (
    <section id="testimonials" className={classes.section}>
      <VStack gap="40" className={classes.content}>
        <VStack gap="12" align="center" className={classes.header}>
          <Tag tone="brand">사용자 후기</Tag>
          <Heading level={4} align="center" wordBreak="cjk">
            달레UI를 사용한 분들의 이야기를 들어보세요.
          </Heading>
        </VStack>

        <div className={classes.viewport}>
          <div data-marquee-track className={classes.track}>
            {looped.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.name}-${index}`}
                testimonial={testimonial}
                ariaHidden={index >= testimonials.length}
              />
            ))}
          </div>
        </div>
      </VStack>
    </section>
  );
}

const styles = sva({
  slots: ["section", "content", "header", "viewport", "track"],
  base: {
    section: {
      width: "100%",
      py: { base: "40", sm: "60px", md: "80px" },
      backgroundColor: "bg.brand",
      overflow: "hidden",
    },
    content: {
      width: "100%",
    },
    header: {
      px: { base: "16", sm: "24" },
    },
    viewport: {
      position: "relative",
      width: "100%",
      overflowX: "auto",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": {
        display: "none",
      },
      maskImage:
        "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      _hover: {
        "& [data-marquee-track]": {
          animationPlayState: "paused",
        },
      },
    },
    track: {
      display: "flex",
      width: "max-content",
      animationName: "marquee",
      animationDuration: "40s",
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
      "@media (prefers-reduced-motion: reduce)": {
        animationPlayState: "paused",
      },
    },
  },
});
