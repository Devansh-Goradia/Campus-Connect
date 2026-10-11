import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full font-sans">
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-zinc-300 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            "bg-zinc-900/80 border border-white/10 text-white px-4 py-3 rounded-2xl text-sm",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all shadow-inner",
            "placeholder:text-zinc-500",
            error && "border-rose-500/60 focus:ring-rose-500/40 focus:border-rose-500",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-400 mt-0.5 ml-1 font-medium">{error}</span>}
      </div>
    )
  }
)
Input.displayName = 'Input'
