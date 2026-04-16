# BandGuy Frontend

BandGuy helps bands rehearse together online with synchronized playback of lyrics, tracks, and live jam sessions.

This repository contains the frontend monorepo for the web client. It is designed so each major app area can be developed and deployed independently while sharing common packages and static assets.

## What’s in this repo

- `apps/jam` — React/Vite SPA for live rehearsal sessions and lyrics playback
- `apps/mixingroom` — Svelte/Vite mixing room prototype
- `packages/shared` — shared source code and utilities
- `public` — root static assets served by the main Vite server
- `tests` — unit/component tests
- `storybook-static` — built Storybook output
- `vite.config.ts` — root Vite dev server and proxy configuration

## Features

- React-based jam SPA for local rehearsal flows
- Browser-side lyric caching
- Two track playback modes
- WebRTC-based session synchronization
- Separate SPA workspaces for lower runtime complexity

## Requirements

- Node.js 24+
- npm 10+
- Docker + Docker Compose
- .NET 10 SDK for the backend if running locally from source
- Hosts file entry: `127.0.0.1 syncup.local`

## Setup

1. Clone this repository and the backend repo:
   - `git clone https://github.com/SyncUpRocksLive/bandguy-frontend-web.git`
   - `git clone https://github.com/SyncUpRocksLive/bandguy-api-server.git`
2. Install dependencies from the root:
   - `npm run install-all`
3. Start the backend stack:
   - `cd bandguy-api-server/docker`
   - `docker compose up`
4. Start the frontend jam app:
   - `npm run dev-jam`
5. Open the app in your browser:
   - `http://syncup.local:7080/`

## Local architecture

The root Vite dev server runs on `port 9000` and serves static content from `public/`.
It proxies requests to active SPA workspaces:

- `/jam` → `http://localhost:5173`
- `/mixingroom` → `http://localhost:5174`
- `/api` → `http://localhost:9001`

This lets the frontend and backend share the same host/domain in local development.

## Available commands

From the repo root:

- `npm run install-all` — install root and workspace dependencies
- `npm run dev-jam` — start the root static server and `apps/jam` dev server
- `npm run dev-static` — start only the root static server
- `npm run build --workspaces` — build all workspace packages

From `apps/jam` workspace:

- `npm run dev --workspace=apps/jam` — run jam app dev server
- `npm run storybook --workspace=apps/jam` — start Storybook
- `npm run build-storybook --workspace=apps/jam` — build Storybook
- `npm run test --workspace=apps/jam` — run the jam workspace tests

From `apps/mixingroom` workspace:

- `npm run dev --workspace=apps/mixingroom` — run mixing room dev server

## Notes

- `apps/jam` is the main React application
- `apps/mixingroom` is a Svelte prototype app
- `apps/profile` is currently a placeholder workspace
- Root Vite proxies `/jam` and `/mixingroom`, while `/api` is forwarded to the backend service

## Troubleshooting

- Confirm `docker compose up` is running in `bandguy-api-server/docker`
- Confirm `syncup.local` maps to `127.0.0.1`
- Use `npm run install-all` after changing workspace dependencies

## Contributing

- Keep experiments in separate branches
- Document Storybook stories in `apps/jam/src/stories`
- Keep frontend changes aligned with the backend API contract in `bandguy-api-server`

## Related repos

- Backend API server: `https://github.com/SyncUpRocksLive/bandguy-api-server`

## License

GPL-3.0 License — see the `LICENSE` file for details.
