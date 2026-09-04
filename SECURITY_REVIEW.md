# Focused frontend application-security review

Review date: 2026-09-04. Scope: the React/Vite repository only; no backend implementation was present. Backend requirements below are verification items, not claims of backend vulnerabilities.

## Threat model

CampusAway exposes travel, identity, family-contact, private-document, and health data to four roles (administrators, teachers, parents, and students). Relevant attackers are an authenticated user crossing a horizontal or vertical privilege boundary, an attacker obtaining script execution in the origin, a user of a shared browser following logout, and an untrusted file or URL supplied through backend data. The browser holds bearer access tokens and renders sensitive API responses, while an HttpOnly cookie can restore a session. The backend is the authorization boundary; route guards and conditional rendering only reduce accidental UI access.

## Architecture and data-flow map

* **Authentication:** passkey registration/authentication and OTP calls include cookies and an `X-XSRF-TOKEN` header for state-changing requests. Successful responses place the access JWT only in module memory. The refresh token is expected in an HttpOnly cookie. `apiFetch` refreshes before expiry and once after a 401, then adds the bearer token to API requests.
* **Identity/RBAC:** identity and role are decoded from the access JWT and cached in module memory for 60 seconds, with `/me` as fallback. `Authenticated`, `RequireCan`, `RequireAdmin`, menu conditions, and action conditions are UX gates only.
* **Sensitive data:** Refine/TanStack query state holds `/me`, family records, document metadata/blob responses, admin registration lists, and health-form JSON in memory. A GDPR export is parsed in memory, downloaded via a short-lived blob URL, and reduced to a non-sensitive summary in component state.
* **Documents/files:** self-service upload posts multipart data to `/me/documents/upload`; previews fetch `/documents/{documentPublicId}/preview` as an authenticated blob and revoke its blob URL on unmount. Trip covers use a backend-issued presigned URL for a direct PUT and persist only the returned object key in the trip form.

## Findings

| ID | Category | Severity | Confidence | Affected code | Exploitability / evidence |
|---|---|---:|---:|---|---|
| F-01 | Confirmed vulnerability (fixed) | High | High | `src/auth/http.ts`, `src/auth/token.ts` | A refresh promise could resolve after logout called `clearAuth()` and then save a fresh access token and identity, restoring the logged-out session. A generation check now discards responses belonging to cleared sessions. |
| F-02 | Likely risk; backend verification | High | High | `src/providers/dataProvider.ts`, `src/pages/voyages/VoyageDashboard.tsx` | Teacher-accessible dashboard requests use attacker-editable trip IDs, user public IDs, and document object IDs: `GET /trips/{tripId}`, `/trips/registrations?tripId=…`, `/users/{userPublicId}/documents?tripId=…`, `/users/{userPublicId}/health-form?tripId=…`, and `/documents/{docPublicId}/preview`. Backend must verify teacher assignment to that trip and participant membership on every request, and must bind each document to the authorized participant/trip. Possession of an ID must never suffice. |
| F-03 | Likely risk; backend verification | High | High | `src/providers/dataProvider.ts`, `src/pages/admin/users/*`, `src/pages/admin/rectifications/*`, `src/pages/admin/ImportCsvPage.tsx` | Generic CRUD constructs `/users/{publicId}`, `/sections/{id}`, `/trips/{id}` and rectification IDs directly. Admin-only UI does not protect these endpoints. Backend must independently require administrator role, constrain mass-assigned fields (especially `role` and relationships), and authorize each referenced object. |
| F-04 | Missing control | Medium | High | `src/auth/authProvider.ts`, `src/App.tsx` | Normal logout clears token/identity but uses SPA navigation. Refine query caches can remain in the JavaScript heap and may be reused during a later same-tab login. Account deletion correctly forces a full navigation, but logout does not explicitly clear application query caches or reload. Verify Refine clears all cached queries; otherwise inject/clear a dedicated query client or perform a full-page replacement after logout. |
| F-05 | Missing control | Medium | High | `deploy/security-headers.conf` | CSP is Report-Only, permits all HTTPS origins for connections/images, and has no reporting endpoint. It neither blocks injection nor produces centrally actionable reports. Move a tested, origin-pinned policy to enforcing mode. This is defense in depth; no plausible HTML injection sink was found in current application code. |
| F-06 | Sensitive-data exposure | Medium | Medium | `src/auth/api.ts`, multiple page error renderers | `ApiError` retains the complete backend error JSON in memory and often exposes backend `message` text in the UI. If the backend includes identifiers, validation objects, or operational details, these reach users and query/mutation state. Return stable public error codes/messages server-side and map them to generic UI messages for sensitive endpoints. |
| F-07 | Likely risk; backend verification | Medium | High | `src/pages/voyages/VoyagesForm.tsx` | The cover upload trusts a backend-returned presigned URL and sends file bytes to it. This is expected, but the backend must restrict bucket/key, MIME, size, expiry, and caller permission. The URL remains only in a local variable and is not logged or placed in history/persistent storage, which limits frontend leakage. |
| F-08 | Privacy minimization | Low | High | `src/pages/voyages/VoyageDashboard.tsx`, `src/providers/dataProvider.ts` | Registration rows include email and telephone before a participant detail sheet is opened, and opening the sheet fetches both document and full health-form payloads. Confirm teachers need all fields for the selected trip and consider separate, purpose-specific responses. This is a technical minimization concern, not a legal-compliance conclusion. |
| F-09 | Unsafe external resource assumptions | Low | Medium | `src/components/common/NavUser.tsx`, voyage cover components | Backend-provided avatar/cover URLs are inserted into image `src`; remote hosts can observe IP/timing and receive a strict-origin referrer. Browser image contexts do not create a demonstrated XSS flow here. Prefer an allowlisted image proxy or same-origin object delivery for private imagery. |

## Frontend authorization assumptions requiring backend enforcement

| UX decision | Sensitive backend operation | Required backend invariant |
|---|---|---|
| `Authenticated` wraps application routes | Every non-public endpoint | Validate the bearer token/session state for each request; a route can be called without rendering the UI. |
| `RequireCan(trips, create/edit)` allows teachers and admins | `POST /trips`, `PUT /trips/{id}`, cover presign | Enforce role and, for teachers, explicit assignment/scope; whitelist writable fields and referenced section/chaperone IDs. |
| Delete button appears only for admins | `DELETE /trips/{id}` | Require administrator role regardless of JWT claims used by the UI. |
| Voyage dashboard is shown to teachers/admins | Registration list filtered by `tripId`; participant documents and health forms | Verify the caller may manage the exact trip and that the user is a participant in it. Do not accept `tripId` merely as an authorization hint. |
| Admin routes are hidden/guarded | User/section CRUD, CSV import, rectification processing | Require active administrator privileges server-side; prevent role/relationship mass assignment and authorize rectification IDs. |
| Registration button follows client dates and checkbox | `POST /trips/registrations` with a client-selected `tripId` | Recheck eligibility, role, registration window, capacity, duplicate status, and permitted parent/child subject server-side. |
| Interest control uses a route trip ID | `POST /trip-preferences/{tripId}` | Bind the preference to the authenticated subject and validate trip visibility; ignore any client `userId`. |
| “My” pages use `/me/*` | Profile patch, family form, health form, document upload/preview/export/deletion | Derive the subject from authentication, not request data. For parent/child functionality, validate the relationship on every child object access. |
| Document preview uses a public/object UUID | `GET /documents/{docPublicId}/preview` | Resolve ownership/membership on every request and prevent cross-user/trip access even when a valid UUID is known. |

## Sensitive personal and health data

No access/refresh tokens, health data, document metadata, or GDPR exports are written to `localStorage`, `sessionStorage`, IndexedDB, query strings, logs, or telemetry by application code. The sole local-storage use is the non-sensitive theme. Access JWT and identity are module-memory values; refresh is cookie-backed. Document blob URLs are revoked, and the GDPR export blob URL is immediately revoked without navigating to it.

Health JSON is fetched into Refine query state and separately parsed into component memory. Admin/teacher dashboard queries also retain participant names, email, telephone, document metadata, and health content. These values can survive component unmount according to query-cache lifetime; F-04 is therefore especially relevant on shared browsers. The GDPR export intentionally contains family identity, document metadata, registrations, and health payload, so the backend must scope family relationships carefully and return `Cache-Control: no-store` on sensitive responses.

## XSS and browser-boundary review

No `dangerouslySetInnerHTML`, raw HTML/Markdown renderer, script injection, iframe, or `postMessage` flow was found. Backend text is rendered through React text nodes. Document content is converted to a blob URL and rendered only as an image or PDF based on MIME; other types are download-only. File names used in `download` attributes strip control and filesystem-special characters. External links found are fixed constants, not user-controlled redirects. CORS is not used as authorization in application logic.

Authentication is hybrid: bearer access JWT plus an HttpOnly refresh cookie. State-changing cookie-backed auth/WebAuthn calls attach the double-submit CSRF header. Backend verification remains necessary for cookie `Secure`, `HttpOnly`, and appropriate `SameSite` attributes, strict CORS allowlisting with credentials, CSRF token rotation/binding, and rejection of state-changing cookie-authenticated calls without the header. Bearer-protected API helpers currently also send cookies, so backend endpoint authentication semantics should be explicit rather than ambiguously accepting either credential.

## Positive findings

* Access tokens are memory-only; refresh tokens are not accessible to JavaScript by design.
* API object IDs are URL-encoded, preventing path/query delimiter confusion.
* `/me/profile` explicitly whitelists mutable fields.
* Document preview/download uses authenticated fetch, short-lived blob URLs, cleanup, restricted preview types, and sanitized download names.
* Presigned upload URLs are not persisted, logged, or inserted into browser history.
* Production minification removes console/debugger statements; no application logging of sensitive values was found.
* Nginx supplies HSTS, `nosniff`, frame denial, referrer, and permissions headers on each location.
* Account deletion requires a second-step OTP and performs a full reload after clearing auth state.

## Fix applied

The auth store now increments a session generation whenever authentication is cleared. A refresh records the generation at start and discards its parsed response if logout, account deletion, or terminal authentication failure cleared the session while it was in flight. This preserves ordinary refresh deduplication while preventing session resurrection.

## Testing constraints and residual risks

The repository has no test script or Vitest dependency. Adding a runner solely for one internal module race test would be disproportionate to this focused fix; lint and production build are the available regression checks. A future auth test suite should mock a delayed refresh, call `clearAuth`, resolve the refresh successfully, and assert that `readAuth()` remains null and `refreshIfNeeded()` returns false.

Residual risk is dominated by backend enforcement that cannot be established here: trip-teacher scope, parent-child scope, per-document authorization, health-data purpose limitation, admin role changes, refresh-cookie/CSRF configuration, cache headers, upload scanning/content validation, and session revocation. The highest-value next review is a backend endpoint-by-endpoint authorization test using two users in every role, attempting cross-trip, cross-child, cross-participant, cross-document, and vertical role access; include presigned upload/preview issuance, health endpoints, GDPR export, rectification, deletion, and concurrent refresh/logout tests.
