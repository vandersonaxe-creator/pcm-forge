import { createAdminClient } from "@/lib/supabase/admin";
import { RequestForm } from "@/components/public/request-form";
import { AlertTriangle, Wrench } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ code: string }>;
}

export const metadata: Metadata = {
  title: "Abrir Chamado de Manutenção",
  description: "Solicite manutenção para este equipamento de forma rápida e sem login.",
};

export default async function PublicRequestPage({ params }: PageProps) {
  const { code } = await params;

  let asset: any = null;
  let error: string | null = null;

  try {
    const supabase = createAdminClient();

    const { data, error: fetchError } = await supabase
      .from("assets")
      .select(`
        id, tag, name, qr_code, status,
        location:asset_locations(name),
        company:companies(name, logo_url)
      `)
      .eq("qr_code", code)
      .single();

    if (fetchError || !data) {
      error = "Ativo não encontrado.";
    } else if (data.status !== "active") {
      error = "Este equipamento está inativo e não aceita chamados.";
    } else {
      asset = data;
    }
  } catch {
    error = "Serviço temporariamente indisponível. Tente novamente em instantes.";
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">
            Não foi possível carregar
          </h1>
          <p className="text-sm text-zinc-500">{error}</p>
          <p className="text-xs text-zinc-400">
            Verifique se o QR Code é válido ou entre em contato com a equipe de manutenção.
          </p>
        </div>
      </div>
    );
  }

  const companyName = (asset.company as any)?.name || "Manutenção";
  const companyLogo = (asset.company as any)?.logo_url || null;
  const locationName = (asset.location as any)?.name || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-zinc-50 to-zinc-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={companyName}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Wrench className="h-4 w-4 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-sm font-bold text-zinc-900">{companyName}</h1>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
              Solicitação de Manutenção
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-zinc-900">
              Abrir Chamado de Manutenção
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Preencha os dados abaixo para registrar sua solicitação.
            </p>
          </div>

          <RequestForm
            asset={{
              tag: asset.tag,
              name: asset.name,
              qr_code: asset.qr_code,
              location_name: locationName,
              company_logo: companyLogo,
              company_name: companyName,
            }}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-[10px] text-zinc-400">
          Powered by PCM Forge Mantix
        </p>
      </footer>
    </div>
  );
}
