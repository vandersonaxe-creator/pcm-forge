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
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 group no-underline animate-in-fade",
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white hover:translate-x-1",
        collapsed && "justify-center px-1 hover:translate-x-0"
      )}
    >
      <Icon className={cn("h-4.5 w-4.5 shrink-0 transition-colors", isActive ? "text-white" : "text-sidebar-foreground group-hover:text-white")} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

import { BrandLogo } from "./logo";

// ... (skipping unchanged code)

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className={cn(
        "flex items-center px-6 py-12 border-b border-sidebar-border bg-sidebar transition-all overflow-hidden",
        collapsed ? "justify-center px-0 py-8" : "justify-start"
      )}>
        {collapsed ? (
          <div className="flex items-center justify-center">
            <span className="text-xl font-black tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              P
            </span>
            <span className="text-xl font-bold tracking-tighter text-amber-500">
              F
            </span>
          </div>
        ) : (
          <div className="flex items-baseline select-none">
            <span className="text-2xl font-[800] tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
              PCM
            </span>
            <span className="text-2xl font-medium tracking-tighter text-amber-500 ml-1.5">
              Forge
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavigate} />
          ))}
        </nav>

        <Separator className="my-4 bg-sidebar-border" />

          <p className="px-3 pb-2 pt-6 text-[11px] font-bold uppercase tracking-widest text-sidebar-foreground/50">
            Administração
          </p>
        <nav className="flex flex-col gap-1">
          {NAV_SETTINGS_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} onClick={onNavigate} />
          ))}
        </nav>
      </ScrollArea>
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
          "hidden lg:flex flex-col glass-morphism-dark transition-all duration-500 ease-in-out",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        <div className="flex-1 relative">
          <SidebarContent collapsed={collapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-7 z-10 h-6 w-6 rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet>
        <SheetTrigger
          className="lg:hidden fixed top-3 left-3 z-40 h-10 w-10 flex items-center justify-center rounded-lg bg-sidebar border border-sidebar-border hover:bg-sidebar-accent transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer outline-none select-none"
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-[260px] p-0 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarContent collapsed={false} />
        </SheetContent>
      </Sheet>
    </SidebarContext.Provider>
  );
}
