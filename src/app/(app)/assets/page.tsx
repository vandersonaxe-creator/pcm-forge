"use client";

import { useState, useRef } from "react";
import Link from "next/link";
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

  const { assets, loading } = useAssets({
    assetType: filterType,
    status: filterStatus,
    criticality: filterCriticality,
    categoryId: filterCategory,
    locationId: filterLocation,
    search: debouncedSearch,
  });

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
          { label: "Total Geral", value: assets.length, icon: Package, color: "text-primary" },
          { label: "Equipamentos", value: totalEquipments, icon: Wrench, color: "text-primary" },
          { label: "Instrumentos", value: totalInstruments, icon: Gauge, color: "text-primary" },
          { label: "Ativos Operantes", value: totalActive, icon: CheckCircle2, color: "text-success" },
        ].map((counter) => (
          <Card key={counter.label} className="bg-card border-border shadow-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={cn("p-2 rounded-lg", counter.color.replace("text-", "bg-").replace("]", "/10]"))}>
                <counter.icon className={cn("h-5 w-5", counter.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{counter.value}</p>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest leading-none mt-1">{counter.label}</p>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tag ou nome..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Tipo</label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v ?? "all")}>
                  <SelectTrigger className="w-[150px] bg-background border-border text-sm">
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Status</label>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v ?? "all")}>
                  <SelectTrigger className="w-[150px] bg-background border-border text-sm">
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Criticidade</label>
                <Select value={filterCriticality} onValueChange={(v) => setFilterCriticality(v ?? "all")}>
                  <SelectTrigger className="w-[150px] bg-background border-border text-sm">
                    <SelectValue placeholder="Criticidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="A">Crítico (A)</SelectItem>
                    <SelectItem value="B">Importante (B)</SelectItem>
                    <SelectItem value="C">Secundário (C)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {categories.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Categoria</label>
                  <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v ?? "all")}>
                    <SelectTrigger className="w-[160px] bg-background border-border text-sm">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
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
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Localização</label>
                  <Select value={filterLocation} onValueChange={(v) => setFilterLocation(v ?? "all")}>
                    <SelectTrigger className="w-[160px] bg-background border-border text-sm">
                      <SelectValue placeholder="Localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas localizações</SelectItem>
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
        <Card className="bg-card border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-[#F8FAFC]">
                <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Tag</TableHead>
                <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider">Nome</TableHead>
                <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider hidden md:table-cell">
                  Tipo
                </TableHead>
                <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider hidden lg:table-cell">
                  Categoria
                </TableHead>
                <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider hidden lg:table-cell">
                  Localização
                </TableHead>
                <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider text-center">
                  Criticidade
                </TableHead>
                <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider text-center">
                  Status
                </TableHead>
                <TableHead className="text-[#374151] font-bold text-xs uppercase tracking-wider text-center hidden md:table-cell">
                  Calibração
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="border-border cursor-pointer hover:bg-[#F1F5F9] transition-colors"
                  onClick={() => router.push(`/assets/${asset.id}`)}
                >
                  <TableCell className="font-mono text-sm font-bold text-primary">
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
        </Card>
      )}
    </div>
  );
}
