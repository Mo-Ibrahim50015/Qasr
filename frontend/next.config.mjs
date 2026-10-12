/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.qasralotoor.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
    ],
  },
  async rewrites() {
    // If external/Docker backend URL is provided, proxy requests to it
    if (process.env.INTERNAL_API_URL) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${process.env.INTERNAL_API_URL}/api/v1/:path*`,
        },
      ];
    }
    // Otherwise use Next.js built-in API routes
    return [];
  },
};

export default nextConfig;
