export interface Problema {
  id: string;
  unidade: string;
  estado: string;
  superintendencia: string;
  categoria: string;
  problema: string;
  criticidade: string;
  impacto: string;
  acao: string;
  responsavel: string;
  status: string;
  prioridade: string;
  custeioEstimado: string;
  investimentoEstimado: string;
  prazo: string;
  dataSolicitacao: string;
  historicoPrazo: string[];
}

export interface ContagemItem {
  nome: string;
  total: number;
  percentual: number;
}

export const NIVEIS_CRITICIDADE = ['Crítica', 'Alta', 'Média', 'Baixa'] as const;

export type ExportCtx =
  | { tipo: 'dashboard' }
  | { tipo: 'unidade';     unidade: string }
  | { tipo: 'categoria';   unidade: string; categoria: string }
  | { tipo: 'problema';    id: string }
  | { tipo: 'responsavel'; responsavel: string };
