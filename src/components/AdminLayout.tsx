"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userEmail, setUserEmail] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const links = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/veiculos", label: "Veículos" },
    { href: "/admin/leads", label: "Leads" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="font-bold text-red-600">
              Ang Admin
            </Link>
            <nav className="flex gap-4 text-sm">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${
                    pathname === link.href
                      ? "text-red-600 font-medium"
                      : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-gray-500">Bem-vindo, {userEmail}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
