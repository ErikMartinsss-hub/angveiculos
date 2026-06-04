import { NextResponse } from "next/server";
import { createServerSupabase, createServiceClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { visitId, status } = await request.json();

  if (!visitId || !status) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (!["confirmado", "cancelado"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const service = createServiceClient();
  const { error } = await service
    .from("visits")
    .update({ status })
    .eq("id", visitId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
