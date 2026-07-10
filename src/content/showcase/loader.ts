import { z } from "zod";
import { showcaseCardSchema } from "./schema";

// 정적 import 대신 glob을 쓰는 이유: 생성 파일이 아직 없을 때도(최초 빌드 전)
// 빌드가 깨지지 않고 빈 목록으로 동작하도록 하기 위함입니다.
const generated = import.meta.glob<{ default: unknown }>(
  "./showcase.generated.json",
  { eager: true },
);

const cards = (() => {
  const mod = generated["./showcase.generated.json"];
  if (!mod) return [];
  return z.array(showcaseCardSchema).parse(mod.default);
})();

export function listShowcase() {
  return cards;
}
