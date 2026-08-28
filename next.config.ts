import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // three.js ships untranspiled ESM helpers consumed by drei/rapier
  transpilePackages: ['three'],
};

export default nextConfig;
