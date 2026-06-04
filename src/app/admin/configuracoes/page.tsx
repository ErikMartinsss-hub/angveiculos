"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AdminLayout from "@/components/AdminLayout";

type Settings = {
  nome: string;
  logo_url: string | null;
  primary_color: string;
};

export default function AdminConfig() {
  const [settings, setSettings] = useState<Settings>({
    nome: "Ang Veículos",
    logo_url: null,
    primary_color: "#dc2626",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.nome) setSettings(data);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    let logo_url = settings.logo_url;

    if (logoFile) {
      const ext = logoFile.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("veiculos")
        .upload(fileName, logoFile);

      if (uploadError) {
        alert("Erro ao fazer upload do logo: " + uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("veiculos")
        .getPublicUrl(fileName);

      logo_url = urlData.publicUrl;
    }

    const res = await fetch("/api/site-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, logo_url }),
    });

    setSaving(false);

    if (!res.ok) {
      alert("Erro ao salvar configurações");
      return;
    }

    setMessage("Configurações salvas!");
    setLogoFile(null);
    router.refresh();
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Configurações do Site</h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border p-6 max-w-lg">
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Nome do Site</label>
          <input
            type="text"
            value={settings.nome}
            onChange={(e) => setSettings({ ...settings, nome: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Cor Primária</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={settings.primary_color}
              onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              className="w-12 h-10 rounded cursor-pointer border"
            />
            <input
              type="text"
              value={settings.primary_color}
              onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
              className="flex-1 border rounded-lg px-3 py-2 font-mono"
              placeholder="#dc2626"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Logo</label>
          {settings.logo_url && !logoFile && (
            <div className="mb-3">
              <img src={settings.logo_url} alt="Logo atual" className="h-16 object-contain rounded border" />
              <button
                type="button"
                onClick={() => setSettings({ ...settings, logo_url: null })}
                className="text-xs text-red-600 hover:underline mt-1"
              >
                Remover logo
              </button>
            </div>
          )}
          {logoFile && (
            <div className="mb-3">
              <img src={URL.createObjectURL(logoFile)} alt="Novo logo" className="h-16 object-contain rounded border" />
              <button
                type="button"
                onClick={() => setLogoFile(null)}
                className="text-xs text-red-600 hover:underline mt-1"
              >
                Cancelar
              </button>
            </div>
          )}
          <label className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-red-400 hover:bg-red-50 transition">
            <span className="text-sm text-gray-600">Escolher imagem</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

        {message && (
          <p className="text-green-600 text-sm mb-4">{message}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar Configurações"}
        </button>
      </form>
    </AdminLayout>
  );
}
