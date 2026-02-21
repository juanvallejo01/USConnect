import { Users, Activity, Zap, Newspaper, AlertTriangle, ShieldCheck } from "lucide-react"
import { StatCard } from "./stat-card"

const stats = [
  { label: "Total Users", value: "2,847", icon: Users, color: "from-[#C62828] to-[#EF4444]" },
  { label: "Active Today", value: "412", icon: Activity, color: "from-[#1565C0] to-[#42A5F5]" },
  { label: "Total Sparks", value: "8,391", icon: Zap, color: "from-[#C62828] to-[#1565C0]" },
  { label: "Total Posts", value: "1,204", icon: Newspaper, color: "from-[#2E7D32] to-[#66BB6A]" },
  { label: "Reports Pending", value: "14", icon: AlertTriangle, color: "from-[#E65100] to-[#FF9800]" },
  { label: "Verified Students", value: "2,103", icon: ShieldCheck, color: "from-[#6A1B9A] to-[#AB47BC]" },
]

const recentActivity = [
  { text: "New user registered: Taylor Kim", time: "5m ago", type: "user" },
  { text: "Post reported for spam", time: "12m ago", type: "report" },
  { text: "42 new sparks created today", time: "1h ago", type: "spark" },
  { text: "Emily Davis account suspended", time: "2h ago", type: "action" },
]

export function OverviewTab() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        <div className="flex flex-col gap-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${
                item.type === "user" ? "bg-[#1565C0]" :
                item.type === "report" ? "bg-[#E65100]" :
                item.type === "spark" ? "bg-[#C62828]" :
                "bg-muted-foreground"
              }`} />
              <p className="flex-1 text-xs text-foreground">{item.text}</p>
              <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
