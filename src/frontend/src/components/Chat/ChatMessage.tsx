import type { ChatMessage as ChatMessageType } from "@/types";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  function handleCopy() {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      data-ocid={`chat.message.${isUser ? "user" : "assistant"}`}
      className={`group flex flex-col gap-1 px-3 py-1 ${isUser ? "items-end" : "items-start"}`}
    >
      <div
        className={`relative max-w-[85%] rounded-xs px-3 py-2 text-sm leading-relaxed break-words ${
          isUser
            ? "bg-muted text-foreground border border-border/40"
            : "bg-background text-foreground border border-border/30"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Copy button — appears on hover */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy message"
          data-ocid="chat.copy_button"
          className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 rounded-xs hover:bg-muted/40 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="w-3 h-3 text-accent" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      </div>

      <span className="text-[10px] text-muted-foreground/60 px-1 select-none">
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}
