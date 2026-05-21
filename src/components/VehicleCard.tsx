import Link from "next/link";
import { MapPin, Fuel, Calendar } from "lucide-react";
import type { Vehicle } from "@/lib/types";
import FavoriteButton from "./FavoriteButton";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const mainPhoto = vehicle.fotos?.[0];
  const formattedPreco = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(vehicle.preco);

  return (
    <Link
      href={`/veiculo/${vehicle.id}`}
      className="card overflow-hidden group"
    >
      <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={`${vehicle.marca} ${vehicle.modelo}`}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {vehicle.destaque && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Destaque
          </span>
        )}

        {vehicle.status !== "disponivel" && (
          <span className={`absolute top-3 right-3 text-white text-xs font-semibold px-2.5 py-1 rounded-full ${
            vehicle.status === "vendido" ? "bg-gray-900" : "bg-yellow-600"
          }`}>
            {vehicle.status === "vendido" ? "Vendido" : "Reservado"}
          </span>
        )}

        {vehicle.status === "disponivel" && (
          <div className="absolute top-3 right-3">
            <FavoriteButton vehicleId={vehicle.id} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
              {vehicle.marca} {vehicle.modelo}
            </h3>
            <p className="text-sm text-gray-500">{vehicle.ano_fabricacao}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-100">
          <span className="flex items-center gap-1">
            <Fuel size={14} /> {vehicle.combustivel || "N/I"}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {vehicle.ano_fabricacao}
          </span>
          <span>{vehicle.km.toLocaleString("pt-BR")} km</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-red-600">{formattedPreco}</p>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <MapPin size={12} />
            Detalhes
          </span>
        </div>
      </div>
    </Link>
  );
}
