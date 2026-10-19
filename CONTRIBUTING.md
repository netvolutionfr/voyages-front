# Contribuer au projet Voyages Scolaires

Merci de votre intérêt pour contribuer à ce projet éducatif !

## Workflow de contribution

1. **Forkez** le dépôt (ou créez une branche si vous êtes membre de l’organisation).
2. **Créez une issue** pour toute nouvelle fonctionnalité, correction de bug ou proposition.
3. **Nommez votre branche** de façon claire :
    - `feat/<id-issue>-courte-description`
    - `fix/<id-issue>-courte-description`
4. **Commitez avec des messages clairs**, en respectant les [Conventional Commits](https://www.conventionalcommits.org/).
    - Exemple : `feat(auth): ajout de l’authentification par token (#12)`
5. **Ouvrez une Pull Request** vers la branche `master` (aucun push direct possible, voir ci-dessous) :
    - Utilisez le template PR fourni.
    - Liez l’issue correspondante dans la description : `Closes #<id-issue>`.
6. **Attendez la CI** : le job `quality` (lint, build, audit) doit être vert, et la branche à jour avec `master`.

## Revue de code et fusion
- `master` est protégée sur GitHub : PR obligatoire pour tout le monde, administrateurs compris ; push direct, force-push et suppression interdits.
- Toutes les PR doivent passer le job CI `quality` et être à jour avec `master` avant fusion.
- Aucune approbation n'est exigée techniquement tant que le projet n'a qu'un mainteneur (GitHub interdit d'approuver sa propre PR) ; une relecture reste attendue pour les contributions externes.
- Fusionner dans `master` déclenche le déploiement en production : ne fusionnez qu'une fois le backend correspondant déployé.
- Les merges se font avec **Squash & Merge** pour garder un historique clair.

## Code de conduite
En contribuant, vous acceptez de respecter le [Code of Conduct](CODE_OF_CONDUCT.md) (basé sur le Contributor Covenant).

## Gouvernance
- Le dépôt officiel et ses releases sont maintenus par le responsable du projet.
- Les étudiants et autres contributeurs peuvent proposer des PR, soumises à revue.
- Les décisions sur la roadmap appartiennent aux mainteneurs principaux.

Merci pour vos contributions 🎉
