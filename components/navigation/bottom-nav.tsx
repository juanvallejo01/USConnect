"use client"

import { Compass, Newspaper, Trophy, User, Shield, Bell, MessageCircle } from "lucide-react"
import { useNotification } from "@/context/notification-context"

export type Tab = "explore" | "feed" | "matches" | "leaderboard" | "notifications" | "profile" | "admin"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  showAdmin?: boolean
}

const tabs = [
  { id: "explore" as const, label: "Explore", icon: Compass },
  { id: "feed" as const, label: "Feed", icon: Newspaper },
  { id: "matches" as const, label: "Matches", icon: MessageCircle },
  { id: "leaderboard" as const, label: "Rank", icon: Trophy },
  { id: "notifications" as const, label: "Alerts", icon: Bell, showBadge: true },
  { id: "profile" as const, label: "Profile", icon: User },
]

export function BottomNav({ activeTab, onTabChange, showAdmin = false }: BottomNavProps) {
  const { unreadCount } = useNotification()
  
  const visibleTabs = showAdmin
    ? [...tabs, { id: "admin" as const, label: "Admin", icon: Shield }]
    : tabs

  return (
    <nav className="border-t border-gray-200 bg-white/80 backdrop-blur-xl px-2 pb-6 pt-2" role="tablist" aria-label="Main navigation">
      <div className="flex items-center justify-around">
        {visibleTabs.map(({ id, label, icon: Icon, showBadge }) => {
          const isActive = activeTab === id
          const hasBadge = showBadge && unreadCount > 0
          
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onTabChange(id)}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 transition-colors"
            >
              {isActive && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]" />
              )}
              
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? "text-[#8B5CF6]" : "text-gray-500"}
                />
                {hasBadge && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center">
                    {unreadCount > 9 ? (
                      <div className="w-5 h-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">9+</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{unreadCount}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <span className={`text-[10px] ${isActive ? "font-bold text-gray-900" : "font-medium text-gray-500"}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
