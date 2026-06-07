"use client";

import { AuthProvider } from "@/store";
import { PlanRenewalShellProvider } from "@/store/plan-renewal-shell";
import { ProjectPortalProvider } from "@/store/project-portal";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { ToastContainer } from "react-toastify";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectPortalProvider>
          <PlanRenewalShellProvider>
            <TooltipProvider>
              {children}
              <Toaster position="top-right" richColors />
              <ToastContainer newestOnTop closeOnClick rtl={false} limit={3} />
            </TooltipProvider>
          </PlanRenewalShellProvider>
        </ProjectPortalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
