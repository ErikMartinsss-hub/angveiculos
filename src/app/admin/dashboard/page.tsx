import Link from "next/link";
import { redirect } from "next/navigation";
import { Calendar, MessageCircle, UserPlus } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { createServerSupabase, createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/admin/login");

  const [vehiclesResult, leadsResult, visitsResult, usersResult] =
    await Promise.all([
      supabase.from("vehicles").select("*"),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("visits").select("*").order("created_at", { ascending: false }).limit(5),
      createServiceClient().auth.admin.listUsers(),
    ]);

  const vehicles = vehiclesResult.data ?? [];
  const recentLeads = leadsResult.data ?? [];
  const recentVisits = visitsResult.data ?? [];
  const allUsers = usersResult.data?.users ?? [];

  const disponiveis = vehicles.filter((v) => v.status === "disponivel").length;
  const vendidos = vehicles.filter((v) => v.status === "vendido").length;
  const total = vehicles.length;

  const registeredUsers = allUsers.filter((u: any) => u.email !== "admin@angveiculos.com");
  const pendentes = recentVisits.filter((v: any) => v.status === "pendente").length;

  const recentActivity = [
    ...recentLeads.map((l: any) => ({
      icon: MessageCircle,
      color: "text-green-600 bg-green-100",
      text: `${l.nome} se interessou por um veículo`,
      date: l.created_at,
      link: "/admin/leads",
    })),
    ...recentVisits.map((v: any) => ({
      icon: Calendar,
      color: "text-blue-600 bg-blue-100",
      text: `${v.nome} agendou visita para ${v.data_visita} às ${v.horario}`,
      date: v.created_at,
      link: "/admin/leads",
    })),
    ...registeredUsers.slice(0, 3).map((u: any) => ({
      icon: UserPlus,
      color: "text-purple-600 bg-purple-100",
      text: `${u.user_metadata?.nome ?? u.email} criou conta`,
      date: u.created_at,
      link: "/admin/leads",
    })),
  ]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          href="/admin/veiculos/novo"
          className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition"
        >
          + Adicionar Veículo
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Veículos"
          value={total}
          detail={`${disponiveis} disponíveis`}
        />
        <StatCard
          label="Leads"
          value={recentLeads.length}
          detail="novos interesses"
        />
        <StatCard
          label="Visitas"
          value={pendentes}
          detail="aguardando confirmação"
          highlight={pendentes > 0}
        />
        <StatCard
          label="Usuários"
          value={registeredUsers.length}
          detail="cadastrados"
        />
      </div>

      {pendentes > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Calendar size={20} className="text-yellow-600" />
          <p className="text-sm text-yellow-800">
            <strong>{pendentes} visita(s)</strong> aguardando confirmação.
          </p>
          <Link href="/admin/leads" className="ml-auto text-sm text-yellow-700 hover:underline font-medium">
            Ver leads
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Atividade Recente</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.length > 0 ? (
            recentActivity.map((item: any, i: number) => (
              <Link
                key={i}
                href={item.link}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{item.text}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(item.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">
              Nenhuma atividade recente.
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
  detail,
  highlight,
}: {
  label: string;
  value: number;
  detail: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white p-5 rounded-xl border shadow-sm ${
        highlight ? "border-yellow-300 ring-1 ring-yellow-200" : "border-gray-100"
      }`}
    >
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-yellow-600" : "text-gray-900"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{detail}</p>
    </div>
  );
}
