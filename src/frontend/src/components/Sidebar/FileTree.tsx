import { useFileSystem } from "@/hooks/useFileSystem";
import { useIDEStore } from "@/store/useIDEStore";
import type { FileNode } from "@/types";
import { useCallback, useRef } from "react";
import { FileTreeItem } from "./FileTreeItem";

interface FileTreeProps {
  collapseAllSignal: number;
}

let flatIndex = 0;

function TreeBranch({
  nodes,
  depth,
  activeFileId,
  onContextNewFile,
  onContextNewFolder,
}: {
  nodes: FileNode[];
  depth: number;
  activeFileId: string | null;
  onContextNewFile: (parentId: string) => void;
  onContextNewFolder: (parentId: string) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        flatIndex += 1;
        const myIndex = flatIndex;
        return (
          <div key={node.id}>
            <FileTreeItem
              node={node}
              depth={depth}
              isActive={node.type === "file" && node.id === activeFileId}
              onContextNewFile={onContextNewFile}
              onContextNewFolder={onContextNewFolder}
              itemIndex={myIndex}
            />
            {node.type === "folder" &&
              node.isOpen &&
              node.children &&
              node.children.length > 0 && (
                <TreeBranch
                  nodes={node.children}
                  depth={depth + 1}
                  activeFileId={activeFileId}
                  onContextNewFile={onContextNewFile}
                  onContextNewFolder={onContextNewFolder}
                />
              )}
          </div>
        );
      })}
    </>
  );
}

export function FileTree({ collapseAllSignal }: FileTreeProps) {
  const { files } = useFileSystem();
  const { openTabs, activeTabId, toggleFolder } = useIDEStore();
  const { createFile, createFolder } = useFileSystem();

  const activeFileId =
    openTabs.find((t) => t.id === activeTabId)?.fileId ?? null;

  // Collapse all folders recursively
  const prevSignal = useRef(-1);
  if (collapseAllSignal !== prevSignal.current && collapseAllSignal > 0) {
    prevSignal.current = collapseAllSignal;
    function collectOpenFolders(nodes: FileNode[]): string[] {
      const ids: string[] = [];
      for (const n of nodes) {
        if (n.type === "folder" && n.isOpen) {
          ids.push(n.id);
          if (n.children) ids.push(...collectOpenFolders(n.children));
        }
      }
      return ids;
    }
    const openIds = collectOpenFolders(files);
    for (const id of openIds) toggleFolder(id);
  }

  const handleContextNewFile = useCallback(
    (parentId: string) => {
      // Delegate creation to root level if parentId empty
      createFile("new-file.ts", parentId || undefined);
    },
    [createFile],
  );

  const handleContextNewFolder = useCallback(
    (parentId: string) => {
      createFolder("new-folder", parentId || undefined);
    },
    [createFolder],
  );

  if (files.length === 0) {
    return (
      <div
        data-ocid="file_tree.empty_state"
        className="flex flex-col items-center justify-center flex-1 gap-2 px-4 py-8 text-center"
      >
        <span className="text-2xl opacity-20">📂</span>
        <p className="text-xs text-muted-foreground">No files yet</p>
        <p className="text-[10px] text-muted-foreground/60">
          Use the buttons above to create files or folders
        </p>
      </div>
    );
  }

  // Reset flat counter before each render
  flatIndex = 0;

  return (
    <div
      role="tree"
      aria-label="File Explorer"
      data-ocid="file_tree.list"
      className="flex-1 overflow-y-auto scrollbar-thin py-0.5"
    >
      <TreeBranch
        nodes={files}
        depth={0}
        activeFileId={activeFileId}
        onContextNewFile={handleContextNewFile}
        onContextNewFolder={handleContextNewFolder}
      />
    </div>
  );
}
