import { describe, expect, it } from "vitest";
import { getCopyrightYear } from "./getCopyrightYear";

describe("getCopyrightYear", () => {
  it("시작 연도 이전이거나 같으면 시작 연도만 반환한다", () => {
    expect(getCopyrightYear(new Date("2024-06-01"))).toBe("2025");
    expect(getCopyrightYear(new Date("2025-12-31"))).toBe("2025");
  });

  it("시작 연도 이후이면 범위 문자열을 반환한다", () => {
    expect(getCopyrightYear(new Date("2026-01-01"))).toBe("2025-2026");
    expect(getCopyrightYear(new Date("2030-07-15"))).toBe("2025-2030");
  });
});
