# Pomotimer — Chrome extension popup

The MV3 popup pinned to the toolbar. 380 × 580px frame.

## Test it locally

### 1. Build

```sh
pnpm install                      # at repo root
pnpm --filter @pomotimer/extension build
```

This produces `apps/extension/dist/` with `manifest.json`, the popup HTML,
the bundled JS, and font assets.

### 2. Load it as an unpacked extension

1. Open Chrome → `chrome://extensions/`
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked**.
4. Pick `apps/extension/dist/` (the *built* folder, not `src/`).
5. The Pomotimer extension appears in the list. Click the pin icon in the
   toolbar so the popup is one click away.

> Heads-up: the manifest currently has no toolbar icon, so you'll see a
> grey puzzle-piece. Add `public/icons/icon-{16,32,48,128}.png` and
> re-enable the `icons` block in `manifest.config.ts` before publishing.

### 3. Open the popup

Click the pinned extension icon. You should see:

- Header: P logo + "Pomotimer" wordmark, info / sync / settings buttons
- Mode tabs: Focus / Short / Long
- 220px progress ring with 56px monospaced numerals (click to edit, 1–180)
- Round + mode label below the numerals
- Reset / Start / Skip controls
- Today's tasks footer (scrolls; "+ Add" reveals an inline input)

The page background subtly shifts between warm beige (focus), cool teal
(short break), and cool slate (long break) when you switch modes.

### 4. Iterating

For the inner-loop dev experience use **HMR**:

```sh
pnpm --filter @pomotimer/extension dev
```

`@crxjs/vite-plugin` rebuilds on save; click the **Reload** icon next to
the extension card on `chrome://extensions/` (or hit `R` while focused on
the card) to pick up new builds. The popup re-renders on next open.

### 5. Verify persistence

State persists to `chrome.storage.local` under the key `pomotimer:v1`.
Inspect it via the popup's devtools:

1. Right-click inside the popup → **Inspect**.
2. In the devtools Console:
   ```js
   chrome.storage.local.get("pomotimer:v1", console.log)
   ```

You should see `{ durations, round, tasks, sessions }`. Closing and
reopening the popup restores the state — start a 25-minute session,
let it tick a few seconds, close the popup, reopen, the timer keeps
ticking from where it left off.

### 6. Verify the timer survives popup closes

The timer state lives entirely in `chrome.storage.local` and the
background service worker (`src/background.ts`) owns completion via
`chrome.alarms`:

1. Set a short duration (click the numerals → enter `1` → Enter).
2. Click **Start**.
3. Close the popup (click anywhere outside it).
4. Wait for the alarm. You should see a desktop notification
   (“Focus session complete”) and, on the next popup open, the mode has
   advanced to Short break, the round counter ticked up, and the active
   task's pomodoro count incremented.

Inspect the alarm directly:

1. `chrome://extensions/` → click **service worker** under the Pomotimer
   card. This opens devtools attached to the SW.
2. In its Console:
   ```js
   chrome.alarms.getAll(console.log)
   ```
   You should see one entry named `pomotimer:completion` with a
   `scheduledTime` matching `endsAt`.

While the popup IS open, the same alarm still fires; the popup's
`StoresProvider` is subscribed to `chrome.storage.onChanged`, so the BG's
post-completion write is mirrored back into the in-memory stores live.

### 7. Reset state

```js
chrome.storage.local.clear()
```

Then close + reopen the popup.

## Common pitfalls

- **"Manifest file is missing or unreadable"** — you pointed Chrome at
  `src/` instead of `dist/`. Always load the built folder.
- **Popup is blank** — open devtools on the popup (right-click inside →
  Inspect) and check the Console / Network tab.
- **Fonts look wrong** — the woff2 files are bundled into `dist/assets/`;
  if Chrome reports 404s, do a clean `rm -rf dist && pnpm build`.
