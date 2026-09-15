/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      ...(process.env.NEXT_PUBLIC_BACKEND_URL
        ? [
            {
              protocol: process.env.NEXT_PUBLIC_BACKEND_URL.startsWith('https') ? 'https' : 'http',
              hostname: new URL(process.env.NEXT_PUBLIC_BACKEND_URL).hostname,
            },
          ]
        : []),
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
