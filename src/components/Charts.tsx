'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
  PieChart, Pie, ResponsiveContainer, Tooltip, LabelList,
} from 'recharts';
import type { ContagemItem } from '@/lib/types';
import { PALETA } from '@/lib/ui';
import { useTheme } from '@/lib/theme';

function truncar(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function formatarMoeda(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}k`;
  return `R$ ${v.toLocaleString('pt-BR')}`;
}

function makeTooltip(formato: 'contagem' | 'moeda') {
  return function TooltipBox({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload as ContagemItem;
    const detalhe = formato === 'moeda'
      ? `${formatarMoeda(p.total)} · ${p.percentual}%`
      : `${p.total} ${p.total === 1 ? 'ocorrência' : 'ocorrências'} · ${p.percentual}%`;
    return (
      <div className="max-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl dark:border-ink-600 dark:bg-ink-900/95">
        <p className="font-medium text-slate-800 dark:text-slate-100 break-words">{p.nome}</p>
        <p className="mt-0.5 text-slate-500 dark:text-slate-400">{detalhe}</p>
      </div>
    );
  };
}

function TickY({ x, y, payload, maxChars, fill }: any) {
  const text = truncar(String(payload.value), maxChars);
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={11}
      textAnchor="end"
      dominantBaseline="middle"
    >
      {text}
    </text>
  );
}

export function GraficoBarras({
  dados,
  onSelect,
  cores,
  formato = 'contagem',
}: {
  dados: ContagemItem[];
  onSelect?: (nome: string) => void;
  cores?: (item: ContagemItem, i: number) => string;
  formato?: 'contagem' | 'moeda';
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridColor  = isDark ? '#26314a' : '#e2e8f0';
  const axisColor  = isDark ? '#64748b' : '#94a3b8';
  const yColor     = isDark ? '#94a3b8' : '#475569';
  const labelColor = isDark ? '#cbd5e1' : '#475569';

  const TooltipBox = makeTooltip(formato);
  const labelFormatter = formato === 'moeda'
    ? (v: number) => formatarMoeda(v)
    : (v: number) => String(v);

  const altura = Math.max(180, dados.length * 42 + 16);

  // Adapta a largura do YAxis e truncamento ao tamanho de tela
  const yAxisWidth = typeof window !== 'undefined' && window.innerWidth < 480 ? 90 : 130;
  const maxChars   = typeof window !== 'undefined' && window.innerWidth < 480 ? 12 : 18;
  const rightMargin = formato === 'moeda' ? 64 : 24;

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <BarChart
        layout="vertical"
        data={dados}
        margin={{ top: 2, right: rightMargin, bottom: 2, left: 0 }}
        barCategoryGap={10}
      >
        <CartesianGrid horizontal={false} stroke={gridColor} strokeDasharray="3 3" />
        <XAxis type="number" stroke={axisColor} fontSize={10} allowDecimals={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="nome"
          stroke={yColor}
          width={yAxisWidth}
          tickLine={false}
          axisLine={false}
          tick={<TickY fill={yColor} maxChars={maxChars} />}
        />
        <Tooltip
          content={<TooltipBox />}
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)' }}
        />
        <Bar
          dataKey="total"
          radius={[0, 5, 5, 0]}
          cursor={onSelect ? 'pointer' : 'default'}
          onClick={(d: any) => onSelect?.(d.nome)}
        >
          {dados.map((item, i) => (
            <Cell key={i} fill={cores ? cores(item, i) : PALETA[i % PALETA.length]} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            style={{ fill: labelColor, fontSize: 10 }}
            formatter={labelFormatter}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoPizza({
  dados,
  onSelect,
  cores,
}: {
  dados: ContagemItem[];
  onSelect?: (nome: string) => void;
  cores?: (item: ContagemItem, i: number) => string;
}) {
  const { theme } = useTheme();
  const stroke = theme === 'dark' ? '#0f1420' : '#f1f5f9';

  const PieTooltip = makeTooltip('contagem');

  // Raios menores em telas pequenas
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
  const inner = isMobile ? 50 : 62;
  const outer = isMobile ? 88 : 108;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Tooltip content={<PieTooltip />} />
        <Pie
          data={dados}
          dataKey="total"
          nameKey="nome"
          cx="50%"
          cy="50%"
          innerRadius={inner}
          outerRadius={outer}
          paddingAngle={2}
          stroke={stroke}
          strokeWidth={2}
          cursor={onSelect ? 'pointer' : 'default'}
          onClick={(d: any) => onSelect?.(d.nome)}
        >
          {dados.map((item, i) => (
            <Cell key={i} fill={cores ? cores(item, i) : PALETA[i % PALETA.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function Legenda({
  dados,
  cores,
  onSelect,
}: {
  dados: ContagemItem[];
  cores?: (item: ContagemItem, i: number) => string;
  onSelect?: (nome: string) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
      {dados.map((item, i) => (
        <li key={item.nome}>
          <button
            onClick={() => onSelect?.(item.nome)}
            className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-ink-800/60 dark:active:bg-ink-800"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: cores ? cores(item, i) : PALETA[i % PALETA.length] }}
              />
              <span className="truncate text-xs text-slate-600 dark:text-slate-300 sm:text-sm">{item.nome}</span>
            </span>
            <span className="shrink-0 font-mono text-[10px] text-slate-400 dark:text-slate-500">
              {item.total} · {item.percentual}%
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
