"use client";

import { Message } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { clsx } from "clsx";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  alias: string;
  avatar: string;
  showAvatar: boolean;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessageBubble({
  message,
  isOwn,
  alias,
  avatar,
  showAvatar,
}: MessageBubbleProps) {
  return (
    <div
      className={clsx(
        "flex items-end gap-2 animate-fade-up",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar — only shown on first message in group */}
      <div className="w-8 shrink-0">
        {showAvatar && (
          <Avatar
            emoji={avatar}
            size="xs"
            glow={isOwn ? "cyan" : "purple"}
            className="mb-0.5"
          />
        )}
      </div>

      <div
        className={clsx(
          "flex flex-col max-w-[72%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {showAvatar && (
          <span
            className={clsx(
              "text-xs font-medium mb-1 px-1",
              isOwn ? "text-neon-cyan/70" : "text-neon-purple/70"
            )}
          >
            {alias}
          </span>
        )}
        <div
          className={clsx(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words",
            isOwn
              ? "bg-neon-cyan/15 border border-neon-cyan/25 text-white rounded-br-sm"
              : "bg-surface-muted border border-surface-border text-white/90 rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <span className="text-xs text-white/25 mt-1 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
