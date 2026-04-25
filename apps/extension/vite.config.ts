import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import manifest from "./manifest.config";

export default defineConfig({
  // Pin the extension dev server to its own port. The web app uses Vite's
  // default 5173, and CRXJS bakes the dev-server URL into the extension
  // bundle at build time — if the port shifts (e.g. because 5173 is taken)
  // the popup shows a "Cannot connect to http://localhost:5173" screen
  // instead of the real UI. `strictPort` makes startup fail loudly rather
  // than silently rolling to the next free port.
  server: {
    port: 5174,
    strictPort: true,
    hmr: { port: 5174 },
  },
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
    },
  },
});
