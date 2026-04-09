// ============================================================
// MANTIX PCM v2 — Constants & Labels (PT-BR)
// ============================================================

import type {
  AssetType, AssetStatus, CriticalityLevel, CalibrationStatus,
  FrequencyType, OsType, OsStatus, OsPriority, UserRole,
  CalibrationResult, ChecklistItemType
} from '@/lib/types/database'

// Asset Type Labels
export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  equipment: 'Equipamento',
  instrument: 'Instrumento',
}

// Asset Status Labels
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  maintenance: 'Em Manutenção',
  disposed: 'Descartado',
}

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  active: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
  inactive: 'bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]',
  maintenance: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  disposed: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
}

// Criticality Labels
export const CRITICALITY_LABELS: Record<CriticalityLevel, string> = {
  A: 'Crítico (A)',
  B: 'Importante (B)',
  C: 'Secundário (C)',
}

export const CRITICALITY_COLORS: Record<CriticalityLevel, string> = {
  A: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
  B: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
  C: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
}

// Calibration Status Labels
export const CALIBRATION_STATUS_LABELS: Record<CalibrationStatus, string> = {
  valid: 'Válido',
  expiring: 'Vencendo',
  expired: 'Vencido',
  pending: 'Pendente',
  not_applicable: 'N/A',
}

export const CALIBRATION_STATUS_COLORS: Record<CalibrationStatus, string> = {
  valid: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
  expiring: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  expired: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
  pending: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  not_applicable: 'bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]',
}

// Calibration Result Labels
export const CALIBRATION_RESULT_LABELS: Record<CalibrationResult, string> = {
  approved: 'Aprovado',
  reproved: 'Reprovado',
  adjusted: 'Ajustado',
}

export const CALIBRATION_RESULT_COLORS: Record<CalibrationResult, string> = {
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  reproved: 'bg-red-500/15 text-red-400 border-red-500/30',
  adjusted: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

// Frequency Labels
export const FREQUENCY_LABELS: Record<FrequencyType, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  biweekly: 'Quinzenal',
  monthly: 'Mensal',
  bimonthly: 'Bimestral',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
  custom: 'Personalizada',
}

export const FREQUENCY_DAYS: Record<Exclude<FrequencyType, 'custom'>, number> = {
  daily: 1,
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  bimonthly: 60,
  quarterly: 90,
  semiannual: 180,
  annual: 365,
}

// OS Type Labels
export const OS_TYPE_LABELS: Record<OsType, string> = {
  preventive: 'Preventiva',
  corrective: 'Corretiva',
  inspection: 'Inspeção',
  calibration: 'Calibração',
}

export const OS_TYPE_COLORS: Record<OsType, string> = {
  preventive: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  corrective: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
  inspection: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
  calibration: 'bg-[#F5F3FF] text-[#5B21B6] border-[#DDD6FE]',
}

export const OS_TYPE_ICONS: Record<OsType, string> = {
  preventive: 'Wrench',
  corrective: 'AlertTriangle',
  inspection: 'Search',
  calibration: 'Gauge',
}

// OS Status Labels
export const OS_STATUS_LABELS: Record<OsStatus, string> = {
  planned: 'Planejada',
  open: 'Aberta',
  in_progress: 'Em Andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
}

export const OS_STATUS_COLORS: Record<OsStatus, string> = {
  planned: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  open: 'bg-[#F9FAFB] text-[#374151] border-[#D1D5DB]',
  in_progress: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  completed: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
  cancelled: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
}

// OS Priority Labels
export const OS_PRIORITY_LABELS: Record<OsPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
}

export const OS_PRIORITY_COLORS: Record<OsPriority, string> = {
  low: 'bg-[#F3F4F6] text-[#374151] border-[#D1D5DB]',
  medium: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  high: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
  critical: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
}

// User Role Labels
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  manager: 'Gestor',
  technician: 'Técnico',
}

// Checklist Item Type Labels
export const CHECKLIST_ITEM_TYPE_LABELS: Record<ChecklistItemType, string> = {
  check: 'Conformidade (OK/NOK)',
  measure: 'Medição Numérica',
  photo: 'Registro Fotográfico',
  text: 'Texto Livre',
  select: 'Seleção (Dropdown)',
}

// Checklist Categories
export const CHECKLIST_CATEGORIES = [
  'Preventiva',
  'Corretiva',
  'Inspeção NR-13',
  'Inspeção NR-12',
  'Geral'
] as const;

// Navigation items for sidebar
export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Ativos', href: '/assets', icon: 'Wrench' },
  { label: 'Calibrações', href: '/calibrations', icon: 'Gauge' },
  { label: 'Planos', href: '/plans', icon: 'CalendarClock' },
  { label: 'Planejamento', href: '/planning', icon: 'CalendarRange' },
  { label: 'Ordens de Serviço', href: '/work-orders', icon: 'ClipboardList' },
  { label: 'Templates', href: '/templates', icon: 'FileCheck' },
] as const

export const NAV_SETTINGS_ITEMS = [
  { label: 'Empresa', href: '/settings', icon: 'Building2' },
  { label: 'Usuários', href: '/settings/users', icon: 'Users' },
  { label: 'Categorias', href: '/settings/categories', icon: 'Tag' },
  { label: 'Localizações', href: '/settings/locations', icon: 'MapPin' },
] as const
