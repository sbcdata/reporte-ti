"use client";

import React from "react";
import { useNav } from "@/lib/nav";
import { useTheme } from "@/lib/theme";

export interface Crumb {
  rotulo: string;
  onClick?: () => void;
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
      strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-accent/50 hover:text-accent dark:border-ink-700 dark:bg-ink-800 dark:text-slate-400 dark:hover:border-accent/50 dark:hover:text-accent"
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

/* ---------- Shell ---------- */
export function Shell({
  crumbs, titulo, subtitulo, acao, children,
}: {
  crumbs: Crumb[];
  titulo: string;
  subtitulo?: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { irDashboard } = useNav();
  const { theme } = useTheme();
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const logoSrc =
    theme === "dark"
      ? `${base}/logo-sbcd-branca.svg`
      : `${base}/sbcd-logo-sem-fundo.png`;

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
      {/* Header */}
      <header className="mb-5 sm:mb-8 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 sm:px-5 sm:py-4 shadow-sm backdrop-blur-sm dark:border-ink-700/70 dark:bg-ink-850/80">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={irDashboard}
            className="group flex min-w-0 items-center gap-2.5 text-left"
          >
            <img src={logoSrc} alt="SBCData" className="h-10 w-auto shrink-0 sm:h-14" />
            <span className="hidden h-7 w-px shrink-0 rounded-full bg-slate-200 dark:bg-slate-600/70 xs:block sm:block" />
            <span className="hidden font-sans text-sm leading-tight text-slate-800 dark:text-slate-200 sm:block">
              Painel Executivo
              <span className="block text-[11px] tracking-wide text-slate-400 dark:text-slate-500">
                Gestão de Problemas
              </span>
            </span>
          </button>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-400 dark:border-ink-700 dark:bg-ink-800/60 dark:text-slate-500 sm:inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-teal2" />
              Dados atualizados 09/06
            </span>
            {acao}
            <ThemeToggle />
          </div>
        </div>

        {/* Badge mobile de atualização */}
        <div className="mt-3 sm:hidden">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-400 dark:border-ink-700 dark:bg-ink-800/60 dark:text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-teal2" />
            Dados atualizados 09/06
          </span>
        </div>

        {/* Breadcrumbs — scrollável horizontalmente no mobile */}
        <nav className="mt-4 flex items-center gap-1 overflow-x-auto pb-0.5 text-xs text-slate-400 dark:text-slate-500 no-scrollbar">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span className="shrink-0 text-slate-300 dark:text-slate-600">/</span>
              )}
              {c.onClick ? (
                <button
                  onClick={c.onClick}
                  className="shrink-0 whitespace-nowrap rounded-md px-1.5 py-1 transition hover:text-accent hover:underline underline-offset-4"
                >
                  {c.rotulo}
                </button>
              ) : (
                <span className="max-w-[160px] truncate whitespace-nowrap px-1.5 py-1 text-slate-700 dark:text-slate-300 sm:max-w-none">
                  {c.rotulo}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>

        <div className="mt-3 sm:mt-4">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-3xl lg:text-4xl">
            {titulo}
          </h1>
          {subtitulo && (
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
              {subtitulo}
            </p>
          )}
        </div>
      </header>

      <main className="space-y-4 sm:space-y-6">{children}</main>

      <footer className="mt-12 sm:mt-16 border-t border-slate-200 dark:border-ink-700/60 pt-5 text-center text-[10px] text-slate-400 dark:text-slate-600">
        Sistema desenvolvido pela equipe SBCData.
      </footer>

      {/* Watermark — escondida em mobile */}
      <img
        src={`${base}/logo-sem-fundo-sbcdata.png`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none fixed bottom-4 right-4 hidden w-48 select-none opacity-70 sm:block lg:w-64 z-50"
      />
    </div>
  );
}

/* ---------- KPI ---------- */
export function KPI({
  rotulo, valor, detalhe, accent = "#f59e0b", delay = 0, onClick,
}: {
  rotulo: string;
  valor: string | number;
  detalhe?: string;
  accent?: string;
  delay?: number;
  onClick?: () => void;
}) {
  const base =
    "panel panel-pad animate-fadeUp relative overflow-hidden text-left w-full";
  const interativo = onClick
    ? "cursor-pointer transition active:scale-[0.98] hover:border-accent/40 hover:shadow-md"
    : "";

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === "Enter" || e.key === " ") && onClick() : undefined}
      className={`${base} ${interativo}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute left-0 top-0 h-full w-1" style={{ background: accent }} />
      <p className="eyebrow leading-tight">{rotulo}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-slate-900 dark:text-slate-50 sm:text-4xl">
        {valor}
      </p>
      {detalhe && (
        <p className="mt-1 text-[11px] leading-snug text-slate-400 dark:text-slate-500">{detalhe}</p>
      )}
      {onClick && (
        <span className="absolute bottom-3 right-4 text-[10px] text-slate-300 dark:text-slate-600">
          ver detalhes ›
        </span>
      )}
    </div>
  );
}

/* ---------- Painel ---------- */
export function Painel({
  titulo, acao, children, className = "", delay = 0,
}: {
  titulo: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={`panel panel-pad animate-fadeUp ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
        <h2 className="font-display text-base font-semibold text-slate-800 dark:text-slate-100 sm:text-lg">
          {titulo}
        </h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

/* ---------- Badge ---------- */
export function Badge({
  children, className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${className}`}>
      {children}
    </span>
  );
}

/* ---------- Estados ---------- */
export function Carregando() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 dark:border-ink-600 border-t-accent" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Carregando planilha…</p>
      </div>
    </div>
  );
}

export function Erro({ mensagem }: { mensagem: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel panel-pad max-w-md w-full text-center">
        <p className="font-display text-xl text-rose2">Falha ao carregar dados</p>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{mensagem}</p>
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-600">
          Coloque o arquivo em{" "}
          <code className="text-slate-600 dark:text-slate-400">
            public/data/problemas_v2.xlsx
          </code>{" "}
          e recarregue.
        </p>
      </div>
    </div>
  );
}

export function Vazio({ mensagem }: { mensagem: string }) {
  return (
    <div className="panel panel-pad text-center text-sm text-slate-400 dark:text-slate-500">
      {mensagem}
    </div>
  );
}
