"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Vehicle } from "@/lib/types";
import { getMarcas, getModelos } from "@/data/carros";
import { Search } from "lucide-react";

type Props = {
  vehicle?: Vehicle | null;
};

const defaultForm = {
  categoria: "carro" as "carro" | "moto",
  marca: "",
  modelo: "",
  ano_fabricacao: new Date().getFullYear(),
  ano_modelo: new Date().getFullYear(),
  km: 0,
  preco: 0,
  combustivel: "",
  cor: "",
  portas: 4,
  cambio: "",
  carroceria: "",
  placa: "",
  opcionais: [] as string[],
  descricao: "",
  status: "disponivel" as Vehicle["status"],
  destaque: false,
};

export default function VehicleForm({ vehicle }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!vehicle;

  const [form, setForm] = useState(() => {
    if (vehicle) {
      const { fotos, id, created_at, ...rest } = vehicle;
      return { ...rest, opcionais: rest.opcionais ?? [] };
    }
    return defaultForm;
  });

  const [files, setFiles] = useState<File[]>([]);
  const [existingFotos, setExistingFotos] = useState<string[]>(
    vehicle?.fotos ?? []
  );
  const [loading, setLoading] = useState(false);
  const [fipeLoading, setFipeLoading] = useState(false);

  const marcas = getMarcas(form.categoria);
  const modelos = form.marca ? getModelos(form.categoria, form.marca) : [];

  async function buscarPrecoFipe() {
    if (!form.marca || !form.modelo || !form.ano_fabricacao) {
      alert("Selecione marca, modelo e ano primeiro");
      return;
    }
    setFipeLoading(true);
    try {
      const res = await fetch("/api/fipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca: form.marca,
          modelo: form.modelo,
          ano: form.ano_fabricacao,
          categoria: form.categoria,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erro ao buscar preço FIPE");
        return;
      }
      updateField("preco", data.fipe);
      if (data.combustivel && !form.combustivel) {
        const map: Record<string, string> = {
          Gasolina: "Gasolina",
          Etanol: "Etanol",
          Flex: "Flex",
          Diesel: "Diesel",
          Elétrico: "Elétrico",
          Híbrido: "Híbrido",
        };
        const combustivel = map[data.combustivel];
        if (combustivel) updateField("combustivel", combustivel);
      }
    } catch {
      alert("Erro de conexão ao buscar FIPE");
    } finally {
      setFipeLoading(false);
    }
  }

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addOpcional() {
    setForm((prev) => ({ ...prev, opcionais: [...prev.opcionais, ""] }));
  }

  function updateOpcional(index: number, value: string) {
    setForm((prev) => {
      const opcionais = [...prev.opcionais];
      opcionais[index] = value;
      return { ...prev, opcionais };
    });
  }

  function removeOpcional(index: number) {
    setForm((prev) => ({
      ...prev,
      opcionais: prev.opcionais.filter((_, i) => i !== index),
    }));
  }

  function removeExistingFoto(index: number) {
    setExistingFotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const uploadedUrls = [...existingFotos];

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from("veiculos")
        .upload(fileName, file);

      if (error) {
        alert("Erro ao fazer upload da foto: " + error.message);
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("veiculos")
        .getPublicUrl(fileName);

      uploadedUrls.push(urlData.publicUrl);
    }

    const payload = {
      ...form,
      fotos: uploadedUrls,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("vehicles")
        .update(payload)
        .eq("id", vehicle!.id);

      if (error) {
        alert("Erro ao atualizar veículo: " + error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("vehicles").insert([payload]);

      if (error) {
        alert("Erro ao criar veículo: " + error.message);
        setLoading(false);
        return;
      }
    }

    router.push("/admin/veiculos");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border p-6 max-w-3xl"
    >
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Categoria</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              updateField("categoria", "carro");
              updateField("marca", "");
              updateField("modelo", "");
            }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${
              form.categoria === "carro"
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            Carro
          </button>
          <button
            type="button"
            onClick={() => {
              updateField("categoria", "moto");
              updateField("marca", "");
              updateField("modelo", "");
            }}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition ${
              form.categoria === "moto"
                ? "border-red-600 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            Moto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Field label="Marca" required>
          <select
            value={form.marca}
            onChange={(e) => {
              updateField("marca", e.target.value);
              updateField("modelo", "");
            }}
            className="w-full border rounded-lg px-3 py-2"
            required
          >
            <option value="">Selecione a marca</option>
            {marcas.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label="Modelo" required>
          <select
            value={form.modelo}
            onChange={(e) => updateField("modelo", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
            disabled={!form.marca}
          >
            <option value="">Selecione o modelo</option>
            {modelos.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label="Ano fabricação" required>
          <input
            type="number"
            value={form.ano_fabricacao}
            onChange={(e) =>
              updateField("ano_fabricacao", Number(e.target.value))
            }
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </Field>

        <Field label="Ano modelo" required>
          <input
            type="number"
            value={form.ano_modelo}
            onChange={(e) => updateField("ano_modelo", Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </Field>

        <Field label="KM" required>
          <input
            type="number"
            value={form.km}
            onChange={(e) => updateField("km", Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </Field>

        <Field label="Preço (R$)" required>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={form.preco}
              onChange={(e) => updateField("preco", Number(e.target.value))}
              className="flex-1 border rounded-lg px-3 py-2"
              required
            />
            <button
              type="button"
              onClick={buscarPrecoFipe}
              disabled={fipeLoading}
              className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 whitespace-nowrap"
            >
              <Search size={15} />
              {fipeLoading ? "..." : "FIPE"}
            </button>
          </div>
        </Field>

        <Field label="Combustível">
          <select
            value={form.combustivel}
            onChange={(e) => updateField("combustivel", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Selecione</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Etanol">Etanol</option>
            <option value="Flex">Flex</option>
            <option value="Diesel">Diesel</option>
            <option value="Elétrico">Elétrico</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </Field>

        <Field label="Cor">
          <input
            value={form.cor}
            onChange={(e) => updateField("cor", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
        </Field>

        {form.categoria === "carro" && (
          <Field label="Portas">
            <select
              value={form.portas}
              onChange={(e) => updateField("portas", Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </Field>
        )}

        <Field label="Câmbio">
          <select
            value={form.cambio}
            onChange={(e) => updateField("cambio", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Selecione</option>
            <option value="Manual">Manual</option>
            <option value="Automático">Automático</option>
            <option value="Semi-automático">Semi-automático</option>
            <option value="CVT">CVT</option>
          </select>
        </Field>

        <Field label="Carroceria">
          <select
            value={form.carroceria}
            onChange={(e) => updateField("carroceria", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Selecione</option>
            {form.categoria === "carro" ? (
              <>
                <option value="Hatch">Hatch</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Picape">Picape</option>
                <option value="Coupé">Coupé</option>
                <option value="Conversível">Conversível</option>
                <option value="Perua">Perua</option>
              </>
            ) : (
              <>
                <option value="Street">Street</option>
                <option value="Naked">Naked</option>
                <option value="Esportiva">Esportiva</option>
                <option value="Trail">Trail</option>
                <option value="Custom">Custom</option>
                <option value="Scooter">Scooter</option>
                <option value="Big Trail">Big Trail</option>
                <option value="Off Road">Off Road</option>
              </>
            )}
          </select>
        </Field>

        <Field label="Placa">
          <input
            value={form.placa}
            onChange={(e) => updateField("placa", e.target.value.toUpperCase())}
            className="w-full border rounded-lg px-3 py-2 uppercase"
            maxLength={7}
          />
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
          </select>
        </Field>

        <Field label="Destaque">
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.destaque}
              onChange={(e) => updateField("destaque", e.target.checked)}
              className="w-5 h-5"
            />
            Mostrar como destaque
          </label>
        </Field>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Opcionais</label>
        {form.opcionais.map((opt, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={opt}
              onChange={(e) => updateOpcional(i, e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Ex: Ar condicionado"
            />
            <button
              type="button"
              onClick={() => removeOpcional(i)}
              className="text-red-600 text-sm hover:underline"
            >
              Remover
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addOpcional}
          className="text-blue-600 text-sm hover:underline"
        >
          + Adicionar opcional
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Descrição</label>
        <textarea
          value={form.descricao}
          onChange={(e) => updateField("descricao", e.target.value)}
          className="w-full border rounded-lg px-3 py-2 h-28"
          placeholder="Descrição detalhada do veículo..."
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Fotos</label>

        {existingFotos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            {existingFotos.map((foto, i) => (
              <div key={i} className="relative group">
                <img
                  src={foto}
                  alt={`Foto ${i + 1}`}
                  className="w-full aspect-[4/3] object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeExistingFoto(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <label className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-red-400 hover:bg-red-50 transition">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Upload de fotos</span>
            <span className="text-xs text-gray-400">Selecione arquivos</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="hidden"
            />
          </label>

          <label className="flex-1 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-red-400 hover:bg-red-50 transition">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Tirar foto</span>
            <span className="text-xs text-gray-400">Usar câmera</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const newFiles = Array.from(e.target.files ?? []);
                setFiles((prev) => [...prev, ...newFiles]);
              }}
              className="hidden"
            />
          </label>
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {files.map((file, i) => (
              <div key={i} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${i + 1}`}
                  className="w-full aspect-[4/3] object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded opacity-0 hover:opacity-100 transition"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading
          ? "Salvando..."
          : isEditing
          ? "Atualizar Veículo"
          : "Cadastrar Veículo"}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
