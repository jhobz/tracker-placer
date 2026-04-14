# Tracker Placer

A web-based map builder to assist in [Poptracker](https://github.com/black-sliver/PopTracker) pack development.

## Features

- **Upload map images** — drag & drop or click to upload one or multiple PNG/JPG/GIF/WebP images
- **Place location boxes** — click anywhere on a map image to drop a location box at that spot
- **Edit location properties** — name, icons (`chest_unopened_img`, `chest_opened_img`), access rules, visibility rules, and sections
- **Multiple locations per box** — each location box can hold one or more Poptracker locations
- **Section editor** — configure section name, item count, hosted item, access/visibility rules, and chest images
- **Export JSON** — generates `maps.json` and `locations.json` in Poptracker-compatible format

## Usage

If you just want to use the tool, simply use the [web interface](https://jhobz.github.io/tracker-placer) directly. Everything is saved in client-side storage, so no account needed.
Or you can clone the repository and follow the Getting Started section under Development.

## Developing

### Getting Started

```sh
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building

```sh
pnpm build
pnpm preview
```
