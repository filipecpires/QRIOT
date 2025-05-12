import type {NextConfig} from 'next';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // disable: process.env.NODE_ENV === "development", // Consider enabling this to disable PWA in development
  sw: "sw.js",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add security headers, especially important for public pages
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            // Updated CSP: added 'unsafe-eval' for dev service worker, and service-worker-src 'self' (though next-pwa might add this too)
            // For production, review if 'unsafe-eval' is truly needed by the SW or can be replaced by 'wasm-unsafe-eval' if applicable.
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://picsum.photos data:; font-src 'self'; connect-src 'self'; service-worker-src 'self';",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: "camera=(), microphone=(), geolocation=()", // Adjust permissions as needed
          },
        ],
      },
       // Stricter policy specifically for public asset pages if needed
      {
        source: '/public/asset/:tag*',
         headers: [
           {
             key: 'Content-Security-Policy',
             value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://picsum.photos data:; font-src 'self';", // More restrictive for public pages
           },
         ],
      }
    ];
  },
};

export default withPWA(nextConfig);
