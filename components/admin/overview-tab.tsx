import { Users, Activity, Heart, Newspaper, TrendingUp, Bell } from "lucide-react"
import { StatCard } from "./stat-card"
import { useRank } from "@/context/rank-context"
import { useMatch } from "@/context/match-context"
import { useNotification } from "@/context/notification-context"

const recentActivity = [
  { text: "New user registered: Taylor Kim", time: "5m ago", type: "user" },
  { text: "New match created: Sarah & James", time: "12m ago", type: "match" },
  { text: "42 new likes created today", time: "1h ago", type: "like" },
  { text: "Emily Davis reached 25 likes", time: "2h ago", type: "action" },
]

export function OverviewTab() {
  const { averageLikes } = useRank()
  const { likes, matches } = useMatch()
  const { notifications } = useNotification()
  
  const stats = [
    { label: "Total Users", value: "2,847", icon: Users, color: "from-[#8B5CF6] to-[#EC4899]" },
    { label: "Active Today", value: "412", icon: Activity, color: "from-[#EC4899] to-[#F97316]" },
    { label: "Total Likes", value: likes.length.toString(), icon: Heart, color: "from-[#EC4899] to-[#EF4444]" },
    { label: "Total Matches", value: matches.length.toString(), icon: TrendingUp, color: "from-[#8B5CF6] to-[#6366F1]" },
    { label: "Notifications", value: notifications.length.toString(), icon: Bell, color: "from-[#F59E0B] to-[#EC4899]" },
    { label: "Avg Likes", value: Math.round(averageLikes).toString(), icon: Heart, color: "from-[#8B5CF6] to-[#A855F7]" },
  ]

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="flex flex-col gap-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${
                item.type === "user" ? "bg-[#8B5CF6]" :
                item.type === "match" ? "bg-[#EC4899]" :
                item.type === "like" ? "bg-pink-400" :
                "bg-gray-400"
              }`} />
              <p className="flex-1 text-xs text-gray-900">{item.text}</p>
              <span className="text-[10px] text-gray-500 shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
