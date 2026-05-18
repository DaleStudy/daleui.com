import { ZodError, type ZodType } from "zod";

function validateFrontmatter<T>(
  schema: ZodType<T>,
  frontmatter: unknown,
  source: string,
): T {
  try {
    return schema.parse(frontmatter);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Invalid frontmatter in ${source}: ${error.message}`, {
        cause: error,
      });
    }
    throw error;
  }
}

type WithFrontmatter = { frontmatter: unknown };

export function validateModules<M extends WithFrontmatter, T>(
  modules: Record<string, M>,
  schema: ZodType<T>,
  prefix: string,
): Record<string, M & { frontmatter: T }> {
  return Object.fromEntries(
    Object.entries(modules).map(([path, mod]) => [
      path,
      {
        ...mod,
        frontmatter: validateFrontmatter(
          schema,
          mod.frontmatter,
          path.slice(prefix.length),
        ),
      },
    ]),
  );
}
