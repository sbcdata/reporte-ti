'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { carregarProblemas } from '@/lib/data';
import type { Problema } from '@/lib/types';

interface DataState {
  problemas: Problema[];
  carregando: boolean;
  erro: string | null;
}

const DataContext = createContext<DataState>({
  problemas: [],
  carregando: true,
  erro: null,
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<DataState>({
    problemas: [],
    carregando: true,
    erro: null,
  });

  useEffect(() => {
    let ativo = true;
    carregarProblemas()
      .then((problemas) => {
        if (ativo) setEstado({ problemas, carregando: false, erro: null });
      })
      .catch((e: Error) => {
        if (ativo) setEstado({ problemas: [], carregando: false, erro: e.message });
      });
    return () => {
      ativo = false;
    };
  }, []);

  return <DataContext.Provider value={estado}>{children}</DataContext.Provider>;
}

export function useProblemas(): DataState {
  return useContext(DataContext);
}
