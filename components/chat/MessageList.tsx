"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  myAlias: string;
  myAvatar: string;
  peerAlias: string;
  peerAvatar: string;
}

export function MessageList({
  messages,
  currentUserId,
  myAlias,
  myAvatar,
  peerAlias,
  peerAvatar,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
        <span className="text-5xl">👋</span>
        <p className="text-white/60 font-medium">Say hello to your match!</p>
        <p className="text-white/30 text-sm">You share common interests — break the ice!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 scrollbar-thin scrollbar-thumb-surface-muted">
      {messages.map((msg, idx) => {
        const isOwn = msg.sender_id === currentUserId;
        const prevMsg = messages[idx - 1];
        const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={isOwn}
            alias={isOwn ? myAlias : peerAlias}
            avatar={isOwn ? myAvatar : peerAvatar}
            showAvatar={showAvatar}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
