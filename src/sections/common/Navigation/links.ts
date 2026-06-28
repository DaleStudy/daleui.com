import type { IconProps } from "daleui";

type IconName = IconProps["name"];

export const INTERNAL_LINKS: { label: string; href: string }[] = [
  { label: "문서", href: "/docs" },
  { label: "모범사례", href: "/showcase" },
  { label: "블로그", href: "/blog" },
];

export const EXTERNAL_LINKS: {
  label: string;
  href: string;
  icon: IconName;
}[] = [
  {
    label: "피그마 디자인",
    href: "https://www.figma.com/community/file/1559487636467651573",
    icon: "Figma",
  },
  {
    label: "깃허브",
    href: "https://github.com/DaleStudy/daleui",
    icon: "GitHub",
  },
];

export const SPONSOR_URL = "https://github.com/sponsors/DaleStudy";
