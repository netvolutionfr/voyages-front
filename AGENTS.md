# Repository Guidelines

## Project Structure & Module Organization
The Vite + React app lives in `src/`, where feature folders such as `pages/`, `providers/`, `auth/`, and `schemas/` keep UI, data layer, and validation concerns isolated. Shared UI primitives reside in `components/`, hooks in `hooks/`, and API helpers in `lib/`. Static assets live under `public/`, while the production bundle is generated into `dist/`. Deployment artefacts (Dockerfile, `deploy/`) and configuration (`vite.config.ts`, `tsconfig*.json`, `components.json`) sit at the repo root for quick reference.

## Build, Test, and Development Commands
- `npm run dev` — launches the Vite dev server with hot reload on http://localhost:5173.
- `npm run build` — runs TypeScript project references (`tsc -b`) and builds the optimized client bundle.
- `npm run preview` — serves the latest production bundle from `dist/` to verify deployments.
- `npm run lint` — applies the ESLint ruleset (TS + React Hooks + React Refresh) to every `ts/tsx` file.

## Coding Style & Naming Conventions
Use TypeScript for every module and the `@/` alias for files under `src/`. Prefer functional React components, PascalCase file names for components/layouts, and camelCase for hooks/utilities. Keep indentation at 4 spaces (as in `App.tsx`), single quotes for style imports, and double quotes elsewhere. Lean on Tailwind utility classes for layout, and colocate feature-specific styles with their components (e.g., `pages/voyages`). Run `npm run lint` before pushing; the config already ignores `dist/`.

## Testing Guidelines
No automated tests ship yet, so cover new features with Vitest + React Testing Library when practical. Place specs next to the code they exercise using the `*.test.ts(x)` suffix, and mock network calls at the provider layer. Until a coverage gate exists, target meaningful scenarios (auth flows, voyage CRUD, document filtering) and document any gaps in the PR description.

## Commit & Pull Request Guidelines
Follow the existing history by writing concise, present-tense subjects that state the change and motivation (e.g., `Improve voyage dashboard filtering`). Commits should be scoped per feature or fix; avoid bundling unrelated refactors. PRs must include: a summary of the change, screenshots or GIFs for UI updates, steps for reviewers to validate (`npm run dev`, route paths), and links to any tracked issues. Ensure lint/build pass locally before requesting review.

## Security & Configuration Tips
Never commit `.env` files; keep API endpoints, JWT signing data, and storage bucket names in local env vars or deployment secrets. The UI only consumes `VITE_API_URL` plus optional `VITE_FILES_BASE`, so sanitize any sample values before sharing. When debugging authentication, use the helpers in `src/auth/token.ts` and always route new HTTP calls through the providers so Authorization headers and error handling stay consistent.
