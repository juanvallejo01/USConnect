import { MAJOR_DISTRIBUTION } from "@/utils/constants"

export function AnalyticsTab() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-3">
        <EngagementCard label="Avg. Daily Posts" value="47" change="+12% vs last week" positive />
        <EngagementCard label="Avg. Daily Sparks" value="186" change="+8% vs last week" positive />
        <EngagementCard label="Engagement Rate" value="73%" change="+3% vs last week" positive />
        <EngagementCard label="Retention (7d)" value="68%" change="-2% vs last week" positive={false} />
      </div>

      <BarChartCard
        title="Posts Per Day"
        data={[28, 35, 42, 38, 55, 47, 51]}
        max={55}
        gradient="from-[#FF6B6B] to-[#4A90D9]"
      />

      <BarChartCard
        title="Sparks Growth"
        data={[120, 145, 162, 178, 186, 198, 210]}
        max={210}
        gradient="from-[#4A90D9] to-[#4A90D9]"
      />

      <div className="rounded-xl bg-card border border-border cloud-shadow p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Users by Major</h3>
        <div className="flex flex-col gap-2.5">
          {MAJOR_DISTRIBUTION.map((item) => (
            <div key={item.major} className="flex items-center gap-3">
              <span className="text-xs text-foreground w-28 shrink-0 truncate">{item.major}</span>
              <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#4A90D9] transition-all"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EngagementCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="rounded-xl bg-card border border-border cloud-shadow p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
      <p className={`text-[10px] font-semibold mt-1 ${positive ? "text-green-600" : "text-red-600"}`}>{change}</p>
    </div>
  )
}

function BarChartCard({ title, data, max, gradient }: { title: string; data: number[]; max: number; gradient: string }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  return (
    <div className="rounded-xl bg-card border border-border cloud-shadow p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((val, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t-md bg-gradient-to-t ${gradient}`}
              style={{ height: `${(val / max) * 100}%` }}
            />
            <span className="text-[9px] text-muted-foreground">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
