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
const FETCH_RETRIES = 2;

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

/** OG 이미지가 상대 경로일 수 있으므로 페이지 URL 기준 절대 경로로 변환합니다. */
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
  } catch (err) {
    console.warn(
      `[generate-showcase] 이전 캐시 로드 실패, 초기화합니다: ${String(err)}`,
    );
    return new Map();
  }
}

/** 빈 문자열·공백만 있는 OG 값은 없는 것으로 취급해 fallback이 동작하게 합니다. */
function nonEmpty(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function buildCard(
  entry: ShowcaseInput,
  og: Partial<OgFields>,
  hash: string,
): CachedCard {
  const ogImage = nonEmpty(og.image);
  const image = ogImage ? absoluteImage(ogImage, entry.url) : null;
  return {
    title: entry.title ?? nonEmpty(og.title) ?? hostname(entry.url),
    description: entry.description ?? nonEmpty(og.description) ?? "",
    image: entry.image ?? image ?? FALLBACK_IMAGE,
    siteName: nonEmpty(og.siteName) ?? hostname(entry.url),
    url: entry.url,
    _hash: hash,
  };
}

async function extractOg(url: string): Promise<Partial<OgFields> | null> {
  // 일시적 네트워크 오류(타임아웃 등)에 대비해 몇 차례 재시도합니다.
  // ogs는 대부분의 실패를 예외가 아닌 `{ error: true }`로 돌려주므로 둘 다 재시도합니다.
  for (let attempt = 1; attempt <= FETCH_RETRIES; attempt++) {
    const last = attempt === FETCH_RETRIES;
    try {
      const { error, result } = await ogs({
        url,
        timeout: FETCH_TIMEOUT_SECONDS,
      });
      if (error) {
        if (last) return null;
        continue;
      }
      return {
        title: result.ogTitle ?? result.twitterTitle,
        description: result.ogDescription ?? result.twitterDescription,
        image: result.ogImage?.[0]?.url ?? result.twitterImage?.[0]?.url,
        siteName: result.ogSiteName,
      };
    } catch {
      if (last) return null;
    }
  }
  return null;
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

  // fetch 실패 시 fallback 카드에는 해시를 비워(빈 문자열은 어떤 해시와도
  // 일치하지 않음) 다음 빌드에서 다시 fetch를 시도하도록 합니다.
  // (일시적 장애가 캐시에 굳어 영구 fallback이 되는 것을 방지)
  if (cached) {
    return { card: { ...cached, _hash: "" }, status: "fallback" };
  }
  return { card: buildCard(entry, {}, ""), status: "fallback" };
}

async function main(): Promise<void> {
  const seen = new Set<string>();
  const entries = showcaseEntries.map((entry, i) => {
    const parsed = showcaseInputSchema.safeParse(entry);
    if (!parsed.success) {
      throw new Error(
        `[generate-showcase] entries.ts[${i}] 검증 실패:\n${parsed.error.message}`,
      );
    }
    if (seen.has(parsed.data.url)) {
      throw new Error(
        `[generate-showcase] entries.ts[${i}] 중복 URL: ${parsed.data.url}`,
      );
    }
    seen.add(parsed.data.url);
    return parsed.data;
  });

  const prev = await loadPrevCards();
  const counts = { cached: 0, fetched: 0, fallback: 0 };

  const resolved = await Promise.all(
    entries.map((entry) => resolveCard(entry, prev)),
  );

  const cards: CachedCard[] = [];
  for (const { card, status } of resolved) {
    if (status === "fallback") {
      console.warn(
        `[generate-showcase] OG 추출 실패, fallback 카드 사용: ${card.url}`,
      );
    }
    counts[status]++;
    const { _hash, ...cardData } = card;
    // buildCard가 모든 필드를 non-empty로 채우므로 검증 실패는 예상 밖 상황입니다.
    // 그 경우 조용히 넘기지 않고 빌드를 중단해 문제를 드러냅니다.
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
