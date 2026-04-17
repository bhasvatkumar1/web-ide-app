export interface FileIconConfig {
  icon: string;
  color: string;
  bgColor: string;
}

const extensionMap: Record<string, FileIconConfig> = {
  js: { icon: "JS", color: "#f7df1e", bgColor: "rgba(247,223,30,0.15)" },
  jsx: { icon: "JSX", color: "#f7df1e", bgColor: "rgba(247,223,30,0.15)" },
  ts: { icon: "TS", color: "#3178c6", bgColor: "rgba(49,120,198,0.15)" },
  tsx: { icon: "TSX", color: "#3178c6", bgColor: "rgba(49,120,198,0.15)" },
  css: { icon: "CSS", color: "#42a5f5", bgColor: "rgba(66,165,245,0.15)" },
  scss: { icon: "CSS", color: "#ce76a9", bgColor: "rgba(206,118,169,0.15)" },
  html: { icon: "HTML", color: "#e44d26", bgColor: "rgba(228,77,38,0.15)" },
  json: { icon: "JSON", color: "#f7df1e", bgColor: "rgba(247,223,30,0.15)" },
  md: { icon: "MD", color: "#8b9dc3", bgColor: "rgba(139,157,195,0.15)" },
  mdx: { icon: "MDX", color: "#8b9dc3", bgColor: "rgba(139,157,195,0.15)" },
  py: { icon: "PY", color: "#4caf50", bgColor: "rgba(76,175,80,0.15)" },
  go: { icon: "GO", color: "#00bcd4", bgColor: "rgba(0,188,212,0.15)" },
  rs: { icon: "RS", color: "#ff6b35", bgColor: "rgba(255,107,53,0.15)" },
  java: { icon: "JV", color: "#f89820", bgColor: "rgba(248,152,32,0.15)" },
  rb: { icon: "RB", color: "#cc342d", bgColor: "rgba(204,52,45,0.15)" },
  php: { icon: "PHP", color: "#8892be", bgColor: "rgba(136,146,190,0.15)" },
  c: { icon: "C", color: "#a8b9cc", bgColor: "rgba(168,185,204,0.15)" },
  cpp: { icon: "C++", color: "#a8b9cc", bgColor: "rgba(168,185,204,0.15)" },
  cs: { icon: "C#", color: "#9b59b6", bgColor: "rgba(155,89,182,0.15)" },
  sh: { icon: "SH", color: "#4caf50", bgColor: "rgba(76,175,80,0.15)" },
  bash: { icon: "SH", color: "#4caf50", bgColor: "rgba(76,175,80,0.15)" },
  yaml: { icon: "YML", color: "#ff5252", bgColor: "rgba(255,82,82,0.15)" },
  yml: { icon: "YML", color: "#ff5252", bgColor: "rgba(255,82,82,0.15)" },
  toml: { icon: "TOML", color: "#ff5252", bgColor: "rgba(255,82,82,0.15)" },
  env: { icon: "ENV", color: "#4caf50", bgColor: "rgba(76,175,80,0.15)" },
  svg: { icon: "SVG", color: "#ffb300", bgColor: "rgba(255,179,0,0.15)" },
  png: { icon: "IMG", color: "#ce76a9", bgColor: "rgba(206,118,169,0.15)" },
  jpg: { icon: "IMG", color: "#ce76a9", bgColor: "rgba(206,118,169,0.15)" },
  jpeg: { icon: "IMG", color: "#ce76a9", bgColor: "rgba(206,118,169,0.15)" },
  gif: { icon: "GIF", color: "#ce76a9", bgColor: "rgba(206,118,169,0.15)" },
  mo: { icon: "MO", color: "#00bcd4", bgColor: "rgba(0,188,212,0.15)" },
  did: { icon: "DID", color: "#8b9dc3", bgColor: "rgba(139,157,195,0.15)" },
};

const defaultFile: FileIconConfig = {
  icon: "FILE",
  color: "#9e9e9e",
  bgColor: "rgba(158,158,158,0.15)",
};

export const folderOpen: FileIconConfig = {
  icon: "DIR",
  color: "#f7df1e",
  bgColor: "rgba(247,223,30,0.15)",
};

export const folderClosed: FileIconConfig = {
  icon: "DIR",
  color: "#9e9e9e",
  bgColor: "rgba(158,158,158,0.15)",
};

export function getFileIcon(
  extension?: string,
  isFolder = false,
  isOpen = false,
): FileIconConfig {
  if (isFolder) return isOpen ? folderOpen : folderClosed;
  if (!extension) return defaultFile;
  return extensionMap[extension.toLowerCase()] ?? defaultFile;
}

export function getExtensionFromName(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export function getMonacoLanguage(extension?: string): string {
  const langMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    md: "markdown",
    mdx: "markdown",
    py: "python",
    go: "go",
    rs: "rust",
    java: "java",
    rb: "ruby",
    php: "php",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    sh: "shell",
    bash: "shell",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    svg: "xml",
    mo: "motoko",
    did: "candid",
  };
  return langMap[extension?.toLowerCase() ?? ""] ?? "plaintext";
}
