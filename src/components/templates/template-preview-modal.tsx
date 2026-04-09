"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  CheckCircle2, 
  Camera, 
  Hash, 
  Type, 
  ListFilter,
  Info
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ChecklistTemplateItem } from "@/lib/types/database";
import { useMemo } from "react";

interface TemplatePreviewModalProps {
  name: string;
  description?: string;
  items: any[];
}

export function TemplatePreviewModal({ name, description, items }: TemplatePreviewModalProps) {
  const groupedItems = useMemo(() => {
    const groups: Record<string, any[]> = {};
    items.forEach((item) => {
      const gName = item.group_name || "Geral";
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(item);
    });
    return groups;
  }, [items]);

  const groupNames = Object.keys(groupedItems);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
        <Eye className="h-4 w-4" />
        Preview
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border/40">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-1">
            <CheckCircle2 className="h-5 w-5" />
            <DialogTitle className="text-xl font-bold">{name}</DialogTitle>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {groupNames.map((gName) => (
            <div key={gName} className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-sm uppercase tracking-widest text-primary/80">{gName}</h3>
                <Separator className="flex-1 bg-primary/20" />
              </div>

              <div className="space-y-4">
                {groupedItems[gName].map((item, idx) => (
                  <div key={idx} className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border/20 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-sm leading-tight">{item.description}</p>
                        {item.requires_photo && (
                           <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-amber-500 uppercase">
                             <Camera className="h-3 w-3" />
                             Foto Obrigatória
                           </div>
                        )}
                      </div>
                      
                      <div className="shrink-0 pt-0.5">
                         {item.item_type === "check" && (
                           <div className="flex gap-2">
                             <Button variant="outline" size="sm" className="h-8 rounded-full border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">OK</Button>
                             <Button variant="outline" size="sm" className="h-8 rounded-full border-red-500/30 text-red-500 hover:bg-red-500/10">NOK</Button>
                             <Button variant="outline" size="sm" className="h-8 rounded-full opacity-50">N/A</Button>
                           </div>
                         )}

                         {item.item_type === "measure" && (
                            <div className="flex items-center gap-2">
                              <Input 
                                disabled 
                                placeholder="0.00" 
                                className="h-8 w-24 text-right bg-background/50 border-border/30"
                              />
                              <span className="text-sm font-bold text-muted-foreground">{item.unit || ""}</span>
                              {(item.min_value !== null || item.max_value !== null) && (
                                <Badge variant="outline" className="text-[10px] h-5 bg-blue-500/5 text-blue-400 border-blue-500/20">
                                  {item.min_value ?? "∞"} - {item.max_value ?? "∞"}
                                </Badge>
                              )}
                            </div>
                         )}

                         {item.item_type === "photo" && (
                            <Button variant="outline" className="h-10 w-full gap-2 border-dashed border-primary/30 text-primary">
                              <Camera className="h-4 w-4" />
                              Capturar Foto
                            </Button>
                         )}

                         {item.item_type === "select" && (
                            <div className="flex flex-wrap gap-2">
                              {(item.options || "").split("|").map((opt: string) => (
                                <Button key={opt} variant="outline" size="sm" className="h-8 rounded-lg bg-background/50">
                                  {opt}
                                </Button>
                              ))}
                            </div>
                         )}

                         {item.item_type === "text" && (
                            <Textarea disabled placeholder="Anotações do técnico..." className="min-h-[60px] bg-background/50 border-border/30" />
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {items.length === 0 && (
             <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Info className="h-8 w-8 mb-3 opacity-20" />
                <p>Nenhum item adicionado a este template.</p>
             </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <DialogClose render={<Button variant="ghost" />}>
            Fechar Preview
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
