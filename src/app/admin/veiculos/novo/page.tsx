import { redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import VehicleForm from "@/components/VehicleForm";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function NovoVeiculo() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/admin/login");

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Novo Veículo</h1>
      <VehicleForm />
    </AdminLayout>
  );
}
