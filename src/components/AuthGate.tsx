'use client';

import React from 'react';
import { useAuth } from './AuthProvider';
import LoginView from './LoginView';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { autenticado } = useAuth();
  return autenticado ? <>{children}</> : <LoginView />;
}
