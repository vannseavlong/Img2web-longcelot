import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Static export for production (Firebase Hosting / self-hosted FastAPI).
  // In dev the Next.js dev server runs normally with the proxy below.
  output: isDev ? undefined : "export",

  // next/image optimisation requires a server; disable it for static export.
  images: { unoptimized: true },

  // Proxy /api/* to the local Python backend in dev only.
  ...(isDev && {
    async rewrites() {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8000/api/:path*",
        },
      ];
    },
  }),
};

export default nextConfig;
