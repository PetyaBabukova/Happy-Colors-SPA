/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdncloudcart.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
