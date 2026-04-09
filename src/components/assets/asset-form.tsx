"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { useCategories, useLocations, createCategory, createLocation, createAsset, updateAsset } from "@/hooks/use-assets";
import { ASSET_TYPE_LABELS, CRITICALITY_LABELS } from "@/lib/constants";
import type { Asset, AssetType, CriticalityLevel, AssetStatus } from "@/lib/types/database";
import { createClient } from "@/lib/supabase/client";

interface AssetFormProps {
  asset?: Asset | null;
  mode: "create" | "edit";
}

export function AssetForm({ asset, mode }: AssetFormProps) {
  const router = useRouter();
  const { categories, refetch: refetchCategories } = useCategories();
  const { locations, refetch: refetchLocations } = useLocations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(asset?.photo_url || null);

  // Form state
  const [form, setForm] = useState({
    tag: asset?.tag || "",
    name: asset?.name || "",
    asset_type: (asset?.asset_type || "equipment") as AssetType,
    manufacturer: asset?.manufacturer || "",
    model: asset?.model || "",
    serial_number: asset?.serial_number || "",
    category_id: asset?.category_id || "",
    location_id: asset?.location_id || "",
    criticality: (asset?.criticality || "B") as CriticalityLevel,
    status: (asset?.status || "active") as AssetStatus,
    notes: asset?.notes || "",
    // Instrument-specific fields
    measurement_range: asset?.measurement_range || "",
    resolution: asset?.resolution || "",
    accuracy: asset?.accuracy || "",
    calibration_frequency_days: asset?.calibration_frequency_days?.toString() || "",
    calibration_provider: asset?.calibration_provider || "",
  });

  const isInstrument = form.asset_type === "instrument";

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let photoUrl = asset?.photo_url || null;

      // Upload photo if changed
      if (photoFile) {
        const supabase = createClient();
        const ext = photoFile.name.split(".").pop();
        const filePath = `assets/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(filePath, photoFile);

        if (uploadError) throw new Error("Erro ao enviar foto: " + uploadError.message);

        const { data: urlData } = supabase.storage.from("photos").getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }

      // Build asset data
      const assetData: Partial<Asset> = {
        tag: form.tag,
        name: form.name,
        asset_type: form.asset_type,
        manufacturer: form.manufacturer || null,
        model: form.model || null,
        serial_number: form.serial_number || null,
        category_id: form.category_id || null,
        location_id: form.location_id || null,
        criticality: form.criticality,
        status: form.status,
        notes: form.notes || null,
        photo_url: photoUrl,
      };

      // Add instrument fields if applicable
      if (isInstrument) {
        assetData.measurement_range = form.measurement_range || null;
        assetData.resolution = form.resolution || null;
        assetData.accuracy = form.accuracy || null;
        assetData.calibration_frequency_days = form.calibration_frequency_days
          ? parseInt(form.calibration_frequency_days)
          : null;
        assetData.calibration_provider = form.calibration_provider || null;
        assetData.calibration_status = "pending";
      } else {
        // Equipment: clear calibration fields
        assetData.measurement_range = null;
        assetData.resolution = null;
        assetData.accuracy = null;
        assetData.calibration_frequency_days = null;
        assetData.calibration_provider = null;
        assetData.calibration_status = "not_applicable";
        assetData.last_calibration_date = null;
        assetData.next_calibration_date = null;
      }

      if (mode === "create") {
        const created = await createAsset(assetData);
        router.push(`/assets/${created.id}`);
      } else if (asset) {
        await updateAsset(asset.id, assetData);
        router.push(`/assets/${asset.id}`);
      }

      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao salvar ativo";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const filteredCategories = categories.filter(
    (c) => c.asset_type === form.asset_type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Tipo e Identificação */}
      <Card className="bg-white border-[var(--color-border)] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#F8FAFC] border-b border-[var(--color-border)] p-4">
          <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Identificação do Ativo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="asset_type" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Tipo de Ativo *</Label>
              <Select
                value={form.asset_type}
                onValueChange={(v) => {
                  updateField("asset_type", v ?? "");
                  updateField("category_id", "");
                }}
              >
                <SelectTrigger id="asset_type" className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tag" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Tag (Código Interno) *</Label>
              <Input
                id="tag"
                value={form.tag}
                onChange={(e) => updateField("tag", e.target.value)}
                placeholder="Ex: FUR-001, PAQ-015"
                required
                className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Nome do Ativo *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Ex: Furadeira de Bancada, Paquímetro Digital"
              required
              className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)] max-w-[800px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="manufacturer" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Fabricante</Label>
              <Input
                id="manufacturer"
                value={form.manufacturer}
                onChange={(e) => updateField("manufacturer", e.target.value)}
                placeholder="Ex: Bosch, Mitutoyo"
                className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Modelo</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(e) => updateField("model", e.target.value)}
                placeholder="Ex: GBM 13-2 RE"
                className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serial_number" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Nº de Série</Label>
              <Input
                id="serial_number"
                value={form.serial_number}
                onChange={(e) => updateField("serial_number", e.target.value)}
                placeholder="Ex: SN-2024-00123"
                className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classificação */}
      <Card className="bg-white border-[var(--color-border)] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#F8FAFC] border-b border-[var(--color-border)] p-4">
          <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Classificação e Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category_id" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Categoria</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => updateField("category_id", v ?? "")}
              >
                <SelectTrigger id="category_id" className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  {filteredCategories.length === 0 && (
                    <div className="px-2 py-3 text-sm text-center text-muted-foreground border-b border-border/50">
                      Nenhuma categoria cadastrada
                    </div>
                  )}
                  <div 
                    className="p-2 cursor-pointer text-sm font-medium text-primary hover:bg-primary/10 rounded-sm w-full text-center mt-1"
                    onClick={async (e) => {
                      e.preventDefault();
                      const name = window.prompt("Nome da nova categoria:");
                      if (name) {
                        try {
                          const created = await createCategory(name, form.asset_type);
                          await refetchCategories();
                          updateField("category_id", created.id);
                        } catch (err: any) {
                          alert("Erro ao criar: " + err.message);
                        }
                      }
                    }}
                  >
                    + Criar nova Categoria
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location_id" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Localização</Label>
              <Select
                value={form.location_id}
                onValueChange={(v) => updateField("location_id", v ?? "")}
              >
                <SelectTrigger id="location_id" className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                  {locations.length === 0 && (
                    <div className="px-2 py-3 text-sm text-center text-muted-foreground border-b border-border/50">
                      Nenhuma localização cadastrada
                    </div>
                  )}
                  <div 
                    className="p-2 cursor-pointer text-sm font-medium text-primary hover:bg-primary/10 rounded-sm w-full text-center mt-1"
                    onClick={async (e) => {
                      e.preventDefault();
                      const name = window.prompt("Nome da nova localização:");
                      if (name) {
                        try {
                          const created = await createLocation(name);
                          await refetchLocations();
                          updateField("location_id", created.id);
                        } catch (err: any) {
                          alert("Erro ao criar: " + err.message);
                        }
                      }
                    }}
                  >
                    + Criar nova Localização
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="criticality" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Criticidade</Label>
              <Select
                value={form.criticality}
                onValueChange={(v) => updateField("criticality", v ?? "")}
              >
                <SelectTrigger id="criticality" className="h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CRITICALITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {mode === "edit" && (
            <div className="space-y-1.5 mt-4">
              <Label htmlFor="status" className="text-[12px] font-medium text-[var(--color-text-secondary)]">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => updateField("status", v ?? "")}
              >
                <SelectTrigger id="status" className="w-[300px] h-[36px] bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus:ring-[var(--color-brand)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="maintenance">Em Manutenção</SelectItem>
                  <SelectItem value="disposed">Descartado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campos Metrológicos (Instrumento) */}
      {isInstrument && (
        <Card className="bg-[#F0F9FF] border-[var(--color-info-border)] shadow-sm overflow-hidden">
          <CardHeader className="bg-[#E0F2FE] border-b border-[var(--color-info-border)] p-4">
            <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-info-text)] flex items-center gap-2">
              Dados Metrológicos Específicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="measurement_range" className="text-[12px] font-medium text-[var(--color-info-text)] opacity-80">Faixa de Medição</Label>
                <Input
                  id="measurement_range"
                  value={form.measurement_range}
                  onChange={(e) => updateField("measurement_range", e.target.value)}
                  placeholder="Ex: 0-150mm"
                  className="h-[36px] bg-white border-[#bae6fd] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[#bae6fd]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resolution" className="text-[12px] font-medium text-[var(--color-info-text)] opacity-80">Resolução</Label>
                <Input
                  id="resolution"
                  value={form.resolution}
                  onChange={(e) => updateField("resolution", e.target.value)}
                  placeholder="Ex: 0.01mm"
                  className="h-[36px] bg-white border-[#bae6fd] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[#bae6fd]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="accuracy" className="text-[12px] font-medium text-[var(--color-info-text)] opacity-80">Precisão</Label>
                <Input
                  id="accuracy"
                  value={form.accuracy}
                  onChange={(e) => updateField("accuracy", e.target.value)}
                  placeholder="Ex: ±0.02mm"
                  className="h-[36px] bg-white border-[#bae6fd] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[#bae6fd]"
                />
              </div>
            </div>

            <Separator className="bg-[#bae6fd]" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="calibration_frequency_days" className="text-[12px] font-medium text-[var(--color-info-text)] opacity-80">
                  Frequência de Calibração (dias) *
                </Label>
                <Input
                  id="calibration_frequency_days"
                  type="number"
                  min="1"
                  value={form.calibration_frequency_days}
                  onChange={(e) => updateField("calibration_frequency_days", e.target.value)}
                  placeholder="Ex: 365"
                  required={isInstrument}
                  className="h-[36px] bg-white border-[#bae6fd] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[#bae6fd]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="calibration_provider" className="text-[12px] font-medium text-[var(--color-info-text)] opacity-80">Empresa Calibradora</Label>
                <Input
                  id="calibration_provider"
                  value={form.calibration_provider}
                  onChange={(e) => updateField("calibration_provider", e.target.value)}
                  placeholder="Ex: Calibra Instrumentos Ltda"
                  className="h-[36px] bg-white border-[#bae6fd] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[#bae6fd]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Foto */}
      <Card className="bg-white border-[var(--color-border)] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#F8FAFC] border-b border-[var(--color-border)] p-4">
          <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Foto do Ativo</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {photoPreview ? (
              <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-border/50">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 w-32 rounded-lg border border-dashed border-border/50 flex items-center justify-center bg-muted/30">
                <Upload className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="photo" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors">
                  <Upload className="h-4 w-4" />
                  {photoPreview ? "Trocar foto" : "Enviar foto"}
                </div>
              </Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WebP. Máx. 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card className="bg-white border-[var(--color-border)] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#F8FAFC] border-b border-[var(--color-border)] p-4">
          <CardTitle className="text-[13px] font-bold uppercase tracking-wider text-[var(--color-text-primary)]">Observações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <Textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Documentação, avisos, etc..."
            rows={4}
            className="bg-white border-[var(--color-border-strong)] rounded-lg text-[13px] text-[var(--color-text-primary)] focus-visible:ring-[var(--color-brand)] p-3 resize-y"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-muted-foreground"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold min-w-[140px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : mode === "create" ? (
            "Cadastrar Ativo"
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
