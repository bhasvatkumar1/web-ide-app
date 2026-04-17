import type {
  AppSettings,
  ChatMessage,
  EditorTab,
  FileNode,
  SidebarTab,
} from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface IDEStore {
  // State
  files: FileNode[];
  openTabs: EditorTab[];
  activeTabId: string | null;
  sidebarOpen: boolean;
  activeSidebarTab: SidebarTab;
  settings: AppSettings;
  chatMessages: ChatMessage[];

  // File actions
  setFiles: (files: FileNode[]) => void;
  addFile: (file: FileNode) => void;
  updateFileContent: (id: string, content: string) => void;
  renameNode: (id: string, name: string) => void;
  deleteNode: (id: string) => void;
  toggleFolder: (id: string) => void;

  // Tab actions
  openTab: (tab: EditorTab) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;
  markTabDirty: (tabId: string, isDirty: boolean) => void;
  openFileInTab: (fileId: string) => void;

  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSidebarTab: (tab: SidebarTab) => void;

  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Chat actions
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
}

const defaultSettings: AppSettings = {
  fontSize: 14,
  fontFamily: "JetBrains Mono, Fira Code, monospace",
  autoSave: true,
  tabSize: 2,
  theme: "dark",
  wordWrap: true,
  showMinimap: false,
  accentColor: "#007acc",
};

const defaultFiles: FileNode[] = [
  {
    id: "folder-src",
    name: "src",
    type: "folder",
    parentId: undefined,
    isOpen: true,
    children: [
      {
        id: "file-app-tsx",
        name: "App.tsx",
        type: "file",
        parentId: "folder-src",
        extension: "tsx",
        content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="flex items-center justify-center h-screen">\n      <h1 className="text-2xl font-bold">Hello World</h1>\n    </div>\n  );\n}\n`,
      },
      {
        id: "file-index-css",
        name: "index.css",
        type: "file",
        parentId: "folder-src",
        extension: "css",
        content:
          "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  margin: 0;\n  font-family: sans-serif;\n}\n",
      },
    ],
  },
  {
    id: "file-package-json",
    name: "package.json",
    type: "file",
    parentId: undefined,
    extension: "json",
    content: `{\n  "name": "my-app",\n  "version": "0.1.0",\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  }\n}\n`,
  },
  {
    id: "file-readme",
    name: "README.md",
    type: "file",
    parentId: undefined,
    extension: "md",
    content:
      "# My Project\n\nWelcome to my project. This is a web IDE built with React.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```\n",
  },
];

const defaultChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    role: "assistant",
    content: "Hello! I'm your AI coding assistant. How can I help you today?",
    timestamp: Date.now() - 60000,
  },
  {
    id: "msg-2",
    role: "user",
    content: "Can you help me understand this TypeScript error?",
    timestamp: Date.now() - 45000,
  },
  {
    id: "msg-3",
    role: "assistant",
    content:
      "Of course! Please paste the error message and the relevant code, and I'll help you diagnose and fix the issue.",
    timestamp: Date.now() - 30000,
  },
];

function deleteNodeFromTree(nodes: FileNode[], id: string): FileNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) =>
      n.children ? { ...n, children: deleteNodeFromTree(n.children, id) } : n,
    );
}

function updateNodeInTree(
  nodes: FileNode[],
  id: string,
  updater: (node: FileNode) => FileNode,
): FileNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n);
    if (n.children)
      return { ...n, children: updateNodeInTree(n.children, id, updater) };
    return n;
  });
}

export const useIDEStore = create<IDEStore>()(
  persist(
    (set, get) => ({
      files: defaultFiles,
      openTabs: [],
      activeTabId: null,
      sidebarOpen: true,
      activeSidebarTab: "files",
      settings: defaultSettings,
      chatMessages: defaultChatMessages,

      setFiles: (files) => set({ files }),

      addFile: (file) =>
        set((state) => {
          if (!file.parentId) {
            return { files: [...state.files, file] };
          }
          const updated = updateNodeInTree(
            state.files,
            file.parentId,
            (parent) => ({
              ...parent,
              children: [...(parent.children ?? []), file],
            }),
          );
          return { files: updated };
        }),

      updateFileContent: (id, content) =>
        set((state) => ({
          files: updateNodeInTree(state.files, id, (n) => ({ ...n, content })),
        })),

      renameNode: (id, name) =>
        set((state) => {
          const ext = name.includes(".") ? name.split(".").pop() : undefined;
          return {
            files: updateNodeInTree(state.files, id, (n) => ({
              ...n,
              name,
              extension: n.type === "file" ? ext : undefined,
            })),
          };
        }),

      deleteNode: (id) =>
        set((state) => {
          const newTabs = state.openTabs.filter((t) => t.fileId !== id);
          const newActiveTab =
            state.activeTabId &&
            state.openTabs.find((t) => t.id === state.activeTabId)?.fileId ===
              id
              ? (newTabs[newTabs.length - 1]?.id ?? null)
              : state.activeTabId;
          return {
            files: deleteNodeFromTree(state.files, id),
            openTabs: newTabs,
            activeTabId: newActiveTab,
          };
        }),

      toggleFolder: (id) =>
        set((state) => ({
          files: updateNodeInTree(state.files, id, (n) => ({
            ...n,
            isOpen: !n.isOpen,
          })),
        })),

      openTab: (tab) =>
        set((state) => {
          const existing = state.openTabs.find((t) => t.id === tab.id);
          if (existing) return { activeTabId: tab.id };
          return { openTabs: [...state.openTabs, tab], activeTabId: tab.id };
        }),

      closeTab: (tabId) =>
        set((state) => {
          const idx = state.openTabs.findIndex((t) => t.id === tabId);
          const newTabs = state.openTabs.filter((t) => t.id !== tabId);
          let newActiveId = state.activeTabId;
          if (state.activeTabId === tabId) {
            newActiveId = newTabs[idx]?.id ?? newTabs[idx - 1]?.id ?? null;
          }
          return { openTabs: newTabs, activeTabId: newActiveId };
        }),

      setActiveTab: (tabId) => set({ activeTabId: tabId }),

      markTabDirty: (tabId, isDirty) =>
        set((state) => ({
          openTabs: state.openTabs.map((t) =>
            t.id === tabId ? { ...t, isDirty } : t,
          ),
        })),

      openFileInTab: (fileId) => {
        const state = get();
        const existingTab = state.openTabs.find((t) => t.fileId === fileId);
        if (existingTab) {
          set({ activeTabId: existingTab.id });
          return;
        }
        const tab: EditorTab = {
          id: `tab-${fileId}-${Date.now()}`,
          fileId,
          isDirty: false,
        };
        set((s) => ({
          openTabs: [...s.openTabs, tab],
          activeTabId: tab.id,
        }));
      },

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

      updateSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings } })),

      addChatMessage: (message) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),

      clearChat: () => set({ chatMessages: [] }),
    }),
    {
      name: "web-ide-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        files: state.files,
        openTabs: state.openTabs,
        activeTabId: state.activeTabId,
        sidebarOpen: state.sidebarOpen,
        activeSidebarTab: state.activeSidebarTab,
        settings: state.settings,
        chatMessages: state.chatMessages,
      }),
    },
  ),
);
