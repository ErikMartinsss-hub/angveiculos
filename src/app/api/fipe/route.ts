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
  const aliases: Record<string, string[]> = {
    chevrolet: ["gmchevrolet", "chevrolet"],
    volkswagen: ["vwvolkswagen"],
    mercedes: ["mercedesbenz"],
  };
  const searchTerms = aliases[n] ?? [n];
  for (const term of searchTerms) {
    let found = apiBrands.find((b: any) => normalize(b.name) === term);
    if (found) return found;
    found = apiBrands.find((b: any) => normalize(b.name).includes(term));
    if (found) return found;
    found = apiBrands.find((b: any) => term.includes(normalize(b.name)));
    if (found) return found;
  }
  let found = apiBrands.find((b: any) => normalize(b.name).includes(n));
  if (found) return found;
  found = apiBrands.find((b: any) => n.includes(normalize(b.name)));
  if (found) return found;
  return null;
}

function matchModels(apiModels: any[], searchName: string) {
  const n = normalize(searchName);
  return apiModels.filter((m: any) => normalize(m.name).includes(n));
}

function matchYear(anos: any[], targetAno: string) {
  return anos.find(
    (a: any) =>
      String(a.code).startsWith(targetAno) ||
      String(a.name).startsWith(targetAno)
  );
}

export async function POST(req: Request) {
  try {
    const { marca, modelo, ano, categoria } = await req.json();
    if (!marca || !modelo || !ano) {
      return NextResponse.json({ error: "marca, modelo e ano obrigatórios" }, { status: 400 });
    }

    const vehicleType = categoria === "moto" ? "motorcycles" : "cars";
    const anoStr = String(ano);

    // 1. Marcas
    const marcas = await fetchJson(`${BASE}/${vehicleType}/brands`);
    if (!marcas) return NextResponse.json({ error: "Erro ao consultar marcas" }, { status: 502 });

    const marcaObj = matchBrand(marcas, marca);
    if (!marcaObj) return NextResponse.json({ error: `Marca "${marca}" não encontrada` }, { status: 404 });

    // 2. Modelos
    const modelosData = await fetchJson(`${BASE}/${vehicleType}/brands/${marcaObj.code}/models`);
    if (!modelosData) return NextResponse.json({ error: "Erro ao consultar modelos" }, { status: 502 });

    const matchingModels = matchModels(modelosData, modelo);
    if (matchingModels.length === 0) {
      return NextResponse.json({ error: `Modelo "${modelo}" não encontrado` }, { status: 404 });
    }

    // 3. Para cada modelo candidato, busca anos e tenta achar o ano alvo
    for (const m of matchingModels.slice(0, 10)) {
      const anos = await fetchJson(
        `${BASE}/${vehicleType}/brands/${marcaObj.code}/models/${m.code}/years`
      );
      if (!anos) continue;

      const anoMatch = matchYear(anos, anoStr);
      if (!anoMatch) continue;

      // 4. Preço
      const precoData = await fetchJson(
        `${BASE}/${vehicleType}/brands/${marcaObj.code}/models/${m.code}/years/${anoMatch.code}`
      );
      if (!precoData) continue;

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
    }

    return NextResponse.json(
      { error: `Nenhuma versão do ${modelo} encontrada para o ano ${ano}` },
      { status: 404 }
    );
  } catch (err) {
    console.error("FIPE error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
