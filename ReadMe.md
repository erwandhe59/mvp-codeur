# Immo Agents — MVP (Frontend only)

Ouvrez `index.html` dans un navigateur.

## Fonctionnalités
- Landing + Auth fictive (localStorage)
- 4 agents (Mandat, Formulaire, Analyse, Home Staging)
- Génération **Mock** à partir de templates
- Export PDF via `window.print()` dans une fenêtre dédiée
- Historique en `localStorage`
- Réglages : tonalité, niveau de détail, et branchement **optionnel** à une API LLM (clé, URL, modèle)

> Attention : exposer une clé d'API dans le frontend n'est pas sécurisé (démo uniquement).

## Prochaine étape (Roadmap)
- V1.1 : backend (auth réelle, stockage, sécurisation)
- V1.2 : équipes, partage, facturation
- V1.3 : modèles immobiliers FR + signature électronique
