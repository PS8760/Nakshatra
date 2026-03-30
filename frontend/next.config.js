/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow builds to succeed even with TS/ESLint warnings
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
  // Expose backend URL to client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};
module.exports = nextConfig;
