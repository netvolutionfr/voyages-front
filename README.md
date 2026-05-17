# voyages-front

Interface web pour la gestion des voyages scolaires : inscription des élèves, suivi des documents, tableaux de bord administrateurs.

Construit avec React 19 + TypeScript, Vite, TailwindCSS v4, shadcn/ui et Refine. L'authentification repose exclusivement sur les **passkeys (WebAuthn)** et des JWT émis par le backend.

## Prérequis

- Node.js ≥ 18
- Backend `voyages-back` disponible sur `http://localhost:8080`

## Installation

```bash
npm install
cp .env.example .env.development
# Éditer .env.development si nécessaire
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL de base de l'API REST (ex : `http://localhost:8080/api`) |
| `VITE_FILES_BASE` | URL de base pour les documents (S3 / CDN) |

En développement, Vite proxifie `/api` → `http://localhost:8080`, donc les appels directs `/api/…` fonctionnent sans CORS.

## Commandes

```bash
npm run dev      # Serveur de développement (http://localhost:5173, HMR)
npm run build    # Vérification TypeScript + bundle de production
npm run preview  # Prévisualiser le build de production en local
npm run lint     # ESLint
```

## Architecture

```
src/
├── auth/          # JWT, passkeys (WebAuthn), session, RBAC
├── components/
│   ├── common/    # Layout, sidebar, thème, flux passkey
│   ├── layout/    # DashboardLayout
│   └── ui/        # Composants shadcn/ui
├── config/        # Ressources Refine, menus
├── pages/
│   ├── admin/     # Sections, utilisateurs, import CSV
│   ├── profil/    # Fiche renseignements, parents, sanitaire
│   └── voyages/   # Liste, détail, dashboard, formulaire
├── providers/     # Data providers Refine (authentifié + public)
├── schemas/       # Schémas de validation Zod
└── type/          # Types TypeScript partagés
```

**Authentification** : passkeys uniquement (WebAuthn). L'access token est stocké en mémoire ; le refresh token est géré exclusivement via un cookie `httpOnly` côté serveur. Le refresh est automatique et transparent, y compris après rechargement de page.

**Rôles** : `ADMIN`, `TEACHER`, `PARENT`, `STUDENT`, `USER`. Les règles sont définies dans `src/auth/rbac.ts`.

**Data layer** : deux providers Refine — `voyagesDataProvider` (authentifié) et `publicDataProvider` (sans auth). Le backend renvoie des réponses paginées Spring : `{ content: T[], page: { totalElements: number } }`.

## Déploiement

```bash
npm run build
# Servir le dossier dist/ avec un serveur statique ou via Docker
```

Un `Dockerfile` et une configuration Nginx (`deploy/nginx.conf`) sont fournis.
