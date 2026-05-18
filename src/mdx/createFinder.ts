import type { MdxDoc, MdxModule } from "./types";

const EXT = ".mdx";

export function createFinder<F>(
  modules: Record<string, MdxModule<F>>,
  prefix: string,
  sort?: (a: MdxDoc<F>, b: MdxDoc<F>) => number,
) {
  const items: MdxDoc<F>[] = Object.entries(modules).map(([path, mod]) => ({
    slug: path.slice(prefix.length, -EXT.length),
    ...mod,
  }));

  if (sort) {
    items.sort(sort);
  }

  return (slug: string): MdxDoc<F> | undefined =>
    items.find((item) => item.slug === slug);
}
