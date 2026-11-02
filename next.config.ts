import type { NextConfig } from "next";

/**
 * Статичный экспорт под GitHub Pages: сайт живёт в https://d1trepes.github.io/demo-dent/.
 * basePath одинаковый локально и на Pages: `npm run dev` → http://localhost:3000/demo-dent/.
 * Ссылки через <Link> учитывают basePath сами; файлы из public/ — только через asset() из lib/asset.ts.
 */
const basePath = process.env.BASE_PATH ?? "/demo-dent";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
