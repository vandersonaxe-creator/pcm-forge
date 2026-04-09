"use client";

import { useState, useRef, useLayoutEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAssets, useCategories, useLocations } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, CriticalityBadge, CalibrationBadge } from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { ASSET_TYPE_LABELS } from "@/lib/constants";
import {
  Plus,
  Search,
  Wrench,
  Gauge,
  Package,
  Loader2,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssetsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCriticality, setFilterCriticality] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Scroll horizontal no topo da tabela (sincronizado com o de baixo) */
  const tableTopScrollRef = useRef<HTMLDivElement>(null);
  const tableBottomScrollRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [showTableTopScroll, setShowTableTopScroll] = useState(false);
  const scrollSyncLock = useRef(false);

  const syncTableScroll = useCallback((source: "top" | "bottom") => {
    const top = tableTopScrollRef.current;
    const bottom = tableBottomScrollRef.current;
    if (!top || !bottom || scrollSyncLock.current) return;
    scrollSyncLock.current = true;
    if (source === "top") bottom.scrollLeft = top.scrollLeft;
    else top.scrollLeft = bottom.scrollLeft;
    queueMicrotask(() => {
      scrollSyncLock.current = false;
    });
  }, []);

  const { assets, loading } = useAssets({
    assetType: filterType,
    status: filterStatus,
    criticality: filterCriticality,
    categoryId: filterCategory,
    locationId: filterLocation,
    search: debouncedSearch,
  });

  useLayoutEffect(() => {
    const el = tableBottomScrollRef.current;
    if (!el) return;

    const update = () => {
      setTableScrollWidth(el.scrollWidth);
      setShowTableTopScroll(el.scrollWidth > el.clientWidth + 2);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [assets, loading]);

  const { categories } = useCategories();
  const { locations } = useLocations();

  // Debounce search
  function handleSearch(value: string) {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  }

  // Counters
  const totalEquipments = assets.filter((a) => a.asset_type === "equipment").length;
  const totalInstruments = assets.filter((a) => a.asset_type === "instrument").length;
  const totalActive = assets.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ativos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie equipamentos e instrumentos de medição industrial
          </p>
        </div>
        <Button
          onClick={() => router.push("/assets/new")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Ativo
        </Button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Geral", value: assets.length, icon: Package, bgClass: "bg-[var(--color-brand-light)]", textClass: "text-[var(--color-brand)]" },
          { label: "Equipamentos", value: totalEquipments, icon: Wrench, bgClass: "bg-[var(--color-bg-muted)]", textClass: "text-[var(--color-text-secondary)]" },
          { label: "Instrumentos", value: totalInstruments, icon: Gauge, bgClass: "bg-[var(--color-warning-bg)]", textClass: "text-[var(--color-warning-text)]" },
          { label: "Ativos Operantes", value: totalActive, icon: CheckCircle2, bgClass: "bg-[var(--color-success-bg)]", textClass: "text-[var(--color-success-icon)]" },
        ].map((counter) => (
          <Card key={counter.label} className="bg-white border-[var(--color-border)] shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn("p-2.5 rounded-full", counter.bgClass)}>
                <counter.icon className={cn("h-5 w-5", counter.textClass)} />
              </div>
              <div>
                <p className="text-[24px] font-bold tracking-tight leading-none text-[var(--color-text-primary)]">{counter.value}</p>
                <p className="text-[12px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-[0.05em] leading-none mt-2">{counter.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <Input
                placeholder="Buscar por tag o nome..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] w-full block"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Tipo</label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "all")}>
                  <SelectTrigger className="w-[150px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                    <Filter className="mr-1 h-3.5 w-3.5" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="equipment">Equipamento</SelectItem>
                    <SelectItem value="instrument">Instrumento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Status</label>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
                  <SelectTrigger className="w-[150px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                    <SelectItem value="disposed">Descartado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Criticidade</label>
                <Select value={filterCriticality} onValueChange={(v) => setFilterCriticality(v ?? "all")}>
                  <SelectTrigger className="w-[150px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                    <SelectValue placeholder="Criticidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as criticidades</SelectItem>
                    <SelectItem value="A">Crítico (A)</SelectItem>
                    <SelectItem value="B">Importante (B)</SelectItem>
                    <SelectItem value="C">Secundário (C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {categories.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Categoria</label>
                  <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "all")}>
                    <SelectTrigger className="w-[160px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {locations.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Localização</label>
                  <Select value={filterLocation} onValueChange={(v) => setFilterLocation(v ?? "all")}>
                    <SelectTrigger className="w-[160px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                      <SelectValue placeholder="Localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as localizações</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8" />}
          title="Nenhum ativo encontrado"
          description={
            debouncedSearch || filterType !== "all" || filterStatus !== "all"
              ? "Tente ajustar os filtros ou buscar por outro termo."
              : "Comece cadastrando seu primeiro equipamento ou instrumento."
          }
          action={
            !debouncedSearch && filterType === "all" && filterStatus === "all" ? (
              <Button
                onClick={() => router.push("/assets/new")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Cadastrar Ativo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="bg-white border-[var(--color-border)] shadow-card overflow-hidden p-0">
          {showTableTopScroll && (
            <div
              ref={tableTopScrollRef}
              className="overflow-x-auto overflow-y-hidden min-h-[14px] border-b border-[var(--color-border)] [scrollbar-width:thin]"
              onScroll={() => syncTableScroll("top")}
              aria-hidden
            >
              <div style={{ width: tableScrollWidth, minHeight: 1 }} />
            </div>
          )}
          <div
            ref={tableBottomScrollRef}
            className="overflow-x-auto [scrollbar-width:thin]"
            onScroll={() => syncTableScroll("bottom")}
          >
            <Table className="min-w-[880px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead className="hidden lg:table-cell">Categoria</TableHead>
                  <TableHead className="hidden lg:table-cell">Localização</TableHead>
                  <TableHead className="text-center">Criticidade</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Calibração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/assets/${asset.id}`)}
                  >
                    <TableCell className="font-mono text-[14px] font-semibold text-[var(--color-text-primary)]">
                      {asset.tag}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {asset.photo_url && (
                          <img
                            src={asset.photo_url}
                            alt=""
                            className="h-8 w-8 rounded-md object-cover border border-border/30"
                          />
                        )}
                        <span className="font-medium">{asset.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {asset.asset_type === "equipment" ? (
                          <Wrench className="h-3.5 w-3.5" />
                        ) : (
                          <Gauge className="h-3.5 w-3.5" />
                        )}
                        {ASSET_TYPE_LABELS[asset.asset_type]}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {asset.category?.name || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {asset.location?.name || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <CriticalityBadge level={asset.criticality} />
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={asset.status} />
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <CalibrationBadge status={asset.calibration_status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
