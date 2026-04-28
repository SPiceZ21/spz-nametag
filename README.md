# spz-nametag
> Dynamic Racing Nametags · `v1.1.5`

## Scripts

| Side   | File              | Purpose                                              |
| ------ | ----------------- | ---------------------------------------------------- |
| Client | `config.lua`      | Client-side configuration                            |
| Client | `client/main.lua` | Nametag rendering, NUI bridge, visibility logic      |
| Server | `config.lua`      | Server-side configuration                            |
| Server | `server/main.lua` | Player data provision, state sync to clients         |

## NUI

**Stack:** Vite · Preact · TypeScript · spz-ui

```
ui/
├── src/
│   ├── app.tsx
│   ├── components/       # spz-ui components
│   └── styles/
└── dist/                 # built output (served by FiveM)
    └── index.html
```

Build: `cd ui && npm run build`

## Dependencies
- spz-lib
- spz-core

## CI
Built and released via `.github/workflows/release.yml` on push to `main`.
