import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TokenName, TokenTable } from "./TokenTable";

describe("TokenTable", () => {
  it("스크린 리더용 설명과 열 제목, 셀을 함께 렌더링한다", () => {
    render(
      <TokenTable
        caption="스페이싱 토큰 목록"
        columns={["토큰", "값"]}
        rows={[
          { key: "16", cells: [<TokenName key="name">16</TokenName>, "1rem"] },
        ]}
      />,
    );

    expect(screen.getByRole("table")).toHaveAccessibleName(
      "스페이싱 토큰 목록",
    );
    expect(screen.getByRole("columnheader", { name: "값" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "1rem" })).toBeVisible();
  });

  it("칸 수가 헤더와 다르면 오류를 던진다", () => {
    expect(() =>
      render(
        <TokenTable
          caption="스페이싱 토큰 목록"
          columns={["토큰", "값"]}
          rows={[{ key: "16", cells: ["16"] }]}
        />,
      ),
    ).toThrowError("스페이싱 토큰 목록의 16 칸 수가 헤더와 다릅니다");
  });
});
