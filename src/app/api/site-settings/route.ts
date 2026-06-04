import { NextResponse } from "next/server";
import { createServerSupabase, createServiceClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json(
      { nome: "Ang Veículos", primary_color: "#dc2626", logo_url: null },
      { status: 200 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { nome, logo_url, primary_color } = body;

  const service = createServiceClient();
  const { error } = await service
    .from("site_settings")
    .upsert({ id: 1, nome, logo_url, primary_color, updated_at: new Date().toISOString() });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
