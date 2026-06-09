# CLAUDE.md

Guia de contexto para o Claude Code trabalhar neste repositório. Leia antes de propor mudanças.

## Visão geral

Painel executivo **100% estático** de gestão de problemas. **Sem backend e sem banco de dados.**
Todos os dados vêm de uma planilha Excel lida no navegador com SheetJS. O alvo de deploy é o
**GitHub Pages** (export estático via `output: 'export'`).

Stack: **Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS 3 · Recharts · xlsx (SheetJS)**.

## Comandos

```bash
npm install        # instala dependências
npm run dev        # desenvolvimento em http://localhost:3000
npm run build      # build + export estático para /out
npm run lint       # checagem de lint
```

Não existe servidor de produção: `npm run build` gera arquivos estáticos em `/out`.

## Regras invioláveis (não quebrar)

1. **Nada de backend, API routes, banco ou Server Actions.** Tudo roda no cliente.
2. **Não usar rotas dinâmicas** (`[slug]`) nem `generateStaticParams`. Os dados só existem em
   runtime (lidos do `.xlsx`), então a navegação é feita por **query string** numa única rota `/`.
   Ex.: `/?view=unidade&u=...`, `/?view=categoria&u=...&c=...`, `/?view=problema&id=...`.
3. **Manter compatível com export estático e GitHub Pages.** Não introduzir recursos que exijam
   servidor (ISR, `next/image` otimizado, headers dinâmicos, cookies de servidor, etc.).
4. **Respeitar o `basePath`.** Para links a assets em `public/`, sempre prefixar com
   `process.env.NEXT_PUBLIC_BASE_PATH` (ver `src/lib/data.ts` → `withBasePath`). Para navegação
   entre views use o hook `useNav` (o `router` do Next já aplica o basePath).
5. **`useSearchParams` exige `<Suspense>`** no export estático — já feito em `src/app/page.tsx`.
   Manter qualquer novo uso dentro de um boundary de Suspense.
6. **Idioma:** UI, nomes de variáveis de domínio e comentários em **português**.

## Estrutura

```
public/data/problemas.xlsx        # ÚNICA fonte de dados (trocar o arquivo troca tudo)
public/.nojekyll                  # impede o GitHub Pages de ignorar a pasta _next
src/app/
  layout.tsx                      # layout raiz + DataProvider
  page.tsx                        # ROTEADOR: lê search params e escolhe a view (em Suspense)
  globals.css                     # fontes, tema escuro, classes .panel/.eyebrow, animações
src/lib/
  types.ts                        # interface Problema + constantes de níveis
  data.ts                         # carregarProblemas() (fetch + SheetJS) e agruparPor()
  ui.ts                           # PALETA e funções de cor (criticidade/prioridade/status)
  nav.ts                          # hook useNav() — navegação por query string
src/components/
  DataProvider.tsx                # Context: carrega o xlsx UMA vez (useProblemas())
  UI.tsx                          # Shell, KPI, Painel, Badge, Carregando, Erro, Vazio
  Charts.tsx                      # GraficoBarras, GraficoPizza, Legenda (Recharts)
  views/
    DashboardView.tsx             # visão geral
    UnidadeView.tsx               # por categoria
    CategoriaView.tsx             # lista + filtros (status, criticidade)
    ProblemaView.tsx              # ficha executiva completa
.github/workflows/deploy.yml      # CI: build e publish no GitHub Pages
```

## Modelo de dados

Cada linha da planilha vira um `Problema` (ver `src/lib/types.ts`). Colunas esperadas:

`Unidade` · `Categoria` · `Problemas daquela categoria` · `Criticidade Consolidada` ·
`Impacto / Risco Principal` · `Ação Prioritária Recomendada` · `Status` ·
`Prioridade Executiva` · `Responsável` · `Data Atualização`

A leitura dos cabeçalhos é **tolerante a acento e maiúsculas** (função `pick` em `data.ts`).
O `id` de cada problema é o índice da linha (1-based) — é o que liga `?view=problema&id=`.
Ao adicionar um campo novo: atualize `Problema` em `types.ts` **e** o mapeamento em `data.ts`.

## Convenções

- **Componentes interativos** levam `'use client'` no topo (praticamente tudo aqui é client).
- **Agrupamentos/contagens** usam sempre `agruparPor(problemas, campo)` — não reimplementar.
- **Cores:** nunca hardcode hex em componentes de domínio; use `PALETA` e as funções
  `corCriticidade` / `classePrioridade` / `classeStatus` / `corStatusDot` de `src/lib/ui.ts`.
- **Estilo:** Tailwind + classes utilitárias `.panel`, `.panel-pad`, `.eyebrow`,
  `.animate-fadeUp` (definidas em `globals.css`). Tema escuro; cores custom no `tailwind.config.ts`
  (`ink-*`, `accent`, `sky2`, `teal2`, `rose2`, `violet2`).
- **Navegação:** sempre via `useNav()` (`irDashboard`, `irUnidade`, `irCategoria`, `irProblema`).
  Não montar URLs à mão nos componentes.
- **Novas telas:** crie em `src/components/views/`, adicione um `case` no switch de `page.tsx`
  e, se precisar, um método de navegação em `src/lib/nav.ts`.

## Checklist antes de finalizar uma mudança

- [ ] `npm run build` passa e gera `/out` sem erros de tipo.
- [ ] Não foram introduzidas rotas dinâmicas nem dependências de servidor.
- [ ] Assets de `public/` referenciados com `basePath`.
- [ ] Novos `useSearchParams` dentro de `<Suspense>`.
- [ ] Cores e navegação via helpers de `lib/`, não hardcoded.

## Deploy

Push na branch `main` dispara `.github/workflows/deploy.yml`, que roda `npm ci && npm run build`,
define `NEXT_PUBLIC_BASE_PATH` com o nome do repositório e publica `/out` no GitHub Pages.
Em **Settings → Pages**, a fonte deve ser **GitHub Actions**.
