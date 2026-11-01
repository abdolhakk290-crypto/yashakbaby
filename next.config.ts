import type { NextConfig } from 'next';

// Security headers for every response. The Content-Security-Policy (with a per-request nonce) is set in proxy.ts.
const supa = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const config: NextConfig = {
  poweredByHeader: false,
  
  reactStrictMode: true,
  images: { remotePatterns: supa ? [{ protocol: 'https', hostname: new URL(supa).hostname, pathname: '/storage/v1/object/public/**' }] : [] },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=15552000' },
    ] }, { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] }];
  },
};
export default config;
