"use client";

import { TemplateForm } from "@/components/templates/template-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FilePlus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewTemplatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit p-0 h-auto text-muted-foreground hover:text-primary transition-colors"
          onClick={() => router.push("/templates")}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Voltar para biblioteca
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <FilePlus className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Template</h1>
        </div>
        <p className="text-muted-foreground">
          Crie um novo modelo de checklist definindo grupos e itens de verificação.
        </p>
      </div>

      <TemplateForm />
    </div>
  );
}
