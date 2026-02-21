"use client"

import { Compass, Newspaper, Zap, MessageCircle, User } from "lucide-react"
import { useSpark } from "@/context/spark-context"

const tabs = [
  { id: "explore" as const, label: "Explore", icon: Compass },
  { id: "feed" as const, label: "Feed", icon: Newspaper },
  { id: "sparks" as const, label: "Sparks", icon: Zap },
  { id: "chat" as const, label: "Chat", icon: MessageCircle },
  { id: "profile" as const, label: "Profile", icon: User },
]

export function BottomNav() {
  const { activeTab, setActiveTab } = useSpark()

  return (
    <nav className="border-t border-border bg-card/80 backdrop-blur-xl px-2 pb-6 pt-2" role="tablist" aria-label="Main navigation">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => setActiveTab(id)}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 transition-colors"
            >
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-gradient-to-r from-[#C62828] to-[#1565C0]" />
              )}
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? "text-[#C62828]" : "text-muted-foreground"}
              />
              <span className={`text-[10px] ${isActive ? "font-bold text-foreground" : "font-medium text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
