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
    <Badge variant="outline" className={cn("text-xs font-medium", ASSET_STATUS_COLORS[status])}>
      {ASSET_STATUS_LABELS[status]}
    </Badge>
  );
}

export function CriticalityBadge({ level }: { level: CriticalityLevel }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-semibold", CRITICALITY_COLORS[level])}>
      {level}
    </Badge>
  );
}

export function CalibrationBadge({ status }: { status: CalibrationStatus }) {
  if (status === "not_applicable") return null;
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", CALIBRATION_STATUS_COLORS[status])}>
      {CALIBRATION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function OsStatusBadge({ status }: { status: OsStatus }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", OS_STATUS_COLORS[status])}>
      {OS_STATUS_LABELS[status]}
    </Badge>
  );
}

export function OsPriorityBadge({ priority }: { priority: OsPriority }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", OS_PRIORITY_COLORS[priority])}>
      {OS_PRIORITY_LABELS[priority]}
    </Badge>
  );
}

export function OsTypeBadge({ type }: { type: OsType }) {
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", OS_TYPE_COLORS[type])}>
      {OS_TYPE_LABELS[type]}
    </Badge>
  );
}

export function PlanStatusBadge({ plan, className }: { plan: Pick<MaintenancePlan, "is_active" | "next_due_date">, className?: string }) {
  const status = getPlanOperationalStatus(plan);
  const colorClass = PLAN_STATUS_COLORS[status];
  const label = PLAN_STATUS_LABELS[status];

  return (
    <Badge variant="outline" className={cn("text-xs font-medium", colorClass, className)}>
      {label}
    </Badge>
  );
}
