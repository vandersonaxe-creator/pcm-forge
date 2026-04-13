"use client";

import { 
  Bell, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Info, 
  AlertTriangle,
  Lock,
  MessageSquare,
  LifeBuoy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function NoticesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background px-6 pt-6 pb-20 lg:px-10 lg:pt-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-3">
          <Bell className="h-7 w-7 text-amber-500" />
          Avisos e Suporte
        </h1>
        <p className="text-[14px] text-[var(--color-text-tertiary)] max-w-2xl">
          Instruções de segurança, termos de uso industrial e canais diretos de suporte técnico para o sistema PCM Forge.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Contato Responsável */}
        <Card className="bg-white border-[var(--color-border)] shadow-card rounded-xl border-t-4 border-t-[var(--color-brand)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-[16px] font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-[var(--color-brand)]" />
              Central de Atendimento ao Usuário
            </CardTitle>
            <CardDescription className="text-[13px] text-[var(--color-text-tertiary)]">
              Dúvidas técnicas, solicitações de novos módulos ou liberação de acessos hierárquicos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 p-5 bg-[var(--color-bg-page)] rounded-lg border border-[var(--color-border)]">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-[var(--color-border-light)]">
                  <Mail className="h-5 w-5 text-[var(--color-brand)]" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mb-0.5">E-mail Corporativo</p>
                  <p className="font-semibold text-[var(--color-text-primary)]">suporte@pcmforge.com.br</p>
                </div>
              </div>
              <div className="hidden md:block w-px bg-[var(--color-border)]" />
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-[var(--color-border-light)]">
                  <Phone className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-muted)] font-bold uppercase tracking-widest mb-0.5">Plantão Técnico</p>
                  <p className="font-semibold text-[var(--color-text-primary)]">+55 (11) 98765-4321</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white shadow-sm gap-2">
                <MessageSquare className="h-4 w-4" />
                Abrir Chamado via WhatsApp
              </Button>
              <Button variant="outline" className="bg-white border-[var(--color-border)] text-[var(--color-text-secondary)] shadow-sm hover:bg-[var(--color-bg-muted)] transition-all">
                Dúvidas Frequentes (FAQ)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Avisos Legais e Segurança */}
        <Card className="bg-white border-[var(--color-border)] shadow-card rounded-xl border-l-4 border-l-amber-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-[16px] font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Protocolos de Segurança e Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-amber-50">
                  <Lock className="h-5 w-5 text-amber-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[var(--color-text-primary)]">Confidencialidade das Credenciais</p>
                  <p className="text-[var(--color-text-secondary)] text-[13px] leading-relaxed">
                    É estritamente proibido compartilhar seu usuário e senha com terceiros. Seu acesso é 
                    pessoal e intransferível. Qualquer atividade realizada com suas credenciais será registrada 
                    na **Trilha de Auditoria** sob sua responsabilidade.
                  </p>
                </div>
              </div>

              <Separator className="bg-[var(--color-border-light)]" />

              <div className="flex gap-4">
                <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50">
                  <AlertTriangle className="h-5 w-5 text-[var(--color-brand)]" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[var(--color-text-primary)]">Propriedade Intelectual e Dados</p>
                  <p className="text-[var(--color-text-secondary)] text-[13px] leading-relaxed">
                    Os dados técnicos, planos de manutenção e certificados de calibração são de **Propriedade Industrial**. 
                    A exportação ou compartilhamento não autorizado de informações resultará em sanções 
                    administrativas conforme política interna da companhia.
                  </p>
                </div>
              </div>

              <Separator className="bg-[var(--color-border-light)]" />

              <div className="flex gap-4">
                <div className="shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-slate-50">
                  <Info className="h-5 w-5 text-slate-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[var(--color-text-primary)]">Boas Práticas de Encerramento</p>
                  <p className="text-[var(--color-text-secondary)] text-[13px] leading-relaxed">
                    Sempre utilize o botão **"Sair" (Logout)** ao encerrar o uso em terminais compartilhados 
                    na planta industrial ou laboratórios de metrologia para prevenir acessos não autorizados.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Versão e Status */}
        <div className="flex items-center justify-between px-2 text-[var(--color-text-muted)] text-[11px] font-medium opacity-60">
          <span>PCM Forge Industrial · Engine Core v2.4.0</span>
          <span>Status do Servidor: Operacional · Último Patch: Out/2026</span>
        </div>
      </div>
      
      <footer className="pt-4 flex justify-center border-t border-border/40">
        <p className="text-[11px] text-[var(--color-text-muted)] opacity-50">
           © 2026 PCM Forge · Sistema de Gestão de Manutenção
        </p>
      </footer>
    </div>
  );
}
