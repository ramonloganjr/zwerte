import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // Set basePath to your repo name for GitHub Pages (e.g., "/my-repo")
  // Leave empty string if deploying to username.github.io root
  basePath: isProd ? process.env.NEXT_PUBLIC_BASE_PATH || "" : "",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
