"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { useCompany } from "@/hooks/use-company";
import { useUserLogs } from "@/hooks/use-user-logs";
import { useEffect } from "react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, company, loading } = useCompany();
  const { createLog } = useUserLogs();

  useEffect(() => {
    // Record login/access for demo purposes
    if (user) {
      createLog("Acesso", "Usuário acessou o painel principal");
    }
  }, [user, createLog]);

  return (
    <div className="flex h-screen overflow-hidden bg-background group/app">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={user} company={company} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
