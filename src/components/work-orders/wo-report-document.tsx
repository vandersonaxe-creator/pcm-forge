"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { WorkOrder, Company } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import { OS_STATUS_LABELS, OS_TYPE_LABELS, OS_STATUS_COLORS } from "@/lib/constants";
import { MapPin, Calendar, Clock, User, ClipboardList, Camera, Globe } from "lucide-react";

interface WOReportDocumentProps {
  workOrder: WorkOrder;
  company: Company | null;
}

export function WOReportDocument({ workOrder, company }: WOReportDocumentProps) {
  const items = workOrder.items || [];
  const photos = items.flatMap(i => (i.photos || []) as any[]);
  const now = new Date();

  const formatDate = (date: string | null | undefined, fmt = "dd/MM/yyyy HH:mm") => {
    if (!date) return "---";
    return format(new Date(date), fmt, { locale: ptBR });
  };

  return (
    <div className="bg-white text-zinc-950 p-8 sm:p-12 shadow-2xl max-w-[800px] mx-auto min-h-screen border border-zinc-200 print:shadow-none print:p-0 print:border-none">
      {/* Document Header */}
      <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-primary/20">
        <div className="space-y-2">
          {company?.logo_url ? (
            <img src={company.logo_url} alt="Logo" className="h-16 w-auto object-contain" />
          ) : (
            <div className="h-14 w-40 bg-zinc-100 rounded flex items-center justify-center border border-zinc-200">
               <span className="font-bold text-zinc-400">LOGO EMPRESA</span>
            </div>
          )}
          <div className="space-y-0.5">
            <h1 className="text-xl font-black tracking-tight text-primary uppercase">{company?.name || "Sistema PCM"}</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">{company?.cnpj || "00.000.000/0001-00"}</p>
          </div>
        </div>
        
        <div className="text-right space-y-1">
           <h2 className="text-3xl font-black text-zinc-900 font-technical tracking-tighter">RELATÓRIO DE OS</h2>
           <p className="text-lg font-bold text-primary font-technical">{workOrder.wo_number}</p>
           <Badge className={cn("mt-2", OS_STATUS_COLORS[workOrder.status as keyof typeof OS_STATUS_COLORS])}>
             {OS_STATUS_LABELS[workOrder.status as keyof typeof OS_STATUS_LABELS]}
           </Badge>
        </div>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-10">
        <section className="space-y-4">
           <div className="flex items-center gap-2 mb-2 pb-1 border-b border-zinc-100">
              <ClipboardList className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Identificação da OS</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Tipo</p>
                <p className="text-xs font-bold">{OS_TYPE_LABELS[workOrder.os_type as keyof typeof OS_TYPE_LABELS]}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Prioridade</p>
                <p className="text-xs font-bold uppercase">{workOrder.priority}</p>
              </div>
              <div className="col-span-2 space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Título do Serviço</p>
                <p className="text-sm font-bold">{workOrder.title}</p>
              </div>
           </div>
        </section>

        <section className="space-y-4">
           <div className="flex items-center gap-2 mb-2 pb-1 border-b border-zinc-100">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Responsabilidade</h3>
           </div>
           <div className="grid grid-cols-1 gap-4">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Técnico em Campo</p>
                <p className="text-sm font-bold underline decoration-zinc-100">{workOrder.assignee?.full_name || "---"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Solicitante / Cliente</p>
                <p className="text-sm font-bold">{workOrder.requested_by || "Automático"}</p>
              </div>
           </div>
        </section>

        <section className="space-y-4">
           <div className="flex items-center gap-2 mb-2 pb-1 border-b border-zinc-100">
              <Globe className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Ativo / Local</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Tag Ativo</p>
                <p className="text-xs font-bold font-technical">{workOrder.asset?.tag || "---"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Nome Ativo</p>
                <p className="text-xs font-bold">{workOrder.asset?.name || "---"}</p>
              </div>
              <div className="col-span-2 space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Localização</p>
                <p className="text-xs font-bold flex items-center gap-1">
                   <MapPin className="h-3 w-3 text-zinc-400" />
                   Área Industrial Central - Bloco B
                </p>
              </div>
           </div>
        </section>

        <section className="space-y-4">
           <div className="flex items-center gap-2 mb-2 pb-1 border-b border-zinc-100">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cronometragem</h3>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Início Real</p>
                <p className="text-xs font-bold">{formatDate(workOrder.started_at)}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-bold text-zinc-400 uppercase">Conclusão Real</p>
                <p className="text-xs font-bold">{formatDate(workOrder.completed_at)}</p>
              </div>
              <div className="col-span-2 bg-zinc-50 p-2 rounded border border-zinc-100 text-center">
                 <p className="text-[9px] font-bold text-zinc-400 uppercase">Tempo em Manutenção</p>
                 <p className="text-sm font-black text-primary">
                   {workOrder.actual_duration_min ? `${Math.floor(workOrder.actual_duration_min / 60)}h ${workOrder.actual_duration_min % 60}min` : "---"}
                 </p>
              </div>
           </div>
        </section>
      </div>

      {/* Corrective Description */}
      {workOrder.os_type === "corrective" && workOrder.failure_description && (
        <section className="mb-10 p-6 bg-destructive/[0.03] border-l-4 border-destructive rounded-r-lg">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive mb-2">Relato da Falha</h3>
           <p className="text-sm leading-relaxed text-zinc-800 italic">"{workOrder.failure_description}"</p>
        </section>
      )}

      {/* Checklist Table */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-zinc-900">
           <ClipboardList className="h-5 w-5 text-primary" />
           <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Execução do Checklist Técnico</h3>
        </div>
        <div className="border rounded-lg overflow-hidden border-zinc-200">
          <Table>
            <TableHeader className="bg-zinc-50 border-b border-zinc-200">
              <TableRow>
                <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Item de Verificação</TableHead>
                <TableHead className="text-[10px] font-black text-zinc-500 uppercase text-center w-24">Tipo</TableHead>
                <TableHead className="text-[10px] font-black text-zinc-500 uppercase text-center w-32">Resultado</TableHead>
                <TableHead className="text-[10px] font-black text-zinc-500 uppercase">Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-b border-zinc-100 last:border-0 h-12">
                  <TableCell className="text-xs font-semibold leading-tight">{item.description}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-[9px] font-bold uppercase text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">{item.item_type}</span>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                     {item.item_type === "check" && (
                       <span className={cn(
                         "text-[10px] px-2 py-0.5 rounded border uppercase",
                         item.value === "OK" ? "bg-success/5 border-success text-success" : 
                         item.value === "NOK" ? "bg-destructive/5 border-destructive text-destructive" :
                         "bg-zinc-50 border-zinc-200 text-zinc-400"
                       )}>
                         {item.value || "PENDENTE"}
                       </span>
                     )}
                     {item.item_type === "measure" && (
                       <span className={cn(
                         "text-[10px] font-technical px-2",
                         item.is_conforming === false ? "text-destructive" : "text-zinc-900"
                       )}>
                         {item.measured_value} {item.unit}
                       </span>
                     )}
                     {(item.item_type === "select" || item.item_type === "text") && (
                       <span className="text-[10px]">{item.value || "---"}</span>
                     )}
                  </TableCell>
                  <TableCell className="text-[10px] text-zinc-500 italic">{item.note || "---"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Evidence Gallery */}
      {photos.length > 0 && (
        <section className="mb-10 break-before-page">
           <div className="flex items-center gap-2 mb-6 pb-2 border-b-2 border-zinc-900">
              <Camera className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Registro Fotográfico de Evidências</h3>
           </div>
           <div className="grid grid-cols-2 gap-6 print:grid-cols-3">
              {photos.map((photo, idx) => (
                <div key={photo.id} className="space-y-2 border border-zinc-100 p-2 rounded-lg">
                   <img 
                     src={photo.storage_path.startsWith('http') ? photo.storage_path : `/api/storage/photos/${photo.storage_path}`} 
                     alt={`Evidence ${idx + 1}`} 
                     className="w-full h-40 object-cover rounded shadow-sm"
                   />
                   <div className="space-y-0.5">
                     <p className="text-[9px] font-bold text-zinc-400 uppercase">Fig {idx + 1}</p>
                     <p className="text-[10px] leading-tight line-clamp-2">{photo.caption || "Sem descrição"}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {/* Final Observations */}
      {workOrder.technician_notes && (
        <section className="mb-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Parecer Técnico Final</h3>
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-lg text-xs leading-relaxed text-zinc-700 whitespace-pre-wrap">
               {workOrder.technician_notes}
            </div>
        </section>
      )}

      {/* Signatures & Footer */}
      <div className="mt-auto pt-10 border-t-2 border-zinc-900 grid grid-cols-2 gap-12">
         <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Assinatura do Técnico</h3>
            {workOrder.signature_url ? (
              <img src={workOrder.signature_url} alt="Signature" className="h-20 w-auto mix-blend-multiply" />
            ) : (
              <div className="h-20 w-48 border-b border-zinc-300" />
            )}
            <div className="space-y-0.5">
               <p className="text-xs font-bold text-zinc-900">{workOrder.assignee?.full_name}</p>
               <p className="text-[9px] font-medium text-zinc-500">Técnico de Manutenção Industrial</p>
            </div>
         </div>

         <div className="text-right space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Data e Autenticação</h3>
            <div className="space-y-1">
               <p className="text-xs font-bold text-zinc-900">Finalizado em {formatDate(workOrder.completed_at || now.toISOString())}</p>
               {workOrder.latitude !== null && workOrder.longitude !== null && (
                 <p className="text-[9px] font-medium text-zinc-500 flex items-center justify-end gap-1">
                   <MapPin className="h-2 w-2" />
                   GPS: {workOrder.latitude.toFixed(6)}, {workOrder.longitude.toFixed(6)}
                 </p>
               )}
            </div>
            <div className="pt-8 opacity-40">
               <p className="text-[8px] font-bold uppercase tracking-widest leading-none">Documento gerado digitalmente pelo</p>
               <p className="text-[10px] font-black tracking-tighter text-primary">PCM FORGE MANTIX v2</p>
            </div>
         </div>
      </div>
      
      {/* Print only watermark */}
      <div className="hidden print:block fixed bottom-4 right-8 opacity-10 pointer-events-none">
         <h1 className="text-4xl font-black rotate-[-15deg]">ORIGINAL DOCUMENT</h1>
      </div>
    </div>
  );
}
