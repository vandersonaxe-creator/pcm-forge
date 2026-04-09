"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { generateBreadcrumbs } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();
  const crumbs = items || generateBreadcrumbs(pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center gap-2 text-[13px] font-medium text-muted-foreground", className)}
    >
      <Link
        href="/dashboard"
        className="hover:text-primary transition-colors flex items-center gap-1.5 no-underline"
      >
        <Home className="h-4 w-4" />
        <span>Início</span>
      </Link>
      
      {crumbs.map((crumb, i) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
          {i === crumbs.length - 1 ? (
            <span className="text-foreground font-semibold">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none no-underline"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// Alias for plural usage if needed
export const Breadcrumbs = Breadcrumb;
