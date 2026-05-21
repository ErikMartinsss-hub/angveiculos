"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import Header from "@/components/Header";
import { Mail, ArrowLeft } from "lucide-react";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/atualizar-senha`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <>
      <Header />
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail size={24} className="text-green-600" />
              </div>
              <h1 className="text-xl font-bold mb-2">Email enviado!</h1>
              <p className="text-sm text-gray-500 mb-6">
                Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
              </p>
              <Link href="/login" className="text-red-600 hover:underline text-sm">
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 mb-6">
                <ArrowLeft size={16} /> Voltar
              </Link>
              <h1 className="text-xl font-bold mb-2">Recuperar Senha</h1>
              <p className="text-sm text-gray-500 mb-6">
                Digite seu email cadastrado e enviaremos um link para redefinir sua senha.
              </p>

              {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

              <form onSubmit={handleReset} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email"
                  className="input-field"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
