"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import {
  getChildModuleIcon,
  getParentModuleIcon,
  PortalNavIcon,
} from "@/restaurant-management-admin-panel/lib/portal-module-icons";
import { LogoutButton } from "@/components/LogoutButton";
import { SidebarProfile } from "@/components/layout/SidebarProfile";
import { useAuth } from "@/store";
import { useProjectPortal } from "@/store/project-portal";
import { canAccessRoute } from "@/config/permissions";
import { restoreProjectPortalSession } from "@/lib/open-restaurant-portal";
import {
  isClientLoginUser,
  isManagementUser,
  isProjectOnlyUser,
} from "@/lib/project-access";
import { NAV_GROUPS, NAV_ROUTES } from "@/routes";
import type { NavGroup } from "@/types/nav-route";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  portalChildPath,
  portalModulePath,
  portalProjectPath,
} from "@/restaurant-management-admin-panel/lib/portal-routes";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sidebar-group-open";

function loadGroupState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function isNavItemActive(pathname: string, itemPath: string): boolean {
  if (pathname === itemPath) return true;
  if (itemPath !== "/dashboard" && pathname.startsWith(`${itemPath}/`)) {
    return true;
  }
  return false;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user } = useAuth();
  const { session, isActive: portalActive, exitPortal, enterPortal } =
    useProjectPortal();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [expandedPortalParents, setExpandedPortalParents] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    setOpenGroups(loadGroupState());
  }, []);

  useEffect(() => {
    if (!session?.modules?.length) return;
    setExpandedPortalParents((prev) => {
      const next = { ...prev };
      for (const mod of session.modules) {
        if ((mod.children?.length ?? 0) > 0 && next[mod.id] === undefined) {
          next[mod.id] = true;
        }
      }
      return next;
    });
  }, [session?.modules]);

  const toggleGroup = useCallback((key: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const navigate = (path: string) => {
    if (pathname !== path) {
      router.push(path);
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const visible = NAV_ROUTES.filter(
    (item) =>
      user &&
      isManagementUser(user) &&
      canAccessRoute(user.role, item.path)
  );

  const groups = Object.keys(NAV_GROUPS) as NavGroup[];

  const togglePortalParent = useCallback((parentId: number) => {
    setExpandedPortalParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  }, []);

  if (user && isProjectOnlyUser(user) && !portalActive) {
    return (
      <Sidebar className="border-r border-sidebar-border/80 bg-sidebar">
        <SidebarHeader className="border-b border-sidebar-border/60 bg-linear-to-br from-primary/12 via-sidebar to-sidebar px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Compney Portal</p>
              <p className="text-xs text-muted-foreground">Project access</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-1 px-2 py-3">
          <SidebarGroup className="px-1">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    type="button"
                    isActive={pathname === "/projects/check"}
                    onClick={() => navigate("/projects/check")}
                    className={cn(
                      "h-10 rounded-lg border border-transparent",
                      pathname === "/projects/check" &&
                        "border-primary/20 bg-primary/12 font-semibold text-primary"
                    )}
                  >
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span>Select Project</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="space-y-3 border-t border-sidebar-border/60 bg-sidebar/80 p-4">
          <SidebarProfile />
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>
    );
  }

  const handlePortalHeaderBack = async () => {
    if (!session) return;

    if (session.viewMode === "restaurant" && session.restaurantViewReturnPath) {
      try {
        const restored = await restoreProjectPortalSession(
          session.projectId,
          user
        );
        enterPortal(restored);
        navigate(session.restaurantViewReturnPath);
      } catch {
        navigate(session.restaurantViewReturnPath);
      }
      return;
    }

    if (user && isManagementUser(user)) {
      exitPortal();
    }
  };

  const showPortalHeaderBack =
    (session?.viewMode === "restaurant" && session.restaurantViewReturnPath) ||
    (user && isManagementUser(user));

  if (portalActive && session) {
    const isRestaurantPortal =
      session.viewMode === "restaurant" || isClientLoginUser(user);
    const portalTitle =
      isRestaurantPortal && (session.restaurantName || user?.restaurantName)
        ? session.restaurantName || user?.restaurantName
        : session.projectName;

    return (
      <Sidebar className="border-r border-sidebar-border/80 bg-sidebar">
        <SidebarHeader className="border-b border-sidebar-border/60 bg-linear-to-br from-primary/12 via-sidebar to-sidebar px-4 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold tracking-tight">
                {portalTitle}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRestaurantPortal
                  ? "Restaurant portal"
                  : session.modules.length
                    ? `${session.modules.length} module${session.modules.length === 1 ? "" : "s"}`
                    : "Project portal"}
              </p>
            </div>
            {showPortalHeaderBack && (
              <button
                type="button"
                onClick={handlePortalHeaderBack}
                title={
                  session.viewMode === "restaurant"
                    ? "Back to restaurant list"
                    : "Back to main portal"
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sidebar-border/80 bg-sidebar-accent/50 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="gap-1 px-2 py-3">
          <SidebarGroup className="px-1">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    type="button"
                    isActive={
                      pathname === portalProjectPath(session.projectId) ||
                      pathname === "/portal"
                    }
                    onClick={() =>
                      navigate(portalProjectPath(session.projectId))
                    }
                    className={cn(
                      "mb-2 h-10 rounded-lg border border-transparent",
                      (pathname === portalProjectPath(session.projectId) ||
                        pathname === "/portal") &&
                        "border-primary/20 bg-primary/12 font-semibold text-primary"
                    )}
                  >
                    <LayoutDashboard className="size-4 shrink-0" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
            <p className="mb-1 px-2.5 text-[0.7rem] font-semibold tracking-wider text-sidebar-foreground/55 uppercase">
              Modules
            </p>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {session.modules.length ? (
                  session.modules.map((mod) => {
                    const parentPath = portalModulePath(
                      session.projectId,
                      mod.id
                    );
                    const parentActive =
                      pathname === parentPath ||
                      pathname.startsWith(`${parentPath}/`);
                    const hasChildren = (mod.children ?? []).length > 0;
                    const isExpanded =
                      expandedPortalParents[mod.id] ?? parentActive;
                    const ParentIcon = getParentModuleIcon(mod.name);

                    return (
                      <div key={mod.id} className="space-y-0.5">
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            type="button"
                            isActive={parentActive && pathname === parentPath}
                            onClick={() => {
                              if (hasChildren) {
                                togglePortalParent(mod.id);
                              }
                              navigate(parentPath);
                            }}
                            className={cn(
                              "h-10 rounded-lg border border-transparent transition-all duration-200",
                              parentActive &&
                                "border-primary/20 bg-primary/12 font-semibold text-primary shadow-sm dark:bg-primary/18 dark:text-primary-foreground"
                            )}
                          >
                            {hasChildren ? (
                              <ChevronRight
                                className={cn(
                                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                  isExpanded && "rotate-90 text-primary"
                                )}
                              />
                            ) : (
                              <span className="inline-block size-4 shrink-0" />
                            )}
                            <PortalNavIcon
                              icon={ParentIcon}
                              active={parentActive}
                            />
                            <span className="truncate font-medium">{mod.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        {hasChildren &&
                          isExpanded &&
                          (mod.children ?? []).map((child) => {
                            const childPath = portalChildPath(
                              session.projectId,
                              mod.id,
                              child.id
                            );
                            const childActive =
                              pathname === childPath ||
                              pathname.startsWith(`${childPath}/`);
                            const ChildIcon = getChildModuleIcon(child.name);

                            return (
                              <SidebarMenuItem key={child.id}>
                                <SidebarMenuButton
                                  type="button"
                                  isActive={childActive}
                                  onClick={() => navigate(childPath)}
                                  className={cn(
                                    "h-9 rounded-lg border border-transparent pl-6",
                                    childActive &&
                                      "border-primary/20 bg-primary/10 font-medium text-primary"
                                  )}
                                >
                                  <PortalNavIcon
                                    icon={ChildIcon}
                                    active={childActive}
                                    className="size-3.5"
                                  />
                                  <span className="truncate text-sm">
                                    {child.name}
                                  </span>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                      </div>
                    );
                  })
                ) : (
                  <p className="px-2.5 py-2 text-xs text-muted-foreground">
                    No modules linked to this project.
                  </p>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="space-y-3 border-t border-sidebar-border/60 bg-sidebar/80 p-4">
          <SidebarProfile />
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-sidebar-border/80 bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border/60 bg-linear-to-br from-primary/12 via-sidebar to-sidebar px-4 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/25">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Compney Admin</p>
            <p className="text-xs text-muted-foreground">Management portal</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-1 px-2 py-3">
        {groups.map((groupKey) => {
          const items = visible.filter((item) => item.group === groupKey);
          if (!items.length) return null;

          const isOpen = openGroups[groupKey] !== false;

          return (
            <SidebarGroup key={groupKey} className="px-1">
              <button
                type="button"
                onClick={() => toggleGroup(groupKey)}
                className="mb-1 flex h-8 w-full items-center justify-between rounded-lg px-2.5 text-[0.7rem] font-semibold tracking-wider text-sidebar-foreground/55 uppercase ring-sidebar-ring outline-none transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground focus-visible:ring-2"
              >
                <span>{NAV_GROUPS[groupKey]}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200",
                    !isOpen && "-rotate-90"
                  )}
                />
              </button>
              {isOpen && (
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const active = isNavItemActive(pathname, item.path);
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton
                            type="button"
                            isActive={active}
                            onClick={() => navigate(item.path)}
                            className={cn(
                              "h-10 rounded-lg border border-transparent transition-all duration-200",
                              active &&
                                "border-primary/20 bg-primary/12 font-semibold text-primary shadow-sm dark:bg-primary/18 dark:text-primary-foreground"
                            )}
                          >
                            <Icon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                active && "text-primary"
                              )}
                            />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="space-y-3 border-t border-sidebar-border/60 bg-sidebar/80 p-4">
        <SidebarProfile />
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
