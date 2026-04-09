"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Loader2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    });

    if (authError) {
      setError(authError.message === "User already registered"
        ? "Este e-mail já está registrado."
        : "Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({ name: companyName })
        .select()
        .single();

      if (companyError) {
        setError("Erro ao criar empresa. Tente novamente.");
        setLoading(false);
        return;
      }

      // 3. Create user profile (first user = admin)
      const { error: profileError } = await supabase.from("users").insert({
        id: authData.user.id,
        company_id: company.id,
        full_name: fullName,
        role: "admin",
      });

      if (profileError) {
        setError("Erro ao criar perfil. Tente novamente.");
        setLoading(false);
        return;
      }
      
      // 3.1 Seed Categories and Locations for the new company
      await supabase.from("asset_categories").insert([
        { company_id: company.id, name: "Equipamentos", asset_type: "equipment" },
        { company_id: company.id, name: "Ferramentas Elétricas", asset_type: "equipment" },
        { company_id: company.id, name: "Compressores", asset_type: "equipment" },
        { company_id: company.id, name: "Instrumentos de Medição", asset_type: "instrument" },
      ]);
      await supabase.from("asset_locations").insert([
        { company_id: company.id, name: "Galpão 1" },
        { company_id: company.id, name: "Galpão 2" },
      ]);

      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <Card className="glass-card amber-glow border-border/50">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Wrench className="h-7 w-7 text-primary" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Comece a gerenciar sua manutenção industrial
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="João Silva"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-muted/50 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Manutenção Industrial S.A."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="bg-muted/50 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerEmail">E-mail</Label>
            <Input
              id="registerEmail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-muted/50 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerPassword">Senha</Label>
            <Input
              id="registerPassword"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="bg-muted/50 border-border/50 focus:border-primary"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium underline-offset-4 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
