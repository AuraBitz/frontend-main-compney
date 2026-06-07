"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface PlanRenewalShellContextValue {
  active: boolean;
  setActive: (active: boolean) => void;
}

const PlanRenewalShellContext = createContext<
  PlanRenewalShellContextValue | undefined
>(undefined);

export function PlanRenewalShellProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActiveState] = useState(false);
  const setActive = useCallback((next: boolean) => {
    setActiveState((prev) => (prev === next ? prev : next));
  }, []);

  const value = useMemo(
    () => ({ active, setActive }),
    [active, setActive]
  );

  return (
    <PlanRenewalShellContext.Provider value={value}>
      {children}
    </PlanRenewalShellContext.Provider>
  );
}

export function usePlanRenewalShell() {
  const ctx = useContext(PlanRenewalShellContext);
  if (!ctx) {
    throw new Error(
      "usePlanRenewalShell must be used within PlanRenewalShellProvider"
    );
  }
  return ctx;
}
