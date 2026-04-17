import { getMonacoLanguage } from "@/lib/fileIcons";
import { useIDEStore } from "@/store/useIDEStore";
import Editor, { type OnMount } from "@monaco-editor/react";
import { useCallback, useEffect, useRef } from "react";

interface MonacoEditorProps {
  fileId: string;
  tabId: string;
  content: string;
  extension?: string;
}

export function MonacoEditor({
  fileId,
  tabId,
  content,
  extension,
}: MonacoEditorProps) {
  const { settings, updateFileContent, markTabDirty } = useIDEStore();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);
  const language = getMonacoLanguage(extension);

  const handleSave = useCallback(() => {
    markTabDirty(tabId, false);
  }, [tabId, markTabDirty]);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Ctrl+S save keybinding inside Monaco
      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        handleSave,
      );

      // Ensure editor uses the VS Code dark theme
      monaco.editor.setTheme("vs-dark");

      // Focus the editor
      editor.focus();
    },
    [handleSave],
  );

  const handleChange = useCallback(
    (value: string | undefined) => {
      const newContent = value ?? "";
      updateFileContent(fileId, newContent);
      markTabDirty(tabId, true);
    },
    [fileId, tabId, updateFileContent, markTabDirty],
  );

  // Re-focus when the mounted editor changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const timeout = setTimeout(() => {
      editorRef.current?.focus();
    }, 50);
    return () => clearTimeout(timeout);
  });

  return (
    <div
      data-ocid="monaco_editor"
      className="flex-1 overflow-hidden min-h-0"
      style={{ height: "100%" }}
    >
      <Editor
        height="100%"
        language={language}
        value={content}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize: settings.fontSize,
          fontFamily: `"Geist Mono", "JetBrains Mono", "Fira Code", monospace`,
          fontLigatures: true,
          minimap: { enabled: settings.showMinimap },
          wordWrap: settings.wordWrap ? "on" : "off",
          tabSize: settings.tabSize,
          lineNumbers: "on",
          folding: true,
          bracketPairColorization: { enabled: true },
          scrollBeyondLastLine: false,
          renderLineHighlight: "all",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          cursorBlinking: "smooth",
          padding: { top: 8, bottom: 8 },
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: false,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          parameterHints: { enabled: true },
          colorDecorators: true,
          renderWhitespace: "selection",
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          stickyScroll: { enabled: true },
          overviewRulerLanes: 3,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            useShadows: false,
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
}
