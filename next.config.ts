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
};

export default nextConfig;
