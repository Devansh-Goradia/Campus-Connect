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
  xs: "h-7 w-7 text-xs font-bold",
  sm: "h-9 w-9 text-sm font-bold",
  md: "h-12 w-12 text-base font-extrabold",
  lg: "h-16 w-16 text-xl font-extrabold",
  xl: "h-20 w-20 text-2xl font-extrabold",
};

export function Avatar({ emoji, src, alt = "", size = "md", className }: AvatarProps) {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center rounded-2xl overflow-hidden shrink-0 shadow-md",
        sizeMap[size],
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="leading-none select-none text-white font-black">{emoji ?? "✨"}</span>
      )}
    </div>
  );
}
