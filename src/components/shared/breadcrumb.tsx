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
      className={cn("flex items-center gap-2 text-[13px] font-medium text-[var(--color-text-tertiary)]", className)}
    >
      <Link
        href="/dashboard"
        className="hover:text-[var(--color-text-primary)] transition-colors flex items-center no-underline"
      >
        <span>Início</span>
      </Link>
      
      {crumbs.map((crumb, i) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <span className="text-[var(--color-text-muted)] select-none">/</span>
          {i === crumbs.length - 1 ? (
            <span className="text-[var(--color-text-primary)] font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-[var(--color-text-primary)] transition-colors truncate max-w-[120px] sm:max-w-none no-underline"
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
