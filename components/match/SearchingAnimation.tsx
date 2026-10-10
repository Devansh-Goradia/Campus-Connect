"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { INTERESTS, MOCK_PEER } from "@/lib/mock/mockData";
import { Interest } from "@/types";

interface SearchingAnimationProps {
  selectedInterests: Interest[];
  onMatchFound: () => void;
}

export function SearchingAnimation({ selectedInterests, onMatchFound }: SearchingAnimationProps) {
  const [phase, setPhase] = useState<"searching" | "found">("searching");
  const [dotCount, setDotCount] = useState(1);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => setDotCount((d) => (d % 3) + 1), 500);
    return () => clearInterval(interval);
  }, []);

  // After 3 seconds, trigger match found
  useEffect(() => {
    const timeout = setTimeout(() => setPhase("found"), 3000);
    return () => clearTimeout(timeout);
  }, []);

  // After "found" shows, navigate
  useEffect(() => {
    if (phase === "found") {
      const timeout = setTimeout(() => onMatchFound(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [phase, onMatchFound]);

  const sharedInterests = selectedInterests
    .filter((i) => MOCK_PEER.sharedInterests?.includes(i.label))
    .slice(0, 3);

  if (phase === "found") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-6 text-center animate-fade-up">
        <div className="text-6xl mb-4 animate-bounce-in">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-2">Match Found!</h1>
        <p className="text-white/50 mb-6">You have a peer who gets you</p>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-neon-cyan/20 border-2 border-neon-cyan/50 flex items-center justify-center text-3xl shadow-neon-cyan animate-pulse-slow">
              🐯
            </div>
            <span className="text-xs text-white/60">You</span>
          </div>
          <div className="text-2xl text-neon-pink animate-pulse">💫</div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 rounded-full bg-neon-purple/20 border-2 border-neon-purple/50 flex items-center justify-center text-3xl shadow-neon-purple animate-pulse-slow">
              {MOCK_PEER.avatar}
            </div>
            <span className="text-xs text-white/60">{MOCK_PEER.alias}</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {(sharedInterests.length > 0 ? sharedInterests : selectedInterests.slice(0, 3)).map((i) => (
            <Badge key={i.id} label={i.label} emoji={i.emoji} color={i.color} />
          ))}
        </div>
        <p className="text-xs text-white/30 mt-6 animate-pulse">Opening chat room...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-6 text-center">
      {/* Radar */}
      <div className="relative mb-12 flex items-center justify-center h-48 w-48">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border border-neon-cyan/20 animate-radar"
            style={{
              width: `${(i + 1) * 40}px`,
              height: `${(i + 1) * 40}px`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
        {/* Spinning orbit */}
        <div className="absolute h-36 w-36 animate-spin-slow">
          <div className="h-4 w-4 rounded-full bg-neon-cyan shadow-neon-cyan absolute -top-2 left-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 text-4xl">🎓</div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        Searching for peers{".".repeat(dotCount)}
      </h1>
      <p className="text-white/40 text-sm mb-8">Scanning campus for your vibe match</p>

      <div className="flex flex-wrap justify-center gap-2">
        {selectedInterests.slice(0, 5).map((i) => (
          <Badge key={i.id} label={i.label} emoji={i.emoji} color={i.color} />
        ))}
      </div>
    </div>
  );
}
