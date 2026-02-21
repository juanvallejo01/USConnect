"use client"

import { useState } from "react"
import { ArrowLeft, BarChart3, Users, AlertTriangle, Activity } from "lucide-react"
import { MobileFrame } from "@/components/layout/mobile-frame"
import { OverviewTab } from "@/components/admin/overview-tab"
import { UsersTab } from "@/components/admin/users-tab"
import { ModerationTab } from "@/components/admin/moderation-tab"
import { AnalyticsTab } from "@/components/admin/analytics-tab"
import { useSpark } from "@/context/spark-context"

type AdminTab = "overview" | "users" | "moderation" | "analytics"

const adminTabs: { id: AdminTab; label: string; icon: typeof Users }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "moderation", label: "Reports", icon: AlertTriangle },
  { id: "analytics", label: "Analytics", icon: Activity },
]

export function AdminDashboardPage() {
  const { closeAdmin } = useSpark()
  const [activeTab, setActiveTab] = useState<AdminTab>("overview")

  return (
    <MobileFrame showStatusBar={false}>
      <div className="bg-gradient-to-r from-[#C62828] to-[#1565C0] px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={closeAdmin}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm transition-all active:scale-90"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
            <p className="text-xs text-white/70">Campus Circle Management</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-4">
          {adminTabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#C62828] shadow-sm"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "moderation" && <ModerationTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </MobileFrame>
  )
}
