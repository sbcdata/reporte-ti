'use client';

import React, { useMemo, useState } from 'react';
import { useProblemas } from '@/components/DataProvider';
import { useNav } from '@/lib/nav';
import { classeStatus, corCriticidade } from '@/lib/ui';
import { Shell, Painel, Badge, Vazio, KPI } from '@/components/UI';
import { ExportButton, ExportDialog } from '@/components/ExportDialog';

function Select({
  label, valor, opcoes, onChange,
}: {
  label: string; valor: string; opcoes: string[]; onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      <select
        value={valor}
        onChange={e => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-accent/60 dark:border-ink-600 dark:bg-ink-850 dark:text-slate-200"
      >
        <option value="">Todos</option>
        {opcoes.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export default function ResponsavelView({ responsavel }: { responsavel: string }) {
  const { problemas } = useProblemas();
  const { irDashboard, irProblema } = useNav();
  const [fUnidade, setFUnidade] = useState('');
  const [fCrit, setFCrit] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  const doResponsavel = useMemo(
    () => problemas.filter(p => p.responsavel === responsavel),
    [problemas, responsavel],
  );

  const unidadeOpts = useMemo(
    () => Array.from(new Set(doResponsavel.map(p => p.unidade).filter(Boolean))).sort(),
    [doResponsavel],
  );
  const critOpts = useMemo(
    () => Array.from(new Set(doResponsavel.map(p => p.criticidade).filter(Boolean))).sort(),
    [doResponsavel],
  );
  const statusOpts = useMemo(
    () => Array.from(new Set(doResponsavel.map(p => p.status).filter(Boolean))).sort(),
    [doResponsavel],
  );

  const filtrados = useMemo(
    () => doResponsavel.filter(p =>
      (!fUnidade || p.unidade === fUnidade) &&
      (!fCrit    || p.criticidade === fCrit) &&
      (!fStatus  || p.status === fStatus)
    ),
    [doResponsavel, fUnidade, fCrit, fStatus],
  );

  const temFiltro = fUnidade || fCrit || fStatus;

  const criticos = filtrados.filter(p =>
    p.criticidade.toLowerCase().includes('crítica') ||
    p.criticidade.toLowerCase().includes('critica')
  ).length;


  return (
    <>
    <Shell
      crumbs={[
        { rotulo: 'Dashboard', onClick: irDashboard },
        { rotulo: responsavel },
      ]}
      titulo={responsavel}
      subtitulo={`Responsável · ${filtrados.length} de ${doResponsavel.length} problema(s) exibido(s)`}
      acao={<ExportButton onClick={() => setExportOpen(true)} />}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPI rotulo="Total Atribuídos"    valor={doResponsavel.length} accent="#0ea5e9" delay={0}   />
        <KPI rotulo="Exibidos com filtro" valor={filtrados.length}     accent="#f59e0b" delay={60}  />
        <KPI rotulo="Criticidade Crítica" valor={criticos}             accent="#f43f5e" delay={120} />
      </div>

      <Painel
        titulo="Filtros"
        delay={0}
        acao={
          temFiltro ? (
            <button
              onClick={() => { setFUnidade(''); setFCrit(''); setFStatus(''); }}
              className="text-xs text-slate-400 underline-offset-4 hover:text-accent hover:underline"
            >
              Limpar
            </button>
          ) : undefined
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:max-w-2xl">
          <Select label="Unidade"    valor={fUnidade} opcoes={unidadeOpts} onChange={setFUnidade} />
          <Select label="Criticidade" valor={fCrit}   opcoes={critOpts}   onChange={setFCrit} />
          <Select label="Status"      valor={fStatus} opcoes={statusOpts} onChange={setFStatus} />
        </div>
      </Painel>

      {filtrados.length === 0 ? (
        <Vazio mensagem="Nenhum problema corresponde aos filtros selecionados." />
      ) : (
        <div className="space-y-2.5 sm:space-y-3">
          {filtrados.map((p, i) => (
            <button
              key={p.id}
              onClick={() => irProblema(p.id)}
              className="panel animate-fadeUp group block w-full overflow-hidden text-left transition active:scale-[0.99] hover:border-accent/40"
              style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}
            >
              <div className="flex items-stretch">
                <span className="w-1 shrink-0 sm:w-1.5" style={{ background: corCriticidade(p.criticidade) }} />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Badge className={classeStatus(p.status)}>{p.status || '—'}</Badge>
                    <Badge className="bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-ink-700 dark:text-slate-300 dark:ring-ink-600">
                      <span className="h-2 w-2 rounded-full" style={{ background: corCriticidade(p.criticidade) }} />
                      {p.criticidade || '—'}
                    </Badge>
                    <Badge className="hidden bg-violet2/20 text-violet2 ring-1 ring-violet2/40 sm:inline-flex">
                      {p.unidade}
                    </Badge>
                  </div>
                  <p className="mt-2.5 text-sm font-medium leading-snug text-slate-800 dark:text-slate-100 group-hover:text-accent sm:text-[15px]">
                    {p.problema || 'Problema sem descrição'}
                  </p>
                  {p.impacto && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 sm:mt-1.5 sm:text-sm">
                      <span className="text-slate-400 dark:text-slate-500">Impacto: </span>
                      {p.impacto}
                    </p>
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500 sm:text-xs">
                    {p.categoria && <span className="truncate max-w-[120px] sm:max-w-none">{p.categoria}</span>}
                    {p.prazo     && <span>Prazo: {p.prazo}</span>}
                    <span className="ml-auto text-accent opacity-0 transition group-hover:opacity-100">
                      ver →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </Shell>

    {exportOpen && (
      <ExportDialog ctx={{ tipo: 'responsavel', responsavel }} onClose={() => setExportOpen(false)} />
    )}
    </>
  );
}
