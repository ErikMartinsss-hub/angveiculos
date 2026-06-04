import { NextResponse } from "next/server";

const BASE = "https://parallelum.com.br/fipe/api/v1";

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}

export async function POST(req: Request) {
  try {
    const { marca, modelo, ano, categoria } = await req.json();
    if (!marca || !modelo || !ano) {
      return NextResponse.json({ error: "marca, modelo e ano são obrigatórios" }, { status: 400 });
    }

    const tipo = categoria === "moto" ? "motos" : "carros";

    // 1. Buscar marcas
    const marcas = await fetchJson(`${BASE}/${tipo}/marcas`);
    if (!marcas) return NextResponse.json({ error: "Erro ao consultar marcas" }, { status: 502 });

    const marcaObj = marcas.find(
      (m: any) => m.nome.toLowerCase() === marca.toLowerCase()
    );
    if (!marcaObj) return NextResponse.json({ error: `Marca "${marca}" não encontrada` }, { status: 404 });

    // 2. Buscar modelos
    const modelosData = await fetchJson(`${BASE}/${tipo}/marcas/${marcaObj.codigo}/modelos`);
    if (!modelosData) return NextResponse.json({ error: "Erro ao consultar modelos" }, { status: 502 });

    const modeloObj = modelosData.modelos.find(
      (m: any) => m.nome.toLowerCase().includes(modelo.toLowerCase())
    );
    if (!modeloObj) return NextResponse.json({ error: `Modelo "${modelo}" não encontrado` }, { status: 404 });

    // 3. Buscar anos
    const anos = await fetchJson(
      `${BASE}/${tipo}/marcas/${marcaObj.codigo}/modelos/${modeloObj.codigo}/anos`
    );
    if (!anos) return NextResponse.json({ error: "Erro ao consultar anos" }, { status: 502 });

    // Procura ano que comece com o ano informado (ex: "2018-1" para 2018 gasolina)
    const anoMatch = anos.find((a: any) => a.nome.startsWith(String(ano)));
    if (!anoMatch) return NextResponse.json({ error: `Ano ${ano} não encontrado` }, { status: 404 });

    // 4. Buscar preço
    const precoData = await fetchJson(
      `${BASE}/${tipo}/marcas/${marcaObj.codigo}/modelos/${modeloObj.codigo}/anos/${anoMatch.codigo}`
    );
    if (!precoData) return NextResponse.json({ error: "Erro ao consultar preço" }, { status: 502 });

    const valor = precoData.Valor;
    const valorNumerico = Number(
      valor.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
    );

    return NextResponse.json({
      fipe: valorNumerico,
      fipe_raw: valor,
      mes_referencia: precoData.MesReferencia,
      codigo_fipe: precoData.CodigoFipe,
      combustivel: precoData.Combustivel,
      sigla_combustivel: precoData.SiglaCombustivel,
    });
  } catch (err) {
    console.error("FIPE error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
