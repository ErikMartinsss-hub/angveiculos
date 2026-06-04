"use client";

import Link from "next/link";
import { Car, Heart, Menu, X, User } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; nome?: string } | null>(null);
  const [settings, setSettings] = useState<{ nome: string; logo_url: string | null; primary_color: string } | null>(null);
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
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.nome) {
          setSettings(data);
          document.documentElement.style.setProperty("--primary", data.primary_color);
          document.documentElement.style.setProperty("--primary-dark", data.primary_color + "cc");
          document.documentElement.style.setProperty("--primary-light", data.primary_color + "11");
        }
      });
  }, []);

  const primaryColor = settings?.primary_color ?? "#dc2626";
  const siteName = settings?.nome ?? "Ang Veículos";

  function nomeCurto(nome: string) {
    const partes = nome.split(" ");
    return partes.length > 1 ? partes[partes.length - 1] : nome;
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt={siteName} className="h-16 object-contain" />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:opacity-90 transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Car className="text-white" size={28} />
            </div>
          )}
          <span className="text-2xl font-bold text-gray-900">{siteName}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 transition-colors"
            style={{ ['--hover-color' as any]: primaryColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Início
          </Link>
          <Link
            href="/#veiculos"
            className="text-sm font-medium text-gray-600 transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Veículos
          </Link>

          {user ? (
            <Link
              href="/favoritos"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              <Heart size={16} />
              <span className="hidden lg:inline">{nomeCurto(user.nome ?? "")}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              <User size={16} />
              Entrar
            </Link>
          )}

          <Link
            href="/admin/login"
            className="text-sm font-medium text-gray-400 transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Admin
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-600 transition-colors"
          onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
          onMouseLeave={(e) => (e.currentTarget.style.color = "")}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-600 transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Início
          </Link>
          <Link
            href="/#veiculos"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-600 transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Veículos
          </Link>
          {user ? (
            <Link
              href="/favoritos"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              <Heart size={16} /> {user.nome ?? "Favoritos"}
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors"
              onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "")}
            >
              <User size={16} /> Entrar
            </Link>
          )}
          <Link
            href="/admin/login"
            onClick={() => setOpen(false)}
            className="block text-sm font-medium text-gray-400 transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}
