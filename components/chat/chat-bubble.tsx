import type { ChatMessage } from "@/utils/constants"

export function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={`rounded-[20px] px-4 py-2.5 text-[15px] leading-snug ${
            message.sent
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-secondary text-secondary-foreground rounded-bl-md"
          }`}
        >
          {message.text}
        </div>
        <span className={`text-[10px] text-muted-foreground px-1 ${message.sent ? "text-right" : "text-left"}`}>
          {message.time}
        </span>
      </div>
    </div>
  )
}
