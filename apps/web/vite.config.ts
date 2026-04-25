import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start-plugin";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tanstackStart({
      tsr: {
        srcDirectory: "src",
        routesDirectory: "src/routes",
        generatedRouteTree: "src/routeTree.gen.ts",
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Pomotimer",
        short_name: "Pomotimer",
        description:
          "Pomodoro productivity app. Focus, take breaks, build a streak.",
        theme_color: "#C8553D",
        background_color: "#FBF7F2",
        display: "standalone",
        start_url: "/app",
        scope: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/",
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
      },
    }),
  ],
});
