"use client"

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check, AlertCircle } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, errorMessage, ...props }, ref) => {
    const [shouldShake, setShouldShake] = React.useState(false)

    React.useEffect(() => {
      if (error) {
        setShouldShake(true)
        const timer = setTimeout(() => setShouldShake(false), 400)
        return () => clearTimeout(timer)
      }
    }, [error])

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-2xl border bg-white px-4 py-3 text-sm text-[#1A1A2E]",
            "placeholder:text-[#C7C7CC] outline-none",
            "transition-all duration-200 ease-out",
            "focus-ring",
            // Default state
            !error && !success && "border-[#EBEBF0] focus:border-[#000000]",
            // Error state
            error && "border-[#FF3B30] focus:border-[#FF3B30]",
            // Success state
            success && "border-[#34C759] focus:border-[#34C759]",
            // Shake animation
            shouldShake && "shake",
            // Disabled state
            props.disabled && "opacity-50 cursor-not-allowed bg-[#F5F5F7]",
            className
          )}
          ref={ref}
          {...props}
        />
        
        {/* Success indicator */}
        {success && !error && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 rounded-full bg-[#34C759] flex items-center justify-center success-pulse">
              <Check size={12} className="text-white checkmark-draw" strokeWidth={3} />
            </div>
          </div>
        )}

        {/* Error indicator */}
        {error && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <AlertCircle size={20} className="text-[#FF3B30]" />
          </div>
        )}

        {/* Error message */}
        {error && errorMessage && (
          <p className="text-xs text-[#FF3B30] mt-1.5 px-1 fade-in-up">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
