import { getMonacoLanguage } from "@/lib/fileIcons";
import { useIDEStore } from "@/store/useIDEStore";
import type { FileNode } from "@/types";
import { useEffect, useState } from "react";

interface CursorPosition {
  line: number;
  column: number;
}

// Global cursor position — updated by MonacoEditor via event
let globalCursorPosition: CursorPosition = { line: 1, column: 1 };

export function updateCursorPosition(pos: CursorPosition) {
  globalCursorPosition = pos;
}

function getFileNode(nodes: FileNode[], id: string): FileNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const found = getFileNode(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

function getLanguageLabel(extension?: string): string {
  const langMap: Record<string, string> = {
    js: "JavaScript",
    jsx: "JavaScript JSX",
    ts: "TypeScript",
    tsx: "TypeScript JSX",
    css: "CSS",
    scss: "SCSS",
    html: "HTML",
    json: "JSON",
    md: "Markdown",
    mdx: "MDX",
    py: "Python",
    go: "Go",
    rs: "Rust",
    java: "Java",
    rb: "Ruby",
    php: "PHP",
    c: "C",
    cpp: "C++",
    cs: "C#",
    sh: "Shell Script",
    bash: "Bash",
    yaml: "YAML",
    yml: "YAML",
    toml: "TOML",
    svg: "XML",
    mo: "Motoko",
    did: "Candid",
  };
  return langMap[extension?.toLowerCase() ?? ""] ?? "Plain Text";
}

export function StatusBar() {
  const { openTabs, activeTabId, settings, files } = useIDEStore();
  const [cursor, setCursor] = useState<CursorPosition>({ line: 1, column: 1 });

  const activeTab = openTabs.find((t) => t.id === activeTabId) ?? null;
  const activeFile = activeTab ? getFileNode(files, activeTab.fileId) : null;

  // Poll cursor position on a lightweight interval
  useEffect(() => {
    const id = setInterval(() => {
      setCursor({ ...globalCursorPosition });
    }, 200);
    return () => clearInterval(id);
  }, []);

  const languageLabel = getLanguageLabel(activeFile?.extension);
  const eolLabel = "LF";
  const encodingLabel = "UTF-8";
  const indentLabel = `Spaces: ${settings.tabSize}`;

  return (
    <div
      data-ocid="status_bar"
      aria-label="Editor status bar"
      className="flex items-center justify-between h-6 px-3 bg-primary text-primary-foreground text-xs shrink-0 gap-2 select-none"
    >
      {/* Left section */}
      <div className="flex items-center gap-4 min-w-0">
        <span
          data-ocid="status_bar.branch"
          className="flex items-center gap-1 opacity-90 font-medium"
        >
          <span aria-hidden="true">⎇</span>
          <span className="truncate max-w-[120px]">Web IDE</span>
        </span>

        {activeFile && (
          <span
            data-ocid="status_bar.filename"
            className="opacity-75 truncate max-w-[200px]"
            title={activeFile.name}
          >
            {activeFile.name}
            {activeTab?.isDirty ? " •" : ""}
          </span>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 shrink-0">
        {activeFile && (
          <>
            <button
              type="button"
              data-ocid="status_bar.cursor_position"
              title="Go to line/column"
              className="opacity-80 hover:opacity-100 transition-opacity duration-100 tabular-nums"
            >
              Ln {cursor.line}, Col {cursor.column}
            </button>

            <button
              type="button"
              data-ocid="status_bar.indent"
              title="Select indentation"
              className="opacity-80 hover:opacity-100 transition-opacity duration-100"
            >
              {indentLabel}
            </button>

            <button
              type="button"
              data-ocid="status_bar.encoding"
              title="Select encoding"
              className="opacity-80 hover:opacity-100 transition-opacity duration-100"
            >
              {encodingLabel}
            </button>

            <button
              type="button"
              data-ocid="status_bar.eol"
              title="Select end of line sequence"
              className="opacity-80 hover:opacity-100 transition-opacity duration-100"
            >
              {eolLabel}
            </button>

            <button
              type="button"
              data-ocid="status_bar.language"
              title="Select language mode"
              className="opacity-90 hover:opacity-100 font-medium transition-opacity duration-100"
            >
              {languageLabel}
            </button>
          </>
        )}

        {!activeFile && (
          <span data-ocid="status_bar.no_file" className="opacity-60">
            No file open
          </span>
        )}
      </div>
    </div>
  );
}
