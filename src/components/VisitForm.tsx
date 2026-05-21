"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Props = {
  vehicleId: string;
  vehicleInfo: string;
};

export default function VisitForm({ vehicleId, vehicleInfo }: Props) {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataVisita, setDataVisita] = useState("");
  const [horario, setHorario] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useState(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  });

  function formatTelefone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  const today = new Date().toISOString().split("T")[0];

  const horarios = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!userId) {
      router.push("/login");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("visits").insert([
      {
        user_id: userId,
        vehicle_id: vehicleId,
        nome,
        telefone,
        data_visita: dataVisita,
        horario,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Erro ao agendar visita. Tente novamente.");
      return;
    }

    setSent(true);
  }

  if (!open) {
    return (
      <button
        onClick={() => {
          if (!userId) {
            router.push("/login");
            return;
          }
          setOpen(true);
        }}
        className="flex items-center justify-center gap-2 w-full border-2 border-red-600 text-red-600 py-3.5 rounded-xl font-semibold hover:bg-red-50 transition"
      >
        <Calendar size={18} />
        Agendar Visita
      </button>
    );
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-green-800">Visita agendada!</p>
        <p className="text-sm text-green-600 mt-1">
          {dataVisita} às {horario}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-5">
      <h4 className="font-semibold text-gray-900 mb-4">Agendar Visita</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome *"
          className="input-field"
          required
        />
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(formatTelefone(e.target.value))}
          placeholder="Telefone *"
          className="input-field"
          required
        />
        <input
          type="date"
          value={dataVisita}
          onChange={(e) => setDataVisita(e.target.value)}
          min={today}
          className="input-field"
          required
        />
        <select
          value={horario}
          onChange={(e) => setHorario(e.target.value)}
          className="input-field"
          required
        >
          <option value="">Selecione o horário</option>
          {horarios.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Agendando..." : "Confirmar"}
          </button>
        </div>
      </form>
    </div>
  );
}
