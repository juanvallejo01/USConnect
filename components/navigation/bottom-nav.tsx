"use client"

import { Home, Compass, MessageCircle, Trophy, User } from "lucide-react"
import { useNotification } from "@/context/notification-context"
import { LiquidGlassIcon } from "@/components/ui/liquid-glass-icon"

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
  
  // Calculate indicator position (0-4 for 5 tabs)
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
  const indicatorPosition = activeIndex * 100 // 100% per tab to move across full width

  return (
    <nav className="bottom-nav-glass relative bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-2xl border-t border-[#EBEBF0]/60 px-2 pb-6 pt-3 shadow-[0_-2px_20px_rgba(0,0,0,0.03)]" role="tablist" aria-label="Main navigation">
      {/* Sliding indicator */}
      <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
        <div 
          className="h-full w-[20%] bg-gradient-to-r from-[#4A90D9] to-[#6BB0F0] transition-transform duration-300 ease-out shadow-[0_2px_8px_rgba(74,144,217,0.4)]"
          style={{ transform: `translateX(${indicatorPosition}%)` }}
        />
      </div>
      
      <div className="flex items-center justify-around">
        {tabs.map(({ id, label, icon }) => {
          const isActive = activeTab === id
          const hasBadge = id === "matches" && unreadCount > 0
          
          return (
            <div key={id} className="flex flex-col items-center">
              <LiquidGlassIcon
                icon={icon}
                isActive={isActive}
                size={22}
                onClick={() => onTabChange(id)}
                badge={
                  hasBadge ? (
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#FF6B6B] rounded-full blur-md animate-pulse" />
                        <div className="relative h-[20px] min-w-[20px] bg-gradient-to-br from-[#FF6B6B] to-[#FF5252] rounded-full flex items-center justify-center px-1.5 shadow-[0_4px_12px_rgba(255,107,107,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)]">
                          <span className="text-[10px] font-bold text-white leading-none">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : undefined
                }
              />
            </div>
          )
        })}
      </div>
    </nav>
  )
}
