'use client';

import React, { useMemo, useState } from 'react';
import { useProblemas } from '@/components/DataProvider';
import { agruparPor } from '@/lib/data';
import { useNav } from '@/lib/nav';
import { PALETA } from '@/lib/ui';
import { Shell, KPI, Painel, Vazio } from '@/components/UI';
import { GraficoBarras, GraficoPizza, Legenda } from '@/components/Charts';
import { ExportButton, ExportDialog } from '@/components/ExportDialog';

export default function UnidadeView({ unidade }: { unidade: string }) {
  const { problemas } = useProblemas();
  const { irDashboard, irCategoria } = useNav();
  const [exportOpen, setExportOpen] = useState(false);

  const daUnidade    = useMemo(() => problemas.filter(p => p.unidade === unidade), [problemas, unidade]);
  const porCategoria = useMemo(() => agruparPor(daUnidade, 'categoria'), [daUnidade]);

  const categoriasZeradas = useMemo(() => {
    const comOcorrencias = new Set(porCategoria.map(c => c.nome));
    const todas = Array.from(new Set(problemas.map(p => p.categoria).filter(Boolean)));
    return todas
      .filter(c => !comOcorrencias.has(c))
      .sort()
      .map(nome => ({ nome, total: 0, percentual: 0 }));
  }, [problemas, porCategoria]);

  const corPorNome = (item: { nome: string }) =>
    PALETA[porCategoria.findIndex(c => c.nome === item.nome) % PALETA.length];

  const abrir = (categoria: string) => irCategoria(unidade, categoria);

  return (
    <>
      <Shell
        crumbs={[
          { rotulo: 'Dashboard', onClick: irDashboard },
          { rotulo: unidade },
        ]}
        titulo={unidade}
        subtitulo={`Distribuição das ocorrências desta unidade por categoria.`}
        acao={<ExportButton onClick={() => setExportOpen(true)} />}
      >
        {daUnidade.length === 0 ? (
          <Vazio mensagem="Nenhuma ocorrência encontrada para esta unidade." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <KPI rotulo="Ocorrências na Unidade"        valor={daUnidade.length}           accent="#f59e0b" />
              <KPI rotulo="Categorias"                   valor={porCategoria.length}         accent="#0ea5e9" delay={60} />
              <KPI
                rotulo="Categoria com Mais Ocorrências"
                valor={porCategoria[0]?.total ?? 0}
                detalhe={porCategoria[0]?.nome}
                accent="#10b981"
                delay={120}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
              <Painel
                titulo="Ocorrências por Categoria"
                className="lg:col-span-3"
                acao={<span className="eyebrow">clique para abrir</span>}
                delay={120}
              >
                <GraficoBarras dados={porCategoria} onSelect={abrir} cores={corPorNome} />
              </Painel>

              <Painel titulo="Percentual por Categoria" className="lg:col-span-2" delay={200}>
                <GraficoPizza dados={porCategoria} onSelect={abrir} cores={corPorNome} />
                <div className="mt-4 border-t border-slate-100 dark:border-ink-700/60 pt-4">
                  <Legenda dados={porCategoria} cores={corPorNome} onSelect={abrir} />
                </div>
              </Painel>
            </div>

            <Painel titulo="Detalhamento de Categorias" delay={200}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
                {porCategoria.map((c, i) => (
                  <button
                    key={c.nome}
                    onClick={() => abrir(c.nome)}
                    className="group rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left transition active:scale-[0.97] hover:border-accent/40 hover:bg-white dark:border-ink-700/50 dark:bg-ink-800/40 dark:hover:border-accent/40 dark:hover:bg-ink-800/80 sm:p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETA[i % PALETA.length] }} />
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 sm:text-xs">{c.percentual}%</span>
                    </div>
                    <p className="mt-2.5 text-xs font-medium leading-snug text-slate-700 dark:text-slate-200 group-hover:text-accent sm:mt-3 sm:text-sm">{c.nome}</p>
                    <p className="mt-0.5 font-display text-xl font-semibold text-slate-900 dark:text-slate-50 sm:text-2xl">{c.total}</p>
                  </button>
                ))}
                {categoriasZeradas.map((c) => (
                  <div
                    key={c.nome}
                    className="rounded-xl border border-slate-200/60 bg-slate-50/40 p-3.5 text-left opacity-50 dark:border-ink-700/30 dark:bg-ink-800/20 sm:p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-ink-600" />
                      <span className="font-mono text-[10px] text-slate-300 dark:text-slate-600 sm:text-xs">0%</span>
                    </div>
                    <p className="mt-2.5 text-xs font-medium leading-snug text-slate-500 dark:text-slate-500 sm:mt-3 sm:text-sm">{c.nome}</p>
                    <p className="mt-0.5 font-display text-xl font-semibold text-slate-400 dark:text-slate-600 sm:text-2xl">0</p>
                  </div>
                ))}
              </div>
            </Painel>
          </>
        )}
      </Shell>

      {exportOpen && (
        <ExportDialog ctx={{ tipo: 'unidade', unidade }} onClose={() => setExportOpen(false)} />
      )}
    </>
  );
}
