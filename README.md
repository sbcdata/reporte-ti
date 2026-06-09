# Painel Executivo de Problemas

Dashboard executivo **100% estático** (sem backend, sem banco de dados). Os dados são lidos
diretamente de uma planilha Excel no navegador, usando **SheetJS (xlsx)**.

Construído com **Next.js (App Router) + React + TypeScript + Tailwind CSS + Recharts**.

## ✨ Funcionalidades

- **Dashboard inicial** — total de problemas, KPIs, gráfico de barras e pizza por unidade, ranking e perfil de criticidade.
- **Página da unidade** — gráficos e percentuais por categoria.
- **Página da categoria** — lista de problemas, prioridade destacada por cores, filtros por status e criticidade.
- **Detalhes do problema** — todos os campos da planilha em layout de painel executivo.
- Navegação **por clique** nos gráficos, cartões e itens de ranking.
- Totalmente **responsivo** e processado **somente no frontend**.

## 📊 A planilha

Coloque o arquivo em `public/data/problemas.xlsx`. Cada linha é um problema, com as colunas:

| Coluna |
|---|
| Unidade |
| Categoria |
| Problemas daquela categoria |
| Criticidade Consolidada |
| Impacto / Risco Principal |
| Ação Prioritária Recomendada |
| Status |
| Prioridade Executiva |
| Responsável |
| Data Atualização |

> A leitura é tolerante a variações de acento/maiúsculas nos cabeçalhos.
> Já incluímos uma planilha de exemplo com 46 problemas.

## 🚀 Executar localmente

```bash
npm install
npm run dev        # http://localhost:3000
```

## 🏗️ Build estático

```bash
npm run build      # gera a pasta /out (site estático)
```

## 🌐 Deploy no GitHub Pages

1. Suba o projeto para um repositório no GitHub.
2. Em **Settings → Pages**, selecione **Source: GitHub Actions**.
3. O workflow `.github/workflows/deploy.yml` faz o build e publica automaticamente a cada push na branch `main`.
   - Ele define o `basePath` com o nome do repositório automaticamente.

Para um build manual com `basePath` (repositório `meu-repo`):

```bash
NEXT_PUBLIC_BASE_PATH="/meu-repo" npm run build
```

## 🧱 Estrutura

```
public/data/problemas.xlsx       # fonte de dados
src/lib/                         # tipos, leitura do xlsx, cores, navegação
src/components/                  # UI, gráficos, provider de dados
src/components/views/            # Dashboard, Unidade, Categoria, Problema
src/app/                         # layout + roteador (page.tsx)
```
