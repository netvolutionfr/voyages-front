# Mainteneurs – Projet Voyages Scolaires

## Mainteneur principal
- @netvolutionfr (Stanis Humez)

## Mainteneurs secondaires
---

## Gouvernance du projet

- **Workflow** : toute évolution passe par une Issue → branche → Pull Request.
- **Revue** : toute PR externe est relue par un mainteneur avant merge. L'approbation n'est pas imposée techniquement tant qu'il n'y a qu'un mainteneur ; passer à 1 approbation requise dès qu'un second mainteneur rejoint le projet.
- **Protection de la branche `master`** (règle GitHub active, administrateurs compris) :
    - Aucun push direct n’est autorisé ; force-push et suppression interdits.
    - Les merges doivent se faire via Pull Request.
    - Le job CI `quality` doit réussir, sur une branche à jour avec `master`.
- **Releases** :
    - Les mainteneurs publient les versions officielles sous forme de tags (`vYYYY-Sn`).
    - Les corrections urgentes sont publiées en *hotfix*.

---

## Décisions de roadmap

- Les mainteneurs définissent la feuille de route en fonction des besoins pédagogiques et métiers.
- Les contributions extérieures sont bienvenues mais validées selon leur pertinence pour le projet.

---

## Contact

Pour toute question ou proposition de contribution, ouvrez une [Issue](./.github/ISSUE_TEMPLATE).
