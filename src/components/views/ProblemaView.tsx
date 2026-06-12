'use client';

import React, { useState } from 'react';
import { useProblemas } from '@/components/DataProvider';
import { useNav } from '@/lib/nav';
import { classeStatus, corCriticidade } from '@/lib/ui';
import { Shell, Painel, Badge, Vazio } from '@/components/UI';
import { ExportButton, ExportDialog } from '@/components/ExportDialog';

function Campo({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className="border-b border-slate-100 dark:border-ink-700/50 py-3.5 last:border-0 sm:py-4">
      <p className="eyebrow">{rotulo}</p>
      <p className={`mt-1.5 ${
        destaque
          ? 'font-display text-base text-slate-900 dark:text-slate-50 sm:text-lg'
          : 'text-sm leading-relaxed text-slate-600 dark:text-slate-300'
      }`}>
        {valor || '—'}
      </p>
    </div>
  );
}

export default function ProblemaView({ id }: { id: string }) {
  const { problemas } = useProblemas();
  const { irDashboard, irUnidade, irCategoria } = useNav();
  const [exportOpen, setExportOpen] = useState(false);
  const p = problemas.find(x => x.id === id);

  if (!p) {
    return (
      <Shell crumbs={[{ rotulo: 'Dashboard', onClick: irDashboard }]} titulo="Ocorrência não encontrada">
        <Vazio mensagem="A ocorrência solicitada não existe na planilha atual." />
      </Shell>
    );
  }

  return (
    <>
      <Shell
        crumbs={[
          { rotulo: 'Dashboard', onClick: irDashboard },
          { rotulo: p.unidade, onClick: () => irUnidade(p.unidade) },
          { rotulo: p.categoria, onClick: () => irCategoria(p.unidade, p.categoria) },
          { rotulo: `Ocorrência #${p.id}` },
        ]}
        titulo={p.problema || `Ocorrência #${p.id}`}
        subtitulo={`${p.unidade} · ${p.categoria}`}
        acao={<ExportButton onClick={() => setExportOpen(true)} />}
      >
        <div
          className="panel animate-fadeUp relative overflow-hidden panel-pad"
          style={{ borderColor: `${corCriticidade(p.criticidade)}55` }}
        >
          <div className="absolute inset-x-0 top-0 h-1" style={{ background: corCriticidade(p.criticidade) }} />
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={classeStatus(p.status)}>{p.status || '—'}</Badge>
            <Badge className="bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-ink-700 dark:text-slate-200 dark:ring-ink-600">
              <span className="h-2 w-2 rounded-full" style={{ background: corCriticidade(p.criticidade) }} />
              <span className="hidden sm:inline">Criticidade </span>{p.criticidade || '—'}
            </Badge>
            {p.prazo && (
              <Badge className="bg-sky2/20 text-sky2 ring-1 ring-sky2/40">
                Prazo: {p.prazo}
              </Badge>
            )}
            <span className="ml-auto font-mono text-[10px] text-slate-400 dark:text-slate-500">#{p.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Painel titulo="Diagnóstico" className="lg:col-span-2" delay={80}>
            <Campo rotulo="Ocorrência Identificada"         valor={p.problema} destaque />
            <Campo rotulo="Impacto / Risco Principal"      valor={p.impacto} />
            <Campo rotulo="Ação Prioritária Recomendada"   valor={p.acao} />
          </Painel>

          <Painel titulo="Ficha Executiva" delay={160}>
            <Campo rotulo="Unidade"          valor={p.unidade} />
            <Campo rotulo="Estado"           valor={p.estado} />
            <Campo rotulo="Superintendência" valor={p.superintendencia} />
            <Campo rotulo="Categoria"        valor={p.categoria} />
            <Campo rotulo="Criticidade"      valor={p.criticidade} />
            {p.prioridade && <Campo rotulo="Prioridade" valor={p.prioridade} />}
            <Campo rotulo="Status"           valor={p.status} />
            <Campo rotulo="Responsável"      valor={p.responsavel} />
            <div className="border-b border-slate-100 dark:border-ink-700/50 py-3.5 last:border-0 sm:py-4">
              <p className="eyebrow">Data de Solicitação</p>
              {p.dataSolicitacao ? (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.dataSolicitacao}</p>
              ) : (
                <p className="mt-1.5 text-sm italic text-slate-400 dark:text-slate-500">Não informada</p>
              )}
            </div>
            {p.prazo && <Campo rotulo="Prazo" valor={p.prazo} />}
            {p.custeioEstimado && (
              <div className="border-b border-slate-100 dark:border-ink-700/50 py-3.5 last:border-0 sm:py-4">
                <p className="eyebrow">Custeio Estimado</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.custeioEstimado}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400">
                  <span>⚠</span> Em caso de tratativas, solicitar atualização do valor.
                </p>
              </div>
            )}
            {p.investimentoEstimado && (
              <div className="border-b border-slate-100 dark:border-ink-700/50 py-3.5 last:border-0 sm:py-4">
                <p className="eyebrow">Investimento Estimado</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.investimentoEstimado}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400">
                  <span>⚠</span> Em caso de tratativas, solicitar atualização do valor.
                </p>
              </div>
            )}
          </Painel>
        </div>

        {p.historicoPrazo.length > 0 && (
          <Painel titulo="Histórico de Prazo" delay={220}>
            <ol className="relative ml-2 border-l border-slate-200 dark:border-ink-700/60">
              {p.historicoPrazo.map((data, i) => (
                <li key={i} className="mb-4 ml-5 last:mb-0">
                  <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 dark:bg-ink-700 ring-4 ring-white dark:ring-ink-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{data}</p>
                </li>
              ))}
              {p.prazo && (
                <li className="ml-5">
                  <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky2/30 ring-4 ring-white dark:ring-ink-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky2" />
                  </span>
                  <p className="text-sm font-medium text-sky2">{p.prazo} <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">(prazo atual)</span></p>
                </li>
              )}
            </ol>
          </Painel>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
          <button
            onClick={() => irCategoria(p.unidade, p.categoria)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition active:scale-[0.98] hover:border-accent/40 hover:text-accent dark:border-ink-600 dark:bg-ink-800/60 dark:text-slate-200 sm:flex-none sm:py-2.5"
          >
            ← Voltar à categoria
          </button>
          <button
            onClick={irDashboard}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition active:scale-[0.98] hover:border-accent/40 hover:text-accent dark:border-ink-600 dark:bg-ink-800/60 dark:text-slate-200 sm:flex-none sm:py-2.5"
          >
            Ir ao dashboard
          </button>
        </div>
      </Shell>

      {exportOpen && (
        <ExportDialog ctx={{ tipo: 'problema', id: p.id }} onClose={() => setExportOpen(false)} />
      )}
    </>
  );
}
