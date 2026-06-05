const fs = require("fs");

// Gera o contexto de veículos disponíveis para alimentar o system prompt do Gemini
// Rode com: node scripts/gerar-contexto.js

async function main() {
  const res = await fetch("https://angveiculos.vercel.app/api/site-settings");
  const data = await res.json();

  // Monta o system prompt com estoque atualizado
  // Na prática, você pode rodar isso num cron do n8n (Schedule Trigger)
  // e atualizar o system prompt do Gemini dinamicamente

  const contexto = `
ESTOQUE ATUAL ANGVEÍCULOS (gerado em ${new Date().toLocaleString("pt-BR")}):

${data.vehicles ? data.vehicles.map((v: any) =>
  `- ${v.marca} ${v.modelo} ${v.ano_fabricacao} - ${v.km.toLocaleString("pt-BR")}km - R$ ${Number(v.preco).toLocaleString("pt-BR")} - ${v.combustivel || "N/I"} - Status: ${v.status}`
).join("\n") : "Consulte o site para ver o estoque disponível."}
`;

  fs.writeFileSync("contexto-estoque.txt", contexto);
  console.log("Contexto gerado em contexto-estoque.txt");
}

main().catch(console.error);
