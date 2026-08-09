# spz-nametag

> 3D player nameplates · `v1.1.6`

## Overview

`spz-nametag` draws minimal nameplates above players and their cars — name, rank and crew
tag — with distance and occlusion rules so the field stays readable during a race. Player
data is supplied by the server and cached on the client.

## Structure

| Side | File | Purpose |
|---|---|---|
| Client | `config.lua` | Draw distance, scale, visibility rules |
| Client | `client/main.lua` | Rendering, NUI bridge, visibility logic |
| Server | `config.lua` | Server-side configuration |
| Server | `server/main.lua` | Player data provision and sync |

## NUI

Vite · Preact · TypeScript on the [spz-ui](../spz-ui/README.md) component set.

```bash
cd ui && npm install && npm run build   # → ui/dist/index.html
```

## Commands

| Command | Effect |
|---|---|
| `/syncnametags` | Force a re-sync of nametag data |

## Dependencies

`ox_lib` · `spz-core`

---

Part of [SPiceZ-Core](../README.md) · GPL-3.0
