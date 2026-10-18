import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // serverRuntimeConfig: {
  //   PROJECT_ROOT: __dirname
  // },
  
  // Package import optimization for key libraries
  // experimental: {
  //   optimizePackageImports: [
  //     'framer-motion',
  //     'gsap',
  //     '@gsap/react',
  //     'three',
  //     'lenis',
  //     '@studio-freight/lenis'
  //   ]
  // },
  
  // images: {
  //   formats: ['image/webp', 'image/avif'],
  //   // 1-year image cache TTL for faster repeat visits
  //   minimumCacheTTL: 31536000,
  //   remotePatterns: [
  //     {
  //       protocol: 'https',
  //       hostname: 'images.unsplash.com',
  //     },
  //     {
  //       protocol: 'https',
  //       hostname: 'wemotif.com',
  //     },
  //     {
  //       protocol: 'https',
  //       hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
  //     },
  //   ],
  // },
  eslint: {ignoreDuringBuilds: true,},

  // Only barrel packages without side effects (gsap is excluded on purpose:
  // its entry file registers CSSPlugin as a side effect)
  experimental: {
    optimizePackageImports: ["d3"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    // Optimised images are cached for 31 days
    minimumCacheTTL: 2678400,
    // Blog media uploaded through Strapi (see brain/strapi-setup.md)
    remotePatterns: [
      { protocol: "https", hostname: "cms.wemotif.com", pathname: "/uploads/**" },
      { protocol: "https", hostname: "tetecztijih9r68vw5vyuoc4.vps.pointerapps.net", pathname: "/uploads/**" },
      { protocol: "http", hostname: "localhost", port: "1337", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "1337", pathname: "/uploads/**" },
    ],
  },

  async headers() {
    return [
      {
        // Static files in public/assets (middleware no longer runs on these)
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
  
  // Performance headers
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'X-DNS-Prefetch-Control',
  //           value: 'on'
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff'
  //         },
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY'
  //         },
  //         {
  //           key: 'X-XSS-Protection',
  //           value: '1; mode=block'
  //         }
  //       ]
  //     },
  //     {
  //       // Cache static assets for 1 year
  //       source: '/_next/static/(.*)',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=31536000, immutable'
  //         }
  //       ]
  //     },
  //     {
  //       // Cache images for 1 year
  //       source: '/images/(.*)',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=31536000, immutable'
  //         }
  //       ]
  //     }
  //   ];
  // },
  
  // async rewrites() {
  //   return [];
  // },
};

export default nextConfig;
