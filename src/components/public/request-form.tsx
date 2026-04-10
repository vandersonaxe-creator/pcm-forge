"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Send,
  MapPin,
  Tag,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetInfo {
  tag: string;
  name: string;
  qr_code: string;
  location_name: string | null;
  company_logo: string | null;
  company_name: string;
}

interface RequestFormProps {
  asset: AssetInfo;
}

type Priority = "low" | "medium" | "high";

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  {
    value: "low",
    label: "Baixa",
    color:
      "border-emerald-300 bg-emerald-50 text-emerald-700 data-[selected=true]:bg-emerald-600 data-[selected=true]:text-white data-[selected=true]:border-emerald-600",
  },
  {
    value: "medium",
    label: "Média",
    color:
      "border-amber-300 bg-amber-50 text-amber-700 data-[selected=true]:bg-amber-500 data-[selected=true]:text-white data-[selected=true]:border-amber-500",
  },
  {
    value: "high",
    label: "Alta",
    color:
      "border-red-300 bg-red-50 text-red-700 data-[selected=true]:bg-red-600 data-[selected=true]:text-white data-[selected=true]:border-red-600",
  },
];

export function RequestForm({ asset }: RequestFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    wo_number: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length >= 2 && description.trim().length >= 5;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/public/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_code: asset.qr_code,
          requester_name: name.trim(),
          description: description.trim(),
          priority,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar solicitação");
      }

      setResult({ wo_number: data.wo_number });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 animate-in fade-in zoom-in-95">
        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-900">
            Solicitação enviada com sucesso!
          </h2>
          <p className="text-sm text-zinc-500 max-w-xs mx-auto">
            Sua OS será analisada pela equipe de manutenção.
          </p>
        </div>
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
            Protocolo
          </p>
          <p className="text-2xl font-black font-mono text-zinc-900 tracking-tight">
            {result.wo_number}
          </p>
        </div>
        <p className="text-xs text-zinc-400">
          Guarde este número para acompanhamento.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Asset Info */}
      <Card className="border-zinc-200 bg-zinc-50/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900 truncate">
                {asset.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Tag className="h-3 w-3" />
                <span className="font-mono font-semibold">{asset.tag}</span>
                {asset.location_name && (
                  <>
                    <span className="text-zinc-300">|</span>
                    <MapPin className="h-3 w-3" />
                    <span>{asset.location_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-zinc-700">
          Seu nome <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: João da Silva"
          className="h-11 bg-white border-zinc-300 rounded-xl text-sm"
          autoComplete="name"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-zinc-700">
          Descreva o problema <span className="text-red-500">*</span>
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o que está acontecendo com o equipamento..."
          className="min-h-[100px] bg-white border-zinc-300 rounded-xl text-sm resize-none"
          required
        />
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-zinc-700">
          Prioridade percebida
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-selected={priority === opt.value}
              onClick={() => setPriority(opt.value)}
              className={cn(
                "h-10 rounded-xl border-2 text-sm font-bold transition-all",
                opt.color
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={!canSubmit || submitting}
        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/20"
      >
        {submitting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Enviar Solicitação
          </>
        )}
      </Button>
    </form>
  );
}
