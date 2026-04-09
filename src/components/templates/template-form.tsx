"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  Trash2,
  Settings2,
  ChevronDown,
  ChevronUp,
  Layout,
  Type,
  CheckCircle2,
  Camera,
  Hash,
  ListFilter,
  AlertCircle,
  Eye,
  Loader2,
  Copy,
} from "lucide-react";
import { CHECKLIST_CATEGORIES, CHECKLIST_ITEM_TYPE_LABELS } from "@/lib/constants";
import { createTemplate, updateTemplate } from "@/hooks/use-templates";
import { toast } from "sonner";
import type { ChecklistTemplate, ChecklistTemplateItem } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const itemSchema = z.object({
  id: z.string().optional(), // For existing items
  group_name: z.string().nullable().optional(),
  description: z.string().min(1, "A descrição é obrigatória"),
  item_type: z.enum(["check", "measure", "photo", "text", "select"]),
  min_value: z.number().nullable().optional(),
  max_value: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  options: z.string().nullable().optional(),
  requires_photo: z.boolean(),
  requires_note_on_nok: z.boolean(),
});

const templateSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  description: z.string().nullable().optional(),
  category: z.string().min(1, "Selecione uma categoria"),
  items: z.array(itemSchema),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  initialData?: ChecklistTemplate;
  isReadOnly?: boolean;
}

export function TemplateForm({ initialData, isReadOnly }: TemplateFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      category: initialData.category || "",
      items: initialData.items || [],
    } : {
      name: "",
      description: "",
      category: "Preventiva",
      items: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group items by group_name for display
  const groupedItems = useMemo(() => {
    const groups: Record<string, number[]> = {};
    fields.forEach((field, index) => {
      const gName = field.group_name || "Geral";
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(index);
    });
    return groups;
  }, [fields]);

  const groupNames = useMemo(() => Object.keys(groupedItems), [groupedItems]);

  const handleAddField = (groupName: string) => {
    append({
      group_name: groupName,
      description: "",
      item_type: "check",
      requires_photo: false,
      requires_note_on_nok: true,
    });
    // Expand the last item (the one just added)
    setExpandedItems(prev => ({ ...prev, [fields.length]: true }));
  };

  const handleAddGroup = () => {
    const defaultGroupName = `Novo Grupo ${groupNames.length + 1}`;
    handleAddField(defaultGroupName);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      
      // Update group name if dragged to a different group position
      // This is a bit complex in a flat DND setup, we'd need to check the 'over' item's group
      const overItem = fields[newIndex];
      const activeItem = fields[oldIndex];
      
      if (activeItem.group_name !== overItem.group_name) {
        form.setValue(`items.${oldIndex}.group_name`, overItem.group_name);
      }
      
      move(oldIndex, newIndex);
    }
  };

  async function onSubmit(values: TemplateFormValues) {
    if (isReadOnly) return;
    setLoading(true);
    try {
      if (initialData) {
        await updateTemplate(initialData.id, values, values.items);
        toast.success("Template atualizado com sucesso!");
      } else {
        const template = await createTemplate(values, values.items);
        toast.success("Template criado com sucesso!");
        router.push(`/templates/${template.id}`);
        return;
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar template");
    } finally {
      setLoading(false);
    }
  }

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isReadOnly && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3 text-amber-500">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">Este é um template global do sistema e não pode ser editado.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Dados do Template */}
          <Card className="lg:col-span-1 bg-card/50 border-border/30 h-fit sticky top-6">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Definições
              </h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Nome do Template</FormLabel>
                    <FormControl>
                      <Input disabled={isReadOnly} placeholder="Ex: Inspeção de Compressor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      disabled={isReadOnly}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CHECKLIST_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        disabled={isReadOnly}
                        placeholder="Descreva o propósito deste checklist..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex flex-col gap-2">
                <Button 
                  type="submit" 
                  disabled={loading || isReadOnly} 
                  className="w-full font-bold"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Template"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                   className="w-full"
                  onClick={() => router.push("/templates")}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Editor de Itens */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Estrutura de Itens
              </h2>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddGroup}
                disabled={isReadOnly}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Grupo
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-8">
                {groupNames.map((gName) => (
                  <div key={gName} className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                         <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {groupedItems[gName].length}
                         </Badge>
                         {gName}
                      </h3>
                      <div className="h-px flex-1 bg-border/30" />
                      {!isReadOnly && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => handleAddField(gName)}
                          >
                            <Plus className="mr-1 h-3 w-3" /> Item
                          </Button>
                        </div>
                      )}
                    </div>

                    <SortableContext
                      items={groupedItems[gName].map(idx => fields[idx].id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {groupedItems[gName].map((fieldIndex) => (
                          <SortableItem
                            key={fields[fieldIndex].id}
                            id={fields[fieldIndex].id}
                            index={fieldIndex}
                            form={form}
                            onRemove={() => remove(fieldIndex)}
                            isExpanded={!!expandedItems[fieldIndex]}
                            onToggle={() => toggleExpand(fieldIndex)}
                            isReadOnly={isReadOnly}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </div>
                ))}

                {fields.length === 0 && (
                  <Card className="border-dashed border-border/30 bg-muted/10">
                    <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                      <Layout className="h-12 w-12 text-muted-foreground/20 mb-4" />
                      <p className="text-muted-foreground mb-4">Seu template ainda não tem itens.</p>
                      <Button type="button" onClick={handleAddGroup}>
                        Começar Agora
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DndContext>
          </div>
        </div>
      </form>
    </Form>
  );
}

function SortableItem({ id, index, form, onRemove, isExpanded, onToggle, isReadOnly }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const itemType = form.watch(`items.${index}.item_type`);
  const description = form.watch(`items.${index}.description`);

  return (
    <div ref={setNodeRef} style={style} className="group/item">
      <Card className={cn(
        "bg-card/30 border-border/30 transition-shadow",
        isDragging && "shadow-xl border-primary/50"
      )}>
        <div className="flex items-start p-3 gap-3">
          <div 
            {...attributes} 
            {...listeners} 
            className={cn(
               "p-1.5 rounded hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground",
               isReadOnly && "pointer-events-none opacity-0"
            )}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex-1 space-y-1">
            {isExpanded ? (
               <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Descrição</FormLabel>
                          <FormControl>
                            <Input disabled={isReadOnly} placeholder="O que o técnico deve verificar?" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.item_type`}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Tipo</FormLabel>
                          <Select
                            disabled={isReadOnly}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(CHECKLIST_ITEM_TYPE_LABELS).map(([val, label]) => (
                                <SelectItem key={val} value={val}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Configurações específicas baseadas no tipo */}
                  <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/20 p-3 rounded-lg border border-border/10">
                    {itemType === "measure" && (
                      <>
                        <FormField
                          control={form.control}
                          name={`items.${index}.min_value`}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Mínimo</FormLabel>
                              <FormControl>
                                <Input 
                                  disabled={isReadOnly}
                                  type="number" 
                                  {...field} 
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                  className="h-8" 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.max_value`}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Máximo</FormLabel>
                              <FormControl>
                                <Input 
                                  disabled={isReadOnly}
                                  type="number" 
                                  {...field} 
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))}
                                  className="h-8" 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.unit`}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Unidade</FormLabel>
                              <FormControl>
                                <Input disabled={isReadOnly} placeholder="ex: bar, °C, A" className="h-8" {...field} value={field.value ?? ""} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {itemType === "select" && (
                      <div className="md:col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.options`}
                          render={({ field }: { field: any }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Opções (separadas por '|')</FormLabel>
                              <FormControl>
                                <Input disabled={isReadOnly} placeholder="ex: Bom|Regular|Ruim" {...field} value={field.value ?? ""} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <div className="md:col-span-3 flex flex-wrap gap-4 pt-2">
                       <FormField
                          control={form.control}
                          name={`items.${index}.requires_photo`}
                          render={({ field }: { field: any }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Switch disabled={isReadOnly} checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                              </FormControl>
                              <FormLabel className="text-xs text-muted-foreground">Foto Obrigatória</FormLabel>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.requires_note_on_nok`}
                          render={({ field }: { field: any }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                              <FormControl>
                                <Switch disabled={isReadOnly} checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                              </FormControl>
                              <FormLabel className="text-xs text-muted-foreground">Nota no NOK</FormLabel>
                            </FormItem>
                          )}
                        />
                    </div>
                  </div>
                  
                  {/* Campo exclusivo para trocar nome do grupo (move o item) */}
                  <div className="md:col-span-12">
                    <FormField
                      control={form.control}
                      name={`items.${index}.group_name`}
                      render={({ field }: { field: any }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground">Grupo</FormLabel>
                          <FormControl>
                            <Input disabled={isReadOnly} {...field} className="h-8" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
               </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium line-clamp-1">{description || "Novo Item"}</span>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 opacity-70">
                   {CHECKLIST_ITEM_TYPE_LABELS[itemType as keyof typeof CHECKLIST_ITEM_TYPE_LABELS]}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={onToggle}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            {!isReadOnly && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
