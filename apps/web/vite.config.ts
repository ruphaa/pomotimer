import { defineConfig, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start-plugin";
import viteReact from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Dev-only middleware: serve a self-destroying script at /sw.js (the
 * URL the old prod SW is registered under). When the browser auto-checks
 * for a SW update on next page load, it fetches /sw.js, sees new bytes,
 * installs this new SW which immediately unregisters itself + nukes all
 * caches. After one reload the origin is clean and `pnpm dev:web` works
 * normally. Without this, a SW left over from a previous prod build keeps
 * intercepting dev requests forever — the dev server never sees them.
 */
function killStaleServiceWorker(): Plugin {
  const body = `
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", async (event) => {
      event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((c) => c.navigate(c.url));
      })());
    });
  `;
  return {
    name: "pomotimer:kill-stale-sw",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split("?")[0] === "/sw.js") {
          res.setHeader("Content-Type", "application/javascript");
          res.setHeader("Cache-Control", "no-store");
          res.setHeader("Service-Worker-Allowed", "/");
          res.end(body);
          return;
        }
        next();
      });
    },
  };
}

// Set to `true` for ONE deploy after you've had to ship a SW change that
// breaks existing clients (e.g. a stale SW caching old optimized deps and
// returning 404s for new exports). Generates a self-unregistering service
// worker that overwrites any previously installed SW on the user's machine
// and clears its caches, then does nothing on subsequent loads. Flip back
// to `false` once you're confident every client has been cleaned up.
const PWA_SELF_DESTROYING = true;

export default defineConfig(({ command }) => ({
  plugins: [
    tanstackStart({
      customViteReactPlugin: true,
      tsr: {
        srcDirectory: "src",
        routesDirectory: "src/routes",
        generatedRouteTree: "src/routeTree.gen.ts",
      },
    }),
    viteReact(),
    killStaleServiceWorker(),
    VitePWA({
      // Never register a SW in dev. Without this, a SW left over from a
      // previous `pnpm build && pnpm preview` (or a deployed prod build
      // visited on the same origin) will intercept dev requests and serve
      // stale `?v=<hash>` URLs from /node_modules/.vite/deps/, causing
      // "export not found" errors that no amount of clearing .vite fixes.
      disable: command === "serve",
      selfDestroying: PWA_SELF_DESTROYING,
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
}));
