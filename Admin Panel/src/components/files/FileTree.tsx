"use client";

import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import type { FileNode } from "@/types/file.types";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  nodes: FileNode[];
  currentPath: string;
  onSelect: (path: string) => void;
}

function TreeNode({
  node,
  currentPath,
  onSelect,
  depth = 0,
}: {
  node: FileNode;
  currentPath: string;
  onSelect: (path: string) => void;
  depth?: number;
}) {
  if (node.type !== "folder") return null;

  const isActive = currentPath === node.path;
  const isParent = currentPath.startsWith(node.path + "/");
  const hasChildren = node.children?.some((c) => c.type === "folder");

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary",
          isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
          !isActive && isParent && "text-primary"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          isActive || isParent ? (
            <FolderOpen className="h-4 w-4 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 shrink-0" />
          )
        ) : (
          <Folder className="h-4 w-4 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
        {hasChildren && !isActive && (
          <ChevronRight className="ml-auto h-3 w-3 shrink-0 opacity-50" />
        )}
      </button>
      {node.children?.map((child) =>
        child.type === "folder" ? (
          <TreeNode
            key={child.id}
            node={child}
            currentPath={currentPath}
            onSelect={onSelect}
            depth={depth + 1}
          />
        ) : null
      )}
    </div>
  );
}

export function FileTree({ nodes, currentPath, onSelect }: FileTreeProps) {
  return (
    <div className="space-y-0.5 p-2">
      <button
        type="button"
        onClick={() => onSelect("/")}
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary",
          currentPath === "/" && "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <FolderOpen className="h-4 w-4" />
        <span>Root</span>
      </button>
      {nodes[0]?.children?.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          currentPath={currentPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
