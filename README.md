# Pomotimer

A Pomodoro productivity app delivered as three surfaces sharing a single core:

- **Web app** (`apps/web`) — TanStack Start (React + SSR), `pomotimer.com/app`.
- **Mobile PWA** — same build as `apps/web`, installable via Add-to-Home-Screen.
- **Chrome extension** (`apps/extension`) — MV3 popup pinned to the toolbar.

Design source: `/Users/ruphaa/Documents/design_handoff_pomotimer/`.

## Stack

- pnpm workspace monorepo
- TanStack Start, Router, Store, Query
- React 18 + TypeScript
- Vite + `vite-plugin-pwa` (web) and `@crxjs/vite-plugin` (extension)
- Inter + JetBrains Mono via `@fontsource/*`
- Lucide icons

## Workspace layout

```
apps/
  web/          TanStack Start app (web + PWA)
  extension/    Chrome MV3 popup
packages/
  core/         Pure TS: types, timer logic, time utils, storage adapters
  store/        TanStack Store factories (timer / tasks / stats)
  ui/           Shared React components
  tokens/       Design tokens CSS + fonts
```

## Scripts

```sh
pnpm install
pnpm dev:web      # run the web app + PWA
pnpm dev:ext      # run the Chrome extension in dev mode
pnpm build        # build everything
pnpm typecheck
```

Requires Node 20+.
