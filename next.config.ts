import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components is off: every page is static data, and without it
  // `dynamicParams = false` makes unknown dojo/scenario ids return a real 404.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
