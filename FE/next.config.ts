import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dzmx76ojp/**',
      },
      {
        protocol: 'https',
        hostname: '*.ngrok-free.app', // Ưu tiên nhận diện các sub-domain của ngrok
      },
      {
        protocol: 'https',
        hostname: '**', // "Chìa khóa vạn năng" cho tất cả các domain https còn lại
      },
      {
        protocol: 'http',
        hostname: '**', // Cho phép cả các link không có bảo mật (http)
      },
    ],
  },
};

export default nextConfig;