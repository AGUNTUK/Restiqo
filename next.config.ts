import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const projectRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path(en|bn)?/pay/:rest*',
          destination: 'http://restiqa.unaux.com/pay/:rest*',
        },
      ],
      afterFiles: [
        {
          source: '/:path(en|bn)?/pay/:rest*',
          destination: 'http://restiqa.unaux.com/pay/:rest*',
        },
      ],
    };
  },
};

export default withNextIntl(nextConfig);

