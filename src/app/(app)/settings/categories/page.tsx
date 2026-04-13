"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, Loader2 } from "lucide-react";
import { useCategories, createCategory, updateCategory, deleteCategory } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Categorias</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Gerencie as categorias de equipamentos e instrumentos do sistema.
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
              <Button className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white gap-2">
                <Plus className="h-4 w-4" />
                Nova Categoria
              </Button>
            }
          />
          <DialogContent className="bg-[#1E293B] border-[#334155] text-white">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Defina o nome e o tipo base para a categoria.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Motores, Multímetros..."
                    className="bg-[#0F172A] border-[#334155] text-white"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Tipo Base</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                  >
                    <SelectTrigger className="bg-[#0F172A] border-[#334155] text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155] text-white">
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
                  className="text-slate-300 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-[#1E293B] border-[#334155] overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#0F172A]/50">
              <TableRow className="border-[#334155] hover:bg-transparent">
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider w-[50px]"></TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">Nome</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider">Tipo Base</TableHead>
                <TableHead className="text-slate-400 font-bold uppercase text-[11px] tracking-wider text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center border-none">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[var(--color-primary)]" />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500 border-none">
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id} className="border-[#334155] hover:bg-slate-800/50 transition-colors">
                    <TableCell>
                      <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-[var(--color-primary)]" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-white">{category.name}</TableCell>
                    <TableCell>
                      <Badge className={category.asset_type === "instrument" ? "badge-warning" : "badge-info"}>
                        {ASSET_TYPE_LABELS[category.asset_type as keyof typeof ASSET_TYPE_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
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
    </div>
  );
}
