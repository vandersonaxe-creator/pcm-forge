import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-technical",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PCM Forge — Mantix",
    template: "%s | PCM Forge",
  },
  description:
    "Sistema de PCM e Controle Metrológico para manutenção industrial. Gerencie ativos, calibrações, ordens de serviço e planos preventivos.",
  keywords: [
    "PCM",
    "manutenção industrial",
    "controle metrológico",
    "calibração",
    "ordem de serviço",
    "preventiva",
  ],
};

import { ThemeProvider } from "@/components/shared/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={300}>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
