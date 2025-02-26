/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    runtime: 'nodejs',
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com; connect-src 'self' https://*.vercel-insights.com https://*.vercel.app https://*.privy.io https://*.helius-rpc.com wss://*.walletconnect.com wss://*.walletlink.org https://*.amazonaws.com https://*.walletconnect.com https://explorer-api.walletconnect.com; img-src 'self' blob: data: https://*.vercel-storage.com https://*.amazonaws.com https://*.s3.amazonaws.com https://s3.amazonaws.com https://s3-*.amazonaws.com https://*.arweave.net https://*.ipfs.io https://*.cloudfront.net https://yap-prod-app.s3.us-east-1.amazonaws.com https://*.walletconnect.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://*.privy.io https://*.walletconnect.org https://verify.walletconnect.org https://verify.walletconnect.com; object-src 'none'; base-uri 'self'; form-action 'self';"
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};
