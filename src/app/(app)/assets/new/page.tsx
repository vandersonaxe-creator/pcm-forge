import { AssetForm } from "@/components/assets/asset-form";

export default function NewAssetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Novo Ativo</h1>
        <p className="text-muted-foreground">
          Cadastre um equipamento ou instrumento de medição
        </p>
      </div>
      <AssetForm mode="create" />
    </div>
  );
}
