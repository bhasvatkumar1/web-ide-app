import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import { useCallback, useEffect, useRef, useState } from "react";

interface ContextMenu {
  tabId: string;
  x: number;
  y: number;
}

export function EditorTabs() {
  const { openTabs, activeTabId, closeTab, setActiveTab, files } =
    useIDEStore();
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Resolve file name from file tree
  function getFileName(fileId: string): string {
    function search(nodes: import("@/types").FileNode[]): string | null {
      for (const n of nodes) {
        if (n.id === fileId) return n.name;
        if (n.children) {
          const found = search(n.children);
          if (found) return found;
        }
      }
      return null;
    }
    return search(files) ?? fileId;
  }

  const closeOthers = useCallback(
    (tabId: string) => {
      for (const t of openTabs.filter((t) => t.id !== tabId)) {
        closeTab(t.id);
      }
      setActiveTab(tabId);
    },
    [openTabs, closeTab, setActiveTab],
  );

  const closeAll = useCallback(() => {
    for (const t of [...openTabs]) {
      closeTab(t.id);
    }
  }, [openTabs, closeTab]);

  // Close context menu on outside click or Escape
  useEffect(() => {
    if (!contextMenu) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, [contextMenu]);

  if (openTabs.length === 0) return null;

  return (
    <div
      data-ocid="editor_tabs"
      className="relative flex items-stretch h-9 bg-card border-b border-border overflow-x-auto shrink-0 scrollbar-thin"
    >
      {openTabs.map((tab, idx) => {
        const name = getFileName(tab.fileId);
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            data-ocid={`editor_tabs.item.${idx + 1}`}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            className={cn(
              "editor-tab group relative flex items-center gap-1.5 px-3 h-full text-xs select-none cursor-pointer border-r border-border whitespace-nowrap min-w-0 shrink-0",
              isActive
                ? "bg-background text-foreground border-b-2 border-b-primary -mb-px"
                : "bg-card text-muted-foreground hover:bg-muted/30 hover:text-foreground border-b-2 border-b-transparent",
            )}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveTab(tab.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ tabId: tab.id, x: e.clientX, y: e.clientY });
            }}
            onMouseDown={(e) => {
              // Middle-click close
              if (e.button === 1) {
                e.preventDefault();
                closeTab(tab.id);
              }
            }}
          >
            <span className="truncate max-w-[120px]" title={name}>
              {name}
            </span>
            {tab.isDirty && (
              <span
                data-ocid={`editor_tabs.dirty.${idx + 1}`}
                className="text-primary leading-none"
                title="Unsaved changes"
              >
                •
              </span>
            )}
            <button
              type="button"
              data-ocid={`editor_tabs.close_button.${idx + 1}`}
              aria-label={`Close ${name}`}
              className={cn(
                "flex items-center justify-center w-4 h-4 rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-150 shrink-0",
                isActive
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100 focus:opacity-100",
              )}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              ×
            </button>
          </div>
        );
      })}

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          data-ocid="editor_tabs.context_menu"
          role="menu"
          className="fixed z-50 min-w-40 bg-popover border border-border shadow-lg rounded-xs text-xs py-1"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {[
            {
              label: "Close",
              ocid: "editor_tabs.context_close",
              action: () => {
                closeTab(contextMenu.tabId);
                setContextMenu(null);
              },
            },
            {
              label: "Close Others",
              ocid: "editor_tabs.context_close_others",
              action: () => {
                closeOthers(contextMenu.tabId);
                setContextMenu(null);
              },
            },
            {
              label: "Close All",
              ocid: "editor_tabs.context_close_all",
              action: () => {
                closeAll();
                setContextMenu(null);
              },
            },
          ].map(({ label, ocid, action }) => (
            <button
              key={label}
              type="button"
              role="menuitem"
              data-ocid={ocid}
              className="w-full text-left px-3 py-1.5 hover:bg-muted/50 text-foreground transition-colors duration-100"
              onClick={action}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
