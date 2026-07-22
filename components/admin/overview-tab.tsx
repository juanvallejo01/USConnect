import { Users, Activity, Heart, MessageSquare, TrendingUp, Percent } from "lucide-react"
import { useTranslations } from "next-intl"
import { StatCard } from "./stat-card"
import { useAdminStats } from "@/hooks/use-admin-stats"

export function OverviewTab() {
  const t = useTranslations("adminOverview")
  const tTime = useTranslations("time")
  const { stats, isLoading, error } = useAdminStats()

  const recentActivity = [
    { text: t("activity.newUser", { name: "Taylor Kim" }), time: tTime("minutesAgo", { count: 5 }), type: "user" },
    { text: t("activity.newMatch", { names: "Sarah & James" }), time: tTime("minutesAgo", { count: 12 }), type: "match" },
    { text: t("activity.newLikes", { count: 42 }), time: tTime("hoursAgo", { count: 1 }), type: "like" },
    { text: t("activity.reachedLikes", { name: "Emily Davis", count: 25 }), time: tTime("hoursAgo", { count: 2 }), type: "action" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-[#8E8E93]">{t("loadingStats")}</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-red-500">{error || t("loadFailed")}</div>
      </div>
    )
  }

  const adminStats = [
    { label: t("totalUsers"), value: stats.totalUsers.toString(), icon: Users, color: "bg-[#000000]" },
    { label: t("activeUsers"), value: stats.activeUsers.toString(), icon: Activity, color: "bg-gradient-to-br from-[#000000] to-[#F97316]" },
    { label: t("totalLikes"), value: stats.totalLikes.toString(), icon: Heart, color: "bg-gradient-to-br from-[#000000] to-[#EF4444]" },
    { label: t("totalMatches"), value: stats.totalMatches.toString(), icon: TrendingUp, color: "bg-gradient-to-br from-[#000000] to-[#404040]" },
    { label: t("messages"), value: stats.totalMessages.toString(), icon: MessageSquare, color: "bg-gradient-to-br from-[#F59E0B] to-[#000000]" },
    { label: t("matchRate"), value: `${Math.round(stats.matchRate * 100)}%`, icon: Percent, color: "bg-gradient-to-br from-[#000000] to-[#171717]" },
  ]

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-xl bg-white border border-[#EBEBF0] cloud-shadow p-4">
        <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">{t("recentActivity")}</h3>
        <div className="flex flex-col gap-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${
                item.type === "user" ? "bg-[#000000]" :
                item.type === "match" ? "bg-[#000000]" :
                item.type === "like" ? "bg-[#000000]" :
                "bg-[#C7C7CC]"
              }`} />
              <p className="flex-1 text-xs text-[#1A1A2E]">{item.text}</p>
              <span className="text-[10px] text-[#8E8E93] shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
