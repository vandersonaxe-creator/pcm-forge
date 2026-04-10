"use client";

import { useState } from "react";
import {
  useAssetDocuments,
  getDocumentSignedUrl,
  deleteAssetDocument,
} from "@/hooks/use-asset-documents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus, ExternalLink, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DocumentUploadDialog } from "./document-upload-dialog";
import type { AssetDocument, AssetDocumentType } from "@/lib/types/database";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<AssetDocumentType, string> = {
  certificate: "Certificado",
  manual: "Manual",
  datasheet: "Datasheet",
  report: "Laudo",
  other: "Outro",
};

function formatSize(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface AssetDocumentsProps {
  assetId: string;
  companyId: string;
}

export function AssetDocuments({ assetId, companyId }: AssetDocumentsProps) {
  const { documents, loading, refetch } = useAssetDocuments(assetId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleOpen(doc: AssetDocument) {
    setOpeningId(doc.id);
    try {
      const url = await getDocumentSignedUrl(doc.file_url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast.error(e.message || "Erro ao abrir documento.");
    } finally {
      setOpeningId(null);
    }
  }

  async function handleDelete(doc: AssetDocument) {
    if (
      !confirm(
        `Remover o documento "${doc.name}"? Esta ação não pode ser desfeita.`
      )
    ) {
      return;
    }
    setDeletingId(doc.id);
    try {
      await deleteAssetDocument(doc);
      toast.success("Documento removido.");
      await refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold">Documentos</CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Adicionar documento
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6 italic">
              Nenhum documento anexado. Adicione certificados, laudos ou manuais.
            </p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg border border-border/40 bg-muted/10 px-3 py-2.5"
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <FileText
                      className={cn(
                        "h-5 w-5 shrink-0 mt-0.5",
                        doc.document_type === "certificate"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      )}
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold leading-tight truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.file_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          {TYPE_LABELS[doc.document_type]}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(doc.created_at), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                        })}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          · {formatSize(doc.file_size)}
                        </span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => handleOpen(doc)}
                      disabled={openingId === doc.id || deletingId === doc.id}
                    >
                      {openingId === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Abrir
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      aria-label="Remover documento"
                    >
                      {deletingId === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <DocumentUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assetId={assetId}
        companyId={companyId}
        onUploaded={() => refetch()}
      />
    </>
  );
}
