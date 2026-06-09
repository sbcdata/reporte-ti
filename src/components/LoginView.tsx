"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "./AuthProvider";

function IconLogIn() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

export default function LoginView() {
  const { tentarLogin } = useAuth();
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const ok = await tentarLogin(senha);
    setCarregando(false);
    if (!ok) {
      setErro("Senha incorreta. Tente novamente.");
      setSenha("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden gdi-login-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="login-light login-light-1" />
        <div className="login-light login-light-2" />
        <div className="login-light login-light-3" />
        <div className="login-light login-light-4" />
        <div className="login-light login-light-5" />
        <div className="login-light login-light-6" />
        <div className="login-light login-light-7" />
        <div className="login-light login-light-8" />
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>
      <div className="absolute inset-0 gdi-login-overlay pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6 animate-fadeUp">
        {/* Logo SBCD + título */}
        <div className="flex flex-col items-center mb-6 gap-2">
          <img
            src={`${base}/logo-sbcd-branca.svg`}
            alt="SBCD – Sociedade Brasileira Caminho de Damasco"
            className="h-40 w-auto drop-shadow-2xl"
          />
          <div className="text-center mt-1">
            <h1 className="text-4xl text-white font-bold font-display tracking-tight">
              Painel Executivo
            </h1>
            <p className="text-[#7ec8e3] text-base">Gestão de Problemas</p>
          </div>
        </div>

        {/* Card */}
        <div
          className="backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "rgba(13,33,55,0.92)",
            border: "1px solid rgba(30,90,122,0.50)",
            boxShadow:
              "0 25px 50px -12px rgba(0,0,0,0.55), 0 0 0 1px rgba(14,165,233,0.06)",
          }}
        >
          {/* Card header */}
          <div className="px-8 pt-7 pb-5">
            <h2 className="text-xl font-semibold text-white mb-1 text-center font-display">
              Acesso Seguro
            </h2>
            <p className="text-[#7ec8e3] text-sm text-center">
              Digite a senha para acessar o painel
            </p>
          </div>

          <div style={{ height: "1px", background: "rgba(30,90,122,0.4)" }} />

          {/* Form */}
          <div className="px-8 py-6">
            {erro && (
              <div
                className="rounded-lg p-3 flex items-center gap-2 text-red-400 mb-5 animate-fadeUp"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.4)",
                }}
              >
                <IconAlert />
                <span className="text-sm">{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  style={{ color: "#7ec8e3" }}
                >
                  Senha de acesso
                </label>
                <div className="relative">
                  <input
                    ref={inputRef}
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setErro("");
                    }}
                    autoComplete="current-password"
                    autoFocus
                    required
                    disabled={carregando}
                    className="w-full h-12 rounded-md px-3 pr-12 text-sm text-white placeholder:text-[#5a9ab8] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                    style={{
                      background: "#132f4c",
                      border: erro
                        ? "1px solid rgba(239,68,68,0.6)"
                        : "1px solid #1e5a7a",
                      boxShadow: erro
                        ? "0 0 0 2px rgba(239,68,68,0.12)"
                        : undefined,
                    }}
                    onFocus={(e) => {
                      if (!erro) {
                        e.currentTarget.style.border = "1px solid #38bdf8";
                        e.currentTarget.style.boxShadow =
                          "0 0 0 2px rgba(56,189,248,0.12)";
                      }
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = erro
                        ? "1px solid rgba(239,68,68,0.6)"
                        : "1px solid #1e5a7a";
                      e.currentTarget.style.boxShadow = erro
                        ? "0 0 0 2px rgba(239,68,68,0.12)"
                        : "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    disabled={carregando}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors disabled:opacity-50 text-[#5a9ab8] hover:text-white"
                  >
                    {mostrarSenha ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando || senha.length === 0}
                className="w-full h-12 text-white font-semibold rounded-lg transition-all duration-300 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 hover:from-blue-500 hover:via-blue-400 hover:to-blue-300 shadow-lg shadow-blue-500/30"
              >
                {carregando ? (
                  <>
                    <Spinner />
                    <span>Verificando…</span>
                  </>
                ) : (
                  <>
                    <IconLogIn />
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div style={{ height: "1px", background: "rgba(30,90,122,0.4)" }} />

          <div className="px-8 py-4 flex items-center justify-between gap-4">
            <p className="text-xs leading-relaxed" style={{ color: "#2e5a78" }}>
              © 2025 SBCD – Sociedade Brasileira Caminho de Damasco
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
