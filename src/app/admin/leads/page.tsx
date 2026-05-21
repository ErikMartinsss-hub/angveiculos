import { redirect } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import LeadCard from "./LeadCard";
import { createServerSupabase, createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminLeads() {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/admin/login");

  const [leadsResult, favResult, visitResult, viewsResult, vehiclesResult, usersResult] =
    await Promise.all([
      supabase.from("leads").select("*, lead_views(*)").order("created_at", { ascending: false }),
      supabase.from("favorites").select("*").order("created_at", { ascending: false }),
      supabase.from("visits").select("*").order("created_at", { ascending: false }),
      supabase.from("user_views").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicles").select("id, marca, modelo"),
      createServiceClient().auth.admin.listUsers(),
    ]);

  const leads = leadsResult.data ?? [];
  const favorites = favResult.data ?? [];
  const visits = visitResult.data ?? [];
  const userViews = viewsResult.data ?? [];
  const vehicles = vehiclesResult.data ?? [];
  const registeredUsers = usersResult.data?.users ?? [];

  const vehicleMap = new Map(vehicles.map((v: any) => [v.id, `${v.marca} ${v.modelo}`]));

  const usersWithActivity = registeredUsers
    .filter((u: any) => u.email !== "admin@angveiculos.com")
    .map((u: any) => {
      const meta = u.user_metadata ?? {};
      return {
        id: u.id,
        nome: meta.nome ?? u.email?.split("@")[0] ?? "Sem nome",
        email: u.email,
        telefone: meta.telefone ?? "",
        created_at: u.created_at,
        last_sign_in: u.last_sign_in_at,
        telelefone_raw: meta.telefone ?? "",
        favorites: favorites.filter((f: any) => f.user_id === u.id),
        visits: visits.filter((v: any) => v.user_id === u.id),
        views: userViews.filter((v: any) => v.user_id === u.id),
      };
    });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-sm text-gray-500">
          {usersWithActivity.length + leads.length} contato(s)
        </p>
      </div>

      <div className="space-y-6">
        {leads.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Formulários de Interesse
            </h2>
            <div className="space-y-3">
              {leads.map((lead: any) => (
                <LeadCard
                  key={lead.id}
                  nome={lead.nome}
                  telefone={lead.telefone}
                  email={lead.email}
                  observacao={lead.observacao}
                  created_at={lead.created_at}
                  items={(lead.lead_views ?? []).map((v: any) => ({
                    type: "view" as const,
                    info: v.vehicle_info,
                    date: v.created_at,
                  }))}
                />
              ))}
            </div>
          </div>
        )}

        {usersWithActivity.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Usuários Cadastrados
            </h2>
            <div className="space-y-3">
              {usersWithActivity.map((user) => (
                <LeadCard
                  key={user.id}
                  nome={user.nome}
                  telefone={user.telefone}
                  email={user.email}
                  created_at={user.created_at}
                  last_sign_in={user.last_sign_in}
                  items={[
                    ...user.views.map((v: any) => ({
                      type: "view" as const,
                      info: `Visualizou: ${v.vehicle_info}`,
                      date: v.created_at,
                    })),
                    ...user.favorites.map((f: any) => ({
                      type: "fav" as const,
                      info: `Favoritou: ${vehicleMap.get(f.vehicle_id) ?? "Veículo"}`,
                      date: f.created_at,
                    })),
                    ...user.visits.map((v: any) => ({
                      type: "visit" as const,
                      id: v.id,
                      info: `Agendou visita: ${vehicleMap.get(v.vehicle_id) ?? "Veículo"} em ${v.data_visita} às ${v.horario}`,
                      date: v.created_at,
                      visitStatus: v.status,
                      visitDate: v.data_visita,
                      visitTime: v.horario,
                      vehicleName: vehicleMap.get(v.vehicle_id) ?? "Veículo",
                    })),
                  ]}
                />
              ))}
            </div>
          </div>
        )}

        {leads.length === 0 && usersWithActivity.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 font-medium">
              Nenhum lead ou usuário cadastrado ainda.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
