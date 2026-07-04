import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      { source: "/wizard/:type/step-:step", destination: "/?flow=wizard&type=:type&step=:step" },
      { source: "/wizard/:type", destination: "/?flow=wizard&type=:type" },
      { source: "/wizard", destination: "/?flow=wizard" },

      { source: "/packages/:type/:package", destination: "/?flow=packages&type=:type&package=:package" },
      { source: "/packages/:type", destination: "/?flow=packages&type=:type" },
      { source: "/packages", destination: "/?flow=packages" },

      { source: "/how-it-works/:hiw", destination: "/?flow=how-it-works&hiw=:hiw" },
      { source: "/how-it-works", destination: "/?flow=how-it-works" },

      { source: "/start", destination: "/?cta=start" },
      { source: "/call", destination: "/?cta=call" },
      { source: "/telegram", destination: "/?cta=telegram" },
    ];
  },
};

export default nextConfig;
