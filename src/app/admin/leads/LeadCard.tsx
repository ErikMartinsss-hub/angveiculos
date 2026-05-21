"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Phone, Mail, Clock, Check, X } from "lucide-react";

type Item = {
  type: "view" | "fav" | "visit";
  id?: string;
  info: string;
  date: string;
  visitStatus?: string;
  visitDate?: string;
  visitTime?: string;
  vehicleName?: string;
};

type Props = {
  nome: string;
  telefone: string;
  email?: string;
  observacao?: string;
  created_at: string;
  last_sign_in?: string;
  items: Item[];
};

const typeIcons: Record<string, string> = {
  view: "👁️",
  fav: "❤️",
  visit: "📅",
};

export default function LeadCard({
  nome,
  telefone,
  email,
  observacao,
  created_at,
  last_sign_in,
  items,
}: Props) {
  const [open, setOpen] = useState(false);
  const [visitStatuses, setVisitStatuses] = useState<Record<string, string>>({});

  async function confirmVisit(visitId: string) {
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitId, status: "confirmado" }),
    });
    if (res.ok) {
      setVisitStatuses((prev) => ({ ...prev, [visitId]: "confirmado" }));
    }
  }

  async function cancelVisit(visitId: string) {
    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitId, status: "cancelado" }),
    });
    if (res.ok) {
      setVisitStatuses((prev) => ({ ...prev, [visitId]: "cancelado" }));
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmado":
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Confirmado
          </span>
        );
      case "cancelado":
        return (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
            Pendente
          </span>
        );
    }
  };

  const sorted = [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">{nome}</h3>
            {last_sign_in && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Ativo
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Phone size={12} /> {telefone}
            </span>
            {email && (
              <span className="flex items-center gap-1">
                <Mail size={12} /> {email}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} />{" "}
              {new Date(created_at).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {items.length}
          </span>
          {open ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-3 space-y-2">
          {observacao && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {observacao}
            </p>
          )}

          {sorted.length > 0 ? (
            sorted.map((item, i) => {
              const status = item.visitStatus
                ? visitStatuses[item.id!] ?? item.visitStatus
                : null;

              return (
                <div
                  key={i}
                  className={`rounded-lg p-3 ${
                    item.type === "visit"
                      ? status === "confirmado"
                        ? "bg-green-50 border border-green-200"
                        : status === "cancelado"
                        ? "bg-red-50 border border-red-200"
                        : "bg-yellow-50 border border-yellow-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        {typeIcons[item.type]} {item.info}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(item.date).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {item.type === "visit" && status && (
                      <div className="flex-shrink-0">{getStatusBadge(status)}</div>
                    )}
                  </div>

                  {item.type === "visit" && status === "pendente" && (
                    <div className="flex gap-2 mt-2 pt-2 border-t border-yellow-200">
                      <button
                        onClick={() => confirmVisit(item.id!)}
                        className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition"
                      >
                        <Check size={14} /> Confirmar visita
                      </button>
                      <button
                        onClick={() => cancelVisit(item.id!)}
                        className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition"
                      >
                        <X size={14} /> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-400">Nenhuma atividade registrada.</p>
          )}

          <a
            href={`https://wa.me/55${telefone.replace(/\D/g, "")}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium pt-1"
          >
            <Phone size={14} /> Falar no WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
