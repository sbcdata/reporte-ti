import * as XLSX from "xlsx";
import type { Problema, ContagemItem } from "./types";

// Resolve o caminho do arquivo respeitando o basePath do GitHub Pages.
function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}${path}`;
}

// Lê uma célula sob diferentes variações de nome de coluna (tolerante a acentos/maiúsculas).
function pick(row: Record<string, unknown>, keys: string[]): string {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  const wanted = keys.map(norm);
  for (const k of Object.keys(row)) {
    if (wanted.includes(norm(k))) {
      const v = row[k];
      if (v === null || v === undefined) return "";
      return String(v).trim();
    }
  }
  return "";
}

// Lê uma célula como valor bruto (sem converter para string).
function pickRaw(row: Record<string, unknown>, keys: string[]): unknown {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
  const wanted = keys.map(norm);
  for (const k of Object.keys(row)) {
    if (wanted.includes(norm(k))) return row[k];
  }
  return "";
}

// Converte serial de data do Excel ou string para texto legível.
function formatarPrazo(v: unknown): string {
  if (v === "" || v === null || v === undefined) return "";
  if (typeof v === "number") {
    const d = XLSX.SSF.parse_date_code(v);
    return `${String(d.d).padStart(2, "0")}/${String(d.m).padStart(2, "0")}/${d.y}`;
  }
  return String(v).trim();
}

// Parseia a coluna "Histórico de Prazo": serial único ou lista separada por ";" ou quebra de linha.
function parsearHistoricoPrazo(v: unknown): string[] {
  if (v === "" || v === null || v === undefined) return [];
  if (typeof v === "number") return [formatarPrazo(v)];
  return String(v)
    .split(/[;\r\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Formata valor monetário numérico ou mantém string como está.
function formatarValor(v: unknown): string {
  if (v === "" || v === null || v === undefined) return "";
  if (typeof v === "number") {
    return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return String(v).trim();
}

/** Carrega a planilha de /public/data/problemas_v2.xlsx e devolve os problemas tipados. */
export async function carregarProblemas(): Promise<Problema[]> {
  const url = withBasePath("/data/problemas_v2.xlsx");
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Não foi possível carregar a planilha (${res.status}). Verifique /public/data/problemas_v2.xlsx`,
    );
  }
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
  });

  return rows
    .map(
      (row, i): Problema => ({
        id: String(i + 1),
        unidade: pick(row, ["Unidade"]),
        estado: pick(row, ["Estado"]),
        superintendencia: pick(row, [
          "Superintendência",
          "Superintendencia",
          "Superintendente",
        ]),
        categoria: pick(row, ["Categoria"]),
        problema: pick(row, [
          "Problema",
          "Problemas daquela categoria",
          "Problemas",
        ]),
        criticidade: pick(row, ["Criticidade", "Criticidade Consolidada"]),
        impacto: pick(row, [
          "Impacto",
          "Impacto / Risco Principal",
          "Risco Principal",
        ]),
        acao: pick(row, [
          "Ação",
          "Acao",
          "Ação Prioritária Recomendada",
          "Acao Prioritaria Recomendada",
        ]),
        responsavel: pick(row, ["Responsável", "Responsavel"]),
        status: pick(row, ["Status"]),
        prioridade: pick(row, ["Prioridade"]),
        custeioEstimado: formatarValor(pickRaw(row, ["Custeio estimado", "Custeio"])),
        investimentoEstimado: formatarValor(pickRaw(row, ["Investimento estimado", "Investimento"])),
        prazo: formatarPrazo(pickRaw(row, ["Prazo", "Prazo inicial"])),
        dataSolicitacao: formatarPrazo(pickRaw(row, ["Data de Solicitação", "Data Solicitação", "Data Solicitacao"])),
        historicoPrazo: parsearHistoricoPrazo(pickRaw(row, ["Histórico de Prazo", "Historico de Prazo", "Histórico Prazo"])),
      }),
    )
    .filter((p) => p.unidade || p.categoria || p.problema);
}

/** Agrupa por um campo e calcula totais e percentuais, ordenado por total desc. */
export function agruparPor(
  problemas: Problema[],
  campo: keyof Problema,
): ContagemItem[] {
  const total = problemas.length || 1;
  const mapa = new Map<string, number>();
  for (const p of problemas) {
    const chave = (p[campo] as string) || "—";
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  }
  return Array.from(mapa.entries())
    .map(([nome, t]) => ({
      nome,
      total: t,
      percentual: Math.round((t / total) * 1000) / 10,
    }))
    .sort((a, b) => b.total - a.total);
}
