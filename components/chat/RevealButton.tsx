"use client";

import { Eye, EyeOff, Clock } from "lucide-react";
import { RevealState } from "@/types";
import { Button } from "@/components/ui/Button";

interface RevealButtonProps {
  revealState: RevealState;
  onReveal: () => void;
}

export function RevealButton({ revealState, onReveal }: RevealButtonProps) {
  if (revealState === "revealed") return null;

  if (revealState === "waiting") {
    return (
      <div className="flex flex-col items-center gap-1.5 px-4 pb-2">
        <div className="w-full flex items-center justify-center gap-2 rounded-xl border border-neon-orange/30 bg-neon-orange/10 px-4 py-3 text-sm font-semibold text-neon-orange">
          <Clock className="h-4 w-4 animate-spin-slow" />
          Waiting for your peer to decide...
        </div>
        <p className="text-xs text-white/25 text-center">
          No pressure sent their way. Fully private.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5 px-4 pb-2">
      <Button
        variant="secondary"
        fullWidth
        onClick={onReveal}
        className="border-neon-pink/30 hover:border-neon-pink/60 hover:bg-neon-pink/10 text-white"
      >
        <Eye className="h-4 w-4 text-neon-pink mr-1" />
        Reveal Identity
      </Button>
      <p className="text-xs text-white/25 text-center">
        Identities only swap if <span className="text-white/40 font-medium">both</span> of you agree. Zero pressure.
      </p>
    </div>
  );
}
