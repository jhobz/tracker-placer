# Tracker Placer

A web-based map builder for [Poptracker](https://github.com/black-sliver/PopTracker) pack development.

## Features

- 🗺️ **Upload map images** — drag & drop or click to upload one or multiple PNG/JPG/GIF/WebP images
- 📍 **Place location boxes** — click anywhere on a map image to drop a location box at that spot
- ✏️ **Edit location properties** — name, icons (`chest_unopened_img`, `chest_opened_img`), `inherit_icon_from`, access rules, visibility rules, and sections
- 📦 **Multiple locations per box** — each location box can hold one or more Poptracker locations
- 📋 **Section editor** — configure section name, item count, hosted item, access/visibility rules, and chest images
- 🎨 **Light & dark theme** — toggle via the sun/moon icon in the top-right corner
- 💾 **Export JSON** — generates `maps.json` and `locations.json` in Poptracker-compatible format

## Getting Started

```sh
bun install
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building

```sh
bun build
bun preview
```

## Tech Stack

- [Svelte 5](https://svelte.dev/) (runes-based reactivity)
- TypeScript
- [Vite](https://vitejs.dev/) via SvelteKit
- [Tailwind CSS 4](https://tailwindcss.com/)
- [DaisyUI 5](https://daisyui.com/)
