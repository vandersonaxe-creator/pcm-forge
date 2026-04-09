"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createCalibration } from "@/hooks/use-calibrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, File as FileIcon } from "lucide-react";
import type { Asset } from "@/lib/types/database";

const schema = z.object({
  calibration_date: z.string().min(1, "Data é obrigatória"),
  next_calibration_date: z.string().min(1, "Próxima data é obrigatória"),
  provider: z.string().min(1, "Empresa é obrigatória"),
  certificate_number: z.string().optional(),
  result: z.enum(["approved", "reproved", "adjusted"]),
  cost: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

// Helper to add days to a string date YYYY-MM-DD
function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function CalibrationForm({ asset }: { asset: Asset }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const freqDays = asset.calibration_frequency_days || 365; // fallbacks to 365 if logic fails
  const today = new Date().toISOString().split("T")[0];

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      calibration_date: today,
      next_calibration_date: addDaysToDateString(today, freqDays),
      result: "approved",
      provider: asset.calibration_provider || "", // suggests last provider
    }
  });

  const watchCalibrationDate = watch("calibration_date");

  // Re-calculate next date when current changes
  const handleCalibrationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("calibration_date", val);
    if (val) {
      setValue("next_calibration_date", addDaysToDateString(val, freqDays));
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true);
      await createCalibration({
        asset_id: asset.id,
        calibration_date: data.calibration_date,
        next_calibration_date: data.next_calibration_date,
        provider: data.provider,
        certificate_number: data.certificate_number || null,
        result: data.result,
        cost: data.cost ? parseFloat(data.cost) : null,
        notes: data.notes || null,
      }, file);

      router.push(`/assets/${asset.id}?tab=calibrations`);
      router.refresh();
    } catch (err: any) {
      alert("Erro ao salvar calibração: " + err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Informações do Ativo */}
      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Instrumento de Medição</p>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-primary/20 text-primary px-2 py-0.5 rounded text-sm font-semibold">{asset.tag}</span>
            <span className="font-medium text-lg">{asset.name}</span>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div>
            <span className="block opacity-70 mb-0.5">Frequência</span>
            <span className="font-medium text-foreground">{asset.calibration_frequency_days} dias</span>
          </div>
          <div>
            <span className="block opacity-70 mb-0.5">Faixa/Res.</span>
            <span className="font-medium text-foreground">{asset.measurement_range} / {asset.resolution}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calibration_date">Data da Calibração *</Label>
              <Input
                id="calibration_date"
                type="date"
                className="bg-muted/50"
                {...register("calibration_date")}
                onChange={handleCalibrationDateChange}
              />
              {errors.calibration_date && <p className="text-xs text-red-500">{errors.calibration_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_calibration_date">Próxima Calibração *</Label>
              <Input
                id="next_calibration_date"
                type="date"
                className="bg-yellow-950/20 border-yellow-900/30 text-yellow-500/90"
                {...register("next_calibration_date")}
              />
              {errors.next_calibration_date && <p className="text-xs text-red-500">{errors.next_calibration_date.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Laboratório / Empresa Calibradora *</Label>
            <Input
              id="provider"
              className="bg-muted/50"
              placeholder="Ex: Metrologia XYZ Ltda"
              {...register("provider")}
            />
            {errors.provider && <p className="text-xs text-red-500">{errors.provider.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="certificate_number">Nº do Certificado</Label>
              <Input
                id="certificate_number"
                className="bg-muted/50"
                placeholder="Ex: CERT-2026-991"
                {...register("certificate_number")}
              />
            </div>
            <div className="space-y-2">
              <Label>Resultado *</Label>
              <Select
                defaultValue={watch("result")}
                onValueChange={(v) => setValue("result", v as any)}
              >
                <SelectTrigger className="bg-muted/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="reproved">Reprovado</SelectItem>
                  <SelectItem value="adjusted">Ajustado e Aprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Custo da Calibração (R$)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              className="bg-muted/50"
              placeholder="0.00"
              {...register("cost")}
            />
          </div>
        </div>

        {/* Coluna 2 */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Laudo / Certificado (PDF)</Label>
            <div 
              className="border-2 border-dashed border-border/50 rounded-xl p-6 bg-muted/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => document.getElementById("certificate-upload")?.click()}
            >
              <input 
                id="certificate-upload" 
                type="file" 
                accept="application/pdf" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              
              {file ? (
                <div className="flex flex-col items-center text-emerald-500 gap-2">
                  <FileIcon className="h-10 w-10" />
                  <span className="font-medium text-sm">{file.name}</span>
                  <span className="text-xs opacity-70">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  <div className="mt-2 text-xs text-foreground bg-background px-3 py-1 rounded-full cursor-pointer hover:bg-muted border border-border" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    Trocar arquivo
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <UploadCloud className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Clique para anexar PDF</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Armazenado de forma segura e anexado no histórico
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2 flex-grow flex flex-col h-full">
            <Label htmlFor="notes">Notas ou Parecer Técnico</Label>
            <Textarea
              id="notes"
              className="bg-muted/50 flex-grow min-h-[120px] resize-none"
              placeholder="Observações sobre a calibração, necessidade de troca futura, etc."
              {...register("notes")}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border/30">
        <Button variant="ghost" type="button" onClick={() => router.back()} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[150px]" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrar Calibração"}
        </Button>
      </div>
    </form>
  );
}
