import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/ccq-licence-c",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
