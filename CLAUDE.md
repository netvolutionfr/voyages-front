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

## CI quality gate

`.github/workflows/frontend-cicd.yml` runs a **blocking** `quality` job on every push and pull request to `master` (Node 24): `npm ci` → `npm run lint` → `npm run build` (`tsc -b` + bundle) → `npm audit --audit-level=high`. The image build (`build-and-push`) and deploy (`deploy_to_server`) jobs only start if `quality` passes. Keep `npm run lint` and `npm run build` green locally before pushing — a failure now stops the pipeline instead of being swallowed.

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
| `token.ts` | `StoredAuth` shape, **in-memory** access-token storage (refresh token lives in an httpOnly cookie), JWT decode helpers, expiry check; `clearAuth()` also purges the identity cache |
| `http.ts` | `apiFetch()` — wraps `fetch`, injects `Authorization` header, proactively refreshes expired access tokens (via `/auth/refresh`, with X-XSRF-TOKEN header and a short cooldown after a failed refresh), retries once on 401 |
| `api.ts` | `api.get/post/put/patch/delete` typed wrapper over `apiFetch`; `delete` accepts an optional body (needed for `DELETE /me` with an OTP); throws `ApiError` on non-2xx |
| `csrf.ts` | Shared `xsrfHeader()` helper — reflects the `XSRF-TOKEN` cookie for cookie-backed endpoints (refresh, logout, WebAuthn) |
| `passkeys.ts` | WebAuthn browser API calls for registration and authentication (one-step and two-step flows), all through `authApi` (`VITE_API_URL` + CSRF) |
| `session.ts` | In-memory identity cache (60s TTL); fast-path reads identity from the JWT payload |
| `authProvider.ts` | Refine `AuthProvider` — `check()` reads the in-memory token, restores via `/auth/refresh` cookie; awaited server-side `logout`; `onError` forces logout on 401 |
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

### GDPR (`src/api/rgpd.ts`, `src/type/rgpd.ts`)

`src/api/rgpd.ts` wraps the backend's GDPR endpoints (right of access, rectification, erasure), all authenticated via the `Authorization` header (no CSRF surface, unlike the cookie-backed auth endpoints):

- `fetchDataExport()` → `GET /me/data-export` — fetched as JSON and turned into a client-side `Blob` download (never navigated to directly, since `Content-Disposition` would be useless without the in-memory bearer token).
- `patchMyProfile()` → `PATCH /me/profile` (replaces the deprecated `POST /me` for `telephone`/`displayName`/`gender`).
- `createRectificationRequest()` → `POST /me/rectification-request` for identity fields that aren't self-editable (`firstName`, `lastName`, `birthDate`, `email`).
- `requestAccountDeletion()` / `confirmAccountDeletion(otp)` → the two-step self-service erasure flow (`POST /me/delete-request` then `DELETE /me`).
- `patchRectificationRequest()` → admin-side `PATCH /users/rectification-requests/{id}`.

Types for all of the above live in `src/type/rgpd.ts`. The export page (`/profil/donnees`, `src/pages/profil/MesDonnees.tsx`) is the first consumer.

**Rectification** (`src/pages/profil/FicheRenseignements.tsx`): split into a read-only identity block (`firstName`, `lastName`, `email`, `birthDate`, `section` — none of these are in the `PATCH /me/profile` contract) and an editable block (`gender`, `telephone`, `displayName`) submitted through `dataProvider.update({ resource: "me" })`, which now whitelists exactly those 3 fields before calling `PATCH /me/profile` — it no longer calls the deprecated `POST /me`. The identity block's "Demander une rectification" button opens `RectificationRequestDialog.tsx`, which posts to `/me/rectification-request` and always shows a "transmitted, processed within 1 month" message — it never implies the change is already applied.

⚠️ **Known backend gap**: `GET /me` (`UserResponse`) does not return `displayName`, even though `PATCH /me/profile` accepts it and the data export DTO includes `profile.displayName`. The form currently can't prefill this field with its stored value — flagged for the backend team, not solved client-side.

⚠️ **`section` is now read-only in the UI** (per product decision): it isn't part of `PATCH /me/profile` nor a rectification field. Changing it requires an admin (`PUT /users/{id}`, existing `UsersForm.tsx`).

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
