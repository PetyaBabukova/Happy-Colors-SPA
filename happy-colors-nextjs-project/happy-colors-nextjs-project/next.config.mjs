/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdncloudcart.com',
        pathname: '/**',              // леко поправям от '**' на '/**'
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/happycolors-store/**', // пътят към твоя bucket
      },
    ],
  },
};

export default nextConfig;
