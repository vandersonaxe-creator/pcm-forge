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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>

            {/* Filter dropdowns */}
            <div className="flex flex-wrap gap-2">
              <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "all")}>
                <SelectTrigger className="w-[180px] bg-background border-border text-sm">
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
        <Card className="bg-card border-border shadow-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent bg-[#F8FAFC]">
                <TableHead className="text-[#374151] font-bold text-[11px] uppercase tracking-wider">Template</TableHead>
                <TableHead className="text-[#374151] font-bold text-[11px] uppercase tracking-wider">Categoria</TableHead>
                <TableHead className="text-[#374151] font-bold text-[11px] uppercase tracking-wider text-center">Itens</TableHead>
                <TableHead className="text-[#374151] font-bold text-[11px] uppercase tracking-wider text-center">Tipo</TableHead>
                <TableHead className="text-[#374151] font-bold text-[11px] uppercase tracking-wider">Criado em</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow
                  key={template.id}
                  className="border-border/20 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => router.push(`/templates/${template.id}`)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-primary">{template.name}</span>
                      {template.description && (
                         <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                           {template.description}
                         </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                       {template.category || "Geral"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-muted-foreground">
                    {template.items_count}
                  </TableCell>
                  <TableCell className="text-center">
                    {template.is_global ? (
                      <Badge className="bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE] shadow-none gap-1 py-0.5">
                        <Globe className="h-3 w-3" />
                        GLOBAL
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground py-0.5 shadow-none border-[#E5E7EB]">Customizado</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
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
