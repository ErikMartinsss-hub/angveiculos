"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;

    const { error } = await supabase.from("vehicles").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir veículo");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:underline text-xs"
    >
      Excluir
    </button>
  );
}
