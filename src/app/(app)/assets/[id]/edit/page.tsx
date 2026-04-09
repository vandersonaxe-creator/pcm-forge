"use client";

import { use } from "react";
import { useAsset } from "@/hooks/use-assets";
import { AssetForm } from "@/components/assets/asset-form";
import { Loader2 } from "lucide-react";

export default function EditAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { asset, loading } = useAsset(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-24 text-muted-foreground">
        Ativo não encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar Ativo</h1>
        <p className="text-muted-foreground">
          <span className="font-mono text-primary">{asset.tag}</span> — {asset.name}
        </p>
      </div>
      <AssetForm asset={asset} mode="edit" />
    </div>
  );
}
