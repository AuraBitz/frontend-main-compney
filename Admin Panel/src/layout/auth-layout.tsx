export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-14 xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,oklch(1_0_0/0.12),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,oklch(0.2_0.05_264/0.35),transparent_50%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-8 rounded-3xl border border-primary-foreground/10"
        />

        <div className="relative z-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-primary-foreground/60">
            Company
          </p>
          <h1 className="font-heading mt-5 text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-primary-foreground xl:text-5xl">
            Admin
            <br />
            Portal
          </h1>
          <div className="mt-8 h-px w-14 bg-primary-foreground/25" />
          <p className="mt-8 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            Manage clients, projects, plans, and modules from one unified
            dashboard.
          </p>
        </div>

        <p className="relative z-10 text-xs tracking-wide text-primary-foreground/45">
          Secure client login · Email or username
        </p>
      </aside>

      <main className="relative flex flex-col items-center justify-center bg-background px-6 py-14 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,oklch(0.488_0.243_264.376/0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,oklch(0.62_0.2_264/0.12),transparent_60%)]"
        />

        <div className="relative z-10 mb-10 text-center lg:hidden">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
            Company
          </p>
          <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Admin Portal
          </h1>
        </div>

        {children}
      </main>
    </div>
  );
}
