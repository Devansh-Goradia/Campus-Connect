import { clsx } from "clsx";

interface AvatarProps {
  emoji?: string;
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  glow?: "cyan" | "green" | "pink" | "purple" | "none";
  className?: string;
}

const sizeMap = {
  xs: "h-7 w-7 text-base",
  sm: "h-9 w-9 text-xl",
  md: "h-12 w-12 text-2xl",
  lg: "h-16 w-16 text-3xl",
  xl: "h-24 w-24 text-5xl",
};

const glowMap = {
  cyan: "ring-2 ring-neon-cyan/60 shadow-neon-cyan",
  green: "ring-2 ring-neon-green/60 shadow-neon-green",
  pink: "ring-2 ring-neon-pink/60 shadow-neon-pink",
  purple: "ring-2 ring-neon-purple/60 shadow-neon-purple",
  none: "",
};

export function Avatar({ emoji, src, alt = "", size = "md", glow = "none", className }: AvatarProps) {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center rounded-full bg-surface-muted overflow-hidden shrink-0",
        sizeMap[size],
        glowMap[glow],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="leading-none select-none">{emoji ?? "👤"}</span>
      )}
    </div>
  );
}
