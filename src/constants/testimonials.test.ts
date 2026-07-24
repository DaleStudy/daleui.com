import { describe, expect, it } from "vitest";
import { z } from "zod";
import { testimonialSchema, testimonials } from "./testimonials";

describe("testimonials", () => {
  it("최소 한 개 이상의 후기가 스키마를 만족한다", () => {
    expect(() =>
      z.array(testimonialSchema).min(1).parse(testimonials),
    ).not.toThrow();
  });
});
