# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server on http://localhost:5173
npm run build     # tsc -b && vite build (type-check + bundle)
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test framework is configured.

## Environment variables

Copy `.env.example` to `.env.development`:

```
VITE_API_URL=http://localhost:8080/api   # Backend REST API base URL
VITE_FILES_BASE=                          # S3/CDN base URL for documents
```

In dev mode, Vite proxies `/api` → `http://localhost:8080`, so direct `/api/...` fetch calls also work in the browser without CORS.

## Architecture

### Tech stack

- **React 19 + TypeScript**, bundled with **Vite 8**
- **TailwindCSS v4** (Vite plugin, CSS variables, no `tailwind.config.js`)
- **shadcn/ui** "new-york" style — components live in `src/components/ui/`, icon library is `lucide-react` (+ `@tabler/icons-react` is also used)
- **Refine** (`@refinedev/core`) for resource/data/auth/access-control wiring
- **React Router v7** for routing
- **Zod** + **react-hook-form** + `@hookform/resolvers` for form validation

### Path alias

`@` resolves to `src/`. Always use `@/...` imports, never relative paths that cross directory boundaries.

### Authentication (`src/auth/`)

Authentication is **WebAuthn/passkeys only** — there is no password flow. The full auth stack:

| File | Role |
|------|------|
| `token.ts` | `StoredAuth` shape, `localStorage` persistence (`auth.jwt`), JWT decode helpers, expiry check |
| `http.ts` | `apiFetch()` — wraps `fetch`, injects `Authorization` header, proactively refreshes expired access tokens (via `/auth/refresh`), retries once on 401 |
| `api.ts` | `api.get/post/put/patch/delete` typed wrapper over `apiFetch`; throws `ApiError` on non-2xx |
| `passkeys.ts` | WebAuthn browser API calls for registration and authentication (one-step and two-step flows) |
| `session.ts` | In-memory identity cache (60s TTL); fast-path reads identity from the JWT payload |
| `authProvider.ts` | Refine `AuthProvider` — `check()` reads `localStorage`, `getIdentity()` calls `/me` |
| `accessControlProvider.ts` | Refine `AccessControlProvider` — evaluates `RULES` from `rbac.ts` against cached identity |
| `rbac.ts` | Static `RULES` table mapping `resource → action → Role[]` |
| `types.ts` | `Role` union, `Me` interface |

Roles: `ADMIN`, `TEACHER`, `PARENT`, `STUDENT`, `USER`.

Login flow: `/login` → passkey assertion → JWT saved via `saveAuth()` → redirect to `/` (or `/otp` if status `PENDING`).

### Data layer (`src/providers/`)

Two Refine data providers:

- **`voyagesDataProvider`** (default) — authenticated API calls via `api.*`. Handles Spring's Pageable response shape `{ content: T[], page: { totalElements: number } }`. Contains special-cased resources (`admin-registrations`, `admin-user-documents`, `admin-user-health`, `admin-document-preview-url`, `sections`, `me`, `me/health-form`, `me/documents`).
- **`publicDataProvider`** — unauthenticated calls (no `Authorization` header).

When using `useList` with `voyagesDataProvider`, pass backend-specific query params through `meta.query` or `meta.includeDocSummary` etc.

### Routing (`src/App.tsx`)

Three tiers:
1. **Public** — `/login`, `/register` (no auth required)
2. **OTP-gated** — `/otp` (requires a temporary JWT to be present)
3. **Protected** — wrapped in `<Authenticated>` + `<DashboardLayout>`. Admin sub-routes (`/admin/*`) additionally wrapped in `<RequireAdmin>`.

Refine resources are declared in `src/config/resources.ts`. Menu items in `src/config/menu.ts` and `src/config/menu-profil.ts`.

### Forms and schemas

Each feature area has a Zod schema in `src/schemas/` and uses `react-hook-form` with `@hookform/resolvers/zod`. Form pages follow the pattern `XxxForm.tsx` co-located with their list page in `src/pages/<feature>/`.

### UI conventions

- Reuse `src/components/ui/` primitives (shadcn/ui) before introducing new dependencies.
- Data tables use `src/components/ui/data-table.tsx` (TanStack Table via `@refinedev/react-table`).
- Toast notifications via `sonner`.
- Theme (light/dark) managed by `src/components/common/ThemeProvider.tsx`.

### Admin-only pages

Use `<RequireAdmin>` wrapper (checks `ADMIN` role via Refine access control) and place pages under `src/pages/admin/`.
