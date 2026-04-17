import { ActivityBar } from "@/components/ActivityBar/ActivityBar";
import { CommandPalette } from "@/components/CommandPalette/CommandPalette";
import { QuickOpen } from "@/components/CommandPalette/QuickOpen";
import { EditorArea } from "@/components/Editor/EditorArea";
import { MenuBar } from "@/components/MenuBar/MenuBar";
import { SettingsModal } from "@/components/Settings/SettingsModal";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { StatusBar } from "@/components/StatusBar/StatusBar";
import { useFileSystem } from "@/hooks/useFileSystem";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import type { ThemeType } from "@/types";
import { Code2, Keyboard, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// ──────────────────────────────────────────────────────────
// Shortcuts modal
// ──────────────────────────────────────────────────────────
const SHORTCUTS = [
  { keys: "Ctrl+N", description: "New File", category: "File" },
  { keys: "Ctrl+S", description: "Save File", category: "File" },
  { keys: "Ctrl+W", description: "Close Tab", category: "File" },
  { keys: "Ctrl+P", description: "Quick Open", category: "File" },
  { keys: "Ctrl+Shift+P", description: "Command Palette", category: "File" },
  { keys: "Ctrl+,", description: "Open Settings", category: "File" },
  { keys: "Ctrl+Z", description: "Undo", category: "Edit" },
  { keys: "Ctrl+Y", description: "Redo", category: "Edit" },
  { keys: "Ctrl+X", description: "Cut", category: "Edit" },
  { keys: "Ctrl+C", description: "Copy", category: "Edit" },
  { keys: "Ctrl+V", description: "Paste", category: "Edit" },
  { keys: "Ctrl+A", description: "Select All", category: "Edit" },
  { keys: "Ctrl+F", description: "Find in File", category: "Edit" },
  { keys: "Ctrl+H", description: "Replace", category: "Edit" },
  { keys: "Ctrl+B", description: "Toggle Sidebar", category: "View" },
  { keys: "Ctrl+Tab", description: "Next Tab", category: "View" },
];

function ShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const categories = [...new Set(SHORTCUTS.map((s) => s.category))];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      data-ocid="shortcuts.dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={() => {}}
      role="presentation"
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-[520px] bg-popover border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Keyboard size={14} className="text-primary" />
            <h2 className="text-sm font-medium text-foreground">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="shortcuts.close_button"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="overflow-y-auto scrollbar-thin max-h-[60vh] p-4 space-y-4">
          {categories.map((cat) => (
            <div key={cat}>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                {cat}
              </div>
              <div className="border border-border overflow-hidden">
                {SHORTCUTS.filter((s) => s.category === cat).map((s, i) => (
                  <div
                    key={s.keys}
                    data-ocid={`shortcuts.item.${i + 1}`}
                    className="flex items-center justify-between px-3 py-2 text-xs border-b border-border/50 last:border-0 hover:bg-muted/20"
                  >
                    <span className="text-foreground/80">{s.description}</span>
                    <kbd className="px-2 py-0.5 text-[10px] font-mono bg-muted border border-border text-muted-foreground">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// About modal
// ──────────────────────────────────────────────────────────
function AboutModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      data-ocid="about.dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={() => {}}
      role="presentation"
    >
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-[380px] bg-popover border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Code2 size={14} className="text-primary" />
            <h2 className="text-sm font-medium text-foreground">
              About Web IDE
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="about.close_button"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-mono font-bold text-primary">
              {"</>"}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Web IDE
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Version 1.0.0
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
            <p>
              A VS Code-inspired web-based IDE with Monaco Editor, file
              management, and AI chat support.
            </p>
            <p>
              Built with React, TypeScript, Tailwind CSS, and Zustand for state
              persistence.
            </p>
          </div>
          <div className="pt-2 border-t border-border space-y-1">
            {[
              { label: "Editor", value: "Monaco Editor" },
              { label: "Framework", value: "React 19" },
              { label: "Styling", value: "Tailwind CSS" },
              { label: "Storage", value: "localStorage" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between text-[11px] py-0.5"
              >
                <span className="text-muted-foreground/70">{label}</span>
                <span className="text-foreground/80 font-mono">{value}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="about.confirm_button"
            className={cn(
              "w-full py-2 text-xs font-medium border border-primary/40 text-primary",
              "hover:bg-primary/10 transition-colors duration-150",
            )}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// App
// ──────────────────────────────────────────────────────────
export default function App() {
  const { toggleSidebar, setActiveSidebarTab, sidebarOpen, settings } =
    useIDEStore();
  const { createFile, createFolder } = useFileSystem();

  // Sync theme state → DOM class
  useEffect(() => {
    const root = document.documentElement;
    const theme = settings.theme as ThemeType;
    root.classList.remove("dark", "high-contrast");
    if (theme === "dark" || theme === "high-contrast") {
      root.classList.add(theme);
    }
  }, [settings.theme]);

  // Overlay state
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickOpenOpen, setQuickOpenOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const openCommandPalette = useCallback(() => {
    setQuickOpenOpen(false);
    setCommandPaletteOpen(true);
  }, []);

  const openQuickOpen = useCallback(() => {
    setCommandPaletteOpen(false);
    setQuickOpenOpen(true);
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);

  const handleNewFile = useCallback(() => {
    if (!sidebarOpen) toggleSidebar();
    setActiveSidebarTab("files");
    createFile("untitled.ts");
  }, [sidebarOpen, toggleSidebar, setActiveSidebarTab, createFile]);

  const handleNewFolder = useCallback(() => {
    if (!sidebarOpen) toggleSidebar();
    setActiveSidebarTab("files");
    createFolder("new-folder");
  }, [sidebarOpen, toggleSidebar, setActiveSidebarTab, createFolder]);

  const handleToggleChat = useCallback(() => {
    setActiveSidebarTab("chat");
    if (!sidebarOpen) toggleSidebar();
  }, [sidebarOpen, toggleSidebar, setActiveSidebarTab]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewFile: handleNewFile,
    onToggleSidebar: toggleSidebar,
    onCommandPalette: openCommandPalette,
    onQuickOpen: openQuickOpen,
  });

  // Additional shortcuts not in useKeyboardShortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      // Ctrl+, → settings
      if (ctrl && e.key === ",") {
        e.preventDefault();
        openSettings();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSettings]);

  return (
    <div
      data-ocid="ide.root"
      className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      {/* Menu Bar */}
      <MenuBar
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onCloseAllTabs={() => {}}
        onToggleSidebar={toggleSidebar}
        onToggleChat={handleToggleChat}
        onShowShortcuts={() => setShortcutsOpen(true)}
        onShowAbout={() => setAboutOpen(true)}
        onFind={() => {}}
        onReplace={() => {}}
        onCommandPalette={openCommandPalette}
      />

      {/* Main IDE layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar onOpenSettings={openSettings} />

        {/* Sidebar */}
        <Sidebar />

        {/* Editor Area */}
        <EditorArea />
      </div>

      {/* Status Bar */}
      <StatusBar />

      {/* Overlays */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onToggleSidebar={toggleSidebar}
        onToggleChat={handleToggleChat}
        onShowSettings={openSettings}
        onShowShortcuts={() => setShortcutsOpen(true)}
        onShowAbout={() => setAboutOpen(true)}
        onQuickOpen={openQuickOpen}
      />

      <QuickOpen
        isOpen={quickOpenOpen}
        onClose={() => setQuickOpenOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
