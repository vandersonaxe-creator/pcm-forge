"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/shared/breadcrumb";
import { LogOut, User as UserIcon, Building2 } from "lucide-react";
import type { User, Company } from "@/lib/types/database";

interface HeaderProps {
  user: User | null;
  company: Company | null;
}

export function Header({ user, company }: HeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-[56px] items-center gap-4 border-b border-[var(--color-border)] bg-white px-4 lg:px-6">
      {/* Breadcrumb area (left-aligned, with space for mobile menu button) */}
      <div className="flex-1 pl-12 lg:pl-0">
        <Breadcrumbs />
      </div>

      {/* User menu (right) */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--color-bg-muted)] outline-none select-none transition-colors"
        >
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[14px] font-medium text-[var(--color-text-primary)] leading-tight">
              {user?.full_name || "Usuário"}
            </span>
            <span className="text-[12px] text-[var(--color-text-tertiary)] leading-tight">
              {company?.name || "Empresa"}
            </span>
          </div>
          <Avatar className="h-9 w-9 border border-[var(--color-border-light)] mt-0.5">
            <AvatarFallback className="bg-[var(--color-brand)] text-white text-[13px] font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-white border-border shadow-md">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.full_name}</p>
              <p className="text-xs text-muted-foreground">{company?.name}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings")}>
            <Building2 className="mr-2 h-4 w-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/settings/users")}>
            <UserIcon className="mr-2 h-4 w-4" />
            Meu Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
