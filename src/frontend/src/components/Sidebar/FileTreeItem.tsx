import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useFileSystem } from "@/hooks/useFileSystem";
import { getFileIcon } from "@/lib/fileIcons";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import type { FileNode } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  isActive: boolean;
  onContextNewFile: (parentId: string) => void;
  onContextNewFolder: (parentId: string) => void;
  itemIndex: number;
}

export function FileTreeItem({
  node,
  depth,
  isActive,
  onContextNewFile,
  onContextNewFolder,
  itemIndex,
}: FileTreeItemProps) {
  const { openFileInTab, toggleFolder, deleteNode, renameNode } = useIDEStore();
  const { createFile, createFolder } = useFileSystem();

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [creatingChild, setCreatingChild] = useState<"file" | "folder" | null>(
    null,
  );
  const [childName, setChildName] = useState("");

  const renameInputRef = useRef<HTMLInputElement>(null);
  const childInputRef = useRef<HTMLInputElement>(null);

  const iconConfig = getFileIcon(
    node.extension,
    node.type === "folder",
    node.isOpen,
  );

  const indentPx = depth * 12;

  useEffect(() => {
    if (isRenaming) {
      setRenameValue(node.name);
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 0);
    }
  }, [isRenaming, node.name]);

  useEffect(() => {
    if (creatingChild) {
      setChildName("");
      setTimeout(() => childInputRef.current?.focus(), 0);
    }
  }, [creatingChild]);

  const commitRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== node.name) {
      renameNode(node.id, trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, node.name, node.id, renameNode]);

  const commitChildCreate = useCallback(() => {
    const trimmed = childName.trim();
    if (trimmed && creatingChild) {
      if (creatingChild === "file") createFile(trimmed, node.id);
      else createFolder(trimmed, node.id);
      if (!node.isOpen) toggleFolder(node.id);
    }
    setCreatingChild(null);
    setChildName("");
  }, [
    childName,
    creatingChild,
    node.id,
    node.isOpen,
    createFile,
    createFolder,
    toggleFolder,
  ]);

  function handleClick() {
    if (node.type === "folder") {
      toggleFolder(node.id);
    } else {
      openFileInTab(node.id);
    }
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.preventDefault();
    setIsRenaming(true);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setIsRenaming(false);
  }

  function handleChildKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitChildCreate();
    if (e.key === "Escape") {
      setCreatingChild(null);
      setChildName("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "F2") {
      e.preventDefault();
      setIsRenaming(true);
    }
    if (e.key === "Delete") {
      e.preventDefault();
      setShowDeleteConfirm(true);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }

  function handleContextNewFile() {
    if (node.type === "folder") {
      setCreatingChild("file");
      if (!node.isOpen) toggleFolder(node.id);
    } else {
      onContextNewFile(node.parentId ?? "");
    }
  }

  function handleContextNewFolder() {
    if (node.type === "folder") {
      setCreatingChild("folder");
      if (!node.isOpen) toggleFolder(node.id);
    } else {
      onContextNewFolder(node.parentId ?? "");
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            role={node.type === "folder" ? "treeitem" : "treeitem"}
            aria-expanded={node.type === "folder" ? node.isOpen : undefined}
            aria-selected={isActive}
            tabIndex={0}
            data-ocid={`file_tree.item.${itemIndex}`}
            className={cn(
              "group relative flex items-center h-7 cursor-pointer select-none rounded-none outline-none",
              "hover:bg-muted/30 focus-visible:bg-muted/30",
              isActive && "bg-primary/15 text-primary",
              !isActive && "text-foreground",
            )}
            style={{ paddingLeft: `${indentPx + 4}px`, paddingRight: "8px" }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
          >
            {/* Expand arrow */}
            <span className="w-4 h-4 shrink-0 flex items-center justify-center mr-0.5">
              {node.type === "folder" ? (
                node.isOpen ? (
                  <ChevronDown size={12} className="text-muted-foreground" />
                ) : (
                  <ChevronRight size={12} className="text-muted-foreground" />
                )
              ) : null}
            </span>

            {/* Icon badge */}
            <span
              className="text-[9px] font-bold leading-none shrink-0 px-[3px] py-[2px] rounded-xs mr-1.5 font-mono"
              style={{
                color: iconConfig.color,
                backgroundColor: iconConfig.bgColor,
              }}
            >
              {node.type === "folder"
                ? node.isOpen
                  ? "▾"
                  : "▸"
                : iconConfig.icon}
            </span>

            {/* Name / Rename input */}
            {isRenaming ? (
              <input
                ref={renameInputRef}
                data-ocid={`file_tree.rename_input.${itemIndex}`}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-input/20 border border-primary/50 text-xs text-foreground px-1 py-0 outline-none min-w-0 h-5 rounded-xs"
                autoComplete="off"
                spellCheck={false}
              />
            ) : (
              <span className="flex-1 text-xs truncate min-w-0 leading-none">
                {node.name}
              </span>
            )}

            {/* Delete confirm inline */}
            {showDeleteConfirm && !isRenaming && (
              <span
                className="ml-auto flex items-center gap-1 text-[10px] shrink-0"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <span className="text-destructive-foreground">Delete?</span>
                <button
                  type="button"
                  data-ocid={`file_tree.confirm_delete_button.${itemIndex}`}
                  className="text-destructive hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                    setShowDeleteConfirm(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      deleteNode(node.id);
                      setShowDeleteConfirm(false);
                    }
                  }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  data-ocid={`file_tree.cancel_delete_button.${itemIndex}`}
                  className="text-muted-foreground hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setShowDeleteConfirm(false);
                  }}
                >
                  No
                </button>
              </span>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent
          data-ocid={`file_tree.context_menu.${itemIndex}`}
          className="w-44 bg-popover border-border text-xs"
        >
          {node.type === "folder" && (
            <>
              <ContextMenuItem
                data-ocid={`file_tree.ctx_new_file.${itemIndex}`}
                className="text-xs gap-2 cursor-pointer"
                onClick={handleContextNewFile}
              >
                New File
              </ContextMenuItem>
              <ContextMenuItem
                data-ocid={`file_tree.ctx_new_folder.${itemIndex}`}
                className="text-xs gap-2 cursor-pointer"
                onClick={handleContextNewFolder}
              >
                New Folder
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          <ContextMenuItem
            data-ocid={`file_tree.ctx_rename.${itemIndex}`}
            className="text-xs gap-2 cursor-pointer"
            onClick={() => setIsRenaming(true)}
          >
            Rename
            <span className="ml-auto text-muted-foreground">F2</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            data-ocid={`file_tree.ctx_delete.${itemIndex}`}
            className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
            <span className="ml-auto text-muted-foreground">Del</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Inline child create input shown below this folder item */}
      {creatingChild && node.type === "folder" && (
        <div
          style={{
            paddingLeft: `${(depth + 1) * 12 + 4 + 4 + 6}px`,
            paddingRight: "8px",
          }}
          className="py-0.5"
        >
          <div className="flex items-center gap-1.5 px-2 h-6 bg-input/20 border border-primary/50 rounded-xs">
            <span className="text-muted-foreground text-[9px]">
              {creatingChild === "file" ? "📄" : "📁"}
            </span>
            <input
              ref={childInputRef}
              data-ocid={`file_tree.new_child_input.${itemIndex}`}
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onBlur={commitChildCreate}
              onKeyDown={handleChildKeyDown}
              placeholder={
                creatingChild === "file" ? "filename.ts" : "folder-name"
              }
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
