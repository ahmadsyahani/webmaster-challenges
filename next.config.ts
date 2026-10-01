import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['quickjs-emscripten'],
  outputFileTracingIncludes: { '/api/*': ['./node_modules/quickjs-emscripten*/**/*', './node_modules/@jitl/**/*'] },
};

export default nextConfig;
