'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dashboard_auth';
const STORAGE_EXPIRY = 'dashboard_auth_expiry';
const DIAS_SESSAO = 14;
const HASH_ESPERADO = process.env.NEXT_PUBLIC_PASSWORD_HASH ?? '';

async function hashSenha(senha: string): Promise<string> {
  const bytes = new TextEncoder().encode(senha);
  const buffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface AuthCtx {
  autenticado: boolean;
  tentarLogin: (senha: string) => Promise<boolean>;
  sair: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [autenticado, setAutenticado] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const expiry = localStorage.getItem(STORAGE_EXPIRY);
    const ok = localStorage.getItem(STORAGE_KEY) === '1' &&
      expiry !== null && Date.now() < Number(expiry);
    if (!ok) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_EXPIRY);
    }
    setAutenticado(ok);
    setPronto(true);
  }, []);

  const tentarLogin = useCallback(async (senha: string): Promise<boolean> => {
    const hash = await hashSenha(senha);
    if (hash === HASH_ESPERADO) {
      const expiry = Date.now() + DIAS_SESSAO * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, '1');
      localStorage.setItem(STORAGE_EXPIRY, String(expiry));
      setAutenticado(true);
      return true;
    }
    return false;
  }, []);

  const sair = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_EXPIRY);
    setAutenticado(false);
  }, []);

  if (!pronto) return null;

  return <Ctx.Provider value={{ autenticado, tentarLogin, sair }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth fora de AuthProvider');
  return ctx;
}
