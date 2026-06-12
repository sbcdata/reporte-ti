'use client';

import React, { useMemo, useState } from 'react';
import { useProblemas } from '@/components/DataProvider';
import { useNav } from '@/lib/nav';
import { classeStatus, corCriticidade } from '@/lib/ui';
import { Shell, Painel, Badge, Vazio } from '@/components/UI';
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

export default function CategoriaView({ unidade, categoria }: { unidade: string; categoria: string }) {
  const { problemas } = useProblemas();
  const { irDashboard, irUnidade, irProblema } = useNav();
  const [fStatus, setFStatus] = useState('');
  const [fCrit, setFCrit] = useState('');
  const [fResp, setFResp] = useState('');
  const [fOrdem, setFOrdem] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  const daCategoria = useMemo(
    () => problemas.filter(p => p.unidade === unidade && p.categoria === categoria),
    [problemas, unidade, categoria],
  );

  const statusOpts = useMemo(
    () => Array.from(new Set(daCategoria.map(p => p.status).filter(Boolean))).sort(),
    [daCategoria],
  );
  const critOpts = useMemo(
    () => Array.from(new Set(daCategoria.map(p => p.criticidade).filter(Boolean))).sort(),
    [daCategoria],
  );
  const respOpts = useMemo(
    () => Array.from(new Set(daCategoria.map(p => p.responsavel).filter(Boolean))).sort(),
    [daCategoria],
  );
  const filtrados = useMemo(() => {
    const base = daCategoria.filter(p =>
      (!fStatus || p.status === fStatus) &&
      (!fCrit   || p.criticidade === fCrit) &&
      (!fResp   || p.responsavel === fResp),
    );
    if (!fOrdem) return base;
    const toISO = (s: string) => s ? s.split('/').reverse().join('-') : '';
    return [...base].sort((a, b) => {
      if (fOrdem === 'sol-asc')   return toISO(a.dataSolicitacao).localeCompare(toISO(b.dataSolicitacao));
      if (fOrdem === 'sol-desc')  return toISO(b.dataSolicitacao).localeCompare(toISO(a.dataSolicitacao));
      if (fOrdem === 'prazo-asc') return toISO(a.prazo).localeCompare(toISO(b.prazo));
      if (fOrdem === 'prazo-desc') return toISO(b.prazo).localeCompare(toISO(a.prazo));
      return 0;
    });
  }, [daCategoria, fStatus, fCrit, fResp, fOrdem]);

  return (
    <>
      <Shell
        crumbs={[
          { rotulo: 'Dashboard', onClick: irDashboard },
          { rotulo: unidade, onClick: () => irUnidade(unidade) },
          { rotulo: categoria },
        ]}
        titulo={categoria}
        subtitulo={`${unidade} · ${filtrados.length} de ${daCategoria.length} ocorrência(s) exibida(s)`}
        acao={<ExportButton onClick={() => setExportOpen(true)} />}
      >
        <Painel
          titulo="Filtros"
          delay={0}
          acao={
            (fStatus || fCrit || fResp || fOrdem) && (
              <button
                onClick={() => { setFStatus(''); setFCrit(''); setFResp(''); setFOrdem(''); }}
                className="text-xs text-slate-400 underline-offset-4 hover:text-accent hover:underline"
              >
                Limpar
              </button>
            )
          }
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select label="Status"              valor={fStatus} opcoes={statusOpts} onChange={setFStatus} />
            <Select label="Criticidade"         valor={fCrit}   opcoes={critOpts}   onChange={setFCrit} />
            <Select label="Responsável"         valor={fResp}   opcoes={respOpts}   onChange={setFResp} />
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">Ordenar por</span>
              <select
                value={fOrdem}
                onChange={e => setFOrdem(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-accent/60 dark:border-ink-600 dark:bg-ink-850 dark:text-slate-200"
              >
                <option value="">Padrão</option>
                <option value="sol-asc">Solicitação: mais antiga</option>
                <option value="sol-desc">Solicitação: mais recente</option>
                <option value="prazo-asc">Prazo: mais próximo</option>
                <option value="prazo-desc">Prazo: mais distante</option>
              </select>
            </label>
          </div>
        </Painel>

        {filtrados.length === 0 ? (
          <Vazio mensagem="Nenhuma ocorrência corresponde aos filtros selecionados." />
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
                    </div>
                    <p className="mt-2.5 text-sm font-medium leading-snug text-slate-800 dark:text-slate-100 group-hover:text-accent sm:text-[15px]">
                      {p.problema || 'Ocorrência sem descrição'}
                    </p>
                    {p.impacto && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
                        <span className="text-slate-400 dark:text-slate-500">Impacto: </span>
                        {p.impacto}
                      </p>
                    )}
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 dark:text-slate-500 sm:text-xs">
                      {p.responsavel        && <span>{p.responsavel}</span>}
                      {p.dataSolicitacao    && <span>Solicitado em: {p.dataSolicitacao}</span>}
                      {p.prazo              && <span>Prazo: {p.prazo}</span>}
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
        <ExportDialog ctx={{ tipo: 'categoria', unidade, categoria }} onClose={() => setExportOpen(false)} />
      )}
    </>
  );
}
