import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Vehicle } from "@/lib/types";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminVeiculos() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/admin/login");

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Veículos</h1>
        <Link
          href="/admin/veiculos/novo"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          + Novo Veículo
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Veículo</th>
              <th className="px-4 py-3 font-medium">Ano</th>
              <th className="px-4 py-3 font-medium">KM</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vehicles?.map((vehicle: Vehicle) => (
              <tr key={vehicle.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {vehicle.marca} {vehicle.modelo}
                </td>
                <td className="px-4 py-3">{vehicle.ano_fabricacao}</td>
                <td className="px-4 py-3">
                  {vehicle.km.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(vehicle.preco)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      vehicle.status === "disponivel"
                        ? "bg-green-100 text-green-700"
                        : vehicle.status === "vendido"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Link
                    href={`/admin/veiculos/${vehicle.id}/edit`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Editar
                  </Link>
                  <DeleteButton id={vehicle.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!vehicles || vehicles.length === 0) && (
          <p className="text-gray-500 text-center py-8">
            Nenhum veículo cadastrado.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
