'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProblemas } from '@/components/DataProvider';
import { Carregando, Erro } from '@/components/UI';
import DashboardView from '@/components/views/DashboardView';
import UnidadeView from '@/components/views/UnidadeView';
import CategoriaView from '@/components/views/CategoriaView';
import ProblemaView from '@/components/views/ProblemaView';
import ResponsavelView from '@/components/views/ResponsavelView';

function Roteador() {
  const { carregando, erro } = useProblemas();
  const params = useSearchParams();

  if (carregando) return <Carregando />;
  if (erro) return <Erro mensagem={erro} />;

  const view = params.get('view');
  const u = params.get('u') ?? '';
  const c = params.get('c') ?? '';
  const id = params.get('id') ?? '';
  const r = params.get('r') ?? '';

  switch (view) {
    case 'unidade':
      return <UnidadeView unidade={u} />;
    case 'categoria':
      return <CategoriaView unidade={u} categoria={c} />;
    case 'problema':
      return <ProblemaView id={id} />;
    case 'responsavel':
      return <ResponsavelView responsavel={r} />;
    default:
      return <DashboardView />;
  }
}

export default function Page() {
  return (
    <Suspense fallback={<Carregando />}>
      <Roteador />
    </Suspense>
  );
}
