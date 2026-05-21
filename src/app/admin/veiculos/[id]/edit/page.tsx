import { notFound, redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import VehicleForm from "@/components/VehicleForm";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function EditarVeiculo({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/admin/login");

  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!vehicle) notFound();

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">
        Editando: {vehicle.marca} {vehicle.modelo}
      </h1>
      <VehicleForm vehicle={vehicle} />
    </AdminLayout>
  );
}
