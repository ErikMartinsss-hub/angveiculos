import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createServiceClient } from "@/lib/supabase-server";

const inter = Inter({ subsets: ["latin"] });

async function getSiteName() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("site_settings")
      .select("nome")
      .eq("id", 1)
      .single();
    return data?.nome ?? "Ang Veículos";
  } catch {
    return "Ang Veículos";
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return {
    title: siteName,
    description: `Sua agência de veículos de confiança - ${siteName}`,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
