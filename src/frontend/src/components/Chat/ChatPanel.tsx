import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useIDEStore } from "@/store/useIDEStore";
import type { ChatMessage } from "@/types";
import { Bot, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage as ChatMessageComponent } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";

const MOCK_RESPONSES = [
  "Great question! In TypeScript, you can use generics to write reusable, type-safe code. For example: `function identity<T>(arg: T): T { return arg; }` — the `<T>` is a type parameter that gets inferred at call time.",
  "I'd recommend using `const` assertions (`as const`) when you want TypeScript to infer the narrowest possible type. For instance, `const config = { env: 'prod' } as const` makes `config.env` type `'prod'` instead of `string`.",
  "For async error handling, wrap your `await` calls in try/catch or use a helper like `const [data, err] = await to(promise)`. This pattern keeps async code clean and forces you to handle errors explicitly.",
  "When you see a TypeScript error like `Property 'x' does not exist on type 'Y'`, it usually means you need to either add the property to the type definition or use a type guard to narrow the type before accessing it.",
  "React hooks follow two rules: only call them at the top level (not inside loops or conditionals), and only call them from React functions. The ESLint plugin `eslint-plugin-react-hooks` enforces these automatically.",
  "Consider using `useMemo` and `useCallback` strategically — they add overhead themselves. Profile first, then optimize. A good rule: only memoize when you have a measured performance problem, not preemptively.",
  "Tailwind's `@apply` directive can clean up repeated utility patterns in your CSS, but don't overuse it — you lose Tailwind's JIT tree-shaking benefits. Keep it for truly repeated, semantic patterns.",
  "For state management, start with `useState` and `useContext`. Reach for Zustand or Jotai when you need cross-component state that's complex or frequently updated. Don't add a library until you feel the pain of not having one.",
];

let responseIndex = 0;
function getNextMockResponse(): string {
  const response = MOCK_RESPONSES[responseIndex % MOCK_RESPONSES.length];
  responseIndex++;
  return response;
}

const PLACEHOLDER_MESSAGES: ChatMessage[] = [
  {
    id: "placeholder-1",
    role: "assistant",
    content:
      "Hello! I'm your AI coding assistant. I can help you with TypeScript, React, CSS, and general programming questions. What would you like to work on?",
    timestamp: Date.now() - 300000,
  },
  {
    id: "placeholder-2",
    role: "user",
    content:
      "Can you explain the difference between `interface` and `type` in TypeScript?",
    timestamp: Date.now() - 240000,
  },
  {
    id: "placeholder-3",
    role: "assistant",
    content:
      "Both `interface` and `type` can describe object shapes, but they have key differences:\n\n• **interface** is open — you can extend it later with declaration merging. Ideal for public APIs and class contracts.\n\n• **type** is a one-time alias — great for unions, intersections, and complex mapped types like `Partial<T>`.\n\nGeneral rule: use `interface` for objects and classes, `type` for everything else.",
    timestamp: Date.now() - 180000,
  },
];

export function ChatPanel() {
  const { chatMessages, addChatMessage, clearChat } = useIDEStore();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Seed placeholder messages if chat is empty
  useEffect(() => {
    if (chatMessages.length === 0) {
      for (const msg of PLACEHOLDER_MESSAGES) {
        addChatMessage(msg);
      }
    }
  }, [chatMessages.length, addChatMessage]);

  // Auto-scroll to bottom whenever messages or typing state changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — scroll deps are chatMessages and isTyping
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatMessages, isTyping]);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight * 4 + 16;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    adjustTextareaHeight();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    addChatMessage(userMsg);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setIsTyping(true);
    const delay = 800 + Math.random() * 400;
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: getNextMockResponse(),
        timestamp: Date.now(),
      };
      addChatMessage(assistantMsg);
      setIsTyping(false);
    }, delay);
  }

  function handleClearConfirmed() {
    clearChat();
    const now = Date.now();
    PLACEHOLDER_MESSAGES.forEach((msg, i) => {
      addChatMessage({ ...msg, timestamp: now - (300000 - i * 60000) });
    });
  }

  return (
    <div className="flex flex-col h-full bg-background" data-ocid="chat.panel">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-wide uppercase">
            AI Assistant
          </span>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label="Clear chat"
              data-ocid="chat.clear_button"
              className="p-1 rounded-xs hover:bg-destructive/20 hover:text-destructive text-muted-foreground transition-colors duration-150"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="bg-popover border-border"
            data-ocid="chat.dialog"
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground text-sm">
                Clear chat history?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-xs">
                This will remove all messages and restore the default
                conversation. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="chat.cancel_button"
                className="text-xs h-7 border-border"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearConfirmed}
                data-ocid="chat.confirm_button"
                className="text-xs h-7 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto py-2 scrollbar-thin"
        data-ocid="chat.list"
      >
        {chatMessages.length === 0 && !isTyping && (
          <div
            className="flex flex-col items-center justify-center h-full gap-3 px-4 text-center"
            data-ocid="chat.empty_state"
          >
            <Bot className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground/60">
              No messages yet. Start a conversation!
            </p>
          </div>
        )}

        {chatMessages.map((msg) => (
          <ChatMessageComponent
            key={msg.id}
            message={{ ...msg, id: `${msg.id}` }}
          />
        ))}

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="shrink-0 border-t border-border/60 bg-card px-2 py-2"
        data-ocid="chat.input_area"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a coding question… (Enter to send)"
            rows={1}
            data-ocid="chat.input"
            className="flex-1 resize-none rounded-xs bg-background border border-border/60 text-foreground text-xs px-2.5 py-2 placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 transition-colors duration-150 scrollbar-thin leading-5"
            style={{ minHeight: "32px", maxHeight: "96px" }}
            disabled={isTyping}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
            data-ocid="chat.send_button"
            className="flex items-center justify-center w-7 h-7 rounded-xs bg-primary text-primary-foreground hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 shrink-0 mb-0.5"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground/40 mt-1 px-0.5">
          Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
