import { PageHeader } from "@/layout/PageHeader";

interface PageShellProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} description={description} />
      {children}
    </div>
  );
}
