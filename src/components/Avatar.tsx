import { Icon } from "daleui";
import { css, cva } from "../../styled-system/css";

export interface AvatarProps {
  /** 프로필 이미지 URL (없으면 기본 아바타 표시) */
  src?: string;
  /** 접근성을 위한 대체 텍스트 (보통 작성자 이름) */
  alt: string;
  /** 아바타 크기 */
  size?: "sm" | "md" | "lg";
}

/** 원형 프로필 아바타. 이미지가 없으면 기본 그라데이션 아이콘을 표시합니다. */
export function Avatar({ src, alt, size = "md" }: AvatarProps) {
  return (
    <div className={styles({ size })}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={css({
            width: "100%",
            height: "100%",
            objectFit: "cover",
          })}
        />
      ) : (
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          })}
        >
          <Icon name="user" size={size} />
        </div>
      )}
    </div>
  );
}

const styles = cva({
  base: {
    borderRadius: "full",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
    backgroundColor: "bg.brand.active",
  },
  variants: {
    size: {
      sm: {
        width: "32px",
        height: "32px",
      },
      md: {
        width: "45px",
        height: "45px",
      },
      lg: {
        width: "64px",
        height: "64px",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
