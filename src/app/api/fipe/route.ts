import { NextResponse } from "next/server";

const BASE = "https://fipe.parallelum.com.br/api/v2";

async function fetchJson(url: string) {
  const headers: Record<string, string> = {};
  if (process.env.FIPE_API_KEY) {
    headers.Authorization = `Bearer ${process.env.FIPE_API_KEY}`;
  }
  const res = await fetch(url, { headers, next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}

function normalize(str: string) {
  return str
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchBrand(apiBrands: any[], searchName: string) {
  const n = normalize(searchName);
  // exact normalized
  let found = apiBrands.find((b: any) => normalize(b.name) === n);
  if (found) return found;
  // partial: api name contains search
  found = apiBrands.find((b: any) => normalize(b.name).includes(n));
  if (found) return found;
  // partial: search contains api name
  found = apiBrands.find((b: any) => n.includes(normalize(b.name)));
  if (found) return found;
  return null;
}

function matchModel(apiModels: any[], searchName: string) {
  const n = normalize(searchName);
  // exact
  let found = apiModels.find((m: any) => normalize(m.name) === n);
  if (found) return found;
  // api model starts with search
  found = apiModels.find((m: any) => normalize(m.name).startsWith(n));
  if (found) return found;
  // api model contains search
  found = apiModels.find((m: any) => normalize(m.name).includes(n));
  if (found) return found;
  return null;
}

export async function POST(req: Request) {
  try {
    const { marca, modelo, ano, categoria } = await req.json();
    if (!marca || !modelo || !ano) {
      return NextResponse.json({ error: "marca, modelo e ano obrigatórios" }, { status: 400 });
    }

    const vehicleType = categoria === "moto" ? 2 : 1;

    // 1. Buscar marcas
    const marcas = await fetchJson(`${BASE}/${vehicleType}/brands`);
    if (!marcas) return NextResponse.json({ error: "Erro ao consultar marcas" }, { status: 502 });

    const marcaObj = matchBrand(marcas, marca);
    if (!marcaObj) return NextResponse.json({ error: `Marca "${marca}" não encontrada` }, { status: 404 });

    // 2. Buscar modelos
    const modelosData = await fetchJson(`${BASE}/${vehicleType}/brands/${marcaObj.code}/models`);
    if (!modelosData) return NextResponse.json({ error: "Erro ao consultar modelos" }, { status: 502 });

    const modeloObj = matchModel(modelosData, modelo);
    if (!modeloObj) return NextResponse.json({ error: `Modelo "${modelo}" não encontrado` }, { status: 404 });

    // 3. Buscar anos
    const anos = await fetchJson(`${BASE}/${vehicleType}/brands/${marcaObj.code}/models/${modeloObj.code}/years`);
    if (!anos) return NextResponse.json({ error: "Erro ao consultar anos" }, { status: 502 });

    const anoStr = String(ano);
    const anoMatch = anos.find((a: any) => String(a.code).startsWith(anoStr) || String(a.name).startsWith(anoStr));
    if (!anoMatch) return NextResponse.json({ error: `Ano ${ano} não encontrado` }, { status: 404 });

    // 4. Buscar preço
    const precoData = await fetchJson(
      `${BASE}/${vehicleType}/brands/${marcaObj.code}/models/${modeloObj.code}/years/${anoMatch.code}`
    );
    if (!precoData) return NextResponse.json({ error: "Erro ao consultar preço" }, { status: 502 });

    const valor = precoData.price;
    const valorNumerico = Number(
      valor.replace("R$ ", "").replace(/\./g, "").replace(",", ".")
    );

    return NextResponse.json({
      fipe: valorNumerico,
      fipe_raw: valor,
      mes_referencia: precoData.referenceMonth,
      codigo_fipe: precoData.codeFipe,
      combustivel: precoData.fuel,
      sigla_combustivel: precoData.fuelAcronym,
    });
  } catch (err) {
    console.error("FIPE error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
