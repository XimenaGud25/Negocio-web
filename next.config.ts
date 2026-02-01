import type { NextConfig } from "next";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gym-exercises-images.s3.us-east-2.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gym-exercises-images.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Temporal para evitar optimización de URLs pre-firmadas
  },
}


export default nextConfig;
