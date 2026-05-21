"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import Header from "@/components/Header";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Email ou senha inválidos");
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
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-center mb-2">Entrar</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Acesse sua conta para favoritar veículos
          </p>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="text-right mb-6">
            <Link
              href="/recuperar-senha"
              className="text-xs text-gray-500 hover:text-red-600 transition"
            >
              Esqueci minha senha
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Não tem conta?{" "}
            <Link href="/cadastro" className="text-red-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
