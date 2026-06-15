import { Link } from "daleui";
import { css } from "../../styled-system/css";
import { Avatar } from "./Avatar";

export interface UserProfileProps {
  authorGithubUrl: string;
  author: string;
  authorAvatar: string;
}

export function UserProfile({
  authorGithubUrl,
  author,
  authorAvatar,
}: UserProfileProps) {
  return (
    <Link
      href={authorGithubUrl}
      external
      size="sm"
      underline={false}
      aria-label={`${author}의 깃허브 프로필`}
      className={css({
        display: "flex",
        alignItems: "center",
        gap: "8",
        fontWeight: "bold",
      })}
    >
      <Avatar src={authorAvatar} alt={`${author}의 프로필 사진`} size="sm" />
      {author}
    </Link>
  );
}
