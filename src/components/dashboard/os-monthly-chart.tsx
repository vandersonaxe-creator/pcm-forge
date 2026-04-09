"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OSMonthlyChartProps {
  data: any[];
  loading?: boolean;
}

export function OSMonthlyChart({ data, loading }: OSMonthlyChartProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = data.some(d => d.preventive > 0 || d.corrective > 0 || d.inspection > 0);

  return (
    <Card className="bg-card border-border shadow-card h-full">
      <CardHeader>
        <CardTitle className="text-[15px] font-semibold text-foreground">
          Ordens de Serviço — Últimos 6 Meses
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-50">
            <p className="text-sm font-bold">Nenhuma OS concluída</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Dados insuficientes para gerar o gráfico</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
              barGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#6B7280" }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              <Tooltip 
                cursor={{ fill: "#F8FAFC" }}
                contentStyle={{ 
                  backgroundColor: "#FFFFFF", 
                  borderColor: "#E5E7EB", 
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                }}
                itemStyle={{ fontWeight: 600, padding: "2px 0" }}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: "20px", fontSize: "11px", fontWeight: 600 }}
              />
              <Bar 
                dataKey="preventive" 
                name="Preventiva" 
                stackId="a" 
                fill="#2563EB" 
              />
              <Bar 
                dataKey="inspection" 
                name="Inspeção" 
                stackId="a" 
                fill="#059669" 
              />
              <Bar 
                dataKey="corrective" 
                name="Corretiva" 
                stackId="a" 
                fill="#DC2626" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
