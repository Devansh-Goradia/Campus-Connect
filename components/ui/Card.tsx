import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  interactive = true,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 shadow-lg",
        interactive && "cursor-pointer hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-indigo-500/15",
        className
      )}
    >
      {children}
    </div>
  );
}
