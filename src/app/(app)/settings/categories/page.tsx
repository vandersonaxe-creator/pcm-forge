"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, Loader2, ListChecks } from "lucide-react";
import { useCategories, createCategory, updateCategory, deleteCategory } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ASSET_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const { categories, loading, refetch } = useCategories();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", type: "equipment" as any });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData.name, formData.type);
        toast.success("Categoria atualizada com sucesso");
      } else {
        await createCategory(formData.name, formData.type);
        toast.success("Categoria criada com sucesso");
      }
      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", type: "equipment" });
      refetch();
    } catch (error: any) {
      toast.error("Erro ao salvar categoria: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
    try {
      await deleteCategory(id);
      toast.success("Categoria excluída com sucesso");
      refetch();
    } catch (error: any) {
      toast.error("Erro ao excluir categoria: " + error.message);
    }
  }

  function handleEdit(category: any) {
    setEditingCategory(category);
    setFormData({ name: category.name, type: category.asset_type });
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background px-6 pt-6 pb-20 lg:px-10 lg:pt-8 space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--color-text-primary)]">
            Categorias de Ativos
          </h1>
          <p className="text-[14px] text-[var(--color-text-tertiary)] flex items-center gap-1.5">
            <ListChecks className="h-4 w-4" />
            <span>Gerencie as categorias de equipamentos e instrumentos do sistema</span>
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCategory(null);
            setFormData({ name: "", type: "equipment" });
          }
        }}>
          <DialogTrigger
            render={
              <Button className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white shadow-sm gap-2">
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            }
          />
          <DialogContent className="bg-white border-[var(--color-border)]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle className="text-[var(--color-text-primary)]">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </DialogTitle>
                <DialogDescription className="text-[var(--color-text-tertiary)]">
                  Defina o nome e o tipo base para organizar seus ativos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-[var(--color-text-secondary)] font-semibold">Nome da Categoria</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Motores, Multímetros..."
                    className="bg-white border-[var(--color-border)] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-[var(--color-text-secondary)] font-semibold">Tipo Base</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="bg-white border-[var(--color-border)] text-[var(--color-text-primary)]">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[var(--color-border)]">
                      <SelectItem value="equipment">Equipamento</SelectItem>
                      <SelectItem value="instrument">Instrumento (Metrologia)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsDialogOpen(false)}
                  className="text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Categoria"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table Content */}
      <Card className="bg-white border-[var(--color-border)] shadow-card overflow-hidden rounded-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[var(--color-bg-page)]/50">
              <TableRow className="border-[var(--color-border)] hover:bg-transparent">
                <TableHead className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] w-[60px] pl-6"></TableHead>
                <TableHead className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Nome da Categoria</TableHead>
                <TableHead className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)]">Tipo de Ativo</TableHead>
                <TableHead className="text-[12px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center border-none">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-brand)]" />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-[var(--color-text-muted)] border-none">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} className="border-[var(--color-border)] hover:bg-[var(--color-bg-card-hover)] transition-colors group">
                    <TableCell className="pl-6">
                      <div className="h-9 w-9 rounded-lg bg-[var(--color-brand-light)] flex items-center justify-center">
                        <Tag className="h-4 w-4 text-[var(--color-brand)]" />
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-[var(--color-text-primary)]">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "font-medium border shadow-none px-2 py-0.5",
                        category.asset_type === "instrument" ? "badge-warning" : "badge-info"
                      )}>
                        {ASSET_TYPE_LABELS[category.asset_type as keyof typeof ASSET_TYPE_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 space-x-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 text-[var(--color-text-tertiary)] hover:text-[var(--color-brand)] hover:bg-[var(--color-brand-light)]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 text-[var(--color-text-tertiary)] hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <footer className="pt-4 flex justify-center border-t border-border/40">
        <p className="text-[11px] text-[var(--color-text-muted)] opacity-60">
          PCM Forge · Gestão de Categorias v1.0
        </p>
      </footer>
    </div>
  );
}
