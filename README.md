# voyages-front

Résumé

Projet frontend React + TypeScript basé sur Vite. Cette application fournit l'interface d'administration et utilisateur pour gérer des voyages, participants et profils. Elle utilise TailwindCSS pour le style, Refine pour les composants d'administration et Keycloak pour l'authentification.

Prérequis

- Node.js (>= 18 recommandé)
- npm, yarn ou pnpm
- Git

Installation et mise en place locale

1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd voyages-front
```

2. Installer les dépendances

Avec npm

```bash
npm install
```

Ou avec pnpm

```bash
pnpm install
```

3. Configuration des variables d'environnement

Créez un fichier .env à la racine si nécessaire (ne pas committer) et ajoutez les variables attendues par le projet, p. ex. :

- REACT_APP_API_URL ou VITE_API_URL — URL de l'API backend
- VITE_KEYCLOAK_URL, VITE_KEYCLOAK_REALM, VITE_KEYCLOAK_CLIENT_ID — paramètres Keycloak si utilisés

(Vérifier dans le code ou la documentation interne du backend les noms exacts.)

4. Lancer l'application en développement

```bash
npm run dev
# ou
pnpm dev
```

L'application sera disponible par défaut sur http://localhost:5173 (ou le port indiqué par Vite).

Scripts utiles

- npm run dev — démarre le serveur de développement Vite (HMR)
- npm run build — compile TypeScript puis build Vite pour la production
- npm run preview — lance un serveur local pour prévisualiser le build de production
- npm run lint — exécute ESLint sur le projet

Technologies principales

- React 19 + TypeScript
- Vite (bundler et dev server)
- TailwindCSS
- Refine (bibliothèque d'administration)
- Keycloak (authentification)
- Zod (validation)

Structure du projet (résumé)

- src/ — code source de l'application
  - components/ — composants réutilisables et UI
  - pages/ — pages applicatives (voyages, participants, profil...)
  - providers/ — providers pour auth, data, access control
  - lib/ — utilitaires et configuration axios
  - schemas/ — schémas de validation
  - type/ — définitions de types

Conseils de développement

- Respecter les règles ESLint/TypeScript du projet. Le lint et les types sont exécutés lors du build.
- Pour ajouter de nouvelles routes/pages, suivez la convention existante dans src/pages et mettez à jour la configuration de routes si nécessaire.
- Pour modifier l'authentification Keycloak, regarder les providers dans src/providers et la configuration dans main.tsx.

Déploiement

1. Construire l'application

```bash
npm run build
```

2. Servir le dossier dist avec un serveur statique ou intégrer au pipeline de déploiement (Netlify, Vercel, Docker, etc.).

