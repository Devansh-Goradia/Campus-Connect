"use client";

import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { RevealState } from "@/types";
import { INTERESTS } from "@/lib/mock/mockData";
import { Shield } from "lucide-react";

interface ChatHeaderProps {
  peerAlias: string;
  peerAvatar: string;
  myAlias: string;
  myAvatar: string;
  sharedInterests: string[];
  revealState: RevealState;
}

export function ChatHeader({
  peerAlias,
  peerAvatar,
  sharedInterests,
  revealState,
}: ChatHeaderProps) {
  const interestDetails = sharedInterests.map(
    (label) => INTERESTS.find((i) => i.label === label) ?? { label, emoji: "✨", color: "cyan", id: 0 }
  );

  return (
    <header className="shrink-0 flex flex-col gap-3 px-4 pt-4 pb-3 border-b border-surface-border bg-surface-card/80 backdrop-blur-sm">
      {/* Top row: peer identity + status */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar
            emoji={revealState !== "revealed" ? peerAvatar : undefined}
            size="md"
            glow="purple"
          />
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-neon-green border-2 border-surface-card" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{peerAlias}</p>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-neon-cyan" />
            <span className="text-xs text-neon-cyan">Verified Student · Anonymous</span>
          </div>
        </div>

        {/* Reveal status badge */}
        {revealState === "waiting" && (
          <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-neon-orange/10 border border-neon-orange/30 text-neon-orange animate-pulse-slow">
            ⏳ Waiting
          </span>
        )}
        {revealState === "revealed" && (
          <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green">
            ✨ Revealed
          </span>
        )}
      </div>

      {/* Shared interests */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/40">You both like:</span>
        {interestDetails.map((interest) => (
          <Badge
            key={interest.label}
            label={interest.label}
            emoji={interest.emoji}
            color={interest.color}
            size="sm"
          />
        ))}
      </div>
    </header>
  );
}
