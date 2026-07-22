"use client"

import { useState } from "react"
import { ArrowLeft, BarChart3, Users, AlertTriangle, Activity, LogOut } from "lucide-react"
import { useTranslations } from "next-intl"
import { MobileFrame } from "@/components/layout/mobile-frame"
import { OverviewTab } from "@/components/admin/overview-tab"
import { UsersTab } from "@/components/admin/users-tab"
import { ModerationTab } from "@/components/admin/moderation-tab"
import { AnalyticsTab } from "@/components/admin/analytics-tab"
import { useAuth } from "@/context/auth-context"

type AdminTab = "overview" | "users" | "moderation" | "analytics"

const adminTabs: { id: AdminTab; labelKey: "overview" | "users" | "moderation" | "analytics"; icon: typeof Users }[] = [
  { id: "overview", labelKey: "overview", icon: BarChart3 },
  { id: "users", labelKey: "users", icon: Users },
  { id: "moderation", labelKey: "moderation", icon: AlertTriangle },
  { id: "analytics", labelKey: "analytics", icon: Activity },
]

interface AdminDashboardPageProps {
  onClose: () => void
}

export function AdminDashboardPage({ onClose }: AdminDashboardPageProps) {
  const t = useTranslations("admin")
  const [activeTab, setActiveTab] = useState<AdminTab>("overview")
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <MobileFrame showStatusBar={false}>
      <div className="bg-[#000000] px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all active:scale-90"
              aria-label={t("goBack")}
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{t("title")}</h1>
              <p className="text-xs text-white/70">{t("subtitle")}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all active:scale-90"
            aria-label={t("logout")}
          >
            <LogOut size={18} className="text-white" />
          </button>
        </div>

        <div className="flex items-center gap-1 mt-4">
          {adminTabs.map(({ id, labelKey, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#000000] shadow-sm"
                    : "bg-white/15 text-white/80 hover:bg-white/25"
                }`}
              >
                <Icon size={13} />
                {t(`tabs.${labelKey}`)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#F8F8FA]">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "moderation" && <ModerationTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </MobileFrame>
  )
}
