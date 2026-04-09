import { differenceInDays, isBefore, startOfDay } from "date-fns";
import type { MaintenancePlan } from "./types/database";

export type PlanOperationalStatus =
  | "inactive"
  | "overdue"
  | "due_soon"
  | "on_track"
  | "no_date";

export function getPlanOperationalStatus(
  plan: Pick<MaintenancePlan, "is_active" | "next_due_date">
): PlanOperationalStatus {
  if (!plan.is_active) return "inactive";
  if (!plan.next_due_date) return "no_date";

  const today = startOfDay(new Date());
  const dueDate = startOfDay(new Date(plan.next_due_date));

  if (isBefore(dueDate, today)) {
    return "overdue";
  }

  const daysToDue = differenceInDays(dueDate, today);
  if (daysToDue <= 7) {
    return "due_soon";
  }

  return "on_track";
}

export const PLAN_STATUS_LABELS: Record<PlanOperationalStatus, string> = {
  inactive: "Inativo",
  overdue: "Atrasado",
  due_soon: "A Vencer",
  on_track: "Em Dia",
  no_date: "Sem Data",
};

export const PLAN_STATUS_COLORS: Record<PlanOperationalStatus, string> = {
  inactive: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  overdue: "bg-red-500/15 text-red-400 border-red-500/30",
  due_soon: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  on_track: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  no_date: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export function formatDuration(minutes: number | null): string {
  if (!minutes) return "Não estimada";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
}
