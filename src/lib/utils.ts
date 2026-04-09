import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting (PT-BR)
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Amanhã'
  if (diffDays === -1) return 'Ontem'
  if (diffDays > 0) return `Em ${diffDays} dias`
  return `${Math.abs(diffDays)} dias atrás`
}

// Duration formatting
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}min`
}

// Currency formatting (BRL)
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Days until date
export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null
  const d = new Date(date)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

// Generate breadcrumb segments from pathname
export function generateBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const pathMap: Record<string, string> = {
    dashboard: 'Dashboard',
    assets: 'Ativos',
    calibrations: 'Calibrações',
    plans: 'Planos',
    planning: 'Planejamento',
    'work-orders': 'Ordens de Serviço',
    templates: 'Templates',
    settings: 'Configurações',
    users: 'Usuários',
    categories: 'Categorias',
    locations: 'Localizações',
    new: 'Novo',
    edit: 'Editar',
    report: 'Relatório',
  }

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; href: string }[] = []

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = pathMap[segment] || segment
    breadcrumbs.push({ label, href: currentPath })
  }

  return breadcrumbs
}
