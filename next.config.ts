import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Luma event covers — covers cdn.lu.ma, images.lumacdn.com,
      // social-images.lumacdn.com, and any future subdomains.
      { protocol: "https", hostname: "**.lu.ma" },
      { protocol: "https", hostname: "lu.ma" },
      { protocol: "https", hostname: "**.lumacdn.com" },
      { protocol: "https", hostname: "lumacdn.com" },
    ],
  },
  async redirects() {
    return [
      // /programs is now the single hub for all registration. Keep old
      // QR codes and external links pointing at /classes working.
      { source: "/classes", destination: "/programs", permanent: true },
      { source: "/classes/:path*", destination: "/programs", permanent: true },
    ];
  },
};

export default nextConfig;
