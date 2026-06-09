'use client';

import React, { useEffect, useCallback } from 'react';
import type { Problema, ContagemItem } from '@/lib/types';
import { corCriticidade, classeStatus, PALETA } from '@/lib/ui';
import { Badge } from '@/components/UI';
import { useNav } from '@/lib/nav';

export type TipoKPI = 'total' | 'unidades' | 'criticos' | 'categorias';

interface Props {
  tipo: TipoKPI;
  problemas: Problema[];
  porUnidade: ContagemItem[];
  porCategoria: ContagemItem[];
  onClose: () => void;
}

const TITULOS: Record<TipoKPI, string> = {
  total:      'Todos os Problemas',
  unidades:   'Unidades Monitoradas',
  criticos:   'Problemas Críticos',
  categorias: 'Categorias Distintas',
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ── Item de problema individual ── */
function ProblemaItem({ p, onClick }: { p: Problema; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-stretch overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition active:scale-[0.99] hover:border-accent/40 dark:border-ink-700/60 dark:bg-ink-800/60"
    >
      <span className="w-1 shrink-0 rounded-l-xl" style={{ background: corCriticidade(p.criticidade) }} />
      <div className="flex-1 px-4 py-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className={classeStatus(p.status)}>{p.status || '—'}</Badge>
          <Badge className="bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-ink-700 dark:text-slate-300 dark:ring-ink-600">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: corCriticidade(p.criticidade) }} />
            {p.criticidade || '—'}
          </Badge>
        </div>
        <p className="mt-2 text-sm font-medium leading-snug text-slate-800 dark:text-slate-100 group-hover:text-accent">
          {p.problema || `Problema #${p.id}`}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400 dark:text-slate-500">
          <span>{p.unidade}</span>
          {p.categoria && <span>· {p.categoria}</span>}
          {p.responsavel && <span>· {p.responsavel}</span>}
        </div>
      </div>
      <span className="flex items-center pr-3 text-slate-300 dark:text-slate-600 group-hover:text-accent">›</span>
    </button>
  );
}

/* ── Item de unidade/categoria ── */
function AgrupamentoItem({
  nome, total, percentual, cor, onClick,
}: {
  nome: string; total: number; percentual: number; cor: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition active:scale-[0.99] hover:border-accent/40 dark:border-ink-700/60 dark:bg-ink-800/60"
    >
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: cor }} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100 group-hover:text-accent">
        {nome}
      </span>
      <span className="shrink-0 font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
        {total}
      </span>
      <span className="shrink-0 font-mono text-[11px] text-slate-400 dark:text-slate-500 w-10 text-right">
        {percentual}%
      </span>
      <span className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-accent">›</span>
    </button>
  );
}

/* ── Drawer principal ── */
export default function KPIDrawer({ tipo, problemas, porUnidade, porCategoria, onClose }: Props) {
  const { irProblema, irUnidade, irCategoria } = useNav();

  const fechar = useCallback(() => onClose(), [onClose]);

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') fechar(); };
    document.addEventListener('keydown', handler);
    // Travar scroll do body
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [fechar]);

  const criticos = problemas.filter(p =>
    p.criticidade.toLowerCase().includes('crític') ||
    p.criticidade.toLowerCase().includes('critic')
  );

  function renderConteudo() {
    switch (tipo) {
      case 'total':
        return (
          <div className="space-y-2">
            <p className="eyebrow mb-3">{problemas.length} problemas</p>
            {problemas.map(p => (
              <ProblemaItem key={p.id} p={p} onClick={() => { fechar(); irProblema(p.id); }} />
            ))}
          </div>
        );

      case 'criticos':
        return (
          <div className="space-y-2">
            <p className="eyebrow mb-3">{criticos.length} problemas críticos</p>
            {criticos.length === 0 ? (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-8">
                Nenhum problema crítico encontrado.
              </p>
            ) : (
              criticos.map(p => (
                <ProblemaItem key={p.id} p={p} onClick={() => { fechar(); irProblema(p.id); }} />
              ))
            )}
          </div>
        );

      case 'unidades':
        return (
          <div className="space-y-2">
            <p className="eyebrow mb-3">{porUnidade.length} unidades</p>
            {porUnidade.map((u, i) => (
              <AgrupamentoItem
                key={u.nome}
                nome={u.nome}
                total={u.total}
                percentual={u.percentual}
                cor={PALETA[i % PALETA.length]}
                onClick={() => { fechar(); irUnidade(u.nome); }}
              />
            ))}
          </div>
        );

      case 'categorias':
        return (
          <div className="space-y-2">
            <p className="eyebrow mb-3">{porCategoria.length} categorias</p>
            {porCategoria.map((c, i) => (
              <AgrupamentoItem
                key={c.nome}
                nome={c.nome}
                total={c.total}
                percentual={c.percentual}
                cor={PALETA[i % PALETA.length]}
                onClick={() => {
                  // categorias sem unidade específica — abrir a mais frequente
                  const unidadeMaisFreq = problemas
                    .filter(p => p.categoria === c.nome)
                    .reduce<Record<string, number>>((acc, p) => {
                      acc[p.unidade] = (acc[p.unidade] ?? 0) + 1;
                      return acc;
                    }, {});
                  const unidade = Object.entries(unidadeMaisFreq)
                    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
                  fechar();
                  if (unidade) irCategoria(unidade, c.nome);
                }}
              />
            ))}
          </div>
        );
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={fechar}
        aria-hidden="true"
      />

      {/* Painel — bottom sheet no mobile, modal centralizado no desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TITULOS[tipo]}
        className="
          fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col
          rounded-t-3xl border border-slate-200 bg-white shadow-2xl
          dark:border-ink-700/70 dark:bg-ink-850
          sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[80vh] sm:max-w-xl sm:rounded-2xl
          animate-slideUp
        "
      >
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-slate-200 dark:bg-ink-700" />
        </div>

        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-ink-700/60">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50">
            {TITULOS[tipo]}
          </h2>
          <button
            onClick={fechar}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:text-slate-600 dark:border-ink-600 dark:text-slate-500 dark:hover:text-slate-300"
            aria-label="Fechar"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {renderConteudo()}
        </div>
      </div>
    </>
  );
}
