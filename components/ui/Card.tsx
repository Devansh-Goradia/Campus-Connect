import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: "cyan" | "green" | "pink" | "purple" | "none";
  onClick?: () => void;
}

export function Card({ children, className, glow = "none", onClick }: CardProps) {
  const glowMap = {
    cyan: "border-neon-cyan/30 shadow-neon-cyan",
    green: "border-neon-green/30 shadow-neon-green",
    pink: "border-neon-pink/30 shadow-neon-pink",
    purple: "border-neon-purple/30 shadow-neon-purple",
    none: "border-surface-border",
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-surface-card rounded-2xl border p-5 transition-all duration-300",
        glowMap[glow],
        onClick && "cursor-pointer hover:scale-[1.01]",
        className
      )}
    >
      {children}
    </div>
  );
}
