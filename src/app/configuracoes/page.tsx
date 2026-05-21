"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Mail, Lock, Phone } from "lucide-react";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase";

export default function Configuracoes() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setEmail(user.email ?? "");
      const meta = user.user_metadata ?? {};
      setNome(meta.nome ?? "");
      setTelefone(meta.telefone ?? "");
    });
  }, []);

  function formatTelefone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function updateMeta() {
    const { error } = await supabase.auth.updateUser({
      data: { nome, telefone },
    });
    if (error) throw error;
  }

  async function updateEmail() {
    if (!senhaAtual) throw new Error("Digite sua senha atual para alterar o email");
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email, // this is the current email
      password: senhaAtual,
    });
    if (signInError) throw new Error("Senha atual incorreta");

    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
    return "Email atualizado! Verifique sua caixa de entrada para confirmar.";
  }

  async function updatePassword() {
    if (!senhaAtual) throw new Error("Digite sua senha atual");
    if (novaSenha.length < 6) throw new Error("Nova senha deve ter no mínimo 6 caracteres");
    if (novaSenha !== confirmSenha) throw new Error("Nova senha e confirmação não conferem");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: senhaAtual,
    });
    if (signInError) throw new Error("Senha atual incorreta");

    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) throw error;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaveMsg("");
    setLoading(true);

    try {
      await updateMeta();
      setSaveMsg("Dados atualizados com sucesso!");
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaveMsg("");
    setLoading(true);

    try {
      const msg = await updateEmail();
      setSaveMsg(msg);
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaveMsg("");
    setLoading(true);

    try {
      await updatePassword();
      setSaveMsg("Senha atualizada com sucesso!");
      setNovaSenha("");
      setConfirmSenha("");
      setSenhaAtual("");
    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);
  }

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/favoritos"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-8">Configurações</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {saveMsg && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-700">
            {saveMsg}
          </div>
        )}

        <div className="space-y-8">
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-5">
              <User size={18} /> Dados Pessoais
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(formatTelefone(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm disabled:opacity-50"
            >
              <Save size={16} /> Salvar
            </button>
          </form>

          <form onSubmit={handleUpdateEmail} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-5">
              <Mail size={18} /> Alterar Email
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Novo Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha Atual</label>
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Confirme sua senha atual"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm disabled:opacity-50"
            >
              <Mail size={16} /> Atualizar Email
            </button>
          </form>

          <form onSubmit={handleUpdatePassword} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 mb-5">
              <Lock size={18} /> Alterar Senha
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Senha Atual</label>
                <input
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmSenha}
                  onChange={(e) => setConfirmSenha(e.target.value)}
                  className="input-field"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm disabled:opacity-50"
            >
              <Lock size={16} /> Atualizar Senha
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
