import type { ChatMessage } from "@/utils/constants"

export function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={`rounded-[22px] px-4 py-3 text-[15px] leading-snug ${
            message.sent
              ? "bg-[#4A90D9] text-white rounded-br-lg"
              : "bg-[#F2F2F7] text-[#1A1A2E] rounded-bl-lg"
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
