import { describe, expect, it } from "vitest";
import {
  describeFontSize,
  describeTextStyle,
  findSemanticColorGroup,
  flattenBorders,
  flattenTextStyles,
  flattenTokens,
  listBorders,
  listPalettes,
  listSemanticColorGroups,
  listTextStylesIn,
  pxLabel,
  remToPx,
  resolveTokenRef,
  textStyleToCss,
  tokenVar,
} from "./tokenValues";

describe("resolveTokenRef", () => {
  it("토큰 참조를 실제 값으로 바꾼다", () => {
    expect(resolveTokenRef("{colors.violet.9}")).toBe("#5333E1");
    expect(resolveTokenRef("{spacing.16}")).toBe("1rem");
  });

  it("참조가 아니면 그대로 반환한다", () => {
    expect(resolveTokenRef("solid")).toBe("solid");
  });

  it("알 수 없는 경로는 입력을 그대로 반환한다", () => {
    expect(resolveTokenRef("{colors.없는색.1}")).toBe("{colors.없는색.1}");
  });
});

describe("tokenVar", () => {
  it("시맨틱 토큰을 CSS 변수 참조로 바꾼다", () => {
    expect(tokenVar("colors.bgSolid.brand")).toBe(
      "var(--colors-bg-solid-brand)",
    );
  });

  it("알 수 없는 경로에는 빈 문자열을 반환한다", () => {
    expect(tokenVar("colors.없는색")).toBe("");
  });
});

describe("remToPx", () => {
  it("rem을 16px 기준 픽셀로 바꾼다", () => {
    expect(remToPx("1rem")).toBe("16px");
    expect(remToPx("0.125rem")).toBe("2px");
  });

  it("rem이 아니면 null을 반환한다", () => {
    expect(remToPx("1px")).toBeNull();
    expect(remToPx("calc(infinity * 1px)")).toBeNull();
  });
});

describe("pxLabel", () => {
  it("rem은 px로 환산하고 나머지는 -로 둔다", () => {
    expect(pxLabel("1.5rem")).toBe("24px");
    expect(pxLabel("calc(infinity * 1px)")).toBe("-");
  });
});

describe("flattenTokens", () => {
  it("중첩된 토큰을 점으로 이은 이름으로 펼친다", () => {
    expect(flattenTokens({ brand: { hover: { value: "#000" } } })).toEqual([
      { name: "brand.hover", value: "#000" },
    ]);
  });

  it("DEFAULT 키는 이름에서 뺀다", () => {
    expect(flattenTokens({ brand: { DEFAULT: { value: "#000" } } })).toEqual([
      { name: "brand", value: "#000" },
    ]);
  });

  it("문자열이 아닌 값과 토큰이 아닌 입력은 건너뛴다", () => {
    expect(flattenTokens({ composite: { value: { width: "1px" } } })).toEqual(
      [],
    );
    expect(flattenTokens("문자열")).toEqual([]);
    expect(flattenTokens({ brand: "문자열" })).toEqual([]);
  });
});

describe("listSemanticColorGroups", () => {
  it("최상위 이름별로 토큰을 묶는다", () => {
    const names = listSemanticColorGroups().map((group) => group.name);
    expect(names).toContain("bg");
    expect(names).toContain("fgSolid");
  });

  it("라이트·다크 참조와 값을 함께 채운다", () => {
    const bg = listSemanticColorGroups().find((group) => group.name === "bg");

    expect(bg?.rows).toEqual(
      expect.arrayContaining([
        {
          name: "bg.brand.hover",
          lightRef: "colors.violet.3",
          darkRef: "colors.darkTeal.3",
          lightValue: "#EFF1FF",
          darkValue: "#0D2D2A",
        },
      ]),
    );
  });

  it("DEFAULT 단계는 상태 없는 이름으로 노출한다", () => {
    const bg = listSemanticColorGroups().find((group) => group.name === "bg");

    expect(bg?.rows.map((row) => row.name)).toContain("bg.brand");
  });

  it("중첩이 없는 토큰도 한 줄로 만든다", () => {
    const appBg = listSemanticColorGroups().find(
      (group) => group.name === "appBg",
    );

    expect(appBg?.rows).toHaveLength(1);
    expect(appBg?.rows[0].name).toBe("appBg");
  });
});

describe("findSemanticColorGroup", () => {
  it("이름으로 묶음을 찾는다", () => {
    expect(findSemanticColorGroup("bg").name).toBe("bg");
  });

  it("없는 이름이면 오류를 던진다", () => {
    expect(() => findSemanticColorGroup("bgg")).toThrowError(
      "bgg 시맨틱 색상 묶음이 없습니다",
    );
  });
});

describe("listPalettes", () => {
  it("팔레트별 단계를 이름만 남겨 펼친다", () => {
    const violet = listPalettes().find((palette) => palette.name === "violet");

    expect(violet?.shades[0]).toEqual({ name: "1", value: "#FDFDFF" });
    expect(violet?.shades).toHaveLength(12);
  });

  it("다크 팔레트와 라이트 팔레트를 짝지어 준다", () => {
    const palettes = listPalettes();

    expect(palettes.find((palette) => palette.name === "violet")).toMatchObject(
      {
        isDark: false,
        counterpart: "darkViolet",
      },
    );
    expect(
      palettes.find((palette) => palette.name === "darkViolet"),
    ).toMatchObject({ isDark: true, counterpart: "violet" });
  });
});

describe("listBorders", () => {
  it("두께·색상 참조를 값으로 풀어 준다", () => {
    expect(listBorders()).toEqual(
      expect.arrayContaining([
        {
          name: "neutral",
          widthRef: "borderWidths.sm",
          width: "1px",
          style: "solid",
          colorRef: "colors.border.neutral",
        },
      ]),
    );
  });
});

describe("flattenBorders", () => {
  it("합성 값이 아닌 항목은 건너뛴다", () => {
    expect(
      flattenBorders({
        shorthand: { value: "1px solid" },
        nested: { sm: { value: { width: "1px" } } },
      }),
    ).toEqual([]);
  });

  it("문자열이 아닌 구성 값은 빈 값으로 둔다", () => {
    expect(
      flattenBorders({ odd: { value: { width: 1, style: 2, color: 3 } } }),
    ).toEqual([
      { name: "odd", widthRef: "", width: "", style: "", colorRef: "" },
    ]);
  });
});

describe("flattenTextStyles", () => {
  it("중첩된 textStyle을 점으로 이은 이름으로 펼친다", () => {
    const names = flattenTextStyles().map((row) => row.name);

    expect(names).toContain("body.md");
    expect(names).toContain("label.md.underline");
    expect(names).toContain("caption");
  });

  it("DEFAULT 변형은 상위 이름으로 노출한다", () => {
    const names = flattenTextStyles().map((row) => row.name);

    expect(names).toContain("label.md");
    expect(names).not.toContain("label.md.DEFAULT");
  });
});

describe("listTextStylesIn", () => {
  it("묶음에 속한 스타일만 골라 준다", () => {
    const names = listTextStylesIn("body").map((row) => row.name);

    expect(names).toContain("body.md");
    expect(names.every((name) => name.startsWith("body"))).toBe(true);
  });

  it("변형이 없는 스타일도 자기 자신을 반환한다", () => {
    expect(listTextStylesIn("caption").map((row) => row.name)).toEqual([
      "caption",
    ]);
  });

  it("없는 묶음이면 오류를 던진다", () => {
    expect(() => listTextStylesIn("bodyy")).toThrowError(
      "bodyy 텍스트 스타일이 없습니다",
    );
  });
});

describe("describeFontSize", () => {
  it("단일 값은 기준값으로 둔다", () => {
    expect(describeFontSize("lg")).toEqual({ base: "lg", responsive: [] });
  });

  it("반응형 값은 기준값과 브레이크포인트로 나눈다", () => {
    expect(describeFontSize({ base: "3xl", lg: "5xl" })).toEqual({
      base: "3xl",
      responsive: [{ name: "lg", value: "5xl" }],
    });
  });

  it("값이 없으면 빈 결과를 반환한다", () => {
    expect(describeFontSize(undefined)).toEqual({ base: "", responsive: [] });
  });
});

describe("describeTextStyle", () => {
  it("구성 값을 한 줄로 잇는다", () => {
    expect(
      describeTextStyle({
        fontSize: { base: "3xl", lg: "5xl" },
        fontWeight: "bold",
        lineHeight: "tight",
        letterSpacing: "tight",
      }),
    ).toBe("크기 3xl · lg 이상 5xl · 굵기 bold · 행간 tight · 자간 tight");
  });

  it("정의되지 않은 항목은 -로 둔다", () => {
    expect(describeTextStyle({})).toBe("크기  · 굵기 - · 행간 - · 자간 -");
  });
});

describe("textStyleToCss", () => {
  it("토큰 이름을 실제 값으로 바꿔 인라인 스타일을 만든다", () => {
    expect(
      textStyleToCss({
        fontFamily: "mono",
        fontSize: "sm",
        fontWeight: "medium",
        lineHeight: "balanced",
        letterSpacing: "balanced",
      }),
    ).toEqual({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.5",
      letterSpacing: "0",
      textDecoration: undefined,
    });
  });

  it("반응형 크기는 기준값으로 렌더링한다", () => {
    expect(
      textStyleToCss({ fontSize: { base: "md", lg: "xl" } }),
    ).toMatchObject({ fontSize: "1rem" });
  });

  it("정의되지 않은 항목은 지정하지 않는다", () => {
    expect(textStyleToCss({})).toEqual({
      fontFamily: undefined,
      fontSize: undefined,
      fontWeight: undefined,
      lineHeight: undefined,
      letterSpacing: undefined,
      textDecoration: undefined,
    });
  });
});
