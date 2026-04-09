"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useWorkOrders, createWorkOrder } from "@/hooks/use-work-orders";
import { useAssets } from "@/hooks/use-assets";
import { useUsers } from "@/hooks/use-users";
import { useTemplates, useTemplate } from "@/hooks/use-templates";
import { usePlans } from "@/hooks/use-plans";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  OS_TYPE_LABELS,
  OS_PRIORITY_LABELS,
  CRITICALITY_LABELS,
  CRITICALITY_COLORS
} from "@/lib/constants";
import { toast } from "sonner";
import {
  Wrench,
  AlertTriangle,
  Search,
  Gauge,
  ChevronLeft,
  Loader2,
  Calendar,
  User,
  Layout,
  Tag,
  MapPin,
  ClipboardList,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const osFormSchema = z.object({
  os_type: z.enum(["preventive", "corrective", "inspection", "calibration"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  asset_id: z.string().min(1, "O ativo é obrigatório"),
  template_id: z.string().optional(),
  plan_id: z.string().optional(),
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  description: z.string().optional(),
  failure_description: z.string().optional(),
  assigned_to: z.string().optional(),
  requested_by: z.string().optional(),
  scheduled_date: z.string().optional(),
  due_date: z.string().optional(),
}).refine((data) => {
  if (data.scheduled_date && data.due_date) {
    return new Date(data.due_date) >= new Date(data.scheduled_date);
  }
  return true;
}, {
  message: "A data limite não pode ser anterior à data programada",
  path: ["due_date"],
});

type OSFormValues = z.infer<typeof osFormSchema>;

export default function NewWorkOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const form = useForm<OSFormValues>({
    resolver: zodResolver(osFormSchema),
    defaultValues: {
      os_type: "corrective",
      priority: "medium",
      title: "",
      description: "",
      failure_description: "",
      requested_by: "",
    },
  });

  const osType = form.watch("os_type");
  
  const { assets } = useAssets();
  const { users } = useUsers();
  const { templates } = useTemplates();
  const { plans } = usePlans({ assetId: selectedAssetId });
  
  const selectedAsset = useMemo(() => 
    assets.find(a => a.id === selectedAssetId), 
    [assets, selectedAssetId]
  );

  const selectedTemplate = useMemo(() => 
    templates.find(t => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  async function onSubmit(values: OSFormValues) {
    setLoading(true);
    try {
      if (values.os_type === "corrective" && !values.failure_description) {
         toast.info("Dica: Preencher a descrição da falha ajuda na análise de causa raiz.");
      }
      
      const wo = await createWorkOrder(values);
      toast.success(`Ordem de Serviço ${wo.wo_number} gerada com sucesso!`);
      router.push(`/work-orders/${wo.id}`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar OS");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-[1000px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit p-0 h-auto text-muted-foreground hover:text-primary transition-colors"
          onClick={() => router.push("/work-orders")}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar para OSs
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Ordem de Serviço</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card className="bg-card/50 border-border/30">
            <CardContent className="p-6 space-y-8">
              
              {/* Seção Type & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="os_type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Manutenção</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          {[
                            { value: "preventive", label: "Preventiva", icon: Wrench, color: "text-blue-400" },
                            { value: "corrective", label: "Corretiva", icon: AlertTriangle, color: "text-red-400" },
                            { value: "inspection", label: "Inspeção", icon: Search, color: "text-emerald-400" },
                            { value: "calibration", label: "Calibração", icon: Gauge, color: "text-purple-400" },
                          ].map((option) => (
                            <div key={option.value}>
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={option.value}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 [&:has([data-state=checked])]:border-amber-500 cursor-pointer transition-all"
                              >
                                <option.icon className={cn("mb-2 h-5 w-5", option.color)} />
                                <span className="text-xs font-bold uppercase tracking-wider">{option.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Prioridade</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-2"
                        >
                          {[
                            { value: "low", label: "Baixa", color: "border-zinc-500/30" },
                            { value: "medium", label: "Média", color: "border-blue-500/30" },
                            { value: "high", label: "Alta", color: "border-amber-500/30" },
                            { value: "critical", label: "Crítica", color: "border-red-500/30 font-bold" },
                          ].map((option) => (
                            <div key={option.value}>
                              <RadioGroupItem
                                value={option.value}
                                id={`priority-${option.value}`}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={`priority-${option.value}`}
                                className={cn(
                                  "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 [&:has([data-state=checked])]:border-amber-500 cursor-pointer transition-all h-full",
                                  option.value === "critical" && "text-red-400"
                                )}
                              >
                                <span className="text-xs font-bold uppercase tracking-wider my-auto">{option.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="h-px bg-border/30" />

              {/* Ativo e Referência */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="asset_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ativo / Equipamento</FormLabel>
                        <Select 
                          onValueChange={(val) => {
                            field.onChange(val);
                            setSelectedAssetId(val || "");
                            form.setValue("plan_id", ""); // reset plan
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-muted/30">
                              <SelectValue placeholder="Selecione um ativo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {assets.map((asset) => (
                              <SelectItem key={asset.id} value={asset.id}>
                                {asset.tag} - {asset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedAsset && (
                    <Card className="bg-background/40 border-border/20 shadow-sm overflow-hidden">
                      <div className="p-4 flex gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                           <Layout className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-mono text-xs font-bold text-amber-500">{selectedAsset.tag}</p>
                          <p className="text-sm font-semibold leading-none">{selectedAsset.name}</p>
                          <div className="flex gap-2 pt-1">
                            <Badge className={cn("text-[9px] h-4 py-0", CRITICALITY_COLORS[selectedAsset.criticality])}>
                              Criticidade {selectedAsset.criticality}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="template_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Checklist (opcional)</FormLabel>
                        <Select 
                          onValueChange={(val) => {
                            field.onChange(val);
                            setSelectedTemplateId(val || "");
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-muted/30">
                              <SelectValue placeholder="Selecione um template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {templates.map((t) => (
                              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {selectedTemplate && selectedTemplateId !== "none" && (
                    <Card className="bg-emerald-500/5 border-emerald-500/20 p-3">
                       <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Plus className="h-3 w-3" /> Checklist Vinculado
                       </p>
                       <p className="text-sm font-semibold">{selectedTemplate.name}</p>
                       <p className="text-xs text-muted-foreground">Serão gerados {selectedTemplate.items_count} itens de verificação.</p>
                    </Card>
                  )}

                  {selectedAssetId && plans.length > 0 && (
                     <FormField
                      control={form.control}
                      name="plan_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plano Preventivo Vínculo (opcional)</FormLabel>
                          <Select onValueChange={(val) => field.onChange(val || "")} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Vincular a um plano..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {plans.map((p) => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="h-px bg-border/30" />

              {/* Detalhes */}
              <div className="space-y-6">
                 <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título da OS</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={osType === "corrective" ? "Descreva o problema brevemente..." : "Título da atividade..."} 
                          {...field} 
                          className="bg-muted/30"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Detalhada</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Instruções específicas para o técnico..." 
                            className="bg-muted/20 min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {osType === "corrective" && (
                     <FormField
                      control={form.control}
                      name="failure_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição da Falha</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="O que aconteceu? Quando percebeu?" 
                              className="bg-red-500/5 border-red-500/20 min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <div className="h-px bg-border/30" />

              {/* Atribuição e Agenda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <FormField
                  control={form.control}
                  name="assigned_to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                         <User className="h-3.5 w-3.5" />
                         Técnico Responsável
                      </FormLabel>
                      <Select onValueChange={(val) => field.onChange(val || "")} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/30">
                            <SelectValue placeholder="Selecione um técnico" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requested_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Solicitante</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome de quem solicitou" {...field} className="bg-muted/30" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scheduled_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                         <Calendar className="h-3.5 w-3.5" />
                         Data Programada
                      </FormLabel>
                      <FormControl>
                         <Input type="date" {...field} className="bg-muted/30 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Limite</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-muted/30 h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/work-orders")}
              disabled={loading}
              className="px-8"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 text-amber-950 hover:bg-amber-600 font-bold px-12 h-11"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Gerar Ordem de Serviço"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
