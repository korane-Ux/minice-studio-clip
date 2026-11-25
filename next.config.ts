import type { NextConfig } from "next";

// cacheComponents désactivé : toutes les pages dépendent de la session de l'utilisateur (rendu dynamique classique).
const nextConfig: NextConfig = {
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
