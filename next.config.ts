import type { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  assetPrefix: "https://arcxya09.github.io/juna",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default config;
