"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTemplates, duplicateTemplate, deleteTemplate } from "@/hooks/use-templates";
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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CHECKLIST_CATEGORIES } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  FileText,
  Globe,
  Loader2,
  MoreVertical,
  Edit2,
  ListChecks,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { templates, loading, refetch } = useTemplates({
    category: filterCategory,
    search: debouncedSearch,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const copy = await duplicateTemplate(id);
      toast.success("Template duplicado com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao duplicar template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este template?")) return;
    try {
      await deleteTemplate(id);
      toast.success("Template excluído com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir template");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Templates de Checklist</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie modelos padronizados de inspeção e manutenção industrial
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/templates/new")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)] placeholder:text-[var(--color-text-muted)] w-full block"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap items-end gap-3">
              <div className="space-y-1">
                <label className="text-[12px] font-medium text-[var(--color-text-tertiary)] ml-1">Categoria</label>
                <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "all")}>
                  <SelectTrigger className="w-[180px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                    <Filter className="mr-1 h-3.5 w-3.5" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {CHECKLIST_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-10 w-10" />}
          title="Nenhum template encontrado"
          description={
            debouncedSearch || filterCategory !== "all"
              ? "Tente ajustar os filtros para encontrar o que procura."
              : "Crie modelos para padronizar as coletas de dados em campo."
          }
          action={
            !debouncedSearch && filterCategory === "all" ? (
              <Button
                onClick={() => router.push("/templates/new")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="bg-white border-[var(--color-border)] shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Itens</TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow
                  key={template.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/templates/${template.id}`)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-[14px] text-[var(--color-text-primary)]">{template.name}</span>
                      {template.description && (
                         <span className="text-[13px] text-[var(--color-text-secondary)] line-clamp-1 max-w-[300px]">
                           {template.description}
                         </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] font-semibold shadow-none border-[var(--color-border-light)] hover:bg-[var(--color-bg-muted)] uppercase text-[10px]">
                       {template.category || "Geral"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-[var(--color-text-tertiary)]">
                    {template.items_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {template.is_global ? (
                      <Badge className="bg-[var(--color-info-bg)] text-[var(--color-info-text)] border-[var(--color-info-border)] shadow-none gap-1 py-0.5 pointer-events-none uppercase text-[10px] tracking-wider font-bold hover:bg-[var(--color-info-bg)]">
                        <Globe className="h-3 w-3" />
                        GLOBAL
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] py-0.5 shadow-none border-[var(--color-border-light)] pointer-events-none uppercase text-[10px] tracking-wider font-bold hover:bg-[var(--color-bg-muted)]">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-[13px] text-[var(--color-text-secondary)]">
                    {format(new Date(template.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border/30">
                        <DropdownMenuItem onClick={() => router.push(`/templates/${template.id}`)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          {template.is_global ? "Visualizar" : "Editar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        {!template.is_global && (
                          <>
                            <DropdownMenuSeparator className="bg-border/30" />
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-400"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
