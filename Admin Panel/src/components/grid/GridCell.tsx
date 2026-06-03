import { cn } from "@/lib/utils";

interface GridCellProps {
  children: React.ReactNode;
  className?: string;
}

export function GridCell({ children, className }: GridCellProps) {
  return (
    <div className={cn("flex h-full w-full items-center py-1", className)}>
      {children}
    </div>
  );
}
