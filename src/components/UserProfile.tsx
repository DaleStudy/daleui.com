import { HStack } from "daleui";
import { Avatar } from "./Avatar";

export interface UserProfileProps {
  author: string;
  authorAvatar: string;
}

export function UserProfile({ author, authorAvatar }: UserProfileProps) {
  return (
    <HStack gap="8">
      <Avatar src={authorAvatar} alt={`${author}의 프로필 사진`} size="sm" />
      {author}
    </HStack>
  );
}
