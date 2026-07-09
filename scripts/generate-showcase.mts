import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import ogs from "open-graph-scraper";
import { showcaseEntries } from "../src/content/showcase/entries.ts";
import {
  type ShowcaseCard,
  type ShowcaseInput,
  showcaseCardSchema,
  showcaseInputSchema,
} from "../src/content/showcase/schema.ts";

const ROOT = join(import.meta.dirname, "..");
const OUT_PATH = join(
  ROOT,
  "src",
  "content",
  "showcase",
  "showcase.generated.json",
);
const FALLBACK_IMAGE = "/og-background.png";
const FETCH_TIMEOUT_SECONDS = 10;

/** 캐시 히트 판정을 위해 병합 입력 해시를 카드에 함께 보관합니다. */
interface CachedCard extends ShowcaseCard {
  _hash: string;
}

type OgFields = Pick<ShowcaseCard, "title" | "description"> & {
  image?: string;
  siteName?: string;
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function absoluteImage(image: string, pageUrl: string): string | null {
  try {
    return new URL(image, pageUrl).href;
  } catch {
    return null;
  }
}

function hashEntry(entry: ShowcaseInput): string {
  return createHash("sha256")
    .update(JSON.stringify(entry))
    .digest("hex")
    .slice(0, 16);
}

async function loadPrevCards(): Promise<Map<string, CachedCard>> {
  if (!existsSync(OUT_PATH)) return new Map();
  try {
    const raw = JSON.parse(await readFile(OUT_PATH, "utf8")) as CachedCard[];
    return new Map(raw.map((card) => [card.url, card]));
  } catch {
    return new Map();
  }
}

function buildCard(
  entry: ShowcaseInput,
  og: Partial<OgFields>,
  hash: string,
): CachedCard {
  return {
    title: entry.title ?? og.title ?? hostname(entry.url),
    description: entry.description ?? og.description ?? "",
    image:
      entry.image ??
      (og.image && absoluteImage(og.image, entry.url)) ??
      FALLBACK_IMAGE,
    siteName: og.siteName ?? hostname(entry.url),
    url: entry.url,
    _hash: hash,
  };
}

async function extractOg(url: string): Promise<Partial<OgFields> | null> {
  try {
    const { error, result } = await ogs({
      url,
      timeout: FETCH_TIMEOUT_SECONDS,
    });
    if (error) return null;
    return {
      title: result.ogTitle ?? result.twitterTitle,
      description: result.ogDescription ?? result.twitterDescription,
      image: result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url,
      siteName: result.ogSiteName,
    };
  } catch {
    return null;
  }
}

async function resolveCard(
  entry: ShowcaseInput,
  prev: Map<string, CachedCard>,
): Promise<{ card: CachedCard; status: "cached" | "fetched" | "fallback" }> {
  const hash = hashEntry(entry);
  const cached = prev.get(entry.url);

  if (cached && cached._hash === hash) {
    return { card: cached, status: "cached" };
  }

  const og = await extractOg(entry.url);
  if (og) {
    return { card: buildCard(entry, og, hash), status: "fetched" };
  }

  if (cached) {
    return { card: { ...cached, _hash: hash }, status: "fallback" };
  }
  return { card: buildCard(entry, {}, hash), status: "fallback" };
}

async function main(): Promise<void> {
  const entries = showcaseEntries.map((entry, i) => {
    const parsed = showcaseInputSchema.safeParse(entry);
    if (!parsed.success) {
      throw new Error(
        `[generate-showcase] entries.ts[${i}] 검증 실패:\n${parsed.error.message}`,
      );
    }
    return parsed.data;
  });

  const prev = await loadPrevCards();
  const counts = { cached: 0, fetched: 0, fallback: 0 };

  const resolved = await Promise.all(
    entries.map((entry) => resolveCard(entry, prev)),
  );

  const cards: CachedCard[] = [];
  for (const { card, status } of resolved) {
    counts[status]++;
    if (status === "fallback") {
      console.warn(
        `[generate-showcase] OG 추출 실패, fallback 카드 사용: ${card.url}`,
      );
    }
    const { _hash, ...cardData } = card;
    showcaseCardSchema.parse(cardData);
    cards.push({ ...cardData, _hash });
  }

  await writeFile(OUT_PATH, `${JSON.stringify(cards, null, 2)}\n`);

  console.log(
    `[generate-showcase] 카드 ${cards.length}개 생성 ` +
      `(신규 fetch ${counts.fetched}, 캐시 ${counts.cached}, fallback ${counts.fallback}).`,
  );
}

main().catch((err) => {
  console.error("[generate-showcase] 실패:", err);
  process.exit(1);
});
