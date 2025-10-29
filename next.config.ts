import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // ✅ 루트 경로 명시 (경고 제거)
  },
};

export default nextConfig;
