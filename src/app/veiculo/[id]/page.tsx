import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Fuel, Calendar, Gauge, Car, Palette, Cog, DoorOpen, Hash, MapPin, ShieldCheck, BadgeCheck, Truck, Headphones } from "lucide-react";
import Header from "@/components/Header";
import PhotoGallery from "@/components/PhotoGallery";
import LeadForm from "@/components/LeadForm";
import FavoriteButton from "@/components/FavoriteButton";
import VisitForm from "@/components/VisitForm";
import ViewTracker from "@/components/ViewTracker";
import { createServerSupabase } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function VehicleDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabase();
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!vehicle) notFound();

  const formattedPreco = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(vehicle.preco);

  const formattedPrecoParcele = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(vehicle.preco / 60);

  const mainSpecs = [
    { icon: Calendar, label: "Ano", value: `${vehicle.ano_fabricacao}/${vehicle.ano_modelo}` },
    { icon: Gauge, label: "KM", value: `${vehicle.km.toLocaleString("pt-BR")} km` },
    { icon: Fuel, label: "Combustível", value: vehicle.combustivel || "-" },
    { icon: Cog, label: "Câmbio", value: vehicle.cambio || "-" },
  ];

  const extraSpecs = [
    { icon: Palette, label: "Cor", value: vehicle.cor || "-" },
    { icon: Car, label: "Carroceria", value: vehicle.carroceria || "-" },
    ...(vehicle.categoria === "carro" ? [{ icon: DoorOpen, label: "Portas", value: vehicle.portas ? `${vehicle.portas}` : "-" }] : []),
    { icon: Hash, label: "Placa", value: vehicle.placa || "-" },
  ];

  const { data: similares } = await supabase
    .from("vehicles")
    .select("id, marca, modelo, ano_fabricacao, preco, km, fotos, combustivel")
    .eq("categoria", vehicle.categoria)
    .neq("id", vehicle.id)
    .eq("status", "disponivel")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <>
      <Header />
      <ViewTracker
        vehicleId={vehicle.id}
        vehicleInfo={`${vehicle.marca} ${vehicle.modelo} ${vehicle.ano_fabricacao}`}
      />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href={`/?categoria=${vehicle.categoria}`}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Voltar para listagem
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <PhotoGallery fotos={vehicle.fotos ?? []} />
            </div>

            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-6 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">
                        {vehicle.marca} {vehicle.modelo}
                      </h1>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Calendar size={14} />
                        {vehicle.ano_fabricacao}
                        {vehicle.cor && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1">
                              <Palette size={14} />
                              {vehicle.cor}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <FavoriteButton vehicleId={vehicle.id} size={24} className="flex-shrink-0" />
                  </div>

                  <div className="mt-5 mb-5">
                    <div className="text-3xl font-bold text-red-600">
                      {formattedPreco}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      ou 60x de <span className="font-semibold text-gray-700">{formattedPrecoParcele}</span> sem juros
                    </p>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={`https://wa.me/5511986022554?text=Olá! Fiquei interessado no ${vehicle.marca} ${vehicle.modelo} ${vehicle.ano_fabricacao} - ${vehicle.km.toLocaleString("pt-BR")} km, ${vehicle.combustivel || ""} por ${formattedPreco}. Gostaria de saber mais sobre o veículo.`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition shadow-sm"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Falar com vendedor
                    </a>

                    <a
                      href={`tel:5511986022554`}
                      className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold hover:border-red-600 hover:text-red-600 transition"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      Ligar
                    </a>
                  </div>

                  {vehicle.status === "disponivel" && (
                    <div className="mt-4">
                      <VisitForm
                        vehicleId={vehicle.id}
                        vehicleInfo={`${vehicle.marca} ${vehicle.modelo} ${vehicle.ano_fabricacao}`}
                      />
                    </div>
                  )}

                  {vehicle.status !== "disponivel" && (
                    <div className="mt-4 bg-gray-100 rounded-xl p-4 text-center">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        {vehicle.status === "vendido" ? "VEÍCULO VENDIDO" : "VEÍCULO RESERVADO"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gauge size={18} className="text-red-500" />
                    Principais Características
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {mainSpecs.map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                          <Icon size={14} />
                          <span className="text-xs">{label}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                  {extraSpecs.length > 0 && (
                    <>
                      <div className="border-t border-gray-100 my-4" />
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                        Detalhes
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {extraSpecs.map(({ icon: Icon, label, value }) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                              <Icon size={14} />
                              <span className="text-xs">{label}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{value}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border border-red-100">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-red-500" />
                    Por que comprar conosco?
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: BadgeCheck, text: "Veículos revisados e com procedência" },
                      { icon: Headphones, text: "Atendimento personalizado via WhatsApp" },
                      { icon: Truck, text: "Aceitamos seu veículo como entrada" },
                      { icon: MapPin, text: "Agende uma visita e veja pessoalmente" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                          <Icon size={16} className="text-red-600" />
                        </div>
                        <span className="text-sm text-gray-700">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
            <div className="lg:col-span-3 space-y-6">
              {vehicle.descricao && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sobre este veículo
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {vehicle.descricao}
                  </p>
                </div>
              )}

              {vehicle.opcionais && vehicle.opcionais.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Opcionais</h3>
                  <div className="flex flex-wrap gap-2">
                    {vehicle.opcionais.map((opt: string, i: number) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-6">
                <LeadForm
                  vehicleId={vehicle.id}
                  vehicleInfo={`${vehicle.marca} ${vehicle.modelo} ${vehicle.ano_fabricacao}`}
                />
              </div>
            </div>
          </div>

          {similares && similares.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Veículos Similares</h2>
                <Link
                  href={`/?categoria=${vehicle.categoria}`}
                  className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                >
                  Ver todos
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {similares.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/veiculo/${s.id}`}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={s.fotos?.[0] ?? "/placeholder.svg"}
                        alt={`${s.marca} ${s.modelo}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {s.marca} {s.modelo}
                      </p>
                      <p className="text-xs text-gray-500">{s.ano_fabricacao} | {s.km.toLocaleString("pt-BR")} km</p>
                      <p className="text-red-600 font-bold text-sm mt-1">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s.preco)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
