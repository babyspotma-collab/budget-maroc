# Budget Maroc

PWA de suivi de budget personnel pour le Maroc : dépenses, budgets par catégorie avec alertes,
statistiques. Interface en **français** et **arabe (RTL)**, montants en **MAD**.
Tout est stocké localement dans le navigateur (IndexedDB) : aucun serveur, aucune donnée envoyée.

## Démarrer

```bash
git clone https://github.com/babyspotma-collab/budget-maroc.git
cd budget-maroc
npm install
npm run dev
```

L'application est servie sur http://localhost:5173.

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | vérification TypeScript puis build de production (`dist/`) |
| `npm run preview` | sert le build de production |
| `npm test` | tests unitaires (Vitest) |
| `npm run typecheck` | vérification TypeScript seule |
| `npm run icons` | régénère les icônes PNG de la PWA |

## Fonctions

- **Programme personnalisé** : questionnaire de 10 questions, puis budget par catégorie, budget du jour,
  objectif d'épargne daté, 3 à 5 règles adaptées au profil et plan de la première semaine.
  Le moteur de règles (src/domain/plan.ts) est pur et testé ; « Appliquer » crée les budgets.
- **Ajout rapide en 2 clics** : « + », montant, puis un clic sur la catégorie. Annulation possible.
- **Dépenses** groupées par jour, modification et suppression avec « Annuler ».
- **Catégories** prédéfinies, personnalisables (nom, icône, couleur) et masquables.
- **Budgets par catégorie** : report automatique d'un mois à l'autre, modifiable par mois,
  alertes à 80 % et 100 %.
- **Reste à vivre** à partir du revenu du mois.
- **Statistiques** : répartition par catégorie (anneau) et courbe cumulée du mois,
  comparée au mois précédent.
- **Données de démo** : chargement et effacement depuis « Plus » (les vraies données ne sont jamais touchées).

À venir : module Daret, module Dettes, dépenses récurrentes, export/import.

## Stack

React 19, Vite, TypeScript, Tailwind CSS 4, Dexie (IndexedDB), react-i18next,
Recharts, vite-plugin-pwa, Vitest.

## Structure

```
src/
├─ app/          coque (navigation, bouton « + »), préférences langue/chiffres, messages
├─ components/ui composants de base (boutons, cartes, champs, feuille, anneau…)
├─ db/           schéma Dexie, types, catégories prédéfinies
├─ domain/       logique métier pure et testée (montants, dates, budgets, stats, plan, démo)
├─ features/     écrans par domaine (expenses, categories, budgets, stats, income, onboarding, program, demo, more)
└─ i18n/         traductions fr.json / ar.json
```

Icônes : un seul composant, `<CategoryIcon />` (`src/components/ui/CategoryIcon.tsx`), regroupe le registre
d'icônes Phosphor (duotone), la forme des badges (étoile à 8 branches) et l'inversion RTL des icônes
directionnelles : changer de style se fait à cet endroit.

Conventions : montants en **centimes entiers**, dates `YYYY-MM-DD`, mois `YYYY-MM`.
La logique métier vit dans `domain/` sans dépendance à React ni à la base.
