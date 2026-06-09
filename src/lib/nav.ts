'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

// Navegação baseada em query string — compatível com export estático (GitHub Pages).
export function useNav() {
  const router = useRouter();

  const irDashboard = useCallback(() => router.push('/'), [router]);

  const irUnidade = useCallback(
    (unidade: string) => router.push(`/?view=unidade&u=${encodeURIComponent(unidade)}`),
    [router]
  );

  const irCategoria = useCallback(
    (unidade: string, categoria: string) =>
      router.push(
        `/?view=categoria&u=${encodeURIComponent(unidade)}&c=${encodeURIComponent(categoria)}`
      ),
    [router]
  );

  const irProblema = useCallback(
    (id: string) => router.push(`/?view=problema&id=${encodeURIComponent(id)}`),
    [router]
  );

  const irResponsavel = useCallback(
    (responsavel: string) => router.push(`/?view=responsavel&r=${encodeURIComponent(responsavel)}`),
    [router]
  );

  return { irDashboard, irUnidade, irCategoria, irProblema, irResponsavel };
}
