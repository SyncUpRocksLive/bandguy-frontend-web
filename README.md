# BandGuy Frontend (React)
Real-time collaborative band rehearsal tool — frontend SPA for SyncRock's BandGuy project

BandGuy helps bands rehearse together online with synchronized playback of lyrics and tracks. 
This repository contains the React frontend SPA for local development and testing.

## Features (Proof-of-Concept)
- React SPA for local rehearsal sessions
- Browser-based lyric file caching
- Two track playback types
- WebRTC-based network sync
- Sample login/signout for testing

## Repo Structure
- `/src` – Main React app components and logic
- `/public` – Static assets
- `/express_server` – Local API stub for WebRTC signaling & sample login (only for local dev testing)
- `/tests` – Component/unit tests
- `.storybook` – Storybook UI component explorer
- `vite.config.ts` – Vite build configuration

## Running Locally

1. Clone the repo:
   git clone https://github.com/SyncRock/bandguy-frontend-react.git
2. Install dependencies:
   npm install
3. Start local dev server + WebRTC stub:
   npm run dev
4. Open the app in your browser at http://localhost:5173

## Running Locally

1. Clone the repo:
   git clone https://github.com/SyncRock/bandguy-frontend-react.git
2. Install dependencies:
   npm install
3. Start local dev server + WebRTC stub:
   npm run dev
4. Open the app in your browser at http://localhost:9000

## Tests
- Run unit/component tests:
  npm run test
- Run Storybook:
  npm run storybook

## Contributing
- Pull requests welcome - must agree to code committer requirements
- Use `npm run dev` for local development
- Keep experiments in separate branches
- Storybook components should be documented with examples

## License
GPL-3.0 License — see LICENSE file for details.

## Architecture Diagram

![BandGuy Frontend Architecture](assets/flow.png)
