import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import {
  ChevronDown,
  ClipboardCopy,
  ClipboardPaste,
  FileCode2,
  FilePlus,
  FolderPlus,
  Info,
  Keyboard,
  LogOut,
  MapPin,
  MessageSquare,
  Moon,
  PanelLeft,
  Redo2,
  Replace,
  RotateCcw,
  Save,
  SaveAll,
  Scissors,
  Search,
  StretchHorizontal,
  Sun,
  Undo2,
  WrapText,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface MenuItemDef {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  dividerBefore?: boolean;
  action?: () => void;
}

interface MenuDef {
  id: string;
  label: string;
  items: MenuItemDef[];
}

interface MenuBarProps {
  onNewFile?: () => void;
  onNewFolder?: () => void;
  onSave?: () => void;
  onSaveAll?: () => void;
  onCloseTab?: () => void;
  onCloseAllTabs?: () => void;
  onFind?: () => void;
  onReplace?: () => void;
  onToggleSidebar?: () => void;
  onToggleChat?: () => void;
  onShowShortcuts?: () => void;
  onShowAbout?: () => void;
  onCommandPalette?: () => void;
  editorRef?: React.MutableRefObject<unknown>;
}

function useMenuBar(props: MenuBarProps) {
  const {
    settings,
    updateSettings,
    closeTab,
    openTabs,
    activeTabId,
    markTabDirty,
  } = useIDEStore();

  const save = useCallback(() => {
    if (activeTabId) markTabDirty(activeTabId, false);
    props.onSave?.();
  }, [activeTabId, markTabDirty, props]);

  const closeActive = useCallback(() => {
    if (activeTabId) closeTab(activeTabId);
    props.onCloseTab?.();
  }, [activeTabId, closeTab, props]);

  const closeAll = useCallback(() => {
    const ids = openTabs.map((t) => t.id);
    for (const id of ids) closeTab(id);
    props.onCloseAllTabs?.();
  }, [openTabs, closeTab, props]);

  const changeFontSize = useCallback(
    (delta: number) => {
      const next = Math.min(28, Math.max(10, settings.fontSize + delta));
      updateSettings({ fontSize: next });
    },
    [settings.fontSize, updateSettings],
  );

  const resetFontSize = useCallback(() => {
    updateSettings({ fontSize: 14 });
  }, [updateSettings]);

  const toggleMinimap = useCallback(() => {
    updateSettings({ showMinimap: !settings.showMinimap });
  }, [settings.showMinimap, updateSettings]);

  const toggleWordWrap = useCallback(() => {
    updateSettings({ wordWrap: !settings.wordWrap });
  }, [settings.wordWrap, updateSettings]);

  return {
    save,
    closeActive,
    closeAll,
    changeFontSize,
    resetFontSize,
    toggleMinimap,
    toggleWordWrap,
    settings,
    updateSettings,
  };
}

// ──────────────────────────────────────────────────────────
// Dropdown Menu
// ──────────────────────────────────────────────────────────
interface DropdownProps {
  items: MenuItemDef[];
  onClose: () => void;
}

function MenuDropdown({ items, onClose }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [focusIdx, setFocusIdx] = useState(0);

  const enabled = items.filter(
    (i) => !i.disabled && !("dividerBefore" in i && i.id === "__divider"),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((p) => Math.min(p + 1, enabled.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((p) => Math.max(p - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const item = enabled[focusIdx];
        if (item && !item.disabled) {
          item.action?.();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [enabled, focusIdx, onClose]);

  let enabledIdx = -1;

  return (
    <div
      ref={ref}
      tabIndex={-1}
      className="absolute top-full left-0 z-50 min-w-[220px] bg-popover border border-border shadow-lg py-1 outline-none"
      style={{ marginTop: 1 }}
    >
      {items.map((item) => {
        if (item.id.startsWith("__div")) {
          return <div key={item.id} className="my-1 border-t border-border" />;
        }
        if (!item.disabled) enabledIdx++;
        const isActive = !item.disabled && enabledIdx === focusIdx;
        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            data-ocid={`menubar.${item.id}`}
            onClick={() => {
              if (!item.disabled) {
                item.action?.();
                onClose();
              }
            }}
            onMouseEnter={() => {
              if (!item.disabled) setFocusIdx(enabledIdx);
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-[5px] text-left text-xs transition-colors duration-100",
              item.disabled
                ? "text-muted-foreground/40 cursor-not-allowed"
                : isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted/50",
            )}
          >
            <span className="w-4 h-4 flex items-center justify-center shrink-0 opacity-70">
              {item.icon}
            </span>
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span
                className={cn(
                  "text-[10px] ml-4 opacity-60",
                  isActive && "opacity-80",
                )}
              >
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// MenuBar
// ──────────────────────────────────────────────────────────
export function MenuBar(props: MenuBarProps) {
  const [open, setOpen] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const {
    save,
    closeActive,
    closeAll,
    changeFontSize,
    resetFontSize,
    toggleMinimap,
    toggleWordWrap,
    settings,
    updateSettings,
  } = useMenuBar(props);

  const close = useCallback(() => setOpen(null), []);

  // Click outside
  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    if (open) document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const menus: MenuDef[] = [
    {
      id: "file",
      label: "File",
      items: [
        {
          id: "new-file",
          label: "New File",
          icon: <FilePlus size={14} />,
          shortcut: "Ctrl+N",
          action: props.onNewFile,
        },
        {
          id: "new-folder",
          label: "New Folder",
          icon: <FolderPlus size={14} />,
          action: props.onNewFolder,
        },
        { id: "__div1", label: "", dividerBefore: true },
        {
          id: "save",
          label: "Save",
          icon: <Save size={14} />,
          shortcut: "Ctrl+S",
          action: save,
        },
        {
          id: "save-all",
          label: "Save All",
          icon: <SaveAll size={14} />,
          action: props.onSaveAll,
        },
        { id: "__div2", label: "", dividerBefore: true },
        {
          id: "close-tab",
          label: "Close Tab",
          icon: <X size={14} />,
          shortcut: "Ctrl+W",
          action: closeActive,
        },
        {
          id: "close-all",
          label: "Close All Tabs",
          icon: <XCircle size={14} />,
          action: closeAll,
        },
        { id: "__div3", label: "", dividerBefore: true },
        {
          id: "exit",
          label: "Exit",
          icon: <LogOut size={14} />,
          disabled: true,
        },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [
        {
          id: "undo",
          label: "Undo",
          icon: <Undo2 size={14} />,
          shortcut: "Ctrl+Z",
          action: () => document.execCommand("undo"),
        },
        {
          id: "redo",
          label: "Redo",
          icon: <Redo2 size={14} />,
          shortcut: "Ctrl+Y",
          action: () => document.execCommand("redo"),
        },
        { id: "__div1", label: "", dividerBefore: true },
        {
          id: "cut",
          label: "Cut",
          icon: <Scissors size={14} />,
          shortcut: "Ctrl+X",
          action: () => document.execCommand("cut"),
        },
        {
          id: "copy",
          label: "Copy",
          icon: <ClipboardCopy size={14} />,
          shortcut: "Ctrl+C",
          action: () => document.execCommand("copy"),
        },
        {
          id: "paste",
          label: "Paste",
          icon: <ClipboardPaste size={14} />,
          shortcut: "Ctrl+V",
          action: () => document.execCommand("paste"),
        },
        { id: "__div2", label: "", dividerBefore: true },
        {
          id: "select-all",
          label: "Select All",
          icon: <StretchHorizontal size={14} />,
          shortcut: "Ctrl+A",
          action: () => document.execCommand("selectAll"),
        },
        { id: "__div3", label: "", dividerBefore: true },
        {
          id: "find",
          label: "Find",
          icon: <Search size={14} />,
          shortcut: "Ctrl+F",
          action: props.onFind,
        },
        {
          id: "replace",
          label: "Replace",
          icon: <Replace size={14} />,
          shortcut: "Ctrl+H",
          action: props.onReplace,
        },
      ],
    },
    {
      id: "view",
      label: "View",
      items: [
        {
          id: "toggle-sidebar",
          label: "Toggle Sidebar",
          icon: <PanelLeft size={14} />,
          shortcut: "Ctrl+B",
          action: props.onToggleSidebar,
        },
        {
          id: "toggle-chat",
          label: "Toggle Chat Panel",
          icon: <MessageSquare size={14} />,
          action: props.onToggleChat,
        },
        { id: "__div1", label: "", dividerBefore: true },
        {
          id: "toggle-minimap",
          label: settings.showMinimap ? "Hide Minimap" : "Show Minimap",
          icon: <MapPin size={14} />,
          action: toggleMinimap,
        },
        {
          id: "toggle-word-wrap",
          label: settings.wordWrap ? "Disable Word Wrap" : "Enable Word Wrap",
          icon: <WrapText size={14} />,
          action: toggleWordWrap,
        },
        { id: "__div2", label: "", dividerBefore: true },
        {
          id: "font-larger",
          label: "Increase Font Size",
          icon: <ZoomIn size={14} />,
          action: () => changeFontSize(1),
        },
        {
          id: "font-smaller",
          label: "Decrease Font Size",
          icon: <ZoomOut size={14} />,
          action: () => changeFontSize(-1),
        },
        {
          id: "font-reset",
          label: "Reset Font Size",
          icon: <RotateCcw size={14} />,
          action: resetFontSize,
        },
      ],
    },
    {
      id: "help",
      label: "Help",
      items: [
        {
          id: "shortcuts",
          label: "Keyboard Shortcuts",
          icon: <Keyboard size={14} />,
          shortcut: "Ctrl+K Ctrl+S",
          action: props.onShowShortcuts,
        },
        {
          id: "about",
          label: "About Web IDE",
          icon: <Info size={14} />,
          action: props.onShowAbout,
        },
      ],
    },
  ];

  return (
    <div
      ref={barRef}
      data-ocid="menubar"
      className="flex items-center h-8 bg-card border-b border-border px-1 shrink-0 z-40 select-none"
    >
      {/* App icon */}
      <div className="flex items-center gap-1.5 px-2 mr-1 text-primary/80">
        <FileCode2 size={14} />
      </div>

      {menus.map((menu) => (
        <div key={menu.id} className="relative">
          <button
            type="button"
            data-ocid={`menubar.${menu.id}.menu`}
            onClick={() =>
              setOpen((prev) => (prev === menu.id ? null : menu.id))
            }
            className={cn(
              "flex items-center gap-1 px-3 h-8 text-xs transition-colors duration-100",
              open === menu.id
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {menu.label}
            <ChevronDown
              size={10}
              className={cn(
                "transition-transform duration-150",
                open === menu.id && "rotate-180",
              )}
            />
          </button>

          {open === menu.id && (
            <MenuDropdown items={menu.items} onClose={close} />
          )}
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme toggle buttons */}
      <div className="flex items-center gap-0.5 pr-1">
        <button
          type="button"
          data-ocid="menubar.theme_light.toggle"
          title="Light Mode"
          onClick={() => updateSettings({ theme: "light" })}
          className={cn(
            "flex items-center justify-center w-7 h-7 text-xs transition-colors duration-150 rounded-sm",
            settings.theme === "light"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Sun size={14} />
        </button>
        <button
          type="button"
          data-ocid="menubar.theme_dark.toggle"
          title="Dark Mode"
          onClick={() => updateSettings({ theme: "dark" })}
          className={cn(
            "flex items-center justify-center w-7 h-7 text-xs transition-colors duration-150 rounded-sm",
            settings.theme === "dark"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          <Moon size={14} />
        </button>
      </div>
    </div>
  );
}
