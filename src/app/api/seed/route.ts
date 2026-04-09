import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
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

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const companyId = profile.company_id;

  // Sed Categories
  const categories = [
    { company_id: companyId, name: "Equipamentos", asset_type: "equipment" },
    { company_id: companyId, name: "Ferramentas Elétricas", asset_type: "equipment" },
    { company_id: companyId, name: "Compressores", asset_type: "equipment" },
    { company_id: companyId, name: "Instrumentos de Medição", asset_type: "instrument" },
  ];

  await supabase.from("asset_categories").insert(categories);

  // Seed Locations
  const locations = [
    { company_id: companyId, name: "Galpão 1" },
    { company_id: companyId, name: "Galpão 2" },
  ];

  await supabase.from("asset_locations").insert(locations);

  return NextResponse.json({ success: true, message: "Seed concluído para a empresa: " + companyId });
}
