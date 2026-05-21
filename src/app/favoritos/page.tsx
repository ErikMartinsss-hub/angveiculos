"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LogOut, Calendar, CheckCircle, Clock, XCircle, Settings } from "lucide-react";
import VehicleCard from "@/components/VehicleCard";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase";
import type { Vehicle } from "@/lib/types";

export default function Favoritos() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [tab, setTab] = useState<"favoritos" | "visitas">("favoritos");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserEmail(user.email ?? "");
      loadData(user.id);
    });
  }, []);

  async function loadData(userId: string) {
    const [favResult, visitResult] = await Promise.all([
      supabase.from("favorites").select("vehicle_id").eq("user_id", userId),
      supabase.from("visits").select("*, vehicles!inner(marca, modelo)").eq("user_id", userId).order("data_visita", { ascending: false }),
    ]);

    if (favResult.data && favResult.data.length > 0) {
      const ids = favResult.data.map((f: any) => f.vehicle_id);
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false });
      setVehicles(vehicles ?? []);
    }

    setVisits(visitResult.data ?? []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
            <p className="text-sm text-gray-500">{userEmail}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/configuracoes"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition"
            >
              <Settings size={16} /> Configurações
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setTab("favoritos")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
              tab === "favoritos"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            ❤️ Favoritos
          </button>
          <button
            onClick={() => setTab("visitas")}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
              tab === "visitas"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📅 Minhas Visitas
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Carregando...</div>
        ) : tab === "favoritos" ? (
          vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="relative">
                  {vehicle.status === "vendido" && (
                    <div className="absolute top-3 right-3 z-10 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                      Vendido
                    </div>
                  )}
                  <VehicleCard vehicle={vehicle} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart size={24} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Nenhum favorito ainda.</p>
              <Link href="/" className="btn-primary inline-block mt-6">
                Ver veículos
              </Link>
            </div>
          )
        ) : visits.length > 0 ? (
          <div className="space-y-4">
            {visits.map((visit) => (
              <div
                key={visit.id}
                className={`bg-white rounded-xl border p-5 shadow-sm ${
                  visit.status === "confirmado"
                    ? "border-green-200"
                    : visit.status === "cancelado"
                    ? "border-red-200"
                    : "border-yellow-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {visit.vehicles?.marca} {visit.vehicles?.modelo}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <Calendar size={14} className="inline mr-1" />
                      {new Date(visit.data_visita).toLocaleDateString("pt-BR")} às{" "}
                      {visit.horario}
                    </p>
                  </div>
                  <div>
                    {visit.status === "confirmado" ? (
                      <span className="flex items-center gap-1 text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full font-medium">
                        <CheckCircle size={14} /> Confirmado
                      </span>
                    ) : visit.status === "cancelado" ? (
                      <span className="flex items-center gap-1 text-sm text-red-700 bg-red-100 px-3 py-1.5 rounded-full font-medium">
                        <XCircle size={14} /> Cancelado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-sm text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full font-medium">
                        <Clock size={14} /> Pendente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar size={24} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma visita agendada.</p>
            <Link href="/" className="btn-primary inline-block mt-6">
              Ver veículos
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
