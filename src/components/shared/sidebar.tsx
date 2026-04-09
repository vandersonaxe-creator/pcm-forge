"use client";

import { useState, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NAV_SETTINGS_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  LayoutDashboard, Wrench, Gauge, CalendarClock, CalendarRange,
  ClipboardList, FileCheck, Building2, Users, Tag, MapPin,
  Settings, ChevronLeft, ChevronRight, Menu, Hammer,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Wrench, Gauge, CalendarClock, CalendarRange,
  ClipboardList, FileCheck, Building2, Users, Tag, MapPin, Settings,
};

// Sidebar context for collapse state
const SidebarContext = createContext({ collapsed: false, setCollapsed: (_: boolean) => { } });
export const useSidebar = () => useContext(SidebarContext);

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number] | (typeof NAV_SETTINGS_ITEMS)[number];
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

import { BrandLogo } from "./logo";

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
  return (
    <div className="flex h-full flex-col bg-[var(--color-bg-sidebar)] text-[var(--color-text-on-dark)]">
      {/* Logo Section */}
      <div className={cn(
        "flex items-center px-4 py-5 border-b border-[var(--color-bg-sidebar-hover)] transition-all overflow-hidden h-[72px]",
        collapsed ? "justify-center" : "justify-start"
      )}>
        <BrandLogo collapsed={collapsed} size={collapsed ? "sm" : "md"} />
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavigate} />
          ))}
        </nav>

        <div className="my-6">
          {!collapsed ? (
             <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--color-text-tertiary)] border-b border-[var(--color-bg-sidebar-hover)]">
               Administração
             </p>
          ) : (
             <Separator className="my-4 bg-[var(--color-bg-sidebar-hover)]" />
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_SETTINGS_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavigate} />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer / Toggle */}
      <div className="border-t border-[var(--color-bg-sidebar-hover)] p-3 flex items-center justify-between">
         {!collapsed && <span className="text-[11px] text-[var(--color-text-secondary)] pl-2">v1.5</span>}
         {setCollapsed && (
           <Button
             variant="ghost"
             size="icon"
             onClick={() => setCollapsed(!collapsed)}
             className="h-8 w-8 rounded-lg hover:bg-[var(--color-bg-sidebar-hover)] text-[var(--color-text-muted)] hover:text-white"
           >
             {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
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
