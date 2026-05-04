import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse', 'mammoth', 'puppeteer', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
};

export default nextConfig;
