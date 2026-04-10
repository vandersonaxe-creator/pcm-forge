"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAsset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  StatusBadge,
  CriticalityBadge,
  CalibrationBadge,
} from "@/components/shared/badges";
import { EmptyState } from "@/components/shared/empty-state";
import { CalibrationHistory } from "@/components/calibrations/calibration-history";
import { formatDate, formatRelativeDate, daysUntil } from "@/lib/utils";
import {
  ASSET_TYPE_LABELS,
  CALIBRATION_STATUS_LABELS,
} from "@/lib/constants";
import {
  Edit,
  Wrench,
  Gauge,
  MapPin,
  Tag,
  Calendar,
  Building2,
  Loader2,
  ArrowLeft,
  QrCode,
  Camera,
  ClipboardList,
  Activity,
  Info,
} from "lucide-react";
import { AssetQRCode } from "@/components/assets/asset-qr";
import { AssetDocuments } from "@/components/assets/asset-documents";

export default function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { asset, loading } = useAsset(id);
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!asset) {
    return (
      <EmptyState
        icon={<Wrench className="h-8 w-8" />}
        title="Ativo não encontrado"
        description="O ativo solicitado não existe ou você não tem permissão para acessá-lo."
        action={
          <Button
            onClick={() => router.push("/assets")}
            variant="ghost"
            className="text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Ativos
          </Button>
        }
      />
    );
  }

  const isInstrument = asset.asset_type === "instrument";
  const days = daysUntil(asset.next_calibration_date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {asset.photo_url ? (
            <img
              src={asset.photo_url}
              alt={asset.name}
              className="h-20 w-20 rounded-xl object-cover border border-border/30 shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
              {isInstrument ? (
                <Gauge className="h-8 w-8 text-muted-foreground/50" />
              ) : (
                <Wrench className="h-8 w-8 text-muted-foreground/50" />
              )}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-semibold text-primary">
                {asset.tag}
              </span>
              <Badge
                variant="outline"
                className="text-[10px] border-border/50 text-muted-foreground"
              >
                {ASSET_TYPE_LABELS[asset.asset_type]}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{asset.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge status={asset.status} />
              <CriticalityBadge level={asset.criticality} />
              {isInstrument && (
                <CalibrationBadge status={asset.calibration_status} />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push("/assets")}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={() => router.push(`/assets/${asset.id}/edit`)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Documentos técnicos / certificados (visível na ficha e ao escanear QR interno) */}
      <AssetDocuments assetId={asset.id} companyId={asset.company_id} />

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-muted/50 border border-border/30">
          <TabsTrigger value="general" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            <Info className="mr-1.5 h-3.5 w-3.5" />
            Dados Gerais
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
            Histórico de OS
          </TabsTrigger>
          {isInstrument && (
            <TabsTrigger value="calibrations" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <Activity className="mr-1.5 h-3.5 w-3.5" />
              Calibrações
            </TabsTrigger>
          )}
          <TabsTrigger value="photos" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
            <Camera className="mr-1.5 h-3.5 w-3.5" />
            Fotos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Dados Gerais */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Info Card */}
            <Card className="lg:col-span-2 bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={Tag} label="Tag" value={asset.tag} />
                  <InfoRow
                    icon={isInstrument ? Gauge : Wrench}
                    label="Tipo"
                    value={ASSET_TYPE_LABELS[asset.asset_type]}
                  />
                  <InfoRow icon={Building2} label="Fabricante" value={asset.manufacturer} />
                  <InfoRow icon={Info} label="Modelo" value={asset.model} />
                  <InfoRow icon={Tag} label="Nº de Série" value={asset.serial_number} />
                  <InfoRow icon={MapPin} label="Localização" value={asset.location?.name} />
                  <InfoRow icon={Tag} label="Categoria" value={asset.category?.name} />
                  <InfoRow icon={Calendar} label="Cadastrado em" value={formatDate(asset.created_at)} />
                </div>

                {asset.notes && (
                  <>
                    <Separator className="bg-border/50" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Observações
                      </p>
                      <p className="text-sm">{asset.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* QR Code Card */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-primary" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AssetQRCode asset={asset} />
              </CardContent>
            </Card>
          </div>

          {/* Metrological Data (instruments) */}
          {isInstrument && (
            <Card className="bg-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Dados Metrológicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InfoRow label="Faixa de Medição" value={asset.measurement_range} />
                  <InfoRow label="Resolução" value={asset.resolution} />
                  <InfoRow label="Precisão" value={asset.accuracy} />
                  <InfoRow
                    label="Frequência de Calibração"
                    value={
                      asset.calibration_frequency_days
                        ? `${asset.calibration_frequency_days} dias`
                        : null
                    }
                  />
                  <InfoRow
                    label="Última Calibração"
                    value={formatDate(asset.last_calibration_date)}
                  />
                  <InfoRow
                    label="Próxima Calibração"
                    value={formatDate(asset.next_calibration_date)}
                    highlight={
                      days !== null
                        ? days < 0
                          ? "destructive"
                          : days <= 30
                          ? "warning"
                          : undefined
                        : undefined
                    }
                  />
                  <InfoRow
                    label="Status da Calibração"
                    value={
                      asset.calibration_status
                        ? CALIBRATION_STATUS_LABELS[asset.calibration_status]
                        : null
                    }
                  />
                  <InfoRow label="Empresa Calibradora" value={asset.calibration_provider} />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab: Histórico de OS */}
        <TabsContent value="history">
          <Card className="bg-card border-border/50">
            <CardContent className="py-12">
              <EmptyState
                icon={<ClipboardList className="h-8 w-8" />}
                title="Nenhuma OS registrada"
                description="As ordens de serviço deste ativo aparecerão aqui."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Calibrations */}
        {isInstrument && (
          <TabsContent value="calibrations">
            <Card className="bg-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Histórico de Calibrações</CardTitle>
                <Button
                  size="sm"
                  onClick={() => router.push(`/calibrations/new?asset_id=${asset.id}`)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Registrar Calibração
                </Button>
              </CardHeader>
              <CardContent className="py-6">
                <CalibrationHistory assetId={asset.id} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Tab: Photos */}
        <TabsContent value="photos">
          <Card className="bg-card border-border/50">
            <CardContent className="py-12">
              <EmptyState
                icon={<Camera className="h-8 w-8" />}
                title="Nenhuma foto registrada"
                description="Fotos de OS e inspeções aparecerão aqui."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon?: React.ElementType;
  label: string;
  value: string | null | undefined;
  highlight?: "destructive" | "warning";
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground/60" />}
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p
        className={`text-sm font-medium ${
          highlight === "destructive"
            ? "text-red-400"
            : highlight === "warning"
            ? "text-amber-400"
            : value && value !== "—"
            ? "text-foreground"
            : "text-muted-foreground/50"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
