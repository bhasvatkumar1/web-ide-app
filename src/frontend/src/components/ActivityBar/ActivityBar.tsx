import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import type { SidebarTab } from "@/types";
import { Files, MessageSquare, Puzzle, Settings } from "lucide-react";

interface ActivityBarItem {
  id: SidebarTab | "extensions";
  label: string;
  icon: React.ReactNode;
  isPlaceholder?: boolean;
}

interface ActivityBarProps {
  onOpenSettings?: () => void;
}

const ITEMS: ActivityBarItem[] = [
  {
    id: "files",
    label: "Explorer",
    icon: <Files size={22} strokeWidth={1.5} />,
  },
  {
    id: "chat",
    label: "AI Chat",
    icon: <MessageSquare size={22} strokeWidth={1.5} />,
  },
  {
    id: "extensions",
    label: "Extensions (coming soon)",
    icon: <Puzzle size={22} strokeWidth={1.5} />,
    isPlaceholder: true,
  },
];

export function ActivityBar({ onOpenSettings }: ActivityBarProps) {
  const { activeSidebarTab, setActiveSidebarTab, sidebarOpen, toggleSidebar } =
    useIDEStore();

  const handleClick = (item: ActivityBarItem) => {
    if (item.isPlaceholder) return;
    const tabId = item.id as SidebarTab;
    if (activeSidebarTab === tabId && sidebarOpen) {
      toggleSidebar();
    } else {
      setActiveSidebarTab(tabId);
      if (!sidebarOpen) toggleSidebar();
    }
  };

  return (
    <nav
      data-ocid="activity_bar"
      className="flex flex-col items-center w-12 shrink-0 bg-card border-r border-border py-1 z-10"
      aria-label="Activity Bar"
    >
      {/* Top icons */}
      <div className="flex flex-col items-center gap-0.5 flex-1">
        {ITEMS.map((item) => {
          const isActive =
            !item.isPlaceholder &&
            activeSidebarTab === (item.id as SidebarTab) &&
            sidebarOpen;

          return (
            <div
              key={item.id}
              className="relative group w-full flex justify-center"
            >
              {/* Active indicator */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-7 bg-primary"
                  aria-hidden="true"
                />
              )}

              <button
                type="button"
                data-ocid={`activity_bar.${item.id}.tab`}
                aria-label={item.label}
                title={item.label}
                disabled={item.isPlaceholder}
                onClick={() => handleClick(item)}
                className={cn(
                  "w-10 h-10 flex items-center justify-center transition-colors duration-150 relative",
                  item.isPlaceholder
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                {item.icon}
              </button>

              {/* Tooltip */}
              {!item.isPlaceholder && (
                <div
                  className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 z-50
                    bg-popover border border-border text-foreground text-xs px-2 py-1 whitespace-nowrap
                    opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-300 shadow-lg"
                  aria-hidden="true"
                >
                  {item.label}
                  {/* Arrow */}
                  <span
                    className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0
                    border-t-4 border-b-4 border-r-4
                    border-t-transparent border-b-transparent border-r-border"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom settings icon */}
      <div className="relative group w-full flex justify-center pb-1">
        <button
          type="button"
          data-ocid="activity_bar.settings.button"
          aria-label="Settings"
          title="Settings"
          onClick={onOpenSettings}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors duration-150"
        >
          <Settings size={22} strokeWidth={1.5} />
        </button>

        {/* Tooltip */}
        <div
          className="pointer-events-none absolute left-[calc(100%+6px)] top-1/2 -translate-y-1/2 z-50
            bg-popover border border-border text-foreground text-xs px-2 py-1 whitespace-nowrap
            opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-300 shadow-lg"
          aria-hidden="true"
        >
          Settings
          <span
            className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0
            border-t-4 border-b-4 border-r-4
            border-t-transparent border-b-transparent border-r-border"
          />
        </div>
      </div>
    </nav>
  );
}
