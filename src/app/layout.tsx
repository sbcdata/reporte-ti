import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/components/DataProvider';
import { ThemeProvider } from '@/lib/theme';
import { AuthProvider } from '@/components/AuthProvider';
import AuthGate from '@/components/AuthGate';

export const metadata: Metadata = {
  title: 'Painel Executivo de Ocorrências',
  description: 'Dashboard executivo estático — análise de ocorrências por unidade e categoria.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/favicon.png`} type="image/png" />
        {/* Anti-flicker: remove dark class if user previously chose light */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='light')document.documentElement.classList.remove('dark')})()` }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AuthGate>
              <DataProvider>
                <div className="relative z-10 min-h-screen">{children}</div>
              </DataProvider>
            </AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
