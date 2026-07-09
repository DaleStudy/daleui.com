import { z } from "zod";
import { showcaseCardSchema } from "./schema";

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
