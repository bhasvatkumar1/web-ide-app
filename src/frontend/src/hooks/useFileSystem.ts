import { getExtensionFromName } from "@/lib/fileIcons";
import { useIDEStore } from "@/store/useIDEStore";
import type { FileNode } from "@/types";
import { useCallback } from "react";

function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function flattenNodes(nodes: FileNode[]): FileNode[] {
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

export function useFileSystem() {
  const {
    files,
    addFile,
    renameNode,
    deleteNode,
    toggleFolder,
    updateFileContent,
  } = useIDEStore();

  const getFileById = useCallback(
    (id: string): FileNode | undefined => {
      return flattenNodes(files).find((n) => n.id === id);
    },
    [files],
  );

  const getAllFiles = useCallback((): FileNode[] => {
    return flattenNodes(files).filter((n) => n.type === "file");
  }, [files]);

  const createFile = useCallback(
    (name: string, parentId?: string): FileNode => {
      const extension = getExtensionFromName(name);
      const file: FileNode = {
        id: generateId(),
        name,
        type: "file",
        parentId,
        extension: extension || undefined,
        content: "",
      };
      addFile(file);
      return file;
    },
    [addFile],
  );

  const createFolder = useCallback(
    (name: string, parentId?: string): FileNode => {
      const folder: FileNode = {
        id: generateId(),
        name,
        type: "folder",
        parentId,
        children: [],
        isOpen: true,
      };
      addFile(folder);
      return folder;
    },
    [addFile],
  );

  const persistToLocalStorage = useCallback(() => {
    // Zustand persist middleware handles this automatically
    // This is a no-op but kept for API compatibility
    localStorage.setItem(
      "web-ide-files-backup",
      JSON.stringify({ files, timestamp: Date.now() }),
    );
  }, [files]);

  return {
    files,
    createFile,
    createFolder,
    renameNode,
    deleteNode,
    toggleFolder,
    getFileById,
    getAllFiles,
    updateFileContent,
    persistToLocalStorage,
  };
}
