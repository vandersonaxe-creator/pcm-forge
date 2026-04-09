"use client";

import { use, useEffect, useState } from "react";
import { useWorkOrder } from "@/hooks/use-work-orders";
import { useCompany } from "@/hooks/use-company";
import { WOReportDocument } from "@/components/work-orders/wo-report-document";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ArrowLeft, Download, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkOrderReportPage({ params }: ReportPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { workOrder, loading: woLoading, error: woError } = useWorkOrder(id);
  const { company, loading: coLoading } = useCompany();

  if (woLoading || coLoading) {
    return (
      <div className="max-w-4xl mx-auto p-12 space-y-8">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-[800px] w-full" />
      </div>
    );
  }

  if (woError || !workOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4 opacity-20" />
        <h2 className="text-xl font-bold mb-2">Relatório não disponível</h2>
        <p className="text-muted-foreground">{woError || "Não foi possível carregar os dados desta OS."}</p>
        <Button variant="link" onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100/50 dark:bg-zinc-950 px-4 py-8 print:p-0 print:bg-white">
      {/* Action Bar - Hidden on print */}
      <div className="max-w-[800px] mx-auto mb-8 flex items-center justify-between print:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para OS
        </Button>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 border-primary/20 bg-background hover:bg-muted"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Imprimir Relatório
          </Button>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary-hover text-white gap-2 font-bold shadow-lg shadow-primary/20"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4" />
            Salvar PDF
          </Button>
        </div>
      </div>

      {/* The actual document */}
      <div className="print:m-0">
        <WOReportDocument workOrder={workOrder} company={company} />
      </div>

      {/* Floating Info - Hidden on print */}
      <div className="fixed bottom-8 right-8 print:hidden">
         <div className="bg-card/80 backdrop-blur border border-border/40 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
               <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
               <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Documento Gerado</p>
               <p className="text-sm font-black font-technical">{workOrder.wo_number}</p>
            </div>
         </div>
      </div>

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            margin: 1cm;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
