"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { INTERESTS } from "@/lib/mock/mockData";
import { Interest } from "@/types";

const colorAccentMap: Record<string, string> = {
  cyan:   "border-neon-cyan/50 bg-neon-cyan/10 shadow-neon-cyan text-neon-cyan",
  green:  "border-neon-green/50 bg-neon-green/10 shadow-neon-green text-neon-green",
  pink:   "border-neon-pink/50 bg-neon-pink/10 shadow-neon-pink text-neon-pink",
  purple: "border-neon-purple/50 bg-neon-purple/10 shadow-neon-purple text-neon-purple",
  orange: "border-neon-orange/50 bg-neon-orange/10 text-neon-orange",
  yellow: "border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow",
  blue:   "border-neon-blue/50 bg-neon-blue/10 text-neon-blue",
  rose:   "border-rose-400/50 bg-rose-400/10 text-rose-400",
  indigo: "border-indigo-400/50 bg-indigo-400/10 text-indigo-400",
  violet: "border-violet-400/50 bg-violet-400/10 text-violet-400",
  amber:  "border-amber-400/50 bg-amber-400/10 text-amber-400",
  red:    "border-red-400/50 bg-red-400/10 text-red-400",
};

interface InterestGridProps {
  onContinue: (selected: Interest[]) => void;
}

export function InterestGrid({ onContinue }: InterestGridProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedInterests = INTERESTS.filter((i) => selected.has(i.id));

  return (
    <div className="min-h-screen bg-surface flex flex-col px-5 py-10 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-widest text-neon-cyan font-semibold mb-2">
          Step 3 of 3
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">What are you into?</h1>
        <p className="text-white/50 text-sm">
          Pick at least 3. We&apos;ll use these to find your perfect campus match.
        </p>
      </div>

      {/* Interest grid */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {INTERESTS.map((interest) => {
          const isSelected = selected.has(interest.id);
          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              className={clsx(
                "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 aspect-square transition-all duration-200 active:scale-95 focus:outline-none",
                isSelected
                  ? colorAccentMap[interest.color]
                  : "border-surface-border bg-surface-card text-white/50 hover:border-white/20 hover:bg-surface-hover"
              )}
            >
              {isSelected && (
                <span className="absolute top-2 right-2">
                  <Check className="h-3.5 w-3.5 opacity-80" />
                </span>
              )}
              <span className="text-3xl leading-none">{interest.emoji}</span>
              <span className="text-xs font-semibold text-center leading-tight">
                {interest.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 pt-4 pb-2 bg-gradient-to-t from-surface via-surface/90 to-transparent">
        <div className="mb-3 flex items-center justify-between text-xs text-white/40">
          <span>{selected.size} selected</span>
          <span className={selected.size >= 3 ? "text-neon-green" : ""}>
            {selected.size < 3 ? `${3 - selected.size} more to go` : "Ready to match! 🎉"}
          </span>
        </div>
        <Button
          variant="primary"
          fullWidth
          size="lg"
          disabled={selected.size < 3}
          onClick={() => onContinue(selectedInterests)}
        >
          Find My Match ✨
        </Button>
      </div>
    </div>
  );
}
