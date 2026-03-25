"use client"

import { Home, Compass, MessageCircle, Trophy, User } from "lucide-react"
import { useNotification } from "@/context/notification-context"

export type Tab = "feed" | "explore" | "matches" | "leaderboard" | "profile" | "notifications" | "admin"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  showAdmin?: boolean
}

const tabs = [
  { id: "feed" as const, label: "Home", icon: Home },
  { id: "explore" as const, label: "Discover", icon: Compass },
  { id: "matches" as const, label: "Messages", icon: MessageCircle },
  { id: "leaderboard" as const, label: "Ranking", icon: Trophy },
  { id: "profile" as const, label: "Profile", icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { unreadCount } = useNotification()

  return (
    <nav className="bg-white/80 glass border-t border-border/40 px-2 pb-6 pt-2" role="tablist" aria-label="Main navigation">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          const hasBadge = id === "matches" && unreadCount > 0
          
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onTabChange(id)}
              className="relative flex flex-col items-center gap-1 px-4 py-1.5 transition-all duration-300"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className={`transition-colors duration-300 ${isActive ? "text-[#4A90D9]" : "text-[#C7C7CC]"}`}
                />
                {hasBadge && (
                  <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center">
                    <div className="h-[18px] min-w-[18px] bg-[#FF6B6B] rounded-full flex items-center justify-center px-1">
                      <span className="text-[9px] font-bold text-white leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <span className={`text-[10px] transition-colors duration-300 ${
                isActive ? "font-semibold text-[#4A90D9]" : "font-medium text-[#C7C7CC]"
              }`}>
                {label}
              </span>

              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full bg-[#4A90D9] transition-all" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
