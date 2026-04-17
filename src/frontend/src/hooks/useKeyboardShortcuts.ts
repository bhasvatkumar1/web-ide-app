import { useIDEStore } from "@/store/useIDEStore";
import { useCallback, useEffect } from "react";

interface ShortcutHandlers {
  onNewFile?: () => void;
  onSave?: () => void;
  onQuickOpen?: () => void;
  onCommandPalette?: () => void;
  onNextTab?: () => void;
  onCloseTab?: () => void;
  onFind?: () => void;
  onToggleSidebar?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const { openTabs, activeTabId, setActiveTab, closeTab, markTabDirty } =
    useIDEStore();

  const handleSave = useCallback(() => {
    if (!activeTabId) return;
    const tab = openTabs.find((t) => t.id === activeTabId);
    if (!tab) return;
    // Content is already updated via updateFileContent on change
    // Just mark as clean
    markTabDirty(activeTabId, false);
    if (handlers.onSave) handlers.onSave();
  }, [activeTabId, openTabs, markTabDirty, handlers]);

  const handleNextTab = useCallback(() => {
    if (openTabs.length === 0) return;
    const idx = openTabs.findIndex((t) => t.id === activeTabId);
    const nextIdx = (idx + 1) % openTabs.length;
    setActiveTab(openTabs[nextIdx].id);
    if (handlers.onNextTab) handlers.onNextTab();
  }, [openTabs, activeTabId, setActiveTab, handlers]);

  const handleCloseTab = useCallback(() => {
    if (!activeTabId) return;
    closeTab(activeTabId);
    if (handlers.onCloseTab) handlers.onCloseTab();
  }, [activeTabId, closeTab, handlers]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+N — new file
      if (ctrl && e.key === "n" && !e.shiftKey) {
        e.preventDefault();
        handlers.onNewFile?.();
        return;
      }

      // Ctrl+S — save
      if (ctrl && e.key === "s" && !e.shiftKey) {
        e.preventDefault();
        handleSave();
        return;
      }

      // Ctrl+P — quick open
      if (ctrl && e.key === "p" && !e.shiftKey) {
        e.preventDefault();
        handlers.onQuickOpen?.();
        return;
      }

      // Ctrl+Shift+P — command palette
      if (ctrl && e.key === "P" && e.shiftKey) {
        e.preventDefault();
        handlers.onCommandPalette?.();
        return;
      }

      // Ctrl+Tab — next tab
      if (ctrl && e.key === "Tab" && !e.shiftKey) {
        e.preventDefault();
        handleNextTab();
        return;
      }

      // Ctrl+W — close tab
      if (ctrl && e.key === "w") {
        e.preventDefault();
        handleCloseTab();
        return;
      }

      // Ctrl+F — find in editor
      if (ctrl && e.key === "f") {
        e.preventDefault();
        handlers.onFind?.();
        return;
      }

      // Ctrl+B — toggle sidebar
      if (ctrl && e.key === "b") {
        e.preventDefault();
        handlers.onToggleSidebar?.();
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, handleNextTab, handleCloseTab, handlers]);

  return {
    handleSave,
    handleNextTab,
    handleCloseTab,
  };
}
