import AdminLayout from "@/components/AdminLayout";
import LeadCard from "./LeadCard";
import { createServiceClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminLeads() {
  const service = createServiceClient();

  const [leadsResult, favResult, visitResult, viewsResult, vehiclesResult] =
    await Promise.all([
      service.from("leads").select("*, lead_views(*)").order("created_at", { ascending: false }),
      service.from("favorites").select("*").order("created_at", { ascending: false }),
      service.from("visits").select("*").order("created_at", { ascending: false }),
      service.from("user_views").select("*").order("created_at", { ascending: false }),
      service.from("vehicles").select("id, marca, modelo"),
    ]);

  const leads = leadsResult.data ?? [];
  const favorites = favResult.data ?? [];
  const visits = visitResult.data ?? [];
  const userViews = viewsResult.data ?? [];
  const vehicles = vehiclesResult.data ?? [];

  const vehicleMap = new Map(vehicles.map((v: any) => [v.id, `${v.marca} ${v.modelo}`]));

  // Agrupa por user_id a partir das tabelas de atividade
  const userIds = new Set<string>();
  visits.forEach((v: any) => v.user_id && userIds.add(v.user_id));
  favorites.forEach((f: any) => f.user_id && userIds.add(f.user_id));
  userViews.forEach((r: any) => r.user_id && userIds.add(r.user_id));

  const usersWithActivity = Array.from(userIds).map((uid) => {
    const userVisits = visits.filter((v: any) => v.user_id === uid);
    const lastVisit = userVisits.length > 0 ? userVisits[0] : null;
    return {
      id: uid,
      nome: lastVisit?.nome ?? "Usuário",
      telefone: lastVisit?.telefone ?? "",
      email: "",
      created_at: userVisits
        .concat(favorites.filter((f: any) => f.user_id === uid))
        .concat(userViews.filter((r: any) => r.user_id === uid))
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
        ?.created_at ?? new Date().toISOString(),
      favorites: favorites.filter((f: any) => f.user_id === uid),
      visits: userVisits,
      views: userViews.filter((r: any) => r.user_id === uid),
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
                  last_sign_in={user.created_at}
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
