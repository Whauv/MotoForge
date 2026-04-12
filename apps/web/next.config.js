/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  output: "standalone",
  transpilePackages: ["three"],
  webpack(config) {
    config.module.rules.push({
      test: /\.glb$/i,
      type: "asset/resource",
    });

    return config;
  },
};

module.exports = nextConfig;
