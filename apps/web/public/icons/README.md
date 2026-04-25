# PWA icons

Production builds need PNG icons referenced from the manifest:

- `icon-192.png` — 192×192
- `icon-512.png` — 512×512
- `icon-maskable-512.png` — 512×512, `purpose: maskable`

Generate from `apps/web/public/favicon.svg` using e.g.:

```sh
# requires `sharp-cli` or similar
npx @squoosh/cli --resize '{"width":192,"height":192}' favicon.svg -d icons/
```

Until these exist, the manifest will register but the install banner
won't show on most browsers.
