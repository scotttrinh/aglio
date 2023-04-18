/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["node-fetch"],
  },
  output: "standalone",
};

module.exports = nextConfig;
