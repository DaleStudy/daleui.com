import { copyFileSync, existsSync } from "node:fs";

const src = "node_modules/daleui/llms.txt";
const dest = "public/llms.txt";

if (existsSync(src)) {
  copyFileSync(src, dest);
  console.log("llms.txt 복사 완료:", dest);
} else {
  console.warn(
    "node_modules/daleui/llms.txt 없음 (daleui 버전이 낮을 수 있음), 건너뜁니다.",
  );
}
