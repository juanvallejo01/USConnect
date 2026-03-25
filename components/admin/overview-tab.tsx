import { Users, Activity, Heart, MessageSquare, TrendingUp, Percent } from "lucide-react"
import { StatCard } from "./stat-card"
import { useAdminStats } from "@/hooks/use-admin-stats"

const recentActivity = [
  { text: "New user registered: Taylor Kim", time: "5m ago", type: "user" },
  { text: "New match created: Sarah & James", time: "12m ago", type: "match" },
  { text: "42 new likes created today", time: "1h ago", type: "like" },
  { text: "Emily Davis reached 25 likes", time: "2h ago", type: "action" },
]

export function OverviewTab() {
  const { stats, isLoading, error } = useAdminStats()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-[#8E8E93]">Loading statistics...</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm text-red-500">{error || "Failed to load statistics"}</div>
      </div>
    )
  }

  const adminStats = [
    { label: "Total Users", value: stats.totalUsers.toString(), icon: Users, color: "bg-[#4A90D9]" },
    { label: "Active Users", value: stats.activeUsers.toString(), icon: Activity, color: "bg-gradient-to-br from-[#4A90D9] to-[#F97316]" },
    { label: "Total Likes", value: stats.totalLikes.toString(), icon: Heart, color: "bg-gradient-to-br from-[#4A90D9] to-[#EF4444]" },
    { label: "Total Matches", value: stats.totalMatches.toString(), icon: TrendingUp, color: "bg-gradient-to-br from-[#4A90D9] to-[#6366F1]" },
    { label: "Messages", value: stats.totalMessages.toString(), icon: MessageSquare, color: "bg-gradient-to-br from-[#F59E0B] to-[#4A90D9]" },
    { label: "Match Rate", value: `${Math.round(stats.matchRate * 100)}%`, icon: Percent, color: "bg-gradient-to-br from-[#4A90D9] to-[#A855F7]" },
  ]

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        {adminStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-xl bg-white border border-[#EBEBF0] cloud-shadow p-4">
        <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Recent Activity</h3>
        <div className="flex flex-col gap-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${
                item.type === "user" ? "bg-[#4A90D9]" :
                item.type === "match" ? "bg-[#4A90D9]" :
                item.type === "like" ? "bg-[#4A90D9]" :
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
