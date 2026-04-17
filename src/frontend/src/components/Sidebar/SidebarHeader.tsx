import { useFileSystem } from "@/hooks/useFileSystem";
import { ChevronsUpDown, FilePlus, FolderPlus } from "lucide-react";
import { useRef, useState } from "react";

interface SidebarHeaderProps {
  onCollapseAll: () => void;
}

export function SidebarHeader({ onCollapseAll }: SidebarHeaderProps) {
  const { createFile, createFolder } = useFileSystem();

  const [creatingFile, setCreatingFile] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startCreate(type: "file" | "folder") {
    setInputValue("");
    if (type === "file") {
      setCreatingFile(true);
      setCreatingFolder(false);
    } else {
      setCreatingFolder(true);
      setCreatingFile(false);
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitCreate() {
    const trimmed = inputValue.trim();
    if (trimmed) {
      if (creatingFile) createFile(trimmed, undefined);
      else createFolder(trimmed, undefined);
    }
    setCreatingFile(false);
    setCreatingFolder(false);
    setInputValue("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitCreate();
    if (e.key === "Escape") {
      setCreatingFile(false);
      setCreatingFolder(false);
      setInputValue("");
    }
  }

  return (
    <div className="shrink-0">
      {/* Header row */}
      <div className="flex items-center justify-between h-8 px-3 select-none">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Explorer
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            data-ocid="sidebar.new_file_button"
            aria-label="New File"
            title="New File (Ctrl+N)"
            onClick={() => startCreate("file")}
            className="w-6 h-6 flex items-center justify-center rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150"
          >
            <FilePlus size={14} />
          </button>
          <button
            type="button"
            data-ocid="sidebar.new_folder_button"
            aria-label="New Folder"
            title="New Folder"
            onClick={() => startCreate("folder")}
            className="w-6 h-6 flex items-center justify-center rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150"
          >
            <FolderPlus size={14} />
          </button>
          <button
            type="button"
            data-ocid="sidebar.collapse_all_button"
            aria-label="Collapse All"
            title="Collapse All"
            onClick={onCollapseAll}
            className="w-6 h-6 flex items-center justify-center rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-150"
          >
            <ChevronsUpDown size={14} />
          </button>
        </div>
      </div>

      {/* Inline create input */}
      {(creatingFile || creatingFolder) && (
        <div className="px-2 py-1">
          <div className="flex items-center gap-1.5 px-2 h-7 bg-input/20 border border-primary/50 rounded-xs">
            <span className="text-muted-foreground text-xs">
              {creatingFile ? "📄" : "📁"}
            </span>
            <input
              ref={inputRef}
              data-ocid="sidebar.new_node_input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={commitCreate}
              onKeyDown={onKeyDown}
              placeholder={creatingFile ? "filename.ts" : "folder-name"}
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
