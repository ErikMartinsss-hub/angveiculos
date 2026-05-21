"use client";

import Link from "next/link";
import { Car, Heart, Menu, X, User } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; nome?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          nome: data.user.user_metadata?.nome,
        });
      }
    });
  }, []);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center group-hover:bg-red-700 transition-colors">
            <Car className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900">
            Ang<span className="text-red-600">Veículos</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            Início
          </Link>
          <Link
            href="/#veiculos"
            className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            Veículos
          </Link>

          {user ? (
            <Link
              href="/favoritos"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <Heart size={16} />
              <span className="hidden lg:inline">{user.nome}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <User size={16} />
              Entrar
            </Link>
          )}

          <Link
            href="/admin/login"
            className="text-sm font-medium text-gray-400 hover:text-red-600 transition-colors"
          >
            Admin
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-600 hover:text-red-600"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-600 hover:text-red-600"
          >
            Início
          </Link>
          <Link
            href="/#veiculos"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-600 hover:text-red-600"
          >
            Veículos
          </Link>
          {user ? (
            <Link
              href="/favoritos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600"
            >
              <Heart size={16} /> {user.nome ?? "Favoritos"}
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600"
            >
              <User size={16} /> Entrar
            </Link>
          )}
          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-400 hover:text-red-600"
          >
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}
