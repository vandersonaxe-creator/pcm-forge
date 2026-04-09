import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ASSET_STATUS_LABELS, ASSET_STATUS_COLORS,
  CRITICALITY_LABELS, CRITICALITY_COLORS,
  CALIBRATION_STATUS_LABELS, CALIBRATION_STATUS_COLORS,
  OS_STATUS_LABELS, OS_STATUS_COLORS,
  OS_PRIORITY_LABELS, OS_PRIORITY_COLORS,
  OS_TYPE_LABELS, OS_TYPE_COLORS,
} from "@/lib/constants";
import type {
  AssetStatus, CriticalityLevel, CalibrationStatus,
  OsStatus, OsPriority, OsType, MaintenancePlan,
} from "@/lib/types/database";
import { getPlanOperationalStatus, PLAN_STATUS_COLORS, PLAN_STATUS_LABELS } from "@/lib/plans";

export function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <div className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border uppercase tracking-[0.03em]", ASSET_STATUS_COLORS[status])}>
      {ASSET_STATUS_LABELS[status]}
    </div>
  );
}

export function CriticalityBadge({ level }: { level: CriticalityLevel }) {
  return (
    <div className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border uppercase tracking-[0.03em]", CRITICALITY_COLORS[level])}>
      {level}
    </div>
  );
}

export function CalibrationBadge({ status }: { status: CalibrationStatus }) {
  if (status === "not_applicable") return null;
  return (
    <div className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border uppercase tracking-[0.03em]", CALIBRATION_STATUS_COLORS[status])}>
      {CALIBRATION_STATUS_LABELS[status]}
    </div>
  );
}

export function OsStatusBadge({ status }: { status: OsStatus }) {
  return (
    <div className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border uppercase tracking-[0.03em]", OS_STATUS_COLORS[status])}>
      {OS_STATUS_LABELS[status]}
    </div>
  );
}

export function OsPriorityBadge({ priority }: { priority: OsPriority }) {
  return (
    <div className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border uppercase tracking-[0.03em]", OS_PRIORITY_COLORS[priority])}>
      {OS_PRIORITY_LABELS[priority]}
    </div>
  );
}

export function OsTypeBadge({ type }: { type: OsType }) {
  return (
    <div className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border uppercase tracking-[0.03em]", OS_TYPE_COLORS[type])}>
      {OS_TYPE_LABELS[type]}
    </div>
  );
}

export function PlanStatusBadge({ plan, className }: { plan: Pick<MaintenancePlan, "is_active" | "next_due_date">, className?: string }) {
  const status = getPlanOperationalStatus(plan);
  const colorClass = PLAN_STATUS_COLORS[status];
  const label = PLAN_STATUS_LABELS[status];

  return (
    <div className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border uppercase tracking-[0.03em]", colorClass, className)}>
      {label}
    </div>
  );
}
