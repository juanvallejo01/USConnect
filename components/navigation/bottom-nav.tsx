"use client"

import { Home, Compass, MessageCircle, Trophy, User } from "lucide-react"
import { useTranslations } from "next-intl"
import { useNotification } from "@/context/notification-context"
import { LiquidGlassIcon } from "@/components/ui/liquid-glass-icon"

export type Tab = "feed" | "explore" | "matches" | "leaderboard" | "profile" | "notifications" | "admin"

interface BottomNavProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  showAdmin?: boolean
}

const tabs = [
  { id: "feed" as const, labelKey: "home" as const, icon: Home },
  { id: "explore" as const, labelKey: "discover" as const, icon: Compass },
  { id: "matches" as const, labelKey: "messages" as const, icon: MessageCircle },
  { id: "leaderboard" as const, labelKey: "ranking" as const, icon: Trophy },
  { id: "profile" as const, labelKey: "profile" as const, icon: User },
]

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const t = useTranslations("nav")
  const { unreadCount } = useNotification()

  // Calculate indicator position (0-4 for 5 tabs)
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab)
  const indicatorPosition = activeIndex * 100 // 100% per tab to move across full width

  return (
    <nav className="bottom-nav-glass relative bg-gradient-to-b from-white/95 via-white/90 to-white/95 backdrop-blur-2xl border-t border-[#EBEBF0]/60 px-2 pb-6 pt-3 shadow-[0_-2px_20px_rgba(0,0,0,0.03)]" role="tablist" aria-label={t("ariaLabel")}>
      {/* Sliding indicator */}
      <div className="absolute top-0 left-0 right-0 h-0.5 overflow-hidden">
        <div
          className="h-full w-[20%] bg-gradient-to-r from-black to-neutral-700 dark:from-white dark:to-neutral-300 transition-transform duration-300 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.4)] dark:shadow-[0_2px_8px_rgba(255,255,255,0.3)]"
          style={{ transform: `translateX(${indicatorPosition}%)` }}
        />
      </div>
      
      <div className="flex items-center justify-around">
        {tabs.map(({ id, labelKey, icon }) => {
          const isActive = activeTab === id
          const hasBadge = id === "matches" && unreadCount > 0

          return (
            <div key={id} className="flex flex-col items-center">
              <LiquidGlassIcon
                icon={icon}
                label={t(labelKey)}
                isActive={isActive}
                size={22}
                onClick={() => onTabChange(id)}
                badge={
                  hasBadge ? (
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <div className="absolute inset-0 bg-black dark:bg-white rounded-full blur-md animate-pulse opacity-60" />
                        <div className="relative h-[20px] min-w-[20px] bg-gradient-to-br from-black to-neutral-700 dark:from-white dark:to-neutral-200 rounded-full flex items-center justify-center px-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.4)] ring-2 ring-white dark:ring-[#0A0A0C]">
                          <span className="text-[10px] font-bold text-white dark:text-black leading-none">
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
