import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "neon";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading,
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#09090b] disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-95 cursor-pointer";

  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110",
    secondary:
      "bg-white/10 text-white border border-white/10 hover:bg-white/15 hover:border-white/20 backdrop-blur-md shadow-sm",
    ghost:
      "text-zinc-300 hover:text-white hover:bg-white/10",
    danger:
      "bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30",
    neon:
      "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 hover:brightness-110",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs gap-1.5",
    md: "px-6 py-2.5 text-sm gap-2",
    lg: "px-8 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      {loading && (
        <svg
          className="absolute left-4 h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      <span className={clsx("flex items-center gap-2", loading && "opacity-0")}>
        {children}
      </span>
    </button>
  );
}
