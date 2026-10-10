import { clsx } from "clsx";

interface BadgeProps {
  label: string;
  emoji?: string;
  color?: string;
  size?: "sm" | "md";
  active?: boolean;
}

const colorMap: Record<string, string> = {
  cyan:   "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
  green:  "bg-neon-green/10 text-neon-green border-neon-green/30",
  pink:   "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
  purple: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
  orange: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  yellow: "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30",
  blue:   "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
  rose:   "bg-rose-400/10 text-rose-400 border-rose-400/30",
  indigo: "bg-indigo-400/10 text-indigo-400 border-indigo-400/30",
  violet: "bg-violet-400/10 text-violet-400 border-violet-400/30",
  amber:  "bg-amber-400/10 text-amber-400 border-amber-400/30",
  red:    "bg-red-400/10 text-red-400 border-red-400/30",
};

export function Badge({ label, emoji, color = "cyan", size = "md", active }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border font-medium transition-all",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs",
        colorMap[color] ?? colorMap.cyan,
        active && "ring-1 ring-current"
      )}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </span>
  );
}
