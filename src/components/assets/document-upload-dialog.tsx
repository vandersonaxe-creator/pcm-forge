"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2, UploadCloud, FileIcon } from "lucide-react";
import { uploadAssetDocument } from "@/hooks/use-asset-documents";
import type { AssetDocumentType } from "@/lib/types/database";
import { toast } from "sonner";

const TYPE_OPTIONS: { value: AssetDocumentType; label: string }[] = [
  { value: "certificate", label: "Certificado" },
  { value: "manual", label: "Manual" },
  { value: "datasheet", label: "Datasheet" },
  { value: "report", label: "Laudo" },
  { value: "other", label: "Outro" },
];

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  companyId: string;
  onUploaded: () => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  assetId,
  companyId,
  onUploaded,
}: DocumentUploadDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [docType, setDocType] = useState<AssetDocumentType>("certificate");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName("");
    setDescription("");
    setDocType("certificate");
    setFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do documento.");
      return;
    }
    if (!file) {
      toast.error("Selecione um arquivo.");
      return;
    }

    setSubmitting(true);
    try {
      await uploadAssetDocument({
        assetId,
        companyId,
        name: name.trim(),
        description: description.trim() || null,
        documentType: docType,
        file,
      });
      toast.success("Documento enviado com sucesso.");
      reset();
      onOpenChange(false);
      onUploaded();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar documento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg" showCloseButton={!submitting}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar documento</DialogTitle>
            <DialogDescription>
              Certificados, laudos e documentos técnicos (PDF ou imagem, até 10 MB).
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="doc-name">Nome do documento *</Label>
              <Input
                id="doc-name"
                placeholder="Certificado de Calibração PAQ-001"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as AssetDocumentType)}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-desc">Descrição (opcional)</Label>
              <Textarea
                id="doc-desc"
                placeholder="Observações sobre o documento..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                className="min-h-[72px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Arquivo *</Label>
              <div
                className="border-2 border-dashed border-border/50 rounded-xl p-5 bg-muted/20 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() =>
                  !submitting && document.getElementById("asset-doc-upload")?.click()
                }
              >
                <input
                  id="asset-doc-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  className="hidden"
                  disabled={submitting}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div className="flex flex-col items-center text-emerald-600 gap-1">
                    <FileIcon className="h-8 w-8" />
                    <span className="font-medium text-sm break-all px-2">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      className="text-xs text-primary mt-1 underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      Remover arquivo
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <UploadCloud className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Clique para selecionar</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG ou PNG — máx. 10 MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Enviar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
