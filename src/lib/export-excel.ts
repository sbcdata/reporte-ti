import * as XLSX from 'xlsx';
import type { Problema, ExportCtx } from './types';
import { agruparPor } from './data';

export function gerarExcel(problemas: Problema[], ctx: ExportCtx): void {
  const wb = XLSX.utils.book_new();

  // ── Aba 1: Resumo Executivo por Unidade ────────────────────
  const porUnidade = agruparPor(problemas, 'unidade');
  const resumoUnd  = porUnidade.map(u => {
    const probs = problemas.filter(p => p.unidade === u.nome);
    const estados     = Array.from(new Set(probs.map(p => p.estado).filter(Boolean))).join('; ') || '—';
    const criticos    = probs.filter(p => p.criticidade.toLowerCase().includes('critic')).length;
    const emAndamento = probs.filter(p => p.status.toLowerCase().includes('andamento') || p.status.toLowerCase().includes('progress')).length;
    const pendentes   = probs.filter(p => p.status.toLowerCase().includes('pend') || p.status.toLowerCase().includes('aberto') || p.status.toLowerCase().includes('aguard')).length;
    const concluidos  = probs.filter(p => p.status.toLowerCase().includes('conclu') || p.status.toLowerCase().includes('resolv')).length;
    return {
      'Unidade':            u.nome,
      'Estado(s)':          estados,
      'Total de Ocorrências': u.total,
      'Participação (%)':   u.percentual,
      'Críticos':           criticos,
      'Em Andamento':       emAndamento,
      'Pendentes':          pendentes,
      'Concluídos':         concluidos,
    };
  });
  const wsResumo = XLSX.utils.json_to_sheet(resumoUnd);
  wsResumo['!cols'] = [
    { wch: 26 }, { wch: 20 }, { wch: 18 }, { wch: 16 },
    { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo por Unidade');

  // ── Aba 2: Problemas (detalhado) ────────────────────────────
  const dadosProblemas = problemas.map(p => ({
    'ID':                  p.id,
    'Unidade':             p.unidade,
    'Estado':              p.estado,
    'Superintendência':    p.superintendencia,
    'Categoria':           p.categoria,
    'Ocorrência':       p.problema,
    'Criticidade':      p.criticidade,
    'Status':           p.status,
    'Impacto / Risco':  p.impacto,
    'Ação Recomendada': p.acao,
    'Responsável':      p.responsavel,
    'Prazo':                  p.prazo,
    'Prioridade':             p.prioridade,
    'Custeio Estimado':       p.custeioEstimado,
    'Investimento Estimado':  p.investimentoEstimado,
  }));
  const wsProblemas = XLSX.utils.json_to_sheet(dadosProblemas);
  wsProblemas['!cols'] = [
    { wch: 6 },   // ID
    { wch: 24 },  // Unidade
    { wch: 16 },  // Estado
    { wch: 26 },  // Superintendência
    { wch: 22 },  // Categoria
    { wch: 52 },  // Problema
    { wch: 14 },  // Criticidade
    { wch: 20 },  // Status
    { wch: 46 },  // Impacto
    { wch: 46 },  // Ação
    { wch: 24 },  // Responsável
    { wch: 14 },  // Prazo
    { wch: 12 },  // Prioridade
    { wch: 22 },  // Custeio
    { wch: 22 },  // Investimento
  ];
  XLSX.utils.book_append_sheet(wb, wsProblemas, 'Ocorrências');

  // ── Aba 3: Resumo por Categoria ─────────────────────────────
  const porCategoria = agruparPor(problemas, 'categoria');
  const resumoCat = porCategoria.map(c => {
    const probs   = problemas.filter(p => p.categoria === c.nome);
    const unidades = Array.from(new Set(probs.map(p => p.unidade))).join('; ');
    const criticos = probs.filter(p => p.criticidade.toLowerCase().includes('critic')).length;
    return {
      'Categoria':          c.nome,
      'Unidade(s)':         unidades,
      'Total de Ocorrências': c.total,
      'Participação (%)':   c.percentual,
      'Críticos':           criticos,
    };
  });
  const wsCat = XLSX.utils.json_to_sheet(resumoCat);
  wsCat['!cols'] = [{ wch: 26 }, { wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, wsCat, 'Resumo por Categoria');

  // ── Nome do arquivo baseado no contexto ─────────────────────
  let nomeArquivo = 'dashboard-executivo';
  if (ctx.tipo === 'unidade')     nomeArquivo = `unidade-${ctx.unidade.replace(/\s+/g, '-').toLowerCase()}`;
  if (ctx.tipo === 'categoria')   nomeArquivo = `categoria-${ctx.categoria.replace(/\s+/g, '-').toLowerCase()}`;
  if (ctx.tipo === 'problema')    nomeArquivo = `problema-${ctx.id}`;
  if (ctx.tipo === 'responsavel') nomeArquivo = `responsavel-${ctx.responsavel.replace(/\s+/g, '-').toLowerCase()}`;

  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}
