"use client";

import { cn } from "@/lib/utils";

const MONTHS = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", 
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"
];

export function GridHeader() {
  return (
    <thead>
      <tr className="bg-[#F8FAFC] border-b border-border">
        <th className="sticky left-0 z-20 bg-card px-4 py-3 text-left w-[280px] border-r border-border shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#374151]">
            Ativo / Plano de Manutenção
          </span>
        </th>
        <th className="px-3 py-3 text-center w-16 border-r border-border">
           <span className="text-[11px] font-bold uppercase tracking-wider text-[#374151]">Crit.</span>
        </th>
        {MONTHS.map((month) => (
          <th key={month} className="w-12 py-3 text-center border-r border-border">
            <span className="text-[11px] font-bold tracking-wider text-[#374151]">
              {month}
            </span>
          </th>
        ))}
      </tr>
    </thead>
  );
}
