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
    sm: "px-5 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-7 py-4 text-sm",
  }

  const base = `rounded-2xl font-semibold transition-all duration-300 active:scale-[0.97] ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`

  if (variant === "outline") {
    return (
      <button
        className={`${base} border border-border bg-white text-foreground hover:bg-secondary cloud-shadow ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={`${base} bg-[#4A90D9] text-white cloud-shadow-blue hover:bg-[#3A7BC8] ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
