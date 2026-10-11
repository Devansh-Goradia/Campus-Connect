import { clsx } from "clsx";

interface BadgeProps {
  label: string;
  emoji?: string;
  color?: string;
  size?: "sm" | "md";
  active?: boolean;
}

const colorMap: Record<string, string> = {
  indigo:  "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  purple:  "bg-purple-500/15 text-purple-300 border-purple-500/30",
  pink:    "bg-pink-500/15 text-pink-300 border-pink-500/30",
  cyan:    "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  amber:   "bg-amber-500/15 text-amber-300 border-amber-500/30",
  rose:    "bg-rose-500/15 text-rose-300 border-rose-500/30",
  violet:  "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

export function Badge({ label, emoji, color = "indigo", size = "md", active }: BadgeProps) {
  const chosenColor = colorMap[color] ?? colorMap.indigo;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all duration-200 select-none",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3.5 py-1 text-xs",
        chosenColor,
        active && "ring-2 ring-indigo-400 bg-indigo-500 text-white border-transparent shadow-sm"
      )}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </span>
  );
}
