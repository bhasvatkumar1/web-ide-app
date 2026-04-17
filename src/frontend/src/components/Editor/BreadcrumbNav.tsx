import { useIDEStore } from "@/store/useIDEStore";
import type { FileNode } from "@/types";

interface BreadcrumbNavProps {
  activeFileId: string;
}

function buildBreadcrumb(
  nodes: FileNode[],
  targetId: string,
  path: FileNode[] = [],
): FileNode[] | null {
  for (const node of nodes) {
    const current = [...path, node];
    if (node.id === targetId) return current;
    if (node.children) {
      const found = buildBreadcrumb(node.children, targetId, current);
      if (found) return found;
    }
  }
  return null;
}

export function BreadcrumbNav({ activeFileId }: BreadcrumbNavProps) {
  const { files, toggleFolder, openFileInTab } = useIDEStore();

  const crumbs = buildBreadcrumb(files, activeFileId) ?? [];

  if (crumbs.length === 0) return null;

  return (
    <nav
      data-ocid="breadcrumb_nav"
      aria-label="File path"
      className="breadcrumb flex items-center h-7 px-3 bg-card border-b border-border shrink-0 overflow-hidden"
    >
      {crumbs.map((node, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span
            key={node.id}
            data-ocid={`breadcrumb_nav.item.${idx + 1}`}
            className="breadcrumb-item flex items-center"
          >
            <button
              type="button"
              title={node.name}
              className={
                isLast
                  ? "text-foreground/90 font-medium truncate max-w-[180px] hover:text-foreground transition-colors duration-100"
                  : "text-muted-foreground truncate max-w-[120px] hover:text-foreground transition-colors duration-100"
              }
              onClick={() => {
                if (node.type === "folder") {
                  toggleFolder(node.id);
                } else {
                  openFileInTab(node.id);
                }
              }}
            >
              {node.name}
            </button>
            {!isLast && (
              <span
                className="breadcrumb-separator mx-1 text-muted-foreground/50 select-none"
                aria-hidden="true"
              >
                ›
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
