'use client';

import React, { useMemo, useState } from 'react';
import { useProblemas } from '@/components/DataProvider';
import { agruparPor } from '@/lib/data';
import { useNav } from '@/lib/nav';
import { PALETA, corCriticidade } from '@/lib/ui';
import { Shell, KPI, Painel } from '@/components/UI';
import { GraficoBarras, GraficoPizza, Legenda } from '@/components/Charts';
import { ExportButton, ExportDialog } from '@/components/ExportDialog';
import KPIDrawer, { type TipoKPI } from '@/components/KPIDrawer';

type ContagemItem = { nome: string; total: number; percentual: number };

export default function DashboardView() {
  const { problemas } = useProblemas();
  const { irUnidade, irResponsavel } = useNav();
  const [exportOpen, setExportOpen] = useState(false);
  const [fEstado, setFEstado] = useState('');
  const [kpiAberto, setKpiAberto] = useState<TipoKPI | null>(null);

  const estados = useMemo(
    () => Array.from(new Set(problemas.map(p => p.estado).filter(Boolean))).sort(),
    [problemas],
  );

  const visiveis = useMemo(
    () => fEstado ? problemas.filter(p => p.estado === fEstado) : problemas,
    [problemas, fEstado],
  );

  const porUnidade          = useMemo(() => agruparPor(visiveis, 'unidade'),          [visiveis]);
  const porCategoria        = useMemo(() => agruparPor(visiveis, 'categoria'),        [visiveis]);
  const porCriticidade      = useMemo(() => agruparPor(visiveis, 'criticidade'),      [visiveis]);
  const porResponsavel      = useMemo(() => agruparPor(visiveis, 'responsavel'),      [visiveis]);
  const porSuperintendencia = useMemo(() => agruparPor(visiveis, 'superintendencia'), [visiveis]);

  const criticos = visiveis.filter(p =>
    p.criticidade.toLowerCase().includes('crític') ||
    p.criticidade.toLowerCase().includes('critic')
  ).length;

  const corUnidade   = (item: ContagemItem) =>
    PALETA[porUnidade.findIndex(u => u.nome === item.nome) % PALETA.length];
  const corCategoria = (_: ContagemItem, i: number) => PALETA[i % PALETA.length];
  const corSuper     = (_: ContagemItem, i: number) => PALETA[i % PALETA.length];

  return (
    <>
      <Shell
        crumbs={[{ rotulo: 'Dashboard' }]}
        titulo="Visão Geral Executiva"
        subtitulo="Panorama consolidado das ocorrências mapeadas em todas as unidades."
        acao={<ExportButton onClick={() => setExportOpen(true)} />}
      >
        {estados.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="eyebrow">Estado</span>
            <select
              value={fEstado}
              onChange={e => setFEstado(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-accent/60 dark:border-ink-600 dark:bg-ink-850 dark:text-slate-200 sm:flex-none sm:py-1.5"
            >
              <option value="">Todos</option>
              {estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            {fEstado && (
              <button
                onClick={() => setFEstado('')}
                className="rounded-lg px-3 py-2 text-xs text-slate-400 underline-offset-4 hover:text-accent hover:underline sm:py-1.5"
              >
                Limpar
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          <KPI
            rotulo="Total de Ocorrências" valor={visiveis.length}
            accent="#f59e0b" delay={0}
            onClick={() => setKpiAberto('total')}
          />
          <KPI
            rotulo="Unidades Monitoradas" valor={porUnidade.length}
            accent="#0ea5e9" delay={60}
            onClick={() => setKpiAberto('unidades')}
          />
          <KPI
            rotulo="Críticos" valor={criticos}
            detalhe="severidade máxima" accent="#f43f5e" delay={120}
            onClick={() => setKpiAberto('criticos')}
          />
          <KPI
            rotulo="Categorias Distintas" valor={porCategoria.length}
            accent="#10b981" delay={180}
            onClick={() => setKpiAberto('categorias')}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Painel
            titulo="Ocorrências por Unidade"
            className="lg:col-span-3"
            acao={<span className="eyebrow">clique para detalhar</span>}
            delay={120}
          >
            <GraficoBarras dados={porUnidade} onSelect={irUnidade} cores={corUnidade} />
          </Painel>

          <Painel titulo="Distribuição por Unidade" className="lg:col-span-2" delay={200}>
            <GraficoPizza dados={porUnidade} onSelect={irUnidade} cores={corUnidade} />
            <div className="mt-4 border-t border-slate-100 dark:border-ink-700/60 pt-4">
              <Legenda dados={porUnidade} cores={corUnidade} onSelect={irUnidade} />
            </div>
          </Painel>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Painel titulo="Distribuição por Categoria" className="lg:col-span-3" delay={120}>
            <GraficoBarras dados={porCategoria} cores={corCategoria} />
          </Painel>

          <Painel titulo="Perfil de Criticidade" className="lg:col-span-2" delay={200}>
            <GraficoPizza dados={porCriticidade} cores={it => corCriticidade(it.nome)} />
            <div className="mt-4 border-t border-slate-100 dark:border-ink-700/60 pt-4">
              <Legenda dados={porCriticidade} cores={it => corCriticidade(it.nome)} />
            </div>
          </Painel>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Painel
            titulo="Ocorrências por Responsável"
            delay={240}
            acao={<span className="eyebrow">clique para detalhar</span>}
          >
            <GraficoBarras
              dados={porResponsavel}
              onSelect={irResponsavel}
              cores={(_item, i) => PALETA[i % PALETA.length]}
            />
          </Painel>

          <Painel titulo="Ocorrências por Superintendência" delay={280}>
            <GraficoBarras
              dados={porSuperintendencia}
              cores={corSuper}
            />
          </Painel>
        </div>
      </Shell>

      {exportOpen && (
        <ExportDialog ctx={{ tipo: 'dashboard' }} onClose={() => setExportOpen(false)} />
      )}

      {kpiAberto && (
        <KPIDrawer
          tipo={kpiAberto}
          problemas={visiveis}
          porUnidade={porUnidade}
          porCategoria={porCategoria}
          onClose={() => setKpiAberto(null)}
        />
      )}
    </>
  );
}
