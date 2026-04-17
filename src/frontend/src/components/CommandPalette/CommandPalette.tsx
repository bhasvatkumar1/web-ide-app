import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import {
  Command,
  FilePlus,
  FolderPlus,
  Info,
  Keyboard,
  MapPin,
  MessageSquare,
  PanelLeft,
  RotateCcw,
  Save,
  SaveAll,
  Settings,
  Terminal,
  WrapText,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface CommandEntry {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onSave?: () => void;
  onSaveAll?: () => void;
  onToggleSidebar?: () => void;
  onToggleChat?: () => void;
  onShowSettings?: () => void;
  onShowShortcuts?: () => void;
  onShowAbout?: () => void;
  onQuickOpen?: () => void;
}

function fuzzyMatch(query: string, target: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

function fuzzyScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.startsWith(q)) return 100;
  if (t.includes(q)) return 80;
  return 50;
}

const RECENT_KEY = "web-ide-recent-commands";
const MAX_RECENT = 5;

function getRecentIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function recordRecent(id: string) {
  const prev = getRecentIds().filter((r) => r !== id);
  const next = [id, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function CommandPalette({
  isOpen,
  onClose,
  onNewFile,
  onNewFolder,
  onSave,
  onSaveAll,
  onToggleSidebar,
  onToggleChat,
  onShowSettings,
  onShowShortcuts,
  onShowAbout,
  onQuickOpen,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { settings, updateSettings, closeTab, activeTabId, markTabDirty } =
    useIDEStore();

  const allCommands: CommandEntry[] = useMemo(
    () => [
      {
        id: "new-file",
        label: "New File",
        shortcut: "Ctrl+N",
        icon: <FilePlus size={14} />,
        action: () => {
          onNewFile?.();
          onClose();
        },
      },
      {
        id: "new-folder",
        label: "New Folder",
        icon: <FolderPlus size={14} />,
        action: () => {
          onNewFolder?.();
          onClose();
        },
      },
      {
        id: "save",
        label: "Save File",
        shortcut: "Ctrl+S",
        icon: <Save size={14} />,
        action: () => {
          if (activeTabId) markTabDirty(activeTabId, false);
          onSave?.();
          onClose();
        },
      },
      {
        id: "save-all",
        label: "Save All Files",
        icon: <SaveAll size={14} />,
        action: () => {
          onSaveAll?.();
          onClose();
        },
      },
      {
        id: "close-tab",
        label: "Close Active Tab",
        shortcut: "Ctrl+W",
        icon: <X size={14} />,
        action: () => {
          if (activeTabId) closeTab(activeTabId);
          onClose();
        },
      },
      {
        id: "toggle-sidebar",
        label: "Toggle Sidebar",
        shortcut: "Ctrl+B",
        icon: <PanelLeft size={14} />,
        action: () => {
          onToggleSidebar?.();
          onClose();
        },
      },
      {
        id: "toggle-chat",
        label: "Toggle Chat Panel",
        icon: <MessageSquare size={14} />,
        action: () => {
          onToggleChat?.();
          onClose();
        },
      },
      {
        id: "quick-open",
        label: "Go to File\u2026",
        shortcut: "Ctrl+P",
        icon: <Command size={14} />,
        action: () => {
          onQuickOpen?.();
          onClose();
        },
      },
      {
        id: "toggle-minimap",
        label: settings.showMinimap ? "Hide Minimap" : "Show Minimap",
        icon: <MapPin size={14} />,
        action: () => {
          updateSettings({ showMinimap: !settings.showMinimap });
          onClose();
        },
      },
      {
        id: "toggle-wordwrap",
        label: settings.wordWrap ? "Disable Word Wrap" : "Enable Word Wrap",
        icon: <WrapText size={14} />,
        action: () => {
          updateSettings({ wordWrap: !settings.wordWrap });
          onClose();
        },
      },
      {
        id: "font-larger",
        label: "Increase Font Size",
        icon: <ZoomIn size={14} />,
        action: () => {
          updateSettings({ fontSize: Math.min(28, settings.fontSize + 1) });
          onClose();
        },
      },
      {
        id: "font-smaller",
        label: "Decrease Font Size",
        icon: <ZoomOut size={14} />,
        action: () => {
          updateSettings({ fontSize: Math.max(10, settings.fontSize - 1) });
          onClose();
        },
      },
      {
        id: "font-reset",
        label: "Reset Font Size",
        icon: <RotateCcw size={14} />,
        action: () => {
          updateSettings({ fontSize: 14 });
          onClose();
        },
      },
      {
        id: "open-settings",
        label: "Open Settings",
        shortcut: "Ctrl+,",
        icon: <Settings size={14} />,
        action: () => {
          onShowSettings?.();
          onClose();
        },
      },
      {
        id: "show-shortcuts",
        label: "Keyboard Shortcuts",
        shortcut: "Ctrl+K Ctrl+S",
        icon: <Keyboard size={14} />,
        action: () => {
          onShowShortcuts?.();
          onClose();
        },
      },
      {
        id: "show-about",
        label: "About Web IDE",
        icon: <Info size={14} />,
        action: () => {
          onShowAbout?.();
          onClose();
        },
      },
      {
        id: "open-terminal",
        label: "Toggle Terminal",
        icon: <Terminal size={14} />,
        description: "Coming soon",
        action: () => onClose(),
      },
    ],
    [
      settings.showMinimap,
      settings.wordWrap,
      settings.fontSize,
      activeTabId,
      closeTab,
      markTabDirty,
      updateSettings,
      onClose,
      onNewFile,
      onNewFolder,
      onSave,
      onSaveAll,
      onToggleSidebar,
      onToggleChat,
      onQuickOpen,
      onShowSettings,
      onShowShortcuts,
      onShowAbout,
    ],
  );

  const filtered = useMemo(() => {
    const recentIds = getRecentIds();
    const matched = allCommands.filter((c) => fuzzyMatch(query, c.label));
    if (!query) {
      const recent = matched.filter((c) => recentIds.includes(c.id));
      const rest = matched.filter((c) => !recentIds.includes(c.id));
      return [...recent, ...rest];
    }
    return matched.sort(
      (a, b) => fuzzyScore(query, b.label) - fuzzyScore(query, a.label),
    );
  }, [query, allCommands]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setFocusIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-cmd-idx="${focusIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusIdx]);

  const execute = useCallback((cmd: CommandEntry) => {
    recordRecent(cmd.id);
    cmd.action();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((p) => Math.min(p + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((p) => Math.max(p - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[focusIdx];
        if (cmd) execute(cmd);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, filtered, focusIdx, onClose, execute]);

  if (!isOpen) return null;

  const recentIds = getRecentIds();
  const hasRecent = !query && filtered.some((c) => recentIds.includes(c.id));

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      data-ocid="command_palette.dialog"
      onClick={handleBackdropClick}
      onKeyDown={() => {}}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[600px] mx-4 bg-popover border border-border shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-2 px-3 border-b border-border">
          <Command size={14} className="text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command\u2026"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-ocid="command_palette.search_input"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-3"
          />
          <button
            type="button"
            onClick={onClose}
            data-ocid="command_palette.close_button"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[320px] overflow-y-auto scrollbar-thin py-1"
        >
          {filtered.length === 0 && (
            <div
              data-ocid="command_palette.empty_state"
              className="px-4 py-8 text-center text-xs text-muted-foreground"
            >
              No commands found
            </div>
          )}

          {hasRecent && (
            <div className="px-3 pt-1 pb-0.5 text-[10px] text-muted-foreground/60 uppercase tracking-widest">
              Recently used
            </div>
          )}

          {filtered.map((cmd, idx) => {
            const isRecent = !query && recentIds.includes(cmd.id);
            const prevIsRecent =
              idx > 0 && !query && recentIds.includes(filtered[idx - 1].id);
            const showDivider = idx > 0 && !isRecent && prevIsRecent;
            return (
              <div key={cmd.id}>
                {showDivider && <div className="my-1 border-t border-border" />}
                <button
                  type="button"
                  data-cmd-idx={idx}
                  data-ocid={`command_palette.item.${idx + 1}`}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setFocusIdx(idx)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-[7px] text-left text-xs transition-colors duration-75",
                    idx === focusIdx
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 shrink-0 flex items-center justify-center",
                      idx === focusIdx
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {cmd.icon}
                  </span>
                  <span className="flex-1">{cmd.label}</span>
                  {cmd.description && (
                    <span
                      className={cn(
                        "text-[10px]",
                        idx === focusIdx
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {cmd.description}
                    </span>
                  )}
                  {cmd.shortcut && (
                    <kbd
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded border font-mono",
                        idx === focusIdx
                          ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground/70"
                          : "border-border bg-muted text-muted-foreground",
                      )}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground/50">
          <span>
            <kbd className="font-mono">&#8593;&#8595;</kbd> navigate
          </span>
          <span>
            <kbd className="font-mono">Enter</kbd> select
          </span>
          <span>
            <kbd className="font-mono">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
