import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://optimizer-1-7fxq.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
