"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Gauge,
  Info,
} from "lucide-react";
import { daysUntil, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Asset } from "@/lib/types/database";

function CalibrationInstrumentCard({ asset }: { asset: Asset }) {
  const router = useRouter();
  const days = daysUntil(asset.next_calibration_date);
  const isOverdue = days !== null && days < 0;

  const daysLabel = isOverdue
    ? `Vencido há ${Math.abs(days ?? 0)} dia${Math.abs(days ?? 0) !== 1 ? "s" : ""}`
    : days !== null
      ? `Vence em ${days} dia${days !== 1 ? "s" : ""}`
      : "—";

  return (
    <Card
      className="hover:border-primary/40 cursor-pointer transition-colors border-border/40 bg-card shadow-sm"
      onClick={() => router.push(`/assets/${asset.id}?tab=calibrations`)}
    >
      <div className="p-3 flex flex-col gap-1 justify-center min-h-[52px]">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-mono text-xs font-bold text-primary shrink-0">
            {asset.tag}
          </span>
          <p className="text-sm font-semibold leading-snug text-foreground truncate">
            {asset.name}
          </p>
        </div>
        <div className="flex items-center gap-2 min-w-0 text-xs">
          <p className="text-muted-foreground truncate flex-1 min-w-0">
            {asset.calibration_provider || "Lab. não informado"}
          </p>
          <span
            className={cn(
              "shrink-0 font-medium tabular-nums whitespace-nowrap",
              isOverdue
                ? "text-destructive"
                : days !== null && days <= 30
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {daysLabel}
          </span>
          <button
            type="button"
            className="shrink-0 text-[10px] font-semibold text-primary hover:underline px-0"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/calibrations/new?asset_id=${asset.id}`);
            }}
          >
            Registrar
          </button>
        </div>
      </div>
    </Card>
  );
}

function ColumnHeader({
  icon: Icon,
  title,
  count,
  variant,
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  variant: "danger" | "warning" | "success";
}) {
  const styles = {
    danger: {
      bar: "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-text)]",
      badge: "bg-[var(--color-danger-border)]/80",
    },
    warning: {
      bar: "border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
      badge: "bg-[var(--color-warning-border)]/80",
    },
    success: {
      bar: "border-[var(--color-success-border)] bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
      badge: "bg-[var(--color-success-border)]/80",
    },
  }[variant];

  return (
    <div
      className={cn(
        "flex-shrink-0 flex items-center justify-between px-4 py-3 border-b",
        styles.bar
      )}
    >
      <div className="flex items-center gap-2 font-bold text-[11px] uppercase tracking-[0.05em]">
        <Icon className="h-4 w-4 shrink-0" />
        {title}
      </div>
      <span
        className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold min-w-[1.5rem] text-center",
          styles.badge
        )}
      >
        {count}
      </span>
    </div>
  );
}

function EmptyColumn({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "muted" | "warning";
}) {
  const bg =
    tone === "success"
      ? "bg-[var(--color-success-bg)]/90 border-[var(--color-success-border)]/60"
      : tone === "warning"
        ? "bg-[var(--color-warning-bg)]/50 border-[var(--color-warning-border)]/40"
        : "bg-muted/40 border-border/40";

  const Icon = tone === "muted" ? Info : CheckCircle2;
  const iconClass =
    tone === "muted"
      ? "h-8 w-8 text-muted-foreground mb-2"
      : "h-8 w-8 text-emerald-600 mb-2 opacity-90";

  return (
    <div
      className={cn(
        "flex-1 flex flex-col items-center justify-center text-center px-4 py-8 rounded-b-xl border border-dashed min-h-[140px]",
        bg
      )}
    >
      <Icon className={iconClass} />
      <p className="text-sm font-medium text-muted-foreground max-w-[220px] leading-snug">
        {message}
      </p>
    </div>
  );
}

function KanbanColumn({
  title,
  items,
  headerVariant,
  emptyTone,
  emptyMessage,
  icon,
}: {
  title: string;
  items: Asset[];
  headerVariant: "danger" | "warning" | "success";
  emptyTone: "success" | "muted" | "warning";
  emptyMessage: string;
  icon: React.ElementType;
}) {
  const hasItems = items.length > 0;

  return (
    <div className="flex-1 flex flex-col min-w-[300px] min-h-0 bg-muted/40 rounded-xl border border-border/60 shadow-sm overflow-hidden">
      <ColumnHeader
        icon={icon}
        title={title}
        count={items.length}
        variant={headerVariant}
      />
      {hasItems ? (
        <div className="flex-1 min-h-0 flex flex-col bg-muted/20">
          <div className="flex-1 overflow-y-auto calibration-scroll px-3 py-3 space-y-2 min-h-0">
            {items.map((asset) => (
              <CalibrationInstrumentCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyColumn message={emptyMessage} tone={emptyTone} />
      )}
    </div>
  );
}

export function CalibrationPanel({
  instruments,
  loading,
}: {
  instruments: Asset[];
  loading: boolean;
}) {
  const valid = instruments.filter(
    (a) =>
      a.calibration_status === "valid" ||
      a.calibration_status === "pending" ||
      a.calibration_status === "not_applicable"
  );
  const expiring = instruments.filter((a) => a.calibration_status === "expiring");
  const expired = instruments.filter((a) => a.calibration_status === "expired");

  const renderCardList = (items: Asset[]) =>
    items.map((asset) => (
      <CalibrationInstrumentCard key={asset.id} asset={asset} />
    ));

  if (loading) {
    return (
      <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[400px] w-full">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 flex flex-col gap-3 min-w-[300px] min-h-0">
            <Skeleton className="h-12 w-full rounded-xl shrink-0" />
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:flex gap-4 h-[calc(100vh-280px)] min-h-[400px] w-full">
        <KanbanColumn
          title="Vencidas"
          items={expired}
          headerVariant="danger"
          emptyTone="success"
          emptyMessage="Nenhum instrumento vencido"
          icon={AlertCircle}
        />
        <KanbanColumn
          title="Vencendo (30d)"
          items={expiring}
          headerVariant="warning"
          emptyTone="success"
          emptyMessage="Nenhum instrumento próximo do vencimento"
          icon={Clock}
        />
        <KanbanColumn
          title="Válidas"
          items={valid}
          headerVariant="success"
          emptyTone="muted"
          emptyMessage="Nenhum instrumento com calibração válida"
          icon={CheckCircle2}
        />
      </div>

      <div className="md:hidden w-full">
        <Tabs defaultValue="expired" className="flex flex-col gap-3">
          <TabsList className="w-full h-auto flex flex-wrap justify-stretch gap-1 p-1 bg-muted/80">
            <TabsTrigger
              value="expired"
              className="flex-1 min-w-[92px] text-[11px] data-[state=active]:bg-red-50 data-[state=active]:text-red-900 data-[state=active]:border data-[state=active]:border-red-200"
            >
              Vencidas ({expired.length})
            </TabsTrigger>
            <TabsTrigger
              value="expiring"
              className="flex-1 min-w-[92px] text-[11px] data-[state=active]:bg-amber-50 data-[state=active]:text-amber-950 data-[state=active]:border data-[state=active]:border-amber-200"
            >
              Vencendo ({expiring.length})
            </TabsTrigger>
            <TabsTrigger
              value="valid"
              className="flex-1 min-w-[92px] text-[11px] data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-950 data-[state=active]:border data-[state=active]:border-emerald-200"
            >
              Válidas ({valid.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expired" className="mt-0 outline-none">
            <div className="h-[calc(100vh-280px)] min-h-[300px] flex flex-col rounded-xl border border-border/60 overflow-hidden bg-muted/15">
              {expired.length > 0 ? (
                <div className="flex-1 overflow-y-auto calibration-scroll px-3 py-3 space-y-2 min-h-0">
                  {renderCardList(expired)}
                </div>
              ) : (
                <EmptyColumn
                  message="Nenhum instrumento vencido"
                  tone="success"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="expiring" className="mt-0 outline-none">
            <div className="h-[calc(100vh-280px)] min-h-[300px] flex flex-col rounded-xl border border-border/60 overflow-hidden bg-muted/15">
              {expiring.length > 0 ? (
                <div className="flex-1 overflow-y-auto calibration-scroll px-3 py-3 space-y-2 min-h-0">
                  {renderCardList(expiring)}
                </div>
              ) : (
                <EmptyColumn
                  message="Nenhum instrumento próximo do vencimento"
                  tone="success"
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="valid" className="mt-0 outline-none">
            <div className="h-[calc(100vh-280px)] min-h-[300px] flex flex-col rounded-xl border border-border/60 overflow-hidden bg-muted/15">
              {valid.length > 0 ? (
                <div className="flex-1 overflow-y-auto calibration-scroll px-3 py-3 space-y-2 min-h-0">
                  {renderCardList(valid)}
                </div>
              ) : (
                <EmptyColumn
                  message="Nenhum instrumento com calibração válida"
                  tone="muted"
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

export function CalibrationsPageHeader() {
  return (
    <div className="mb-6 flex-shrink-0">
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Gauge className="h-6 w-6 text-primary" />
        Painel Metrológico
      </h1>
      <p className="text-muted-foreground">
        Gerencie o ciclo de vida e vencimentos das calibrações de seus instrumentos.
      </p>
    </div>
  );
}
