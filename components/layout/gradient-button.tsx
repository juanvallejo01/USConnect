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

  const base = `rounded-2xl font-semibold transition-all duration-200 micro-press micro-hover ${sizeClasses[size]} ${fullWidth ? "w-full" : ""}`

  if (variant === "outline") {
    return (
      <button
        className={`${base} border border-border bg-white text-foreground hover:bg-secondary hover:shadow-md cloud-shadow focus-ring ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      className={`${base} bg-gradient-to-r from-[#000000] to-[#404040] text-white cloud-shadow-blue hover:from-[#B8941F] hover:to-[#171717] hover:shadow-lg focus-ring ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
