"use client";

import { Download } from "lucide-react";

type Vehicle = {
  marca: string;
  modelo: string;
  ano_fabricacao: number;
  ano_modelo: number;
  km: number;
  preco: number;
  combustivel?: string;
  cor?: string;
  cambio?: string;
  carroceria?: string;
  portas?: number;
  placa?: string;
  status: string;
  categoria: string;
  opcionais?: string[];
  descricao?: string;
};

export default function ExportCsvButton({ vehicles }: { vehicles: Vehicle[] }) {
  function download() {
    const BOM = "\uFEFF";
    const headers = [
      "Marca", "Modelo", "Ano Fab.", "Ano Mod.", "KM", "Preço",
      "Combustível", "Cor", "Câmbio", "Carroceria", "Portas",
      "Placa", "Status", "Categoria", "Opcionais",
    ];
    const rows = vehicles.map((v) => [
      v.marca,
      v.modelo,
      v.ano_fabricacao,
      v.ano_modelo,
      v.km,
      v.preco.toFixed(2),
      v.combustivel ?? "",
      v.cor ?? "",
      v.cambio ?? "",
      v.carroceria ?? "",
      v.portas ?? "",
      v.placa ?? "",
      v.status,
      v.categoria,
      (v.opcionais ?? []).join("; "),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
    ].join("\r\n");

    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `veiculos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
    >
      <Download size={16} />
      Exportar CSV
    </button>
  );
}
