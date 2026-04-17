import { cn } from "@/lib/utils";
import { useIDEStore } from "@/store/useIDEStore";
import type { AppSettings, ThemeType } from "@/types";
import { Code2, Keyboard, Palette, X } from "lucide-react";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "editor" | "appearance" | "keybindings";

const FONT_FAMILIES = [
  { label: "Fira Code", value: "Fira Code, monospace" },
  { label: "Monaco", value: "Monaco, monospace" },
  { label: "Consolas", value: "Consolas, monospace" },
  { label: "Geist Mono", value: "Geist Mono, monospace" },
  { label: "JetBrains Mono", value: "JetBrains Mono, monospace" },
];

const ACCENT_COLORS: { label: string; value: string }[] = [
  { label: "Electric Blue", value: "#007acc" },
  { label: "Indigo", value: "#6366f1" },
  { label: "Emerald", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Violet", value: "#8b5cf6" },
];

const KEYBINDINGS: { label: string; shortcut: string; category: string }[] = [
  { label: "New File", shortcut: "Ctrl+N", category: "File" },
  { label: "Save File", shortcut: "Ctrl+S", category: "File" },
  { label: "Close Tab", shortcut: "Ctrl+W", category: "File" },
  { label: "Quick Open", shortcut: "Ctrl+P", category: "File" },
  { label: "Command Palette", shortcut: "Ctrl+Shift+P", category: "File" },
  { label: "Undo", shortcut: "Ctrl+Z", category: "Edit" },
  { label: "Redo", shortcut: "Ctrl+Y", category: "Edit" },
  { label: "Cut", shortcut: "Ctrl+X", category: "Edit" },
  { label: "Copy", shortcut: "Ctrl+C", category: "Edit" },
  { label: "Paste", shortcut: "Ctrl+V", category: "Edit" },
  { label: "Select All", shortcut: "Ctrl+A", category: "Edit" },
  { label: "Find in File", shortcut: "Ctrl+F", category: "Edit" },
  { label: "Replace", shortcut: "Ctrl+H", category: "Edit" },
  { label: "Toggle Sidebar", shortcut: "Ctrl+B", category: "View" },
  { label: "Next Tab", shortcut: "Ctrl+Tab", category: "View" },
  { label: "Open Settings", shortcut: "Ctrl+,", category: "Settings" },
  {
    label: "Keyboard Shortcuts",
    shortcut: "Ctrl+K Ctrl+S",
    category: "Settings",
  },
];

// ──────────────────────────────────────────────────────────
// Section components
// ──────────────────────────────────────────────────────────
function EditorSettings({
  settings,
  update,
}: { settings: AppSettings; update: (s: Partial<AppSettings>) => void }) {
  return (
    <div className="space-y-6">
      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="settings-font-size"
            className="text-xs font-medium text-foreground"
          >
            Font Size
          </label>
          <span className="text-xs text-primary font-mono">
            {settings.fontSize}px
          </span>
        </div>
        <input
          id="settings-font-size"
          type="range"
          min={10}
          max={24}
          value={settings.fontSize}
          onChange={(e) => update({ fontSize: Number(e.target.value) })}
          data-ocid="settings.font_size.input"
          className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground/60">
          <span>10px</span>
          <span>24px</span>
        </div>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <label
          htmlFor="settings-font-family"
          className="text-xs font-medium text-foreground"
        >
          Font Family
        </label>
        <select
          id="settings-font-family"
          value={settings.fontFamily}
          onChange={(e) => update({ fontFamily: e.target.value })}
          data-ocid="settings.font_family.select"
          className="w-full bg-background border border-input text-foreground text-xs px-3 py-2 outline-none focus:border-primary transition-colors"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Size */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground">Tab Size</p>
        <div className="flex gap-2">
          {[2, 4, 8].map((size) => (
            <button
              key={size}
              type="button"
              data-ocid={`settings.tab_size.${size}`}
              onClick={() => update({ tabSize: size })}
              className={cn(
                "flex-1 py-1.5 text-xs border transition-colors",
                settings.tabSize === size
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {size} spaces
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {[
          {
            key: "wordWrap" as const,
            label: "Word Wrap",
            description: "Wrap long lines to fit viewport",
          },
          {
            key: "autoSave" as const,
            label: "Auto Save",
            description: "Automatically save file changes",
          },
          {
            key: "showMinimap" as const,
            label: "Show Minimap",
            description: "Display code overview on scrollbar",
          },
        ].map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div>
              <div className="text-xs font-medium text-foreground">{label}</div>
              <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                {description}
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings[key] as boolean}
              aria-label={label}
              data-ocid={`settings.${key}.switch`}
              onClick={() => update({ [key]: !(settings[key] as boolean) })}
              className={cn(
                "relative w-9 h-5 rounded-full border transition-colors duration-200",
                (settings[key] as boolean)
                  ? "bg-primary border-primary"
                  : "bg-muted border-border",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform duration-200 shadow-sm",
                  (settings[key] as boolean)
                    ? "translate-x-4"
                    : "translate-x-0.5",
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceSettings({
  settings,
  update,
}: { settings: AppSettings; update: (s: Partial<AppSettings>) => void }) {
  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground">Color Theme</p>
        <div className="space-y-1.5">
          {(["dark", "light", "high-contrast"] as ThemeType[]).map((theme) => {
            const labels = {
              dark: "Dark",
              light: "Light",
              "high-contrast": "High Contrast",
            };
            const descriptions = {
              dark: "VS Code dark theme",
              light: "Light mode for bright environments",
              "high-contrast": "Maximum contrast for accessibility",
            };
            return (
              <button
                key={theme}
                type="button"
                data-ocid={`settings.theme.${theme}`}
                onClick={() => update({ theme })}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 border text-left text-xs transition-colors",
                  settings.theme === theme
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                <div>
                  <div className="font-medium">{labels[theme]}</div>
                  <div className="text-[10px] opacity-60 mt-0.5">
                    {descriptions[theme]}
                  </div>
                </div>
                {settings.theme === theme && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground">Accent Color</p>
        <div className="flex gap-2 flex-wrap">
          {ACCENT_COLORS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              title={label}
              aria-label={`Set accent color to ${label}`}
              data-ocid={`settings.accent.${label.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => update({ accentColor: value })}
              className={cn(
                "w-8 h-8 rounded border-2 transition-all duration-150",
                settings.accentColor === value
                  ? "border-foreground scale-110 shadow-md"
                  : "border-transparent hover:scale-105 hover:border-foreground/40",
              )}
              style={{ backgroundColor: value }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div
            className="w-6 h-6 rounded border border-border shrink-0"
            style={{ backgroundColor: settings.accentColor }}
          />
          <span className="text-xs text-muted-foreground font-mono">
            {settings.accentColor}
          </span>
        </div>
      </div>
    </div>
  );
}

function KeybindingsTab() {
  const categories = [...new Set(KEYBINDINGS.map((k) => k.category))];
  return (
    <div className="space-y-4">
      {categories.map((cat) => (
        <div key={cat}>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-1.5 px-1">
            {cat}
          </div>
          <div className="border border-border overflow-hidden">
            {KEYBINDINGS.filter((k) => k.category === cat).map((kb, i) => (
              <div
                key={kb.label}
                data-ocid={`settings.keybinding.item.${i + 1}`}
                className="flex items-center justify-between px-3 py-2 text-xs border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <span className="text-foreground/80">{kb.label}</span>
                <kbd className="px-2 py-0.5 text-[10px] font-mono bg-muted border border-border text-muted-foreground">
                  {kb.shortcut}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground/50 pt-2 pb-1">
        Keybindings are read-only in this version.
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Main modal
// ──────────────────────────────────────────────────────────
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("editor");
  const { settings, updateSettings } = useIDEStore();

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "editor", label: "Editor", icon: <Code2 size={13} /> },
    { id: "appearance", label: "Appearance", icon: <Palette size={13} /> },
    { id: "keybindings", label: "Keybindings", icon: <Keyboard size={13} /> },
  ];

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      data-ocid="settings.dialog"
      onClick={handleBackdropClick}
      onKeyDown={() => {}}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-[640px] bg-popover border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <h2 className="text-sm font-medium text-foreground">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            data-ocid="settings.close_button"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tabs sidebar */}
          <div className="w-36 shrink-0 border-r border-border bg-card/50 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-ocid={`settings.${tab.id}.tab`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors",
                  activeTab === tab.id
                    ? "bg-primary/15 text-primary border-l-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border-l-2 border-transparent",
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
            {activeTab === "editor" && (
              <EditorSettings settings={settings} update={updateSettings} />
            )}
            {activeTab === "appearance" && (
              <AppearanceSettings settings={settings} update={updateSettings} />
            )}
            {activeTab === "keybindings" && <KeybindingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
