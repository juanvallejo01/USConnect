"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { X, CheckCircle2, AlertCircle } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto fade-in-up"
          >
            <div
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg backdrop-blur-xl min-w-[280px] max-w-[400px] ${
                toast.type === "success"
                  ? "bg-[#34C759]/95 text-white"
                  : toast.type === "error"
                  ? "bg-[#FF3B30]/95 text-white"
                  : "bg-white/95 text-[#1A1A2E] border border-[#EBEBF0]"
              }`}
            >
              {toast.type === "success" && (
                <CheckCircle2 size={20} className="flex-shrink-0" strokeWidth={2.5} />
              )}
              {toast.type === "error" && (
                <AlertCircle size={20} className="flex-shrink-0" strokeWidth={2.5} />
              )}
              
              <p className="flex-1 text-sm font-medium leading-tight">{toast.message}</p>
              
              <button
                onClick={() => dismissToast(toast.id)}
                className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity micro-press"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}
