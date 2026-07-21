import { Card, Flex, HStack, Heading, Tag, Text, VStack } from "daleui";
import { css } from "../../../styled-system/css";
import {
  type Testimonial,
  testimonials as defaultTestimonials,
} from "../../constants/testimonials";

interface TestimonialCardProps {
  /** 카드에 표시할 후기 데이터 */
  testimonial: Testimonial;
  /** 무한 스크롤용으로 복제된 카드는 스크린리더에서 숨긴다. */
  ariaHidden?: boolean;
}

function TestimonialCard({ testimonial, ariaHidden }: TestimonialCardProps) {
  const { name, affiliation, quote, avatar } = testimonial;

  return (
    <Card
      aria-hidden={ariaHidden}
      className={css({
        padding: "24",
        borderRadius: "sm",
        width: { base: "280px", sm: "360px" },
        flexShrink: 0,
        whiteSpace: "normal",
        marginRight: "24",
      })}
    >
      <Card.Body
        className={css({
          gap: "16",
          height: "100%",
        })}
      >
        <Text
          size="md"
          className={css({
            color: "fg.neutral.active",
            lineHeight: "1.6",
            wordBreak: "keep-all",
            flex: 1,
          })}
        >
          “{quote}”
        </Text>
        <HStack gap="12" align="center">
          <div
            className={css({
              width: "40px",
              height: "40px",
              borderRadius: "full",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
              backgroundColor: "bg.brand.active",
            })}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={`${name}의 프로필 사진`}
                className={css({
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                })}
              />
            ) : (
              <Flex
                align="center"
                justify="center"
                className={css({
                  width: "100%",
                  height: "100%",
                })}
              >
                <Text
                  size="sm"
                  className={css({
                    color: "fg.brand.active",
                    fontWeight: "bold",
                  })}
                >
                  {name.slice(0, 1)}
                </Text>
              </Flex>
            )}
          </div>
          <VStack gap="2" align="left" className={css({ minWidth: 0 })}>
            <Heading
              level={5}
              className={css({
                color: "fg.neutral.active",
                wordBreak: "keep-all",
              })}
            >
              {name}
            </Heading>
            <Text
              size="sm"
              muted
              className={css({
                lineHeight: "1.2",
                wordBreak: "keep-all",
              })}
            >
              {affiliation}
            </Text>
          </VStack>
        </HStack>
      </Card.Body>
    </Card>
  );
}

export interface TestimonialsProps {
  testimonials?: Testimonial[];
}

export function Testimonials({
  testimonials = defaultTestimonials,
}: TestimonialsProps) {
  const looped = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className={css({
        width: "100%",
        py: {
          base: "40",
          sm: "60px",
          md: "80px",
        },
        backgroundColor: "bg.brand",
        overflow: "hidden",
      })}
    >
      <VStack
        gap="40"
        className={css({
          width: "100%",
        })}
      >
        <VStack
          gap="12"
          align="center"
          className={css({
            px: { base: "16", sm: "24" },
          })}
        >
          <Tag tone="brand">사용자 후기</Tag>
          <Heading level={4} align="center" wordBreak="cjk">
            달레UI를 사용한 분들의 이야기를 들어보세요.
          </Heading>
        </VStack>

        <div
          className={css({
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
          })}
        >
          <div
            data-marquee-track
            className={css({
              display: "flex",
              width: "max-content",
              animationName: "marquee",
              animationDuration: "40s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              "@media (prefers-reduced-motion: reduce)": {
                animationPlayState: "paused",
              },
            })}
          >
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
