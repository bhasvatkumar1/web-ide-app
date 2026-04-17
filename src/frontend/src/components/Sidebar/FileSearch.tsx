import { useFileSystem } from "@/hooks/useFileSystem";
import { getFileIcon } from "@/lib/fileIcons";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import type { FileNode } from "@/types";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface FileSearchProps {
  query: string;
  onChange: (q: string) => void;
}

function SearchResultItem({
  node,
  query,
  index,
}: {
  node: FileNode;
  query: string;
  index: number;
}) {
  const { openFileInTab, activeTabId, openTabs } = useIDEStore();
  const iconConfig = getFileIcon(node.extension, false, false);

  const isActive = openTabs.some(
    (t) => t.fileId === node.id && t.id === activeTabId,
  );

  // Highlight matching chars in name
  const lowerName = node.name.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIdx = lowerName.indexOf(lowerQuery);

  function highlight() {
    if (matchIdx === -1 || !query) return <span>{node.name}</span>;
    return (
      <>
        <span>{node.name.slice(0, matchIdx)}</span>
        <span className="text-primary font-semibold">
          {node.name.slice(matchIdx, matchIdx + query.length)}
        </span>
        <span>{node.name.slice(matchIdx + query.length)}</span>
      </>
    );
  }

  return (
    <button
      type="button"
      data-ocid={`file_search.result.${index}`}
      className={cn(
        "flex items-center gap-2 h-7 px-3 cursor-pointer select-none rounded-none outline-none",
        "hover:bg-muted/30 focus-visible:bg-muted/30 text-xs",
        isActive && "bg-primary/15 text-primary",
      )}
      onClick={() => openFileInTab(node.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openFileInTab(node.id);
      }}
    >
      <span
        className="text-[9px] font-bold leading-none shrink-0 px-[3px] py-[2px] rounded-xs font-mono"
        style={{ color: iconConfig.color, backgroundColor: iconConfig.bgColor }}
      >
        {iconConfig.icon}
      </span>
      <span className="flex-1 truncate min-w-0">{highlight()}</span>
    </button>
  );
}

export function FileSearch({ query, onChange }: FileSearchProps) {
  const { getAllFiles } = useFileSystem();
  const inputRef = useRef<HTMLInputElement>(null);

  const allFiles = getAllFiles();
  const filtered =
    query.trim() === ""
      ? []
      : allFiles.filter((f) =>
          f.name.toLowerCase().includes(query.toLowerCase()),
        );

  return (
    <>
      {/* Search input */}
      <div className="px-2 py-1.5 shrink-0">
        <div className="flex items-center gap-1.5 h-7 px-2 bg-input/20 border border-border rounded-xs focus-within:border-primary/60 transition-colors duration-150">
          <Search size={12} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            data-ocid="file_search.search_input"
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              type="button"
              data-ocid="file_search.clear_button"
              aria-label="Clear search"
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors duration-150 shrink-0"
            >
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {query.trim() !== "" && (
        <div
          aria-label="Search results"
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {filtered.length === 0 ? (
            <div
              data-ocid="file_search.empty_state"
              className="px-3 py-4 text-xs text-muted-foreground text-center"
            >
              No files matching "{query}"
            </div>
          ) : (
            filtered.map((node, i) => (
              <SearchResultItem
                key={node.id}
                node={node}
                query={query}
                index={i + 1}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}
