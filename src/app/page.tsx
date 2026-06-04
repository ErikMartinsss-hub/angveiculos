import VehicleCard from "@/components/VehicleCard";
import VehicleFilter from "@/components/VehicleFilter";
import Header from "@/components/Header";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Vehicle } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createServerSupabase();
  const [vehiclesResult, settingsResult] = await Promise.all([
    supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("*").eq("id", 1).single(),
  ]);

  const vehicles = vehiclesResult.data;
  const siteSettings = settingsResult.data;
  const siteName = siteSettings?.nome ?? "Ang Veículos";
  const footerBg = siteSettings?.footer_bg ?? "#111827";
  const footerTextColor = siteSettings?.footer_text_color ?? "#9ca3af";

  const disponiveis = vehicles?.filter((v: Vehicle) => v.status === "disponivel") ?? [];
  const destaques = disponiveis.filter((v: Vehicle) => v.destaque);

  return (
    <>
      <Header />

      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Encontre o veículo{" "}
              <span className="text-red-500">perfeito</span> para você
            </h1>
            <p className="text-lg text-gray-400 mb-8">
              Confira nossa seleção de veículos seminovos com procedência, qualidade e o melhor preço da região.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#veiculos"
                className="bg-red-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-red-700 transition text-sm"
              >
                Ver veículos disponíveis
              </a>
              <a
                href="https://wa.me/5511947831797"
                target="_blank"
                className="border border-gray-600 text-gray-300 px-8 py-3.5 rounded-xl font-semibold hover:border-red-600 hover:text-red-500 transition text-sm"
              >
                Falar com Anizio
              </a>
              <a
                href="https://wa.me/5511942398993"
                target="_blank"
                className="border border-gray-600 text-gray-300 px-8 py-3.5 rounded-xl font-semibold hover:border-red-600 hover:text-red-500 transition text-sm"
              >
                Falar com Gabriel
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="veiculos" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {destaques.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Destaques</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                {destaques.slice(0, 3).map((vehicle: Vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Todos os Veículos
          </h2>

          <VehicleFilter vehicles={disponiveis} />
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Quer vender seu veículo?
          </h3>
          <p className="text-gray-500 mb-6">
            Fazemos a avaliação e vendemos seu carro com rapidez e segurança.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/5511947831797"
              target="_blank"
              className="btn-primary inline-block"
            >
              Falar com Anizio
            </a>
            <a
              href="https://wa.me/5511942398993"
              target="_blank"
              className="btn-primary inline-block"
            >
              Falar com Gabriel
            </a>
          </div>
        </div>
      </section>

      <footer style={{ backgroundColor: footerBg, borderColor: footerTextColor + "30" }} className="border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--primary)" }}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg font-bold" style={{ color: "#ffffff" }}>
                  {siteName}
                </span>
              </div>
              <p className="text-sm" style={{ color: footerTextColor }}>
                Sua agência de veículos de confiança. Qualidade e procedência em cada veículo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#ffffff" }}>Contato</h4>
              <div className="space-y-2 text-sm" style={{ color: footerTextColor }}>
                <p>(11) 947831797</p>
                <p>Contato Anizio  </p>
                <br></br>
                <p>(11) 942398993</p>
                <p>Contato Gabriel</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "#ffffff" }}>Horário</h4>
              <div className="space-y-2 text-sm" style={{ color: footerTextColor }}>
                <p>Seg - Sex: 9h às 18h</p>
                <p>Sábado: 9h às 13h</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-sm" style={{ borderTop: `1px solid ${footerTextColor}30`, color: footerTextColor }}>
            <p>© 2026 {siteName}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
