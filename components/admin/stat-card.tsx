import type { LucideIcon } from "lucide-react"

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  icon: LucideIcon
  color: string
}) {
  return (
    <div className="rounded-xl bg-card border border-border cloud-shadow p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: "active" | "suspended" | "banned" }) {
  const styles = {
    active: "bg-green-100 text-green-700",
    suspended: "bg-amber-100 text-amber-700",
    banned: "bg-red-100 text-red-700",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}
