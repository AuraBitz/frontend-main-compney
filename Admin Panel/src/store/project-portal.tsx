"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "project-portal-session";

export interface ProjectPortalModule {
  id: number;
  name: string;
}

export interface ProjectPortalSession {
  projectId: number;
  projectName: string;
  moduleIds: number[];
  modules: ProjectPortalModule[];
  planIds?: number[];
  status?: string;
  description?: string | null;
}

interface ProjectPortalContextValue {
  session: ProjectPortalSession | null;
  isActive: boolean;
  enterPortal: (session: ProjectPortalSession) => void;
  exitPortal: () => void;
}

const ProjectPortalContext = createContext<ProjectPortalContextValue | undefined>(
  undefined
);

function loadSession(): ProjectPortalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectPortalSession;
    if (!parsed?.projectId || !parsed?.projectName) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveSession(session: ProjectPortalSession | null) {
  try {
    if (session) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function ProjectPortalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<ProjectPortalSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setHydrated(true);
  }, []);

  const enterPortal = useCallback((next: ProjectPortalSession) => {
    setSession(next);
    saveSession(next);
  }, []);

  const exitPortal = useCallback(() => {
    setSession(null);
    saveSession(null);
    router.push("/dashboard");
  }, [router]);

  const value = useMemo(
    () => ({
      session: hydrated ? session : null,
      isActive: hydrated && session != null,
      enterPortal,
      exitPortal,
    }),
    [session, hydrated, enterPortal, exitPortal]
  );

  return (
    <ProjectPortalContext.Provider value={value}>
      {children}
    </ProjectPortalContext.Provider>
  );
}

export function useProjectPortal() {
  const ctx = useContext(ProjectPortalContext);
  if (!ctx) {
    throw new Error("useProjectPortal must be used within ProjectPortalProvider");
  }
  return ctx;
}
