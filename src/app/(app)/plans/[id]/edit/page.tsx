"use client";

import { usePlan } from "@/hooks/use-plans";
import { useParams } from "next/navigation";
import { PlanForm } from "@/components/plans/plan-form";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { Loader2 } from "lucide-react";

export default function EditPlanPage() {
  const { id } = useParams() as { id: string };
  const { plan, loading } = usePlan(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return <div className="text-center py-20">Plano não encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Planos Preventivos", href: "/plans" },
          { label: plan.name, href: `/plans/${id}` },
          { label: "Editar", href: `/plans/${id}/edit` },
        ]}
      />
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Plano: {plan.name}</h1>
        <p className="text-muted-foreground">
          Atualize as regras e cronograma deste plano preventivo
        </p>
      </div>

      <PlanForm initialData={plan} />
    </div>
  );
}
