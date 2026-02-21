import type { ReactNode, ButtonHTMLAttributes } from "react"

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "outline"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
}

export function GradientButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  ...props
}: GradientButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-sm",
  }

  const base = `rounded-full font-semibold shadow-sm transition-all hover:shadow-md active:scale-95 ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`

  if (variant === "outline") {
    return (
      <button
        className={`${base} border border-border bg-card text-foreground hover:bg-secondary ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={`${base} bg-gradient-to-r from-[#C62828] to-[#1565C0] text-white ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
