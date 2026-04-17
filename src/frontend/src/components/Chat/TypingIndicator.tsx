export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-3 py-2">
      <div className="flex items-center gap-0.5 px-3 py-2.5 rounded-xs bg-card border border-border/60">
        <span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "900ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce"
          style={{ animationDelay: "200ms", animationDuration: "900ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground motion-safe:animate-bounce"
          style={{ animationDelay: "400ms", animationDuration: "900ms" }}
        />
      </div>
    </div>
  );
}
