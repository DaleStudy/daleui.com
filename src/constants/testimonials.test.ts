import { describe, expect, it } from "vitest";
import { testimonials } from "./testimonials";

describe("testimonials", () => {
  it("최소 한 개 이상의 후기를 노출한다", () => {
    expect(testimonials.length).toBeGreaterThan(0);
  });

  it("모든 후기에 이름·소속·인용문이 채워져 있다", () => {
    for (const testimonial of testimonials) {
      expect(testimonial.name.trim()).not.toBe("");
      expect(testimonial.affiliation.trim()).not.toBe("");
      expect(testimonial.quote.trim()).not.toBe("");
    }
  });

  it("avatar가 있으면 http(s) URL 형식이다", () => {
    for (const { avatar } of testimonials) {
      if (avatar !== undefined) {
        expect(avatar).toMatch(/^https?:\/\//);
      }
    }
  });
});
