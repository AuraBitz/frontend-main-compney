"use client";

import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileBreadcrumbProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function FileBreadcrumb({ path, onNavigate }: FileBreadcrumbProps) {
  const segments =
    path === "/"
      ? []
      : path
          .split("/")
          .filter(Boolean)
          .map((segment, index, arr) => ({
            name: segment,
            path: "/" + arr.slice(0, index + 1).join("/"),
          }));

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      <button
        type="button"
        onClick={() => onNavigate("/")}
        className={cn(
          "flex items-center gap-1 rounded px-1.5 py-0.5 hover:bg-secondary hover:text-foreground",
          path === "/" && "text-foreground font-medium"
        )}
      >
        <Home className="h-3.5 w-3.5" />
        Root
      </button>
      {segments.map((segment) => (
        <span key={segment.path} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          <button
            type="button"
            onClick={() => onNavigate(segment.path)}
            className={cn(
              "rounded px-1.5 py-0.5 capitalize hover:bg-secondary hover:text-foreground",
              path === segment.path && "text-foreground font-medium"
            )}
          >
            {segment.name.replace(/-/g, " ")}
          </button>
        </span>
      ))}
    </nav>
  );
}
