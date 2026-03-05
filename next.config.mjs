/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Codespaces forwards requests through *.app.github.dev while Origin may be localhost in dev.
      allowedOrigins: ["localhost:3000", "127.0.0.1:3000", "*.app.github.dev"],
    },
  },
};

export default nextConfig;
