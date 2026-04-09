// ============================================================
// MANTIX PCM v2 — TypeScript Types (based on supabase-schema-v2.sql)
// ============================================================

// Enums
export type AssetType = 'equipment' | 'instrument'
export type CriticalityLevel = 'A' | 'B' | 'C'
export type CalibrationStatus = 'valid' | 'expiring' | 'expired' | 'pending' | 'not_applicable'
export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'disposed'
export type FrequencyType = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom'
export type OsType = 'preventive' | 'corrective' | 'inspection' | 'calibration'
export type OsStatus = 'planned' | 'open' | 'in_progress' | 'completed' | 'cancelled'
export type OsPriority = 'low' | 'medium' | 'high' | 'critical'
export type UserRole = 'admin' | 'manager' | 'technician'
export type CompanyPlan = 'trial' | 'starter' | 'pro' | 'enterprise'
export type CalibrationResult = 'approved' | 'reproved' | 'adjusted'
export type ChecklistItemType = 'check' | 'measure' | 'photo' | 'text' | 'select'

// Tables
export interface Company {
  id: string
  name: string
  cnpj: string | null
  logo_url: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  plan: CompanyPlan
  trial_ends_at: string | null
  wo_counter: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  company_id: string
  full_name: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
}

export interface AssetCategory {
  id: string
  company_id: string
  name: string
  asset_type: AssetType
  icon: string | null
  created_at: string
}

export interface AssetLocation {
  id: string
  company_id: string
  name: string
  parent_id: string | null
  created_at: string
  // Computed for UI
  children?: AssetLocation[]
  full_path?: string
}

export interface Asset {
  id: string
  company_id: string
  category_id: string | null
  location_id: string | null
  tag: string
  name: string
  asset_type: AssetType
  manufacturer: string | null
  model: string | null
  serial_number: string | null
  photo_url: string | null
  criticality: CriticalityLevel
  status: AssetStatus
  // Metrological fields (instruments only)
  measurement_range: string | null
  resolution: string | null
  accuracy: string | null
  calibration_frequency_days: number | null
  last_calibration_date: string | null
  next_calibration_date: string | null
  calibration_provider: string | null
  calibration_status: CalibrationStatus
  qr_code: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  category?: AssetCategory
  location?: AssetLocation
}

export interface Calibration {
  id: string
  company_id: string
  asset_id: string
  calibration_date: string
  next_calibration_date: string
  provider: string
  certificate_number: string | null
  certificate_url: string | null
  result: CalibrationResult
  cost: number | null
  notes: string | null
  registered_by: string | null
  is_locked: boolean
  created_at: string
  // Joined fields
  asset?: Asset
  registered_by_user?: User
}

export interface MaintenancePlan {
  id: string
  company_id: string
  asset_id: string
  name: string
  description: string | null
  frequency: FrequencyType
  frequency_days: number | null
  template_id: string | null
  estimated_duration_min: number | null
  default_assignee: string | null
  execution_window_days: number
  tolerance_days: number
  cost_center: string | null
  inherits_criticality: boolean
  is_active: boolean
  last_generated_at: string | null
  next_due_date: string | null
  created_at: string
  updated_at: string
  // Joined fields
  asset?: Asset
  assignee?: User
}

export interface ChecklistTemplate {
  id: string
  company_id: string
  plan_id: string | null
  name: string
  description: string | null
  category: string | null
  is_global: boolean
  created_at: string
  // Computed
  items_count?: number
  items?: ChecklistTemplateItem[]
}

export interface ChecklistTemplateItem {
  id: string
  template_id: string
  sort_order: number
  group_name: string | null
  description: string
  item_type: ChecklistItemType
  min_value: number | null
  max_value: number | null
  unit: string | null
  options: string | null
  requires_photo: boolean
  requires_note_on_nok: boolean
  created_at: string
}

export interface WorkOrder {
  id: string
  company_id: string
  asset_id: string
  plan_id: string | null
  template_id: string | null
  wo_number: string
  wo_seq: number
  os_type: OsType
  status: OsStatus
  priority: OsPriority
  title: string
  description: string | null
  failure_description: string | null
  assigned_to: string | null
  requested_by: string | null
  scheduled_date: string | null
  started_at: string | null
  completed_at: string | null
  due_date: string | null
  latitude: number | null
  longitude: number | null
  technician_notes: string | null
  ai_summary: string | null
  signature_url: string | null
  client_signature_url: string | null
  actual_duration_min: number | null
  created_at: string
  updated_at: string
  // Joined fields
  asset?: Asset
  assignee?: User
  plan?: MaintenancePlan
  template?: ChecklistTemplate
  items?: WorkOrderItem[]
}

export interface WorkOrderItem {
  id: string
  work_order_id: string
  template_item_id: string | null
  sort_order: number
  group_name: string | null
  description: string
  item_type: string
  value: string | null
  is_conforming: boolean | null
  measured_value: number | null
  note: string | null
  ai_validation: string | null
  ai_validated_at: string | null
  filled_at: string
  // Added fields from template/copies
  min_value?: number | null
  max_value?: number | null
  unit?: string | null
  options?: string | null
  requires_photo?: boolean
  // Joined
  photos?: Photo[]
}

export interface Photo {
  id: string
  company_id: string
  work_order_id: string | null
  work_order_item_id: string | null
  calibration_id: string | null
  asset_id: string | null
  storage_path: string
  thumbnail_path: string | null
  original_filename: string | null
  caption: string | null
  latitude: number | null
  longitude: number | null
  taken_at: string
  ai_analysis: Record<string, unknown> | null
  ai_analyzed_at: string | null
  created_at: string
}

// Dashboard KPIs
export interface DashboardKPIs {
  total_assets: number
  total_instruments: number
  calibrations_expired: number
  calibrations_expiring_30d: number
  preventives_overdue: number
  open_work_orders: number
  completed_this_month: number
  compliance_rate: number
}

// Calibration Alert
export interface CalibrationAlert {
  asset_id: string
  asset_tag: string
  asset_name: string
  next_calibration: string
  days_remaining: number
  alert_level: 'expired' | 'expiring' | 'valid'
}

// Overdue Maintenance
export interface OverdueMaintenance {
  plan_id: string
  plan_name: string
  asset_tag: string
  asset_name: string
  due_date: string
  days_overdue: number
}
