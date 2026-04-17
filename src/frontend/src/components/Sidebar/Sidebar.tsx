import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import { FolderOpen, MessageSquare } from "lucide-react";
import { useState } from "react";
import { ChatPanel } from "../Chat/ChatPanel";
import { FileSearch } from "./FileSearch";
import { FileTree } from "./FileTree";
import { SidebarHeader } from "./SidebarHeader";

export function Sidebar() {
  const { sidebarOpen, activeSidebarTab, setActiveSidebarTab } = useIDEStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [collapseAllSignal, setCollapseAllSignal] = useState(0);

  if (!sidebarOpen) return null;

  const isFiles = activeSidebarTab === "files";
  const isSearching = isFiles && searchQuery.trim() !== "";

  function handleCollapseAll() {
    setCollapseAllSignal((s) => s + 1);
  }

  return (
    <div
      data-ocid="sidebar_panel"
      className="w-60 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden"
    >
      {/* Tab strip */}
      <div className="flex items-center shrink-0 border-b border-sidebar-border bg-sidebar">
        <button
          type="button"
          data-ocid="sidebar.files_tab"
          aria-label="Files"
          title="Explorer"
          onClick={() => setActiveSidebarTab("files")}
          className={cn(
            "flex items-center gap-1.5 px-3 h-9 text-[10px] font-medium uppercase tracking-widest border-b-2 transition-colors duration-150",
            isFiles
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <FolderOpen size={12} />
          Files
        </button>
        <button
          type="button"
          data-ocid="sidebar.chat_tab"
          aria-label="Chat"
          title="Chat"
          onClick={() => setActiveSidebarTab("chat")}
          className={cn(
            "flex items-center gap-1.5 px-3 h-9 text-[10px] font-medium uppercase tracking-widest border-b-2 transition-colors duration-150",
            !isFiles
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <MessageSquare size={12} />
          Chat
        </button>
      </div>

      {/* Content */}
      {isFiles ? (
        <>
          <SidebarHeader onCollapseAll={handleCollapseAll} />
          <FileSearch query={searchQuery} onChange={setSearchQuery} />
          {!isSearching && <FileTree collapseAllSignal={collapseAllSignal} />}
        </>
      ) : (
        <ChatPanel />
      )}
    </div>
  );
}
