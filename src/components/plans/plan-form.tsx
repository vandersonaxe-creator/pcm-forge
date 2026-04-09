"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useAssets } from "@/hooks/use-assets";
import { createClient } from "@/lib/supabase/client";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { Loader2, Info, Wrench, Gauge, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createPlan, updatePlan } from "@/hooks/use-plans";
import type { MaintenancePlan, User, ChecklistTemplate, Asset } from "@/lib/types/database";

const planSchema = z.object({
  asset_id: z.string().min(1, "O ativo é obrigatório"),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().nullable().optional(),
  frequency: z.enum([
    "daily", "weekly", "biweekly", "monthly", "bimonthly", 
    "quarterly", "semiannual", "annual", "custom"
  ]),
  frequency_days: z.number().nullable().optional(),
  template_id: z.string().nullable().optional(),
  default_assignee: z.string().nullable().optional(),
  estimated_duration_min: z.number().min(1, "Duração mínima de 1 min"),
  execution_window_days: z.number().min(0),
  tolerance_days: z.number().min(0),
  cost_center: z.string().nullable().optional(),
  inherits_criticality: z.boolean(),
  next_due_date: z.string().min(1, "A próxima execução é obrigatória"),
  is_active: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  initialData?: MaintenancePlan;
}

export function PlanForm({ initialData }: PlanFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const { assets } = useAssets();
  
  const isEditing = !!initialData;

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: initialData ? {
      asset_id: initialData.asset_id,
      name: initialData.name,
      description: initialData.description || "",
      frequency: initialData.frequency,
      frequency_days: initialData.frequency_days,
      template_id: initialData.template_id || null,
      default_assignee: initialData.default_assignee || null,
      estimated_duration_min: initialData.estimated_duration_min || 60,
      execution_window_days: initialData.execution_window_days || 0,
      tolerance_days: initialData.tolerance_days || 0,
      cost_center: initialData.cost_center || "",
      inherits_criticality: initialData.inherits_criticality,
      next_due_date: initialData.next_due_date ? initialData.next_due_date.split('T')[0] : "",
      is_active: initialData.is_active,
    } : {
      asset_id: "",
      name: "",
      description: "",
      frequency: "monthly",
      frequency_days: null,
      template_id: null,
      default_assignee: null,
      estimated_duration_min: 60,
      execution_window_days: 2,
      tolerance_days: 1,
      cost_center: "",
      inherits_criticality: true,
      next_due_date: new Date().toISOString().split('T')[0],
      is_active: true,
    },
  });

  const selectedAssetId = form.watch("asset_id");
  const selectedAsset = assets.find(a => a.id === selectedAssetId);
  const frequency = form.watch("frequency");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch Users
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("is_active", true)
        .order("full_name");
      setUsers((userData as User[]) || []);

      // Fetch Templates
      const { data: templateData } = await supabase
        .from("checklist_templates")
        .select("*")
        .order("name");
      setTemplates((templateData as ChecklistTemplate[]) || []);
    }
    fetchData();
  }, []);

  async function onSubmit(values: PlanFormValues) {
    setLoading(true);
    try {
      if (isEditing) {
        await updatePlan(initialData.id, values);
        toast.success("Plano atualizado com sucesso!");
      } else {
        const newPlan = await createPlan(values);
        toast.success("Plano criado com sucesso!");
        router.push(`/plans/${newPlan.id}`);
        return;
      }
      router.push(`/plans/${initialData.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar plano");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Seção 1: Ativo e Identificação */}
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">1</span>
                    Ativo e Identificação
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="asset_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ativo</FormLabel>
                          <Select
                            disabled={isEditing}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Selecione o ativo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {assets.map((asset) => (
                                <SelectItem key={asset.id} value={asset.id}>
                                  [{asset.tag}] {asset.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Plano</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Preventiva Mensal Elétrica" {...field} className="bg-muted/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva as principais atividades deste plano..." 
                            {...field} 
                            value={field.value || ""}
                            className="bg-muted/50 min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seção 2: Frequência e Execução */}
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">2</span>
                    Frequência e Execução
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequência</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Selecione a frequência" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(FREQUENCY_LABELS).map(([val, label]) => (
                                <SelectItem key={val} value={val}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {frequency === "custom" && (
                      <FormField
                        control={form.control}
                        name="frequency_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dias (Intervalo)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value || ""} 
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                className="bg-muted/50" 
                              />
                            </FormControl>
                            <FormDescription>Quantos dias de intervalo?</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="next_due_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Próxima Execução</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="bg-muted/50" />
                          </FormControl>
                          <FormDescription>
                            Data sugerida para a primeira ou próxima OS.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimated_duration_min"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duração Estimada (min)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-muted/50" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="execution_window_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Janela de Execução (dias)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-muted/50" 
                            />
                          </FormControl>
                          <FormDescription>Dias em que a OS fica aberta antes do prazo.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tolerance_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tolerância (dias)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-muted/50" 
                            />
                          </FormControl>
                          <FormDescription>Dias aceitáveis após o vencimento.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção 3: Responsável e Template */}
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">3</span>
                    Responsável e Operação
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="default_assignee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Responsável Padrão</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Não definido" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="template_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template de Checklist</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-muted/50">
                                <SelectValue placeholder="Sem checklist" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cost_center"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Centro de Custo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: CC-01-MANUT" {...field} value={field.value || ""} className="bg-muted/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção 4: Regras e Status */}
            <Card className="bg-card/50 border-border/30">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">4</span>
                    Regras Adicionais
                  </h3>
                  
                  <div className="flex flex-col gap-6">
                    <FormField
                      control={form.control}
                      name="inherits_criticality"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/30 p-4 bg-muted/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Herdar Criticidade</FormLabel>
                            <FormDescription>
                              A prioridade da OS seguirá automaticamente a criticidade do ativo.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/30 p-4 bg-muted/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Plano Ativo</FormLabel>
                            <FormDescription>
                              Define se novas ordens de serviço serão geradas automaticamente.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="bg-card/50 border-border/30 sticky top-6">
              <CardContent className="p-6">
                <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Resumo do Ativo
                </h4>
                
                {selectedAsset ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        {selectedAsset.asset_type === "equipment" ? (
                          <Wrench className="h-5 w-5" />
                        ) : (
                          <Gauge className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-mono text-sm font-bold text-primary">{selectedAsset.tag}</div>
                        <div className="font-medium">{selectedAsset.name}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                      <div>
                        <div className="text-muted-foreground text-xs">Criticidade</div>
                        <div className="font-semibold">{selectedAsset.criticality}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">Status</div>
                        <div className="font-semibold capitalize text-emerald-400">{selectedAsset.status}</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/30">
                      <div className="text-xs text-muted-foreground mb-2">Dica Operacional</div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Certifique-se de definir uma janela de execução que dê tempo para o técnico se planejar.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="p-3 rounded-full bg-muted/30 mb-3">
                      <CheckCircle2 className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <p className="text-sm text-muted-foreground">Selecione um ativo para visualizar os detalhes aqui.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Criar Plano"}
              </Button>
              <Button variant="ghost" onClick={() => router.back()} disabled={loading} className="w-full">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
