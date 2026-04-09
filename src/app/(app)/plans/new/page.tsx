import { PlanForm } from "@/components/plans/plan-form";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export default function NewPlanPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Planos Preventivos", href: "/plans" },
          { label: "Novo Plano", href: "/plans/new" },
        ]}
      />
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Novo Plano Preventivo</h1>
        <p className="text-muted-foreground">
          Configure as regras para geração automática de ordens de serviço
        </p>
      </div>

      <PlanForm />
    </div>
  );
}
