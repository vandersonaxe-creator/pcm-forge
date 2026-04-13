"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_MAIN_ITEMS, NAV_METROLOGY_ITEMS, NAV_ADMIN_ITEMS } from "@/lib/constants";
import { useCompany } from "@/hooks/use-company";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  LayoutDashboard, Wrench, Gauge, CalendarClock, CalendarRange,
  ClipboardList, FileCheck, Building2, Users, Tag, MapPin,
  Settings, ChevronLeft, ChevronRight, Menu, Hammer, LogOut,
  History, Bell, AlertTriangle
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Wrench, Gauge, CalendarClock, CalendarRange,
  ClipboardList, FileCheck, Building2, Users, Tag, MapPin, Settings,
  History, Bell, AlertTriangle,
};

// Sidebar context for collapse state
const SidebarContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => { } });
export const useSidebar = () => useContext(SidebarContext);

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: { label: string; href: string; icon: string };
  collapsed: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const Icon = iconMap[item.icon] || Wrench;
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition-all duration-200 group no-underline",
        isActive
          ? "bg-[var(--color-bg-sidebar-active)] text-white font-semibold"
          : "text-[var(--color-text-on-dark-muted)] hover:bg-[var(--color-bg-sidebar-hover)] hover:text-[var(--color-text-on-dark)] font-medium",
        collapsed && "justify-center px-0"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[3px] bg-white rounded-r-md" />
      )}
      <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", isActive ? "text-white" : "text-inherit")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

import { PCMForgeLogo } from "./pcm-forge-logo";

// ... (skipping unchanged code)

function SidebarContent({
  collapsed,
  onNavigate,
  setCollapsed
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  setCollapsed?: (val: boolean) => void;
}) {
  const router = useRouter();
  const { user } = useCompany();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col bg-[var(--color-bg-sidebar)] text-[var(--color-text-on-dark)]">
      {/* Logo Section */}
      <div className={cn(
        "border-b border-[var(--color-bg-sidebar-hover)] transition-all overflow-hidden",
        collapsed ? "flex items-center justify-center h-[72px]" : ""
      )}>
        <PCMForgeLogo collapsed={collapsed} size={collapsed ? "sm" : "md"} />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        {/* Group 1: Core */}
        <nav className="flex flex-col gap-1">
          {NAV_MAIN_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavigate} />
          ))}
        </nav>

        {/* Group 2: Metrology */}
        <div className="mt-6 mb-2">
          {!collapsed ? (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b border-[var(--color-bg-sidebar-hover)]">
              Metrologia
            </p>
          ) : (
            <Separator className="my-4 bg-[var(--color-bg-sidebar-hover)]" />
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_METROLOGY_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavigate} />
          ))}
        </nav>

        {/* Group 3: Administration */}
        <div className="mt-6 mb-2">
          {!collapsed ? (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b border-[var(--color-bg-sidebar-hover)]">
              Administração
            </p>
          ) : (
            <Separator className="my-4 bg-[var(--color-bg-sidebar-hover)]" />
          )}
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ADMIN_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavigate} />
          ))}
        </nav>
      </ScrollArea>

      {/* User Footer */}
      <div className="mt-auto border-t border-[var(--color-bg-sidebar-hover)] p-4">
        {!collapsed ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[var(--color-text-on-dark)] truncate">
                {user?.full_name || "Usuário"}
              </span>
              <span className="text-[12px] text-[var(--color-text-on-dark-muted)] truncate">
                {user?.email || "email@exemplo.com"}
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] w-full transition-all duration-200 font-medium",
                "text-red-400/90 hover:bg-red-500/10 hover:text-red-400 border border-red-500/20"
              )}
            >
              <LogOut className="h-[16px] w-[16px] shrink-0" />
              <span>Sair</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <button
              onClick={handleLogout}
              className="flex items-center justify-center h-10 w-10 rounded-lg text-red-400/90 hover:bg-red-500/10 hover:text-red-400 transition-all border border-red-500/10"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Toggle */}
      <div className="border-t border-[var(--color-bg-sidebar-hover)] p-2 flex items-center justify-center">
         {setCollapsed && (
           <Button
             variant="ghost"
             size="sm"
             onClick={() => setCollapsed(!collapsed)}
             className="h-8 w-full rounded-lg hover:bg-[var(--color-bg-sidebar-hover)] text-[var(--color-text-muted)] hover:text-white flex items-center justify-center"
           >
             {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
             {!collapsed && <span className="ml-2 text-[11px] font-medium uppercase tracking-wider">Recolher</span>}
           </Button>
         )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-[var(--color-bg-sidebar)] border-r border-[#1E293B] transition-all duration-300 ease-in-out z-40 h-full overflow-hidden",
          collapsed ? "w-[64px]" : "w-[240px]"
        )}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet>
        <SheetTrigger
          className="lg:hidden fixed top-3 left-3 z-40 h-10 w-10 flex items-center justify-center rounded-lg bg-[var(--color-bg-sidebar)] border border-[var(--color-bg-sidebar-hover)] focus:outline-none transition-colors text-[var(--color-text-on-dark-muted)] hover:text-white cursor-pointer select-none"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0 bg-[var(--color-bg-sidebar)] border-[#1E293B]">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </SidebarContext.Provider>
  );
}
