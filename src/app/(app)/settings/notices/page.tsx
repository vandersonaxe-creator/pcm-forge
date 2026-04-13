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
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Bell className="h-8 w-8 text-amber-400" />
          Avisos e Suporte
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Informações importantes sobre o uso do sistema e contatos de suporte técnico.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Contato Responsável */}
        <Card className="bg-[#1E293B] border-[#334155] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-blue-400" />
              Responsável pelo Sistema
            </CardTitle>
            <CardDescription className="text-slate-400">
              Entre em contato para dúvidas técnicas ou liberação de acessos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-6 p-4 bg-[#0F172A]/50 rounded-lg border border-[#334155]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">E-mail</p>
                  <p className="font-medium">suporte@pcmforge.com.br</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Telefone / WhatsApp</p>
                  <p className="font-medium">+55 (11) 98765-4321</p>
                </div>
              </div>
            </div>
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <MessageSquare className="h-4 w-4" />
              Abrir Chamado via WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Avisos Legais e Segurança */}
        <Card className="bg-[#1E293B] border-[#334155] border-l-4 border-l-amber-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Segurança e Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="shrink-0 h-6 w-6 mt-1 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-amber-500">Confidencialidade das Credenciais</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    É estritamente proibido compartilhar seu usuário e senha com terceiros. Seu acesso é 
                    pessoal e intransferível. Qualquer atividade realizada com suas credenciais é de sua 
                    inteira responsabilidade.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#334155]" />

              <div className="flex gap-4">
                <div className="shrink-0 h-6 w-6 mt-1 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-amber-500">Divulgação de Dados</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Os dados técnicos, planos de manutenção e logs de calibração contidos neste sistema 
                    são de propriedade industrial. A exportação ou compartilhamento não autorizado de 
                    informações pode acarretar em sanções administrativas e legais.
                  </p>
                </div>
              </div>

              <Separator className="bg-[#334155]" />

              <div className="flex gap-4">
                <div className="shrink-0 h-6 w-6 mt-1 flex items-center justify-center">
                  <Info className="h-4 w-4 text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-white">Boas Práticas</p>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Sempre encerre sua sessão (Logout) ao terminar o uso do sistema em computadores 
                    compartilhados na planta industrial. Mantenha sua senha atualizada e utilize caracteres 
                    especiais para maior segurança.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Versão e Status */}
        <div className="flex items-center justify-between px-2 text-slate-500 text-xs">
          <span>PCM Forge Industrial System — Versão 2.4.0</span>
          <span>Última atualização: Outubro 2026</span>
        </div>
      </div>
    </div>
  );
}
