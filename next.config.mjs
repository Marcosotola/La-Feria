// next.config.mjs
/** @type {import('next').NextConfig} */
import { GenerateSW } from 'workbox-webpack-plugin';
import path from 'path';
const nextConfig = {
  turbopack: {},
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  },

  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ];
  },

  compress: true,

  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.plugins.push(
        new GenerateSW({
          swDest: path.join(process.cwd(), 'public', 'sw.js'),
          clientsClaim: true,
          skipWaiting: true,
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: {
                  maxEntries: 4,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
              },
            },
            {
              urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-font-assets',
                expiration: {
                  maxEntries: 4,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
              },
            },
            {
              urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-image-assets',
                expiration: {
                  maxEntries: 64,
                  maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
              },
            },
            {
              urlPattern: /\/_next\/image\?url=.+$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'next-image',
                expiration: {
                  maxEntries: 64,
                  maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
              },
            },
            // Fallback for document navigation
            {
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages',
                expiration: {
                  maxEntries: 32,
                  maxAgeSeconds: 24 * 60 * 60
                }
              }
            }
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;