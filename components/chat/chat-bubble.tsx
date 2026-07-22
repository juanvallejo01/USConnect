import type { ChatMessage } from "@/context/chat-context"

export function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={`rounded-[22px] px-4 py-3 text-[15px] leading-snug ${
            message.sent
              ? "bg-primary text-primary-foreground rounded-br-lg"
              : "bg-[#F2F2F7] dark:bg-[#1C1C1E] text-[#1A1A2E] dark:text-[#F5F5F0] rounded-bl-lg"
          }`}
        >
          {message.text}
        </div>
        <span className={`text-[10px] text-[#C7C7CC] px-1 ${message.sent ? "text-right" : "text-left"}`}>
          {message.time}
        </span>
      </div>
    </div>
  )
}
