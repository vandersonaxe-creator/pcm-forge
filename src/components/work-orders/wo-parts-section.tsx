"use client";

import { useState } from "react";
import {
  useWorkOrderParts,
  addWorkOrderPart,
  deleteWorkOrderPart,
  updateWorkOrderPart,
} from "@/hooks/use-work-order-parts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WOPartsSectionProps {
  workOrderId: string;
  isReadOnly: boolean;
}

const UNIT_OPTIONS = [
  { value: "un", label: "un" },
  { value: "m", label: "m" },
  { value: "kg", label: "kg" },
  { value: "L", label: "L" },
  { value: "cx", label: "cx" },
  { value: "pç", label: "pç" },
  { value: "rolo", label: "rolo" },
  { value: "par", label: "par" },
];

interface NewPartForm {
  part_name: string;
  part_code: string;
  quantity: string;
  unit: string;
  unit_cost: string;
}

const emptyForm: NewPartForm = {
  part_name: "",
  part_code: "",
  quantity: "1",
  unit: "un",
  unit_cost: "",
};

export function WOPartsSection({
  workOrderId,
  isReadOnly,
}: WOPartsSectionProps) {
  const { parts, loading, refetch } = useWorkOrderParts(workOrderId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewPartForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const totalCost = parts.reduce((sum, p) => {
    const cost = (p.quantity ?? 0) * (p.unit_cost ?? 0);
    return sum + cost;
  }, 0);

  async function handleAdd() {
    if (!form.part_name.trim()) {
      toast.error("Informe o nome da peça/material.");
      return;
    }

    setSubmitting(true);
    try {
      await addWorkOrderPart(workOrderId, {
        part_name: form.part_name.trim(),
        part_code: form.part_code.trim() || undefined,
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : undefined,
      });
      setForm(emptyForm);
      setShowForm(false);
      await refetch();
      toast.success("Peça adicionada.");
    } catch (err: any) {
      toast.error("Erro ao adicionar: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(partId: string) {
    try {
      await deleteWorkOrderPart(partId);
      await refetch();
      toast.success("Item removido.");
    } catch (err: any) {
      toast.error("Erro ao remover: " + err.message);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-base font-bold uppercase tracking-widest text-primary/80 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Peças e Materiais
        </h3>
        <div className="flex-1 h-px bg-border/20" />
        {!isReadOnly && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Adicionar
          </Button>
        )}
      </div>

      {/* Add form */}
      {showForm && !isReadOnly && (
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Nome da peça *
                </label>
                <Input
                  value={form.part_name}
                  onChange={(e) =>
                    setForm({ ...form, part_name: e.target.value })
                  }
                  placeholder="Ex: Rolamento 6205"
                  className="h-9 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Código
                </label>
                <Input
                  value={form.part_code}
                  onChange={(e) =>
                    setForm({ ...form, part_code: e.target.value })
                  }
                  placeholder="SKU-001"
                  className="h-9 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Qtd
                </label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  className="h-9 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Unidade
                </label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm({ ...form, unit: v ?? "un" })}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_OPTIONS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                  Custo unit. (R$)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unit_cost}
                  onChange={(e) =>
                    setForm({ ...form, unit_cost: e.target.value })
                  }
                  placeholder="0,00"
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                }}
                className="h-8 text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={submitting || !form.part_name.trim()}
                className="h-8 text-xs"
              >
                {submitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parts list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : parts.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground/50 italic">
          Nenhuma peça ou material registrado.
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 text-[11px] font-bold uppercase text-muted-foreground">
                    Peça / Material
                  </th>
                  <th className="text-left p-3 text-[11px] font-bold uppercase text-muted-foreground">
                    Código
                  </th>
                  <th className="text-center p-3 text-[11px] font-bold uppercase text-muted-foreground">
                    Qtd
                  </th>
                  <th className="text-center p-3 text-[11px] font-bold uppercase text-muted-foreground">
                    Unid.
                  </th>
                  <th className="text-right p-3 text-[11px] font-bold uppercase text-muted-foreground">
                    Custo Unit.
                  </th>
                  <th className="text-right p-3 text-[11px] font-bold uppercase text-muted-foreground">
                    Total
                  </th>
                  {!isReadOnly && <th className="w-10" />}
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => {
                  const lineTotal = (part.quantity ?? 0) * (part.unit_cost ?? 0);
                  return (
                    <tr
                      key={part.id}
                      className="border-b border-border/30 last:border-0"
                    >
                      <td className="p-3 font-semibold">{part.part_name}</td>
                      <td className="p-3 text-muted-foreground font-mono text-xs">
                        {part.part_code || "—"}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {part.quantity}
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {part.unit}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {part.unit_cost != null
                          ? formatCurrency(part.unit_cost)
                          : "—"}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold">
                        {part.unit_cost != null
                          ? formatCurrency(lineTotal)
                          : "—"}
                      </td>
                      {!isReadOnly && (
                        <td className="p-3">
                          <button
                            onClick={() => handleDelete(part.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              {totalCost > 0 && (
                <tfoot>
                  <tr className="bg-muted/20 border-t-2 border-border">
                    <td
                      colSpan={isReadOnly ? 5 : 5}
                      className="p-3 text-right text-xs font-bold uppercase text-muted-foreground"
                    >
                      Total de materiais:
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-primary text-base">
                      {formatCurrency(totalCost)}
                    </td>
                    {!isReadOnly && <td />}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
