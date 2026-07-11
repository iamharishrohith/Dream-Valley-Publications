/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const apiOrigin = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://dreamvalleypublications.com';

const connectSrc = [
  "'self'",
  apiOrigin,
  'https:',
];

if (!isProd) {
  connectSrc.push('http://localhost:3001', 'ws://localhost:3000', 'ws://localhost:3001');
}

const nextConfig = {
  reactCompiler: true,
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/books',
        destination: '/catalog',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              `connect-src ${connectSrc.join(' ')}`,
              "frame-ancestors 'none'",
              "base-uri 'self'",
              `form-action 'self' ${siteOrigin} ${apiOrigin}`,
            ].join('; '),
          },
        ],
      },
      {
        source: '/Assets/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
