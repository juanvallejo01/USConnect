import { UserAvatar } from "@/components/layout/user-avatar"
import { GradientButton } from "@/components/layout/gradient-button"
import type { SparkUser } from "@/utils/constants"

export function SparkCard({
  spark,
  onStartChat,
}: {
  spark: SparkUser
  onStartChat: (id: number) => void
}) {
  return (
    <div className="rounded-3xl bg-card border border-border shadow-sm p-5">
      <div className="flex items-start gap-4">
        <UserAvatar
          src={spark.avatar}
          alt={`${spark.name}'s avatar`}
          size="lg"
          ring
          indicator={spark.unread}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-foreground">{spark.name}</h3>
            <span className={`text-xs shrink-0 ${spark.unread ? "font-semibold text-[#C62828]" : "text-muted-foreground"}`}>
              {spark.time}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{spark.major}</p>
          <p className="text-xs text-foreground/70 mt-1 italic">{spark.status}</p>
          <p className={`text-sm mt-2 truncate ${spark.unread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {spark.lastMessage}
          </p>
          <GradientButton
            size="sm"
            onClick={() => onStartChat(spark.id)}
            className="mt-3"
          >
            Start Chat
          </GradientButton>
        </div>
      </div>
    </div>
  )
}
