import { Suspense } from "react";
import { CalibrationForm } from "@/components/calibrations/calibration-form";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Asset } from "@/lib/types/database";

export default async function NewCalibrationPage({
  searchParams,
}: {
  searchParams: { asset_id?: string };
}) {
  const assetId = searchParams.asset_id;

  if (!assetId) {
    redirect("/calibrations");
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: assetData } = await supabase
    .from("assets")
    .select("*")
    .eq("id", assetId)
    .single();

  if (!assetData || assetData.asset_type !== "instrument") {
    redirect("/calibrations");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registrar Calibração</h1>
        <p className="text-muted-foreground">
          Anexe o certificado oficial e registre o resultado do laudo metrológico.
        </p>
      </div>

      <Suspense fallback={<div className="flex p-12 justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary"/></div>}>
        <CalibrationForm asset={assetData as Asset} />
      </Suspense>
    </div>
  );
}
