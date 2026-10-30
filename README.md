# spz-nametag

> Nametags with rank, crew and record crowns.

![version](https://img.shields.io/badge/version-1.2.0-ff6200) ![SPiceZ-Core](https://img.shields.io/badge/SPiceZ--Core-beta-18181b)

## Overview

Draws a nametag over nearby players with their name, rank, crew and a crown if they hold a track record.

## Features

- Rank and crew tags
- Record crowns
- Distance fade

## Requirements

None — runs on its own.

## Installation

Included in the [txAdmin recipe](https://github.com/SPiceZ21/spz-txrecipe). Manual install:

1. Download `spz-nametag` from GitHub (latest release, or the repository) into your `resources` folder.
2. Add to `server.cfg`:

```cfg
ensure spz-nametag
```

## Configuration

- `config.lua`

See the file for every option.

## Commands

| Command | Who | Description |
|---|---|---|
| `/syncnametags` | dev | Force a nametag resync |

## Key binds

Rebindable in **Settings → Key Bindings → FiveM**.

| Action | Default |
|---|---|
| Toggle player nametags | `F10` |

---

Part of **SPiceZ-Core** — [documentation](https://github.com/SPiceZ21/Docs) · [all modules](https://github.com/SPiceZ21/Docs/blob/main/modules/README.md)
