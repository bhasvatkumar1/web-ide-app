export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileNode[];
  parentId?: string;
  extension?: string;
  isOpen?: boolean;
}

export interface EditorTab {
  id: string;
  fileId: string;
  isDirty: boolean;
}

export type ThemeType = "dark" | "light" | "high-contrast";

export interface AppSettings {
  fontSize: number;
  fontFamily: string;
  autoSave: boolean;
  tabSize: number;
  theme: ThemeType;
  wordWrap: boolean;
  showMinimap: boolean;
  accentColor: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export type SidebarTab = "files" | "chat";

export interface IDEState {
  files: FileNode[];
  openTabs: EditorTab[];
  activeTabId: string | null;
  sidebarOpen: boolean;
  activeSidebarTab: SidebarTab;
  settings: AppSettings;
  chatMessages: ChatMessage[];
}

export type IDEAction =
  | { type: "SET_FILES"; payload: FileNode[] }
  | { type: "ADD_FILE"; payload: FileNode }
  | { type: "UPDATE_FILE"; payload: { id: string; content: string } }
  | { type: "RENAME_NODE"; payload: { id: string; name: string } }
  | { type: "DELETE_NODE"; payload: string }
  | { type: "TOGGLE_FOLDER"; payload: string }
  | { type: "OPEN_TAB"; payload: EditorTab }
  | { type: "CLOSE_TAB"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: string | null }
  | { type: "MARK_TAB_DIRTY"; payload: { tabId: string; isDirty: boolean } }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR_OPEN"; payload: boolean }
  | { type: "SET_ACTIVE_SIDEBAR_TAB"; payload: SidebarTab }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "CLEAR_CHAT" };
