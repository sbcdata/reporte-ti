function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export const PALETA = [
  '#f59e0b', '#0ea5e9', '#10b981', '#f43f5e',
  '#a78bfa', '#f97316', '#22d3ee', '#f472b6',
  '#818cf8', '#a3e635',
];

export function corCriticidade(valor: string): string {
  const v = norm(valor);
  if (v.includes('critic')) return '#f43f5e';
  if (v.includes('alta') || v.includes('alto')) return '#f59e0b';
  if (v.includes('medi') || v.includes('moder')) return '#0ea5e9';
  if (v.includes('baix')) return '#10b981';
  return '#a78bfa';
}

export function classePrioridade(valor: string): string {
  const v = norm(valor);
  if (v.includes('alta') || v.includes('critic') || v.includes('urgent'))
    return 'bg-rose2/20 text-rose2 ring-1 ring-rose2/40';
  if (v.includes('medi'))
    return 'bg-accent/20 text-accent ring-1 ring-accent/40';
  if (v.includes('baix'))
    return 'bg-teal2/20 text-teal2 ring-1 ring-teal2/40';
  return 'bg-sky2/20 text-sky2 ring-1 ring-sky2/40';
}

export function classeStatus(valor: string): string {
  const v = norm(valor);
  if (v.includes('conclu') || v.includes('resolv') || v.includes('fechad'))
    return 'bg-teal2/20 text-teal2 ring-1 ring-teal2/40';
  if (v.includes('andamento') || v.includes('progress') || v.includes('execu'))
    return 'bg-sky2/20 text-sky2 ring-1 ring-sky2/40';
  if (v.includes('pend') || v.includes('aberto') || v.includes('aguard'))
    return 'bg-accent/20 text-accent ring-1 ring-accent/40';
  if (v.includes('atras') || v.includes('bloque'))
    return 'bg-rose2/20 text-rose2 ring-1 ring-rose2/40';
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-300 dark:bg-ink-700 dark:text-slate-300 dark:ring-ink-600';
}

export function corStatusDot(valor: string): string {
  const v = norm(valor);
  if (v.includes('conclu') || v.includes('resolv')) return '#10b981';
  if (v.includes('andamento') || v.includes('progress')) return '#0ea5e9';
  if (v.includes('atras') || v.includes('bloque')) return '#f43f5e';
  return '#f59e0b';
}
