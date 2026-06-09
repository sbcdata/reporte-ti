'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useProblemas } from '@/components/DataProvider';
import type { ExportCtx } from '@/lib/types';
import { gerarPDF } from '@/lib/export-pdf';
import { gerarExcel } from '@/lib/export-excel';

/* ── ícones inline ─────────────────────────────────────────── */
function IconPDF() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
      <line x1="9" y1="9" x2="11" y2="9" />
    </svg>
  );
}

function IconExcel() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13l2 3 2-3" />
      <path d="M12 16v-3" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ── botão de abertura ─────────────────────────────────────── */
export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-accent/50 hover:text-accent dark:border-ink-700 dark:bg-ink-800 dark:text-slate-300 dark:hover:border-accent/50 dark:hover:text-accent"
    >
      <IconDownload />
      Exportar
    </button>
  );
}

/* ── texto descritivo por contexto ──────────────────────────── */
function descricaoPDF(ctx: ExportCtx): string {
  if (ctx.tipo === 'dashboard')
    return 'Relatório executivo consolidado com gráficos de distribuição por unidade, categoria e criticidade — abrange todas as unidades monitoradas.';
  if (ctx.tipo === 'unidade')
    return `Relatório executivo da unidade "${ctx.unidade}" com gráficos de distribuição por categoria, perfil de criticidade e lista completa de problemas.`;
  if (ctx.tipo === 'categoria')
    return `Relatório da categoria "${ctx.categoria}" (${ctx.unidade}) com gráficos de criticidade, status e listagem de todos os problemas.`;
  if (ctx.tipo === 'problema')
    return 'Ficha executiva detalhada do problema com diagnóstico, impacto, ação recomendada e informações de acompanhamento.';
  if (ctx.tipo === 'responsavel')
    return `Relatório executivo de "${ctx.responsavel}" com distribuição por criticidade, unidade e lista completa dos problemas atribuídos.`;
  return '';
}

/* ── dialog principal ──────────────────────────────────────── */
export function ExportDialog({
  ctx,
  onClose,
}: {
  ctx: ExportCtx;
  onClose: () => void;
}) {
  const { problemas: todos } = useProblemas();
  const [formato, setFormato] = useState<'pdf' | 'excel'>('pdf');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const unidades = useMemo(
    () => Array.from(new Set(todos.map(p => p.unidade))).filter(Boolean).sort(),
    [todos],
  );

  const [selecionadas, setSelecionadas] = useState<Set<string>>(() => {
    if (ctx.tipo === 'unidade')   return new Set([ctx.unidade]);
    if (ctx.tipo === 'categoria') return new Set([ctx.unidade]);
    if (ctx.tipo === 'problema') {
      const p = todos.find(x => x.id === ctx.id);
      return p ? new Set([p.unidade]) : new Set(unidades);
    }
    return new Set(unidades);
  });

  // sincroniza seleção quando unidades mudam (carregamento assíncrono)
  useEffect(() => {
    if (ctx.tipo === 'dashboard' && selecionadas.size === 0) {
      setSelecionadas(new Set(unidades));
    }
  }, [unidades, ctx.tipo]); // eslint-disable-line

  const todasMarcadas = selecionadas.size === unidades.length;

  function toggleUnidade(u: string) {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(u)) next.delete(u); else next.add(u);
      return next;
    });
  }

  function toggleTodas() {
    setSelecionadas(todasMarcadas ? new Set() : new Set(unidades));
  }

  async function handleExportar() {
    setErro('');
    setLoading(true);
    try {
      if (formato === 'pdf') {
        await gerarPDF(ctx, todos);
      } else {
        const filtrados = selecionadas.size > 0
          ? todos.filter(p => selecionadas.has(p.unidade))
          : todos;
        gerarExcel(filtrados, ctx);
      }
      onClose();
    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao gerar arquivo.');
    } finally {
      setLoading(false);
    }
  }

  // fecha com Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* dialog */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-ink-700 dark:bg-ink-900 animate-fadeUp"
        onClick={e => e.stopPropagation()}
      >
        {/* cabeçalho */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-ink-700/60">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
              Exportar Relatório
            </h2>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              Escolha o formato e as opções desejadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-ink-800 dark:hover:text-slate-300"
          >
            <IconClose />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* seletor de formato */}
          <div className="grid grid-cols-2 gap-3">
            {([
              { id: 'pdf',   label: 'Relatório PDF',    sub: 'Executivo com gráficos', icon: <IconPDF />,   cor: 'text-rose2'  },
              { id: 'excel', label: 'Planilha Excel',   sub: 'Dados completos .xlsx',  icon: <IconExcel />, cor: 'text-teal2'  },
            ] as const).map(opt => (
              <button
                key={opt.id}
                onClick={() => setFormato(opt.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
                  formato === opt.id
                    ? 'border-accent bg-accent/8 dark:bg-accent/10'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-ink-700 dark:bg-ink-800/60 dark:hover:border-ink-600'
                }`}
              >
                <span className={formato === opt.id ? 'text-accent' : opt.cor}>{opt.icon}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{opt.label}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{opt.sub}</span>
              </button>
            ))}
          </div>

          {/* detalhes PDF */}
          {formato === 'pdf' && (
            <div className="rounded-xl border-l-4 border-l-accent bg-amber-50/60 px-4 py-3 dark:bg-accent/5 dark:border-l-accent">
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {descricaoPDF(ctx)}
              </p>
            </div>
          )}

          {/* seleção de unidades (Excel) */}
          {formato === 'excel' && (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Unidades a incluir
              </p>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50 dark:border-ink-700 dark:hover:bg-ink-800/60">
                <input
                  type="checkbox"
                  checked={todasMarcadas}
                  onChange={toggleTodas}
                  className="h-4 w-4 accent-accent rounded"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Todas as unidades
                </span>
                <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
                  {unidades.length} unidade(s)
                </span>
              </label>

              <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                {unidades.map(u => (
                  <label
                    key={u}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 transition hover:bg-slate-50 dark:hover:bg-ink-800/40"
                  >
                    <input
                      type="checkbox"
                      checked={selecionadas.has(u)}
                      onChange={() => toggleUnidade(u)}
                      className="h-4 w-4 accent-accent rounded"
                    />
                    <span className="truncate text-sm text-slate-700 dark:text-slate-300">{u}</span>
                  </label>
                ))}
              </div>

              {selecionadas.size === 0 && (
                <p className="text-xs text-rose2">Selecione pelo menos uma unidade.</p>
              )}
            </div>
          )}

          {/* erro */}
          {erro && (
            <p className="rounded-lg bg-rose2/10 px-3 py-2 text-xs text-rose2">{erro}</p>
          )}

          {/* botão de ação */}
          <button
            onClick={handleExportar}
            disabled={loading || (formato === 'excel' && selecionadas.size === 0)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <IconSpinner />
                Gerando…
              </>
            ) : (
              <>
                <IconDownload />
                {formato === 'pdf' ? 'Gerar PDF Executivo' : `Baixar Excel (${selecionadas.size} unidade${selecionadas.size !== 1 ? 's' : ''})`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
