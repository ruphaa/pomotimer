import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Pomotimer",
  version: "0.0.1",
  description: "A focused Pomodoro timer pinned to your toolbar.",
  action: {
    default_popup: "src/popup/index.html",
    default_title: "Pomotimer",
  },
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  permissions: ["storage", "alarms", "notifications"],
  // TODO: add icons/icon-{16,32,48,128}.png to public/ before publishing.
});
