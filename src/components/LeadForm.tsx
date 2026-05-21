"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase";

type Props = {
  vehicleId: string;
  vehicleInfo: string;
};

export default function LeadForm({ vehicleId, vehicleInfo }: Props) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [observacao, setObservacao] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  function formatTelefone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const leadId = crypto.randomUUID();

    const { error: leadError } = await supabase
      .from("leads")
      .insert([{ id: leadId, nome, telefone, email, observacao }]);

    if (leadError) {
      alert("Erro ao enviar. Tente novamente.");
      setLoading(false);
      return;
    }

    await supabase.from("lead_views").insert([
      {
        lead_id: leadId,
        vehicle_id: vehicleId,
        vehicle_info: vehicleInfo,
      },
    ]);

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-green-800">Recebemos seu contato!</p>
        <p className="text-sm text-green-600 mt-1">
          Em breve um vendedor entrará em contato.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        Tenho interesse neste veículo
      </h3>
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
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (opcional)"
          className="input-field"
        />
        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Mensagem (opcional)"
          className="input-field h-20 resize-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Quero saber mais"}
        </button>
      </form>
    </div>
  );
}
