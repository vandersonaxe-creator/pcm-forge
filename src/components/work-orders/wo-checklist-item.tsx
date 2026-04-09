"use client";

import { useState, useCallback } from "react";
import type { WorkOrder, WorkOrderItem } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Check, X, Minus, Camera, AlertCircle, 
  Trash2, Loader2, Image as ImageIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadWorkOrderPhoto } from "@/hooks/use-work-orders";
import { toast } from "sonner";

interface WOChecklistItemProps {
  item: WorkOrderItem;
  workOrder: WorkOrder;
  onUpdate: (itemId: string, data: Partial<WorkOrderItem>) => Promise<void>;
  isReadOnly?: boolean;
}

export function WOChecklistItem({ item, workOrder, onUpdate, isReadOnly }: WOChecklistItemProps) {
  const [loading, setLoading] = useState(false);
  const [localNote, setLocalNote] = useState(item.note || "");
  const [uploading, setUploading] = useState(false);

  const handleValueUpdate = async (value: string | null, conforms: boolean | null, measured?: number | null) => {
    if (isReadOnly || loading) return;
    setLoading(true);
    try {
      await onUpdate(item.id, {
        value,
        is_conforming: conforms,
        measured_value: measured !== undefined ? measured : item.measured_value
      });
    } catch (error) {
      toast.error("Erro ao salvar item");
    } finally {
      setLoading(false);
    }
  };

  const handleNoteBlur = async () => {
    if (localNote === item.note) return;
    try {
      await onUpdate(item.id, { note: localNote });
    } catch (error) {
      toast.error("Erro ao salvar nota");
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isReadOnly) return;

    setUploading(true);
    try {
      await uploadWorkOrderPhoto(workOrder.company_id, workOrder.id, item.id, file);
      toast.success("Foto enviada com sucesso!");
      // We rely on the parent refetch to see the new photo in item.photos
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const renderInput = () => {
    switch (item.item_type) {
      case "check":
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isReadOnly || loading}
              className={cn(
                "h-9 px-4 rounded-full border-success/30 text-success hover:bg-success/10",
                item.value === "OK" && "bg-success text-white hover:bg-success hover:text-white"
              )}
              onClick={() => handleValueUpdate("OK", true)}
            >
              <Check className="mr-1 h-3.5 w-3.5" /> OK
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isReadOnly || loading}
              className={cn(
                "h-9 px-4 rounded-full border-destructive/30 text-destructive hover:bg-destructive/10",
                item.value === "NOK" && "bg-destructive text-white hover:bg-destructive hover:text-white"
              )}
              onClick={() => handleValueUpdate("NOK", false)}
            >
              <X className="mr-1 h-3.5 w-3.5" /> NOK
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isReadOnly || loading}
              className={cn(
                "h-9 px-4 rounded-full border-border/30",
                item.value === "NA" && "bg-muted text-muted-foreground"
              )}
              onClick={() => handleValueUpdate("NA", null)}
            >
              <Minus className="mr-1 h-3.5 w-3.5" /> N/A
            </Button>
          </div>
        );

      case "measure":
        const rangeError = item.measured_value !== null && (
          (item.min_value !== null && item.measured_value! < (item.min_value as any)) ||
          (item.max_value !== null && item.measured_value! > (item.max_value as any))
        );

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                disabled={isReadOnly || loading}
                defaultValue={item.measured_value?.toString() || ""}
                placeholder="0.00"
                className={cn(
                  "h-9 w-28 text-right bg-background/50 font-technical",
                  rangeError && "border-destructive focus:ring-destructive"
                )}
                onBlur={(e) => {
                  const val = e.target.value === "" ? null : parseFloat(e.target.value);
                  const isConf = val === null ? null : (
                    (item.min_value === null || val >= (item.min_value as any)) &&
                    (item.max_value === null || val <= (item.max_value as any))
                  );
                  handleValueUpdate(e.target.value, isConf, val);
                }}
              />
              <span className="text-sm font-bold text-muted-foreground">{item.unit}</span>
            </div>
            {(item.min_value !== null || item.max_value !== null) && (
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                Limite: {item.min_value ?? "-∞"} {item.unit} a {item.max_value ?? "+∞"} {item.unit}
              </p>
            )}
            {rangeError && (
              <div className="flex items-center gap-1.5 text-destructive text-[10px] font-bold uppercase">
                <AlertCircle className="h-3 w-3" />
                Fora da faixa de tolerância
              </div>
            )}
          </div>
        );

      case "photo":
        return (
          <div className="w-full">
             <Button
                variant="outline"
                disabled={isReadOnly || uploading}
                className="w-full h-12 gap-2 border-dashed border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-all group"
                onClick={() => document.getElementById(`file-${item.id}`)?.click()}
             >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 transition-transform group-hover:scale-110" />}
                {item.photos && (item.photos as any[]).length > 0 ? "Adicionar outra foto" : "Capturar Foto"}
             </Button>
             <input 
               id={`file-${item.id}`}
               type="file" 
               accept="image/*" 
               capture="environment"
               className="hidden" 
               onChange={handlePhotoUpload}
             />
          </div>
        );

      case "select":
        const options = (item.options || "").split("|");
        return (
          <div className="flex flex-wrap gap-2">
             {options.map((opt) => (
               <Button
                 key={opt}
                 size="sm"
                 variant="outline"
                 disabled={isReadOnly || loading}
                 className={cn(
                   "h-9 rounded-lg bg-background/50",
                   item.value === opt && "border-primary bg-primary/10 text-primary font-bold"
                 )}
                 onClick={() => handleValueUpdate(opt, true)}
               >
                 {opt}
               </Button>
             ))}
          </div>
        );

      case "text":
        return (
          <Textarea
            disabled={isReadOnly || loading}
            defaultValue={item.value || ""}
            placeholder="Descreva as observações..."
            className="min-h-[80px] bg-background/50"
            onBlur={(e) => handleValueUpdate(e.target.value, true)}
          />
        );

      default:
        return null;
    }
  };

  // Visibility of notes field
  const showNoteField = item.item_type === "measure" || (item.item_type === "check" && item.value === "NOK") || item.note;

  return (
    <div className={cn(
      "p-5 rounded-2xl bg-card/40 border transition-all duration-300 shadow-sm",
      item.value ? "border-success/20 bg-success/[0.02]" : "border-border/20",
      loading && "opacity-60"
    )}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <p className="text-sm font-semibold leading-relaxed text-foreground/90">
              {item.description}
            </p>
            {item.requires_photo && !(item.photos || []).length && (
               <Badge className="shrink-0 bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] animate-pulse">
                 FOTO OBRIGATÓRIA
               </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
             {(item.photos || []).map((photo) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-border/40 shadow-sm w-20 h-20">
                   <img 
                     src={photo.storage_path.startsWith('http') ? photo.storage_path : `/api/storage/photos/${photo.storage_path}`} 
                     alt="Item evidence" 
                     className="w-full h-full object-cover"
                   />
                   {!isReadOnly && (
                      <button className="absolute inset-0 bg-destructive/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Trash2 className="h-4 w-4 text-white" />
                      </button>
                   )}
                </div>
             ))}
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[280px] shrink-0">
          {renderInput()}
        </div>
      </div>

      {showNoteField && (
        <div className="mt-4 pt-4 border-t border-border/10 space-y-2">
           <label className={cn(
             "text-[10px] font-bold uppercase tracking-widest",
             item.value === "NOK" ? "text-destructive" : "text-muted-foreground"
           )}>
             Anotações / Justificativa {item.value === "NOK" && "(Obrigatório)"}
           </label>
           <Textarea
             disabled={isReadOnly || loading}
             value={localNote}
             onChange={(e) => setLocalNote(e.target.value)}
             onBlur={handleNoteBlur}
             placeholder="Digite aqui..."
             className={cn(
               "h-20 bg-background/30 text-xs",
               item.value === "NOK" && !localNote && "border-destructive focus:ring-destructive"
             )}
           />
        </div>
      )}
    </div>
  );
}
