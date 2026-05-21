"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import VehicleCard from "./VehicleCard";
import type { Vehicle } from "@/lib/types";

type Props = {
  vehicles: Vehicle[];
};

export default function VehicleFilter({ vehicles }: Props) {
  const [categoria, setCategoria] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const disponiveis = useMemo(
    () => vehicles.filter((v) => v.status === "disponivel"),
    [vehicles]
  );

  const filtered = useMemo(() => {
    let list = disponiveis;

    if (categoria !== "todos") {
      list = list.filter((v) => v.categoria === categoria);
    }

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      list = list.filter(
        (v) =>
          v.marca.toLowerCase().includes(term) ||
          v.modelo.toLowerCase().includes(term) ||
          `${v.marca} ${v.modelo}`.toLowerCase().includes(term)
      );
    }

    return list;
  }, [disponiveis, categoria, search]);

  const tabs = [
    { key: "todos", label: "Todos" },
    { key: "carro", label: "Carros" },
    { key: "moto", label: "Motos" },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategoria(tab.key)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition ${
                categoria === tab.key
                  ? "bg-white text-red-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por marca ou modelo..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((vehicle: Vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            {search
              ? "Nenhum veículo encontrado para esta busca."
              : "Nenhum veículo disponível nesta categoria."}
          </p>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-6 text-center">
        {filtered.length} veículo(s) encontrado(s)
      </p>
    </div>
  );
}
