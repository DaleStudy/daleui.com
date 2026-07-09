import { Text } from "daleui";
import { css } from "../../styled-system/css";
import type { ShowcaseCard as ShowcaseCardData } from "../content/showcase/schema";

const FALLBACK_IMAGE = "/og-background.png";

export interface ShowcaseCardProps {
  card: ShowcaseCardData;
}

export function ShowcaseCard({ card }: ShowcaseCardProps) {
  return (
    <article
      className={`group ${css({
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        borderRadius: "md",
        borderWidth: "sm",
        borderColor: "border.neutral",
        bg: "bg.neutral",
        transition: "border-color 0.15s ease",
        _hover: { borderColor: "border.brand" },
      })}`}
    >
      <div
        className={css({
          aspectRatio: "1200 / 630",
          overflow: "hidden",
          bgColor: "bg.neutral",
        })}
      >
        <img
          src={card.image}
          alt={`${card.title} 미리보기`}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (img.src.endsWith(FALLBACK_IMAGE)) return;
            img.src = FALLBACK_IMAGE;
          }}
          className={css({
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          })}
        />
      </div>

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "4",
          p: "16",
        })}
      >
        <Text size="lg" weight="semibold" as="p">
          <a
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            className={css({
              _groupHover: { color: "fg.brand" },
              _after: {
                content: '""',
                position: "absolute",
                inset: 0,
              },
            })}
          >
            {card.title}
          </a>
        </Text>
        {card.description ? (
          <Text size="md" tone="neutral" as="p">
            {card.description}
          </Text>
        ) : null}
        <Text size="sm" tone="neutral" className={css({ mt: "8" })}>
          {card.siteName}
        </Text>
      </div>
    </article>
  );
}
