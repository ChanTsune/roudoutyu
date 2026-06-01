# Repository Guidelines

## Project Structure & Module Organization

This repository is a Tauri desktop app with a Next.js/React frontend. Frontend code lives in `src/`: `src/pages/` contains Next pages, `src/timer.tsx` contains the timer UI, `src/i18n/` contains localized strings, `src/atoms/` contains Recoil state, and `src/assets/` contains imported assets. Static files live in `public/`; documentation images live in `docs/images/`.

Rust/Tauri code lives in `src-tauri/`. Use `src-tauri/src/lib.rs` for Tauri setup and commands, `src-tauri/src/version.rs` for version data, `src-tauri/tauri.conf.json` for app configuration, and `src-tauri/capabilities/` for Tauri permission manifests. Generated schema files under `src-tauri/gen/` should not be hand-edited unless regenerating Tauri metadata.

## Build, Test, and Development Commands

- `yarn`: install JavaScript dependencies from `yarn.lock`.
- `yarn dev`: run the Next.js frontend on port `1420`.
- `yarn build`: build the Next.js app; this is part of CI.
- `yarn tauri dev`: run the desktop app locally through Tauri.
- `yarn tauri build --no-bundle`: compile the Tauri app without packaging, matching the test workflow.
- `yarn lint`: run Next.js and TypeScript ESLint checks.
- `yarn format`: format TypeScript files with Prettier.

## Coding Style & Naming Conventions

Use TypeScript for frontend code and Rust 2021 for backend/Tauri code. ESLint enforces type-aware TypeScript rules and double quotes. Prefer functional React components, PascalCase component names (`WorkTimer`), camelCase variables/functions, and small modules grouped by feature. Keep localized user-facing text in `src/i18n/locales/` rather than inline strings. Run `cargo fmt` in `src-tauri/` before committing Rust changes.

## Testing Guidelines

There is no dedicated unit test suite currently. For every change, run `yarn lint` and `yarn build`; for Tauri-facing changes, also run `yarn tauri build --no-bundle`. When adding tests, place frontend tests near the related component or module and use clear names such as `timer.test.tsx`. Rust unit tests should live beside the code they cover in `src-tauri/src/`.

## Commit & Pull Request Guidelines

Recent history uses short, imperative commit subjects such as `Bump tauri-plugin-dialog from 2.6.0 to 2.7.1 in /src-tauri`. Keep subjects concise and specific, and mention the affected package or area when useful.

Pull requests should include a brief description, linked issue when applicable, test/build commands run, and screenshots or screen recordings for visible UI changes. Note any Tauri permission or configuration changes explicitly because they affect desktop security and packaging.

