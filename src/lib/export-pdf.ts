import type { Problema, ContagemItem, ExportCtx } from './types';
import { agruparPor } from './data';
import { PALETA, corCriticidade } from './ui';

// ── página A4 ──────────────────────────────────────────────────
const PW = 210;
const PH = 297;
const ML = 14;
const MR = 14;
const CW = PW - ML - MR;

// ── paleta corporativa SBCData ─────────────────────────────────
const C = {
  navy:    '#0f172a',
  navyMid: '#1e293b',
  blue:    '#1a65c2',
  blueDk:  '#1449a0',
  blueLt:  '#eff6ff',
  blueMid: '#dbeafe',
  white:   '#ffffff',
  slate50: '#f8fafc',
  slate100:'#f1f5f9',
  slate200:'#e2e8f0',
  slate300:'#cbd5e1',
  slate400:'#94a3b8',
  slate500:'#64748b',
  slate600:'#475569',
  slate700:'#334155',
  slate800:'#1e293b',
  rose:    '#f43f5e',
  teal:    '#10b981',
  sky:     '#0ea5e9',
  violet:  '#a78bfa',
};

async function loadImage(path: string): Promise<string | null> {
  try {
    const base = (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.runtimeConfig?.basePath) ||
                 process.env.NEXT_PUBLIC_BASE_PATH || '';
    const res = await fetch(`${base}${path}`);
    if (!res.ok) return null;
    const buf   = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = '';
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    return 'data:image/png;base64,' + btoa(bin);
  } catch {
    return null;
  }
}

function hex2rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function trunc(s: string, n: number): string {
  return s && s.length > n ? s.slice(0, n - 1) + '…' : (s || '');
}

function today(): string {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}


function setFill(doc: any, color: string) {
  const [r, g, b] = hex2rgb(color);
  doc.setFillColor(r, g, b);
}

function setStroke(doc: any, color: string) {
  const [r, g, b] = hex2rgb(color);
  doc.setDrawColor(r, g, b);
}

function setTxt(doc: any, color: string) {
  const [r, g, b] = hex2rgb(color);
  doc.setTextColor(r, g, b);
}

// ── cabeçalho branco corporativo SBCData ─────────────────────
// logoEsq: sbcd-logo-sem-fundo  (ícone, lado esquerdo, centralizado)
// logoDir: logo-sem-fundo-sbcdata (marca completa, canto direito-inferior)
function drawHeader(
  doc: any,
  titulo: string,
  subtitulo: string,
  logoEsq: string | null,
  logoDir: string | null,
) {
  // área branca
  setFill(doc, C.white);
  doc.rect(0, 0, PW, 38, 'F');

  // barra azul à esquerda
  setFill(doc, C.blue);
  doc.rect(0, 0, 3.5, 38, 'F');

  // ícone SBCD — centralizado verticalmente na coluna esquerda
  const iconW = 43, iconH = 26;
  const iconX = 3.5 + 3;
  const iconY = (38 - iconH) / 2;
  if (logoEsq) {
    try { doc.addImage(logoEsq, 'PNG', iconX, iconY, iconW, iconH); } catch {}
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    setTxt(doc, C.blue);
    doc.text('SBCD', iconX + 2, 20);
  }

  // separador vertical
  setFill(doc, C.slate200);
  doc.rect(ML + 42, 7, 0.4, 24, 'F');

  // label "RELATÓRIO EXECUTIVO" + data (canto superior direito)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  setTxt(doc, C.blue);
  doc.text('RELATÓRIO EXECUTIVO  ·  GESTÃO DE PROBLEMAS', ML + 47, 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  setTxt(doc, C.slate400);
  doc.text(today(), PW - MR, 10, { align: 'right' });

  // título principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  setTxt(doc, C.navy);
  doc.text(trunc(titulo, 54), ML + 47, 21);

  // subtítulo — largura limitada para não sobrepor o logo direito
  const logoDirW = 34, logoDirH = 12;
  const logoDirX = PW - MR - logoDirW;
  const logoDirY = 38 - logoDirH - 2;
  const subtitMaxW = logoDirX - (ML + 47) - 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setTxt(doc, C.slate500);
  const linhas = doc.splitTextToSize(subtitulo, subtitMaxW);
  doc.text(linhas.slice(0, 1), ML + 47, 28.5);

  // logo SBCData completo — canto direito-inferior do cabeçalho
  if (logoDir) {
    try { doc.addImage(logoDir, 'PNG', logoDirX, logoDirY, logoDirW, logoDirH); } catch {}
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setTxt(doc, C.blue);
    doc.text('SBCData', PW - MR, logoDirY + 7, { align: 'right' });
  }

  // linha azul separadora inferior
  setFill(doc, C.blue);
  doc.rect(0, 38, PW, 1.2, 'F');

}

// ── rodapé ───────────────────────────────────────────────────
function drawFooter(doc: any, pg: number, total: number, label: string) {
  const y = PH - 10;
  setFill(doc, C.slate200);
  doc.rect(ML, y - 3, CW, 0.2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  setTxt(doc, C.slate400);
  doc.text(`Confidencial  ·  ${label}`, ML, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.text(`Página ${pg} de ${total}`, PW - MR, y + 1, { align: 'right' });
}

// ── título de seção ──────────────────────────────────────────
function sectionTitle(doc: any, titulo: string, y: number): number {
  setFill(doc, C.blueLt);
  doc.rect(ML, y, CW, 8, 'F');
  setFill(doc, C.blue);
  doc.rect(ML, y, 3, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setTxt(doc, C.blueDk);
  doc.text(titulo.toUpperCase(), ML + 7, y + 5.8);
  return y + 13;
}

// ── KPI cards ────────────────────────────────────────────────
function drawKPIs(
  doc: any,
  items: { rotulo: string; valor: string | number; cor: string }[],
  y: number,
): number {
  const n   = items.length;
  const gap = 3.5;
  const w   = (CW - gap * (n - 1)) / n;
  const H   = 24;

  items.forEach((item, i) => {
    const x = ML + i * (w + gap);
    const [r, g, b] = hex2rgb(item.cor);

    // cartão branco com borda sutil
    setFill(doc, C.white);
    doc.roundedRect(x, y, w, H, 2, 2, 'F');
    setStroke(doc, C.slate200);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, y, w, H, 2, 2, 'D');

    // barra colorida no topo
    doc.setFillColor(r, g, b);
    doc.rect(x, y, w, 2.5, 'F');
    doc.roundedRect(x, y, w, 2.5, 1, 1, 'F');

    // valor grande
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(r, g, b);
    doc.text(String(item.valor), x + w / 2, y + 16, { align: 'center' });

    // label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    setTxt(doc, C.slate500);
    doc.text(item.rotulo.toUpperCase(), x + w / 2, y + 21.5, { align: 'center', maxWidth: w - 3 });
  });

  return y + H + 7;
}

// ── gráfico de barras horizontais ────────────────────────────
function barChart(
  doc: any,
  dados: ContagemItem[],
  y: number,
  cores: string[],
  maxItens = 12,
): number {
  const rows   = dados.slice(0, maxItens);
  const maxVal = rows[0]?.total || 1;
  const BAR_H  = 6.5;
  const GAP    = 4.5;
  const LBL_W  = 60;
  const AREA   = CW - LBL_W - 20;

  rows.forEach((item, i) => {
    const ry  = y + i * (BAR_H + GAP);
    const barW = Math.max(2, (item.total / maxVal) * AREA);
    const cor  = cores[i % cores.length];
    const [r, g, b] = hex2rgb(cor);

    // número de ordem
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    setTxt(doc, C.slate300);
    doc.text(String(i + 1).padStart(2, '0'), ML, ry + BAR_H / 2 + 1.5);

    // label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setTxt(doc, C.slate700);
    doc.text(trunc(item.nome, 22), ML + 7, ry + BAR_H / 2 + 1.5);

    // trilho
    setFill(doc, C.slate100);
    doc.roundedRect(ML + LBL_W, ry, AREA, BAR_H, 2, 2, 'F');

    // barra
    doc.setFillColor(r, g, b);
    doc.roundedRect(ML + LBL_W, ry, barW, BAR_H, 2, 2, 'F');

    // valor
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setTxt(doc, C.slate700);
    doc.text(`${item.total}`, ML + LBL_W + AREA + 2.5, ry + BAR_H / 2 + 1.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    setTxt(doc, C.slate400);
    doc.text(`${item.percentual}%`, ML + LBL_W + AREA + 2.5, ry + BAR_H / 2 + 5.5);
  });

  return y + rows.length * (BAR_H + GAP) + 4;
}

// ── tabela executiva ─────────────────────────────────────────
function drawTable(
  doc: any,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  y: number,
): number {
  const ROW_H = 7.5;

  // cabeçalho
  setFill(doc, C.navyMid);
  doc.roundedRect(ML, y, CW, ROW_H, 1.5, 1.5, 'F');
  doc.rect(ML, y + 2, CW, ROW_H - 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  setTxt(doc, C.white);
  let cx = ML;
  headers.forEach((h, i) => {
    doc.text(h, cx + 2.5, y + 5.2);
    cx += colWidths[i];
  });
  y += ROW_H;

  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? C.slate50 : C.white;
    setFill(doc, bg);
    doc.rect(ML, y, CW, ROW_H, 'F');

    setStroke(doc, C.slate200);
    doc.setLineWidth(0.1);
    doc.line(ML, y + ROW_H, ML + CW, y + ROW_H);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    setTxt(doc, C.slate700);
    cx = ML;
    row.forEach((cell, ci) => {
      const maxCh = Math.floor(colWidths[ci] / 2.0);
      const txt = trunc(cell || '—', maxCh);

      // célula de criticidade: colore o texto
      if (headers[ci] === 'Criticidade' || headers[ci] === 'CRITICIDADE') {
        const cor = corCriticidade(cell || '');
        setTxt(doc, cor);
        doc.setFont('helvetica', 'bold');
        doc.text(txt, cx + 2.5, y + 5.2);
        doc.setFont('helvetica', 'normal');
        setTxt(doc, C.slate700);
      } else {
        doc.text(txt, cx + 2.5, y + 5.2);
      }
      cx += colWidths[ci];
    });
    y += ROW_H;
  });

  // borda externa
  setStroke(doc, C.slate200);
  doc.setLineWidth(0.25);
  doc.roundedRect(ML, y - rows.length * ROW_H - ROW_H, CW, rows.length * ROW_H + ROW_H, 1.5, 1.5, 'D');

  return y + 5;
}

// ── campo de texto (ficha do problema) ───────────────────────
function drawField(doc: any, rotulo: string, valor: string, y: number, destaque = false): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  setTxt(doc, C.blue);
  doc.text(rotulo.toUpperCase(), ML, y);
  y += 5;

  doc.setFont('helvetica', destaque ? 'bold' : 'normal');
  doc.setFontSize(destaque ? 10 : 8.5);
  setTxt(doc, destaque ? C.navy : C.slate700);
  const linhas = doc.splitTextToSize(valor || '—', CW);
  const maxL   = destaque ? 4 : 6;
  doc.text(linhas.slice(0, maxL), ML, y);
  y += linhas.slice(0, maxL).length * (destaque ? 6 : 5);

  setFill(doc, C.slate200);
  doc.rect(ML, y + 2, CW, 0.2, 'F');
  return y + 7;
}

// ── checagem de espaço ───────────────────────────────────────
function ensureSpace(doc: any, y: number, needed: number): number {
  if (y + needed > PH - 16) {
    doc.addPage();
    return 20;
  }
  return y;
}

// ── rodapés em todas as páginas ──────────────────────────────
function applyFooters(doc: any, label: string) {
  const total = (doc as any).internal.pages.length - 1;
  for (let pg = 1; pg <= total; pg++) {
    doc.setPage(pg);
    drawFooter(doc, pg, total, label);
  }
}

// ── tabela resumo por unidade (usada no dashboard) ───────────
function drawResumoUnidades(doc: any, todos: Problema[], y: number): number {
  const porUnidade = agruparPor(todos, 'unidade');
  const headers = ['Unidade', 'Estado(s)', 'Total', 'Críticos', 'Em Andamento'];
  const colWidths = [52, 30, 14, 18, 24];

  const rows = porUnidade.map(u => {
    const probs = todos.filter(p => p.unidade === u.nome);
    const estados     = Array.from(new Set(probs.map(p => p.estado).filter(Boolean))).join('; ') || '—';
    const criticos    = probs.filter(p => p.criticidade.toLowerCase().includes('critic')).length;
    const emAndamento = probs.filter(p => p.status.toLowerCase().includes('andamento') || p.status.toLowerCase().includes('progress')).length;
    return [u.nome, estados, String(u.total), String(criticos), String(emAndamento)];
  });

  return drawTable(doc, headers, rows, colWidths, y);
}

// ═══════════════════════════════════════════════════════════════
// EXPORTADORES POR CONTEXTO
// ═══════════════════════════════════════════════════════════════

export async function gerarPDF(ctx: ExportCtx, todos: Problema[]): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const [logoEsq, logoDir] = await Promise.all([
    loadImage('/sbcd-logo-sem-fundo.png'),
    loadImage('/logo-sem-fundo-sbcdata.png'),
  ]);

  // y inicial: 38mm (cabeçalho branco) + 1.2mm linha + 8mm margem
  const Y0 = 48;

  // ── DASHBOARD ─────────────────────────────────────────────
  if (ctx.tipo === 'dashboard') {
    const pbs        = todos;
    const porUnidade = agruparPor(pbs, 'unidade');
    const porCat     = agruparPor(pbs, 'categoria');
    const porCrit    = agruparPor(pbs, 'criticidade');
    const criticos   = pbs.filter(p => p.criticidade.toLowerCase().includes('critic')).length;

    drawHeader(doc,
      'Visão Geral Executiva',
      `${porUnidade.length} unidades monitoradas  ·  ${pbs.length} problemas mapeados  ·  ${porCat.length} categorias`,
      logoEsq, logoDir,
    );

    let y = Y0;

    y = drawKPIs(doc, [
      { rotulo: 'Total de Problemas',   valor: pbs.length,        cor: C.blue  },
      { rotulo: 'Unidades Monitoradas', valor: porUnidade.length, cor: C.sky   },
      { rotulo: 'Criticidade Crítica',  valor: criticos,          cor: C.rose  },
      { rotulo: 'Categorias',           valor: porCat.length,     cor: C.teal  },
    ], y);

    y = ensureSpace(doc, y, 18 + porUnidade.length * 8 + 10);
    y = sectionTitle(doc, 'Resumo por Unidade', y);
    y = drawResumoUnidades(doc, pbs, y);
    y += 4;

    y = ensureSpace(doc, y, 18 + porCrit.length * 11 + 8);
    y = sectionTitle(doc, 'Distribuição por Criticidade', y);
    y = barChart(doc, porCrit, y, porCrit.map(c => corCriticidade(c.nome)), 6);
    y += 6;

    y = ensureSpace(doc, y, 18 + Math.min(porCat.length, 10) * 11 + 8);
    y = sectionTitle(doc, 'Distribuição por Categoria', y);
    y = barChart(doc, porCat, y, PALETA, 10);

    applyFooters(doc, 'Visão Geral Executiva — Todas as Unidades');
    doc.save('dashboard-executivo.pdf');
    return;
  }

  // ── UNIDADE ───────────────────────────────────────────────
  if (ctx.tipo === 'unidade') {
    const { unidade } = ctx;
    const pbs       = todos.filter(p => p.unidade === unidade);
    const porCat    = agruparPor(pbs, 'categoria');
    const porCrit   = agruparPor(pbs, 'criticidade');
    const porStatus = agruparPor(pbs, 'status');
    const criticos  = pbs.filter(p => p.criticidade.toLowerCase().includes('critic')).length;

    drawHeader(doc,
      trunc(unidade, 48),
      `${pbs.length} problema(s) em ${porCat.length} categoria(s)`,
      logoEsq, logoDir,
    );

    let y = Y0;

    y = drawKPIs(doc, [
      { rotulo: 'Total de Problemas', valor: pbs.length,       cor: C.blue   },
      { rotulo: 'Críticos',           valor: criticos,         cor: C.rose   },
      { rotulo: 'Categorias',         valor: porCat.length,    cor: C.sky    },
    ], y);

    y = ensureSpace(doc, y, 18 + Math.min(porCat.length, 10) * 11 + 8);
    y = sectionTitle(doc, 'Problemas por Categoria', y);
    y = barChart(doc, porCat, y, PALETA);
    y += 6;

    y = ensureSpace(doc, y, 18 + porCrit.length * 11 + 8);
    y = sectionTitle(doc, 'Distribuição por Criticidade', y);
    y = barChart(doc, porCrit, y, porCrit.map(c => corCriticidade(c.nome)), 6);
    y += 6;

    y = ensureSpace(doc, y, 20 + Math.min(pbs.length, 25) * 8);
    y = sectionTitle(doc, 'Lista de Problemas', y);
    const tHeaders = ['#', 'Problema', 'Criticidade', 'Prazo', 'Status', 'Responsável'];
    const tCols    = [10, 68, 24, 20, 26, 30];
    const tRows    = pbs.slice(0, 30).map(p => [
      p.id, p.problema, p.criticidade, p.prazo, p.status, p.responsavel,
    ]);
    y = drawTable(doc, tHeaders, tRows, tCols, y);

    applyFooters(doc, `Unidade: ${unidade}`);
    doc.save(`unidade-${unidade.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    return;
  }

  // ── CATEGORIA ─────────────────────────────────────────────
  if (ctx.tipo === 'categoria') {
    const { unidade, categoria } = ctx;
    const pbs       = todos.filter(p => p.unidade === unidade && p.categoria === categoria);
    const porCrit   = agruparPor(pbs, 'criticidade');
    const porStatus = agruparPor(pbs, 'status');
    const criticos  = pbs.filter(p => p.criticidade.toLowerCase().includes('critic')).length;

    drawHeader(doc,
      trunc(categoria, 44),
      `${unidade}  ·  ${pbs.length} problema(s) nesta categoria`,
      logoEsq, logoDir,
    );

    let y = Y0;

    y = drawKPIs(doc, [
      { rotulo: 'Total na Categoria', valor: pbs.length,       cor: C.blue  },
      { rotulo: 'Críticos',           valor: criticos,         cor: C.rose  },
      { rotulo: 'Status Distintos',   valor: porStatus.length, cor: C.sky   },
    ], y);

    y = ensureSpace(doc, y, 18 + porCrit.length * 11 + 8);
    y = sectionTitle(doc, 'Distribuição por Criticidade', y);
    y = barChart(doc, porCrit, y, porCrit.map(c => corCriticidade(c.nome)), 6);
    y += 6;

    y = ensureSpace(doc, y, 18 + porStatus.length * 11 + 8);
    y = sectionTitle(doc, 'Distribuição por Status', y);
    y = barChart(doc, porStatus, y, PALETA, 8);
    y += 8;

    y = ensureSpace(doc, y, 20 + pbs.length * 8);
    y = sectionTitle(doc, 'Problemas desta Categoria', y);
    const tHeaders = ['#', 'Problema', 'Criticidade', 'Prazo', 'Status', 'Responsável'];
    const tCols    = [10, 68, 24, 20, 26, 30];
    const tRows    = pbs.map(p => [p.id, p.problema, p.criticidade, p.prazo, p.status, p.responsavel]);
    y = drawTable(doc, tHeaders, tRows, tCols, y);

    applyFooters(doc, `${unidade}  ·  ${categoria}`);
    doc.save(`categoria-${categoria.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    return;
  }

  // ── RESPONSÁVEL ───────────────────────────────────────────
  if (ctx.tipo === 'responsavel') {
    const { responsavel } = ctx;
    const pbs       = todos.filter(p => p.responsavel === responsavel);
    const porCrit   = agruparPor(pbs, 'criticidade');
    const porUnid   = agruparPor(pbs, 'unidade');
    const porStatus = agruparPor(pbs, 'status');
    const criticos  = pbs.filter(p => p.criticidade.toLowerCase().includes('critic')).length;
    const emAndamento = pbs.filter(p => p.status.toLowerCase().includes('andamento') || p.status.toLowerCase().includes('progress')).length;

    drawHeader(doc,
      trunc(responsavel, 48),
      `Responsável  ·  ${pbs.length} problema(s) atribuído(s)  ·  ${porUnid.length} unidade(s)`,
      logoEsq, logoDir,
    );

    let y = Y0;

    y = drawKPIs(doc, [
      { rotulo: 'Total Atribuídos',    valor: pbs.length,    cor: C.blue  },
      { rotulo: 'Criticidade Crítica', valor: criticos,      cor: C.rose  },
      { rotulo: 'Em Andamento',        valor: emAndamento,   cor: C.sky   },
      { rotulo: 'Unidades',            valor: porUnid.length, cor: C.teal },
    ], y);

    y = ensureSpace(doc, y, 18 + porCrit.length * 11 + 8);
    y = sectionTitle(doc, 'Distribuição por Criticidade', y);
    y = barChart(doc, porCrit, y, porCrit.map(c => corCriticidade(c.nome)), 6);
    y += 6;

    y = ensureSpace(doc, y, 18 + Math.min(porUnid.length, 10) * 11 + 8);
    y = sectionTitle(doc, 'Distribuição por Unidade', y);
    y = barChart(doc, porUnid, y, PALETA, 10);
    y += 6;

    y = ensureSpace(doc, y, 18 + porStatus.length * 11 + 8);
    y = sectionTitle(doc, 'Distribuição por Status', y);
    y = barChart(doc, porStatus, y, PALETA, 8);
    y += 8;

    y = ensureSpace(doc, y, 20 + Math.min(pbs.length, 30) * 8);
    y = sectionTitle(doc, 'Lista de Problemas Atribuídos', y);
    const tHeaders = ['#', 'Problema', 'Unidade', 'Criticidade', 'Status'];
    const tCols    = [10, 68, 36, 24, 24];
    const tRows    = pbs.slice(0, 30).map(p => [p.id, p.problema, p.unidade, p.criticidade, p.status]);
    drawTable(doc, tHeaders, tRows, tCols, y);

    applyFooters(doc, `Responsável: ${responsavel}`);
    doc.save(`responsavel-${responsavel.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`);
    return;
  }

  // ── PROBLEMA ──────────────────────────────────────────────
  if (ctx.tipo === 'problema') {
    const p = todos.find(x => x.id === ctx.id);
    if (!p) return;

    const nomeTitulo = p.problema || `Problema #${p.id}`;

    drawHeader(doc,
      trunc(nomeTitulo, 50),
      `${p.unidade}  ·  ${p.categoria}`,
      logoEsq, logoDir,
    );

    let y = Y0;

    // badges de status/criticidade
    const badges: [string, string, string][] = [
      ['ESTADO',      p.estado      || '—', C.blue],
      ['STATUS',      p.status      || '—', C.sky ],
      ['CRITICIDADE', p.criticidade || '—', corCriticidade(p.criticidade)],
      ['RESPONSÁVEL', p.responsavel || '—', C.teal],
    ];
    const bw = (CW - 10.5) / 4;
    badges.forEach(([lbl, val, cor], i) => {
      const bx = ML + i * (bw + 3.5);
      const [r, g, b] = hex2rgb(cor);

      setFill(doc, C.slate50);
      doc.roundedRect(bx, y, bw, 17, 1.5, 1.5, 'F');
      setStroke(doc, C.slate200);
      doc.setLineWidth(0.2);
      doc.roundedRect(bx, y, bw, 17, 1.5, 1.5, 'D');

      // faixa colorida no topo
      doc.setFillColor(r, g, b);
      doc.rect(bx, y, bw, 2, 'F');
      doc.roundedRect(bx, y, bw, 2, 1, 1, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      setTxt(doc, C.slate400);
      doc.text(lbl, bx + bw / 2, y + 7.5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(r, g, b);
      doc.text(trunc(val, 13), bx + bw / 2, y + 13.5, { align: 'center' });
    });
    y += 25;

    // diagnóstico
    y = ensureSpace(doc, y, 20 + 35);
    y = sectionTitle(doc, 'Diagnóstico', y);
    y = drawField(doc, 'Problema Identificado',       p.problema, y, true);
    y = ensureSpace(doc, y, 22);
    y = drawField(doc, 'Impacto / Risco Principal',   p.impacto, y);
    y = ensureSpace(doc, y, 22);
    y = drawField(doc, 'Ação Prioritária Recomendada', p.acao, y);
    y += 4;

    // ficha executiva em duas colunas
    y = ensureSpace(doc, y, 70);
    y = sectionTitle(doc, 'Ficha Executiva', y);

    const HW = (CW - 8) / 2;
    const fichaEsq: [string, string][] = [
      ['Unidade',   p.unidade],
      ['Estado',    p.estado],
      ['Categoria', p.categoria],
      ...(p.prazo ? [['Prazo', p.prazo] as [string, string]] : []),
      ...(p.custeioEstimado ? [['Custeio Estimado', p.custeioEstimado] as [string, string]] : []),
      ...(p.investimentoEstimado ? [['Investimento Estimado', p.investimentoEstimado] as [string, string]] : []),
    ];
    const fichaDir: [string, string][] = [
      ['Criticidade', p.criticidade],
      ...(p.prioridade ? [['Prioridade', p.prioridade] as [string, string]] : []),
      ['Status',      p.status],
      ['Responsável', p.responsavel],
    ];

    const startY = y;
    fichaEsq.forEach(([lbl, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      setTxt(doc, C.slate400);
      doc.text(lbl.toUpperCase(), ML, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      setTxt(doc, C.navy);
      doc.text(trunc(val || '—', 32), ML, y);
      y += 9;
    });

    let yd = startY;
    fichaDir.forEach(([lbl, val]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      setTxt(doc, C.slate400);
      doc.text(lbl.toUpperCase(), ML + HW + 8, yd);
      yd += 4;
      doc.setFont('helvetica', lbl === 'Criticidade' ? 'bold' : 'normal');
      doc.setFontSize(8.5);
      if (lbl === 'Criticidade') {
        setTxt(doc, corCriticidade(val));
      } else {
        setTxt(doc, C.navy);
      }
      doc.text(trunc(val || '—', 32), ML + HW + 8, yd);
      yd += 9;
    });

    applyFooters(doc, `Problema #${p.id}  ·  ${p.unidade}`);
    const nomeArquivo = nomeTitulo.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    doc.save(`problema-${nomeArquivo}.pdf`);
  }
}
