# voyages-front

Interface web pour la gestion des voyages scolaires : inscription des élèves, suivi des documents, tableaux de bord administrateurs.

Construit avec React 19 + TypeScript, Vite, TailwindCSS v4, shadcn/ui et Refine. L'authentification repose exclusivement sur les **passkeys (WebAuthn)** et des JWT émis par le backend.

## Prérequis

- Node.js 24 (aligné avec la CI et l'image Docker de build)
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

## RGPD

Page `/profil/donnees` (`src/pages/profil/MesDonnees.tsx`) : droit d'accès — l'utilisateur télécharge une copie JSON de toutes ses données (`GET /me/data-export`), générée en mémoire via un `Blob` puis un lien `download` (jamais une navigation directe sur le blob). Les fonctions d'appel (export, rectification, effacement) sont centralisées dans `src/api/rgpd.ts` ; les types dans `src/type/rgpd.ts`.

**Rectification** : la fiche de renseignements (`/profil`) sépare désormais les champs modifiables en libre-service (sexe, téléphone, nom d'affichage — via `PATCH /me/profile`) des champs d'identité en lecture seule (prénom, nom, email, date de naissance, section), qui passent par une demande de rectification (`POST /me/rectification-request`) examinée par l'établissement — la demande ne modifie rien immédiatement.

**Traitement admin** : `/admin/rectifications` liste les demandes (filtrables par statut) et matérialise le flux imposé par le back en deux actions distinctes — appliquer le changement sur la fiche utilisateur (lien vers `/admin/users/edit/{id}`), puis clôturer la demande (« Marquer appliquée » / « Rejeter »), sans jamais confondre les deux.

L'effacement du compte est prévu dans une vague ultérieure.

## Intégration continue (CI)

Le workflow `.github/workflows/frontend-cicd.yml` applique une **barrière qualité bloquante** avant toute construction d'image, sur chaque push et pull request vers `master` (Node 24) :

| Étape | Commande | Effet si échec |
|---|---|---|
| Lint | `npm run lint` | Pipeline stoppé |
| Vérification des types + build | `npm run build` | Pipeline stoppé (`tsc -b` + bundle) |
| Audit des dépendances | `npm audit --audit-level=high` | Pipeline stoppé (vulnérabilité high/critical) |

Tant que ce job `quality` ne passe pas, les jobs de construction d'image (`build-and-push`) et de déploiement (`deploy_to_server`) ne démarrent pas. Pensez à exécuter `npm run lint` et `npm run build` en local avant de pousser.

Les actions JavaScript utilisées par le workflow (`actions/*`, `docker/*`, etc.) doivent rester sur des versions qui ciblent Node 24 ; ne réactivez pas `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24`, qui masque les actions encore déclarées en Node 20 au lieu de les corriger.

## Journalisation côté client

Les traces d'authentification WebAuthn et de décisions RBAC ne doivent pas être journalisées dans le navigateur. Le build de production Vite/Rolldown supprime également les appels `console.*` et les instructions `debugger` via la minification Oxc (`dropConsole` / `dropDebugger`) ; les avertissements utiles au développement restent donc limités aux builds locaux.

## Déploiement

```bash
npm run build
# Servir le dossier dist/ avec un serveur statique ou via Docker
```

Un `Dockerfile` et une configuration Nginx (`deploy/nginx.conf`) sont fournis. L'image construit le frontend avec `node:24-alpine`, puis sert `dist/` via Nginx. Les seuls arguments Vite attendus au build sont `VITE_API_URL` et `VITE_FILES_BASE`, identiques à ceux passés par la CI :

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.test/api \
  --build-arg VITE_FILES_BASE=https://files.example.test \
  -t voyages-front .
```

### En-têtes de sécurité

`deploy/security-headers.conf` ajoute, sur toutes les réponses, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` et `Strict-Transport-Security`. Le snippet est ré-inclus dans **chaque** `location` (nginx n'hérite pas les `add_header` quand une location définit les siens).

La **CSP** est volontairement livrée en `Content-Security-Policy-Report-Only` : elle ne casse pas le rendu et ne fait que signaler les violations dans la console du navigateur. À promouvoir en `Content-Security-Policy` (enforcing) après observation, idéalement en remplaçant les `https:` génériques de `connect-src`/`img-src` par les origines réelles de l'API (`VITE_API_URL`) et du stockage (`VITE_FILES_BASE`).

### Aperçu des documents

Le composant `DocumentPreviewDialog` n'ouvre un blob dans un nouvel onglet que pour les images (`image/*`) et les PDF (`application/pdf`). Les autres types MIME sont proposés en téléchargement via l'attribut `download` afin d'éviter la navigation vers un blob HTML same-origin.

Cette protection reste une défense en profondeur : le backend doit continuer à servir les fichiers utilisateur non prévisualisables avec `Content-Disposition: attachment`, un `Content-Type` non interprétable comme HTML, et les réponses Nginx doivent conserver `X-Content-Type-Options: nosniff`.
