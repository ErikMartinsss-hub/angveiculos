"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import Header from "@/components/Header";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function formatTelefone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("As senhas não conferem");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome,
          telefone,
          role: "customer",
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/favoritos");
    router.refresh();
  }

  return (
    <>
      <Header />
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <form
          onSubmit={handleSignup}
          className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-center mb-2">Criar Conta</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Crie sua conta para favoritar veículos e agendar visitas
          </p>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              WhatsApp *
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatTelefone(e.target.value))}
              className="input-field"
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Senha *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Repetir Senha *</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo de 6 caracteres</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Já tem conta?{" "}
            <Link href="/login" className="text-red-600 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
