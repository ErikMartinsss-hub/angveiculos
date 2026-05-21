import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { visitId, status } = await request.json();

  if (!visitId || !status) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  if (!["confirmado", "cancelado"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("visits")
    .update({ status })
    .eq("id", visitId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
