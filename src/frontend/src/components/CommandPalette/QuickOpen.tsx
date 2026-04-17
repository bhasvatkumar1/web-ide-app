import { useFileSystem } from "@/hooks/useFileSystem";
import { getFileIcon } from "@/lib/fileIcons";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import type { FileNode } from "@/types";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface QuickOpenProps {
  isOpen: boolean;
  onClose: () => void;
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

function getFilePath(file: FileNode, allFiles: FileNode[]): string {
  const parts: string[] = [file.name];
  let current = file;
  while (current.parentId) {
    const parent = allFiles.find((f) => f.id === current.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  return parts.join("/");
}

function flattenAll(nodes: FileNode[]): FileNode[] {
  const result: FileNode[] = [];
  function traverse(list: FileNode[]) {
    for (const n of list) {
      result.push(n);
      if (n.children) traverse(n.children);
    }
  }
  traverse(nodes);
  return result;
}

export function QuickOpen({ isOpen, onClose }: QuickOpenProps) {
  const [query, setQuery] = useState("");
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { files } = useFileSystem();
  const { openFileInTab } = useIDEStore();

  const allNodes = useMemo(() => flattenAll(files), [files]);
  const allFileNodes = useMemo(
    () => allNodes.filter((n) => n.type === "file"),
    [allNodes],
  );

  const filtered = useMemo(() => {
    return allFileNodes.filter((f) => fuzzyMatch(query, f.name));
  }, [query, allFileNodes]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setFocusIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-qo-idx="${focusIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusIdx]);

  const openFile = useCallback(
    (file: FileNode) => {
      openFileInTab(file.id);
      onClose();
    },
    [openFileInTab, onClose],
  );

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
        const file = filtered[focusIdx];
        if (file) openFile(file);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, filtered, focusIdx, onClose, openFile]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      data-ocid="quick_open.dialog"
      onClick={handleBackdropClick}
      onKeyDown={() => {}}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-[600px] mx-4 bg-popover border border-border shadow-2xl overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-2 px-3 border-b border-border">
          <Search size={14} className="text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Go to file\u2026"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-ocid="quick_open.search_input"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-3"
          />
          <button
            type="button"
            onClick={onClose}
            data-ocid="quick_open.close_button"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* File list */}
        <div
          ref={listRef}
          className="max-h-[340px] overflow-y-auto scrollbar-thin py-1"
        >
          {filtered.length === 0 && (
            <div
              data-ocid="quick_open.empty_state"
              className="px-4 py-8 text-center text-xs text-muted-foreground"
            >
              No files found
            </div>
          )}

          {filtered.map((file, idx) => {
            const path = getFilePath(file, allNodes);
            const parts = path.split("/");
            const dirPart = parts.slice(0, -1).join("/");
            const { icon, color } = getFileIcon(file.extension ?? "");
            return (
              <button
                key={file.id}
                type="button"
                data-qo-idx={idx}
                data-ocid={`quick_open.item.${idx + 1}`}
                onClick={() => openFile(file)}
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
                    "text-base shrink-0",
                    idx !== focusIdx && color,
                  )}
                >
                  {icon}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="font-medium">{file.name}</span>
                  {dirPart && (
                    <span
                      className={cn(
                        "ml-2 text-[10px]",
                        idx === focusIdx
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground/60",
                      )}
                    >
                      {dirPart}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground/50">
          <span>
            <kbd className="font-mono">&#8593;&#8595;</kbd> navigate
          </span>
          <span>
            <kbd className="font-mono">Enter</kbd> open
          </span>
          <span>
            <kbd className="font-mono">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
