# 🎣 Mini‑Jeu de Pêche

Un mini‑jeu de pêche jouable dans le navigateur. Déplace l’hameçon, adapte ton pattern d’appât selon l’espèce, gère la tension de la ligne et enchaîne les prises pour battre ton record.

---

## 🚀 Démarrage rapide

- Ouvrir simplement `index.html` dans ton navigateur moderne (Chrome, Edge, Firefox, Safari).
- Alternativement, lancer un petit serveur local puis ouvrir l’URL indiquée :

```bash
# Node (via npx)
npx serve .

# Python 3
python -m http.server 5500
```

---

## 🎮 Contrôles

- Souris
  - Déplacer: bouger le curseur sur le `canvas` pour positionner l’hameçon
  - Clic: lancer/ferrer selon le contexte
  - Maintenir: rembobiner/ramener la ligne pendant le combat
- Clavier
  - `Échap` (Esc): fermer la fenêtre de jeu/retour

### 📱 Contrôles mobiles

- Tap court (au repos): lancer la ligne
- Tap court (quand un poisson mord): ferrer
- Glisser/slider pendant la pêche: rembobiner (intensité = vitesse du geste)

Astuce: l’indicateur au curseur aide à visualiser la zone active et la tension.

---

## 🧩 Principales mécaniques

- Chaque capture ajoute un bonus de temps au chrono.
- La bonne technique d’appât augmente fortement la probabilité de morsure.
- Les patterns d’appât sont 6 zones relatives au poisson (détection au curseur):
  - devant, derriere, au_dessus, au_dessous, toucher, complete
  - Règle: curseur dans un rayon de 20px pendant 3s; si ça correspond au pattern de l’espèce ⇒ ≥ 90% de morsure.
- La tension dépend de la taille et du comportement du poisson ; trop haute trop longtemps casse la ligne.
- Différentes espèces ont profondeur, vitesse, stamina et pattern préférés distincts.

Consulte le guide complet pour toutes les stats et stratégies.

---

## 📙 Guide détaillé

Le document `fishing-game-guide.md` contient :

- Légende des paramètres (taille, vitesse, points, stamina, etc.)
- Tableaux par espèce avec conseils de capture
- Classement par difficulté
- Explications des patterns d’appât et multiplicateurs
- Conseils et objectifs de maîtrise

Ouvre `fishing-game-guide.md` pour optimiser ta pêche et viser les captures légendaires.

---

## 💾 Sauvegarde et progression

- Le meilleur score est conservé en local (`localStorage`).
- Un gestionnaire de cookies/Progression est disponible depuis l’interface (bouton « 🔧 »).
- Depuis ce gestionnaire, tu peux exporter/importer ta progression et réinitialiser si besoin.

---

## 🛠️ Développement

- Entrée: `index.html` (charge `fishing-game.js`).
- Logique/affichage: `fishing-game.js` (UI, gameplay, événements souris/clavier, persistance locale).
- Guide: `fishing-game-guide.md` (documentation avancée du jeu).

Suggestions de contribution :

- Ajuster l’équilibrage (stats des espèces, multiplicateurs de pattern)
- Améliorer l’accessibilité (focus, ARIA, clavier)
- Ajouter des sons/effets visuels et nouveaux succès

---

## ✅ Compatibilité

- Navigateurs récents supportés.
- Aucune installation nécessaire ; fonctionne hors‑ligne après chargement.

---

Bonne pêche ! 🎣🌊
