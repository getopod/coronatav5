# Coronata Game AI Coding Agent Instructions

## Project Overview
- **Coronata** is a rogue-like solitaire game built with React and TypeScript, featuring custom progression, dynamic card interactions, and enhanced scoring.
- The codebase is modular, with clear separation between engine logic (`src/debug/engine/`), UI components (`src/ui/`), and registry/configuration (`src/registry/`).
- Mobile implementation lives in `mobile/Coronatafresh/`.

## Architecture & Key Patterns
- **Game Engine**: Core logic in `src/debug/engine/` (e.g., `effectEngine.ts`, `encounterFlow.ts`, `enhancedScoring.ts`).
  - Game modes and scoring are extensible via `gameModeProfiles.ts` and `enhancedScoring.ts`.
- **UI**: React components in `src/ui/` (e.g., `GameScreen.tsx`, `CoronataWelcomeScreen.tsx`).
  - Follows functional component and hooks patterns.
- **Registry System**: Keyword and effect registries in `src/registry/`.
  - Use registry loader utilities for dynamic keyword/effect loading.
- **Assets**: All game assets (images, SVGs, etc.) are in `src/assets/`.

## Developer Workflows
- **Automation**: Use `scripts/build-automation.ps1` for all major workflows:
  - `install`: Install dependencies
  - `dev`: Start Vite dev server
  - `test -Coverage -Watch`: Run Jest tests (with coverage/watch)
  - `lint -Fix`: Run ESLint and auto-fix
  - `build`: Production build
  - `electron`: Build Electron desktop app
  - `release`: Prepare release (with git validation)
  - `full-check`: Run lint, test, build, and analyze in one step
- **Run scripts from PowerShell in project root.**
- **Troubleshooting**: If you hit execution policy errors, run PowerShell as Administrator or adjust policy.

## Project-Specific Conventions
- **Game Modes**: Set `VITE_GAME_MODE=coronata` for Coronata mode (see `.env` or build scripts).
- **Scoring**: Enhanced scoring auto-integrates with Coronata features; see `enhancedScoring.ts`.
- **Registry Loading**: Use loader utilities for dynamic registry population; avoid hardcoding keywords/effects.
- **Testing**: Tests are in `test/` and follow Jest conventions. Use automation script for coverage and watch mode.

## Integration Points
- **Electron**: Desktop builds via `electron-main.js` and `electron.js`.
- **Vite**: Main dev/build tool (`vite.config.js`).
- **Node.js**: Required for all automation and builds.

## Examples
- To add a new game mode: Extend `gameModeProfiles.ts` and update registry/config as needed.
- To add a new effect/keyword: Update `src/registry/` and use loader utilities for registration.
- To run all checks: `./scripts/build-automation.ps1 full-check`

## References
- See `README.md` for high-level project description and file structure.
- See `scripts/README.md` for automation details and troubleshooting.

---
**Feedback:** If any section is unclear or missing, please specify so it can be improved for future AI agents.
