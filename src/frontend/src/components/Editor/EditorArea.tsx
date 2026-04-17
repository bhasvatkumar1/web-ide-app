import { useIDEStore } from "@/store/useIDEStore";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { EditorTabs } from "./EditorTabs";
import { MonacoEditor } from "./MonacoEditor";

function WelcomeScreen() {
  const shortcuts = [
    { keys: "Ctrl+N", description: "New file" },
    { keys: "Ctrl+P", description: "Quick open" },
    { keys: "Ctrl+Shift+P", description: "Command palette" },
    { keys: "Ctrl+B", description: "Toggle sidebar" },
    { keys: "Ctrl+Tab", description: "Cycle tabs" },
    { keys: "Ctrl+W", description: "Close tab" },
    { keys: "Ctrl+S", description: "Save file" },
    { keys: "Ctrl+F", description: "Find in file" },
  ];

  return (
    <div
      data-ocid="editor_welcome"
      className="flex-1 flex flex-col items-center justify-center bg-background text-foreground select-none"
    >
      <div className="flex flex-col items-center gap-8 max-w-sm w-full px-8">
        {/* Logo / wordmark */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-mono font-bold text-primary">
            {"</>"}
          </div>
          <h1 className="text-xl font-display font-semibold text-foreground tracking-tight">
            Welcome to Web IDE
          </h1>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Open a file from the explorer or create a new one to start editing.
          </p>
        </div>

        {/* Shortcut grid */}
        <div className="w-full">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Keyboard Shortcuts
          </p>
          <div className="grid grid-cols-1 gap-0.5">
            {shortcuts.map(({ keys, description }) => (
              <div
                key={keys}
                className="flex items-center justify-between px-3 py-1.5 rounded-xs hover:bg-muted/20 transition-colors duration-100"
              >
                <span className="text-xs text-muted-foreground">
                  {description}
                </span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-card border border-border rounded-xs text-foreground/70">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getFileNode(
  nodes: import("@/types").FileNode[],
  id: string,
): import("@/types").FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = getFileNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function EditorArea() {
  const { openTabs, activeTabId, files } = useIDEStore();

  const activeTab = openTabs.find((t) => t.id === activeTabId) ?? null;
  const activeFile = activeTab ? getFileNode(files, activeTab.fileId) : null;

  return (
    <div
      data-ocid="editor_area"
      className="flex-1 flex flex-col bg-background overflow-hidden min-w-0"
    >
      {/* Tab bar — always rendered, hides itself when no tabs */}
      <EditorTabs />

      {/* Breadcrumb */}
      {activeFile && <BreadcrumbNav activeFileId={activeFile.id} />}

      {/* Editor content */}
      {activeFile ? (
        <MonacoEditor
          key={activeTab!.id}
          fileId={activeFile.id}
          tabId={activeTab!.id}
          content={activeFile.content ?? ""}
          extension={activeFile.extension}
        />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
}
