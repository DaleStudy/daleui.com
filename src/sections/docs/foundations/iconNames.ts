import type { IconProps } from "daleui";

type IconName = IconProps["name"];

export type IconKind = "interface" | "brand";

/**
 * 아이콘 하나하나를 어느 갤러리에 넣을지 정합니다.
 * daleui가 아이콘을 추가하면 이 맵에서 타입 오류가 나므로 문서가 조용히 낡지 않습니다.
 */
const ICON_KINDS: Record<IconName, IconKind> = {
  award: "interface",
  check: "interface",
  chevronDown: "interface",
  chevronLeft: "interface",
  chevronRight: "interface",
  circleAlert: "interface",
  clock: "interface",
  codeXml: "interface",
  externalLink: "interface",
  eye: "interface",
  eyeClosed: "interface",
  eyeOff: "interface",
  globe: "interface",
  handHeart: "interface",
  heartHandshake: "interface",
  info: "interface",
  kr: "interface",
  loaderCircle: "interface",
  menu: "interface",
  messageCircle: "interface",
  messageCircleMore: "interface",
  moon: "interface",
  search: "interface",
  star: "interface",
  sun: "interface",
  thumbsUp: "interface",
  user: "interface",
  users: "interface",
  x: "interface",
  Discord: "brand",
  Figma: "brand",
  GitHub: "brand",
  GithubDark: "brand",
  GithubLight: "brand",
  LinkedIn: "brand",
  LinkedInDark: "brand",
  LinkedInLight: "brand",
  Medium: "brand",
  Storybook: "brand",
  YouTube: "brand",
};

const KINDS: IconKind[] = ["interface", "brand"];

function isKind(value: string): value is IconKind {
  return KINDS.includes(value as IconKind);
}

/** 한 갤러리에 속한 아이콘 이름입니다. 없는 갤러리를 요청하면 실패합니다. */
export function listIconNames(kind: string): IconName[] {
  if (!isKind(kind)) {
    throw new Error(`${kind} 아이콘 갤러리가 없습니다`);
  }

  return (Object.keys(ICON_KINDS) as IconName[]).filter(
    (name) => ICON_KINDS[name] === kind,
  );
}
