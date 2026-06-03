"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { useAuth } from "@/store";
import { canAccessRoute } from "@/config/permissions";
import { NAV_GROUPS, NAV_ROUTES } from "@/routes";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user } = useAuth();

  const navigate = (path: string) => {
    if (pathname !== path) {
      router.push(path);
    }
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const visible = NAV_ROUTES.filter((item) =>
    user ? canAccessRoute(user.role, item.path) : false
  );

  const groups = Object.keys(NAV_GROUPS) as Array<keyof typeof NAV_GROUPS>;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold">Compney Admin</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((groupKey) => {
          const items = visible.filter((item) => item.group === groupKey);
          if (!items.length) return null;

          return (
            <SidebarGroup key={groupKey}>
              <SidebarGroupLabel>{NAV_GROUPS[groupKey]}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          type="button"
                          isActive={pathname === item.path}
                          onClick={() => navigate(item.path)}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="space-y-3 border-t border-sidebar-border p-4">
        {user && (
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        )}
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
