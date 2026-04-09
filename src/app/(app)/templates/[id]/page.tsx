"use client";

import { useTemplate } from "@/hooks/use-templates";
import { TemplateForm } from "@/components/templates/template-form";
import { TemplatePreviewModal } from "@/components/templates/template-preview-modal";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileEdit, Ghost, Globe, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function TemplateDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { template, loading, error } = useTemplate(id as string);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Carregando template...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4 text-center">
        <div className="p-4 rounded-full bg-red-500/10 text-red-500">
           <Ghost className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold">Template não encontrado</h2>
        <p className="text-muted-foreground max-w-md">
          {error || "O template que você está tentando acessar não existe ou foi removido."}
        </p>
        <Button variant="outline" onClick={() => router.push("/templates")}>
           Voltar para biblioteca
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
           <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors"
            onClick={() => router.push("/templates")}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Voltar para biblioteca
          </Button>

          <TemplatePreviewModal 
            name={template.name} 
            description={template.description || ""} 
            items={template.items || []} 
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <FileEdit className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
                {template.is_global && (
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1.5">
                    <Globe className="h-3 w-3" />
                    GLOBAL
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {template.description || "Sem descrição informada."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <TemplateForm initialData={template} isReadOnly={template.is_global} />
    </div>
  );
}
