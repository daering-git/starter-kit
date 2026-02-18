import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

// Map our size names to shadcn Avatar's built-in size system (data-size attribute)
const sizeMap = {
  sm: "sm",
  md: "default",
  lg: "lg",
} as const satisfies Record<string, "sm" | "default" | "lg">;

type AvatarSize = keyof typeof sizeMap;

interface UserAvatarProps {
  name?: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar({
  name,
  src,
  alt,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <Avatar
      data-slot="user-avatar"
      size={sizeMap[size]}
      className={cn(className)}
    >
      <AvatarImage src={src} alt={alt ?? name} />
      <AvatarFallback className="font-medium">
        {name ? getInitials(name) : "?"}
      </AvatarFallback>
    </Avatar>
  );
}
