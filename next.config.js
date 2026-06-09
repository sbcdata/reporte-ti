/** @type {import('next').NextConfig} */

// Para hospedar no GitHub Pages em https://<usuario>.github.io/<repo>/
// defina a variável de ambiente NEXT_PUBLIC_BASE_PATH="/<repo>" no build.
// Ex.: NEXT_PUBLIC_BASE_PATH="/meu-repo" npm run build
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  output: 'export',          // gera site estático em /out
  basePath: basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  images: { unoptimized: true },
  trailingSlash: true,       // necessário para roteamento correto no GitHub Pages
  reactStrictMode: true,
};

module.exports = nextConfig;
