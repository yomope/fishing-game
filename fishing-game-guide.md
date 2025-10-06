# 🎣 Guide Complet du Mini-Jeu de Pêche


## 📋 Table des Matières
- [Légende des Paramètres](#-légende-des-paramètres)
- [Tableaux par Espèce](#-tableaux-par-espèce)
- [Classement par Difficulté](#-classement-par-difficulté)
- [Patterns d'Appât](#-patterns-dappât)
- [Conseils Généraux](#-conseils-généraux)

---

## 📖 Légende des Paramètres

| Paramètre | Description | Unité |
|-----------|-------------|-------|
| **Taille** | Taille du sprite du poisson | pixels (px) |
| **Vitesse** | Vitesse de nage dans l'eau | px/s |
| **Points** | Points de base + (taille × multiplicateur) | points |
| **Stamina** | Endurance lors du combat (plus = plus long) | unités |
| **Profondeur** | Zone de spawn (0% = surface, 100% = fond) | pourcentage |
| **Affinité morsure** | Probabilité de base de mordre | pourcentage |
| **Agressivité** | Influence le mood (curieux vs méfiant) | pourcentage |
| **Flash** | Durée de clignotement après morsure | secondes |
| **Pattern** | Mouvement d'appât préféré pour mordre | type |
| **Multiplicateur tension** | Impact sur la tension de la ligne | multiplicateur |

---

## 🐟 Tableaux par Espèce

### 🦐 CREVETTE
**Poisson facile pour débuter**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 8 px | 12 px | Très petit |
| **Vitesse** | 1.5 | 2.2 | Rapide |
| **Points** | 11 | 15 | Faible récompense |
| **Stamina** | 30 | 50 | Se fatigue vite |
| **Profondeur** | 60% | 90% | Près du fond |
| **Affinité morsure** | 50% | 70% | Mord facilement |
| **Agressivité** | 30% | 50% | Moyennement curieuse |
| **Flash** | 1.5s | 2.0s | Temps court |
| **Pattern préféré** | **`devant`** | - | **Rester devant le poisson (20px/3s)** |
| **Multiplicateur tension** | 0.36× | 0.44× | Très faible tension |

**🎯 Stratégie** : Facile à attraper. Bouge vite l'appât de gauche à droite. Idéal pour débuter et gagner du temps rapidement.

---

### 🐠 POISSON TROPICAL
**Poisson de profondeur moyenne**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 14 px | 18 px | Petit-moyen |
| **Vitesse** | 1.2 | 1.8 | Moyen |
| **Points** | 27 | 32 | Récompense correcte |
| **Stamina** | 50 | 70 | Résistance moyenne |
| **Profondeur** | 40% | 80% | Toutes zones |
| **Affinité morsure** | 40% | 60% | Méfiant |
| **Agressivité** | 40% | 60% | Équilibré |
| **Flash** | 1.8s | 2.2s | Normal |
| **Pattern préféré** | **`au_dessus`** | - | **Rester au-dessus (20px/3s)** |
| **Multiplicateur tension** | 0.48× | 0.56× | Faible tension |

**🎯 Stratégie** : Approche l'hameçon du poisson et reste près de lui pendant 3 secondes sans bouger. Patience et proximité sont clés.

---

### 🐡 POISSON BALLON
**Poisson calme nécessitant de la patience**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 16 px | 22 px | Moyen |
| **Vitesse** | 0.8 | 1.3 | Lent |
| **Points** | 28 | 48 | Bon score |
| **Stamina** | 60 | 90 | Résistant |
| **Profondeur** | 50% | 85% | Mi-eau à fond |
| **Affinité morsure** | 30% | 50% | Méfiant |
| **Agressivité** | 20% | 40% | Calme |
| **Flash** | 2.0s | 2.5s | Long |
| **Pattern préféré** | **`toucher`** | - | **Curseur sur le poisson (3s)** |
| **Multiplicateur tension** | 0.52× | 0.64× | Tension moyenne-basse |

**🎯 Stratégie** : Laisse l'hameçon au fond et ne bouge plus. La patience est récompensée ! Attend qu'il s'approche et reste immobile.

---

### 🐟 POISSON COMMUN
**Le plus facile à attraper**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 12 px | 16 px | Petit-moyen |
| **Vitesse** | 1.0 | 1.6 | Moyen |
| **Points** | 20 | 24 | Standard |
| **Stamina** | 40 | 60 | Faible |
| **Profondeur** | 30% | 70% | Partout |
| **Affinité morsure** | 45% | 65% | Mord facilement |
| **Agressivité** | 50% | 70% | Curieux |
| **Flash** | 1.5s | 2.0s | Court |
| **Pattern préféré** | **`any`** | - | **PAS DE PRÉFÉRENCE** |
| **Multiplicateur tension** | 0.44× | 0.52× | Faible tension |

**🎯 Stratégie** : Le plus facile ! Mord avec n'importe quel mouvement d'appât. Bonus de ×1.2 sur la probabilité de morsure. Parfait pour les débutants.

---

### 🦑 CALMAR
**Prédateur rapide des profondeurs**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 18 px | 26 px | Grand |
| **Vitesse** | 1.8 | 2.5 | Très rapide |
| **Points** | 34 | 67 | Bonne récompense |
| **Stamina** | 70 | 100 | Très résistant |
| **Profondeur** | 60% | 100% | Profondeurs |
| **Affinité morsure** | 25% | 45% | Très méfiant |
| **Agressivité** | 60% | 80% | Agressif |
| **Flash** | 1.2s | 1.8s | Très court |
| **Pattern préféré** | **`au_dessous`** | - | **Rester au-dessous (20px/3s)** |
| **Multiplicateur tension** | 0.56× | 0.72× | Tension moyenne |

**🎯 Stratégie** : Approche l'hameçon du poisson et laisse-le couler rapidement vers lui. Mouvement vertical et rapide pour déclencher la morsure. Fenêtre de ferrage très courte (1.2-1.8s), réagis vite !

---

### 🐙 PIEUVRE
**Créature du fond, très résistante**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 20 px | 30 px | Très grand |
| **Vitesse** | 0.9 | 1.5 | Lent |
| **Points** | 65 | 85 | Très bon score |
| **Stamina** | 90 | 130 | Extrêmement résistant |
| **Profondeur** | 70% | 100% | Fond uniquement |
| **Affinité morsure** | 20% | 40% | Très méfiant |
| **Agressivité** | 30% | 50% | Calme |
| **Flash** | 2.2s | 2.8s | Très long |
| **Pattern préféré** | **`derriere`** | - | **Rester derrière le poisson (20px/3s)** |
| **Multiplicateur tension** | 0.60× | 0.80× | Tension forte |

**🎯 Stratégie** : Laisse l'hameçon au fond et ne bouge plus. Combat long et difficile avec une stamina énorme. Gère bien la tension de la ligne !

---

### 🐋 BALEINE ⭐
**Boss de grande taille, capture légendaire**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 35 px | 50 px | **ÉNORME** |
| **Vitesse** | 0.4 | 0.8 | Très lent |
| **Points** | 172 | 225 | **JACKPOT** |
| **Stamina** | 150 | 220 | **Épuisant** |
| **Profondeur** | 40% | 70% | Mi-eau |
| **Affinité morsure** | 15% | 30% | Extrêmement méfiant |
| **Agressivité** | 10% | 30% | Paisible |
| **Flash** | 2.5s | 3.5s | Maximum |
| **Pattern préféré** | **`complete`** | - | **Couvrir les 4 quadrants en 3s** |
| **Multiplicateur tension** | 0.90× | 1.0× | **TENSION MAXIMALE** |

**🎯 Stratégie** : Approche l'hameçon du poisson et reste près de lui pendant 5 secondes sans bouger. Combat extrêmement difficile avec tension maximale. **Risque élevé de casser la ligne !** Gère parfaitement le rembobinage.

---

### 🪼 MÉDUSE
**Créature facile de surface**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 10 px | 16 px | Petit |
| **Vitesse** | 0.5 | 0.9 | Très lent |
| **Points** | 8 | 11 | Très faible |
| **Stamina** | 20 | 40 | Très faible |
| **Profondeur** | 20% | 60% | Surface à mi-eau |
| **Affinité morsure** | 60% | 80% | Mord très facilement |
| **Agressivité** | 20% | 30% | Timide |
| **Flash** | 1.0s | 1.5s | Minimum |
| **Pattern préféré** | **`moving`** | - | **Avance rapidement devant le poisson** |
| **Multiplicateur tension** | 0.40× | 0.52× | Tension négligeable |

**🎯 Stratégie** : Bouge rapidement l'hameçon devant le poisson. Capture très facile mais peu de points. Idéal pour gagner du temps bonus rapidement.

---

### 🧜‍♀️ SIRÈNE ⭐⭐
**Capture ultime, la plus difficile**

| Paramètre | Min | Max | Notes |
|-----------|-----|-----|-------|
| **Taille** | 22 px | 30 px | Grand |
| **Vitesse** | 1.0 | 1.6 | Moyen |
| **Points** | 168 | 200 | **LÉGENDAIRE** |
| **Stamina** | 120 | 180 | **Boss** |
| **Profondeur** | 30% | 80% | Toutes zones |
| **Affinité morsure** | 10% | 25% | **Quasi impossible** |
| **Agressivité** | 40% | 70% | Imprévisible |
| **Flash** | 2.8s | 3.5s | Maximum |
| **Pattern préféré** | **`falling`** | - | **Coule à pic à proximité du poisson** |
| **Multiplicateur tension** | 0.64× | 0.80× | Tension forte |

**🎯 Stratégie** : Approche l'hameçon du poisson et laisse-le couler rapidement vers lui. La capture la plus difficile du jeu ! Seulement 10-25% de chance de mordre. 👑🔥

---

## 📊 Classement par Difficulté

### 🟢 FACILE (Débutants)
1. **🐟 Poisson Commun** - Mord sur tout, faible tension, spawn partout
2. **🪼 Méduse** - Très facile à attraper (60-80% affinité), reste en surface
3. **🦐 Crevette** - Rapide mais mord facilement (50-70% affinité)

### 🟡 MOYEN (Intermédiaire)
4. **🐠 Poisson Tropical** - Nécessite d'aller en profondeur, technique de positionnement
5. **🐡 Poisson Ballon** - Demande de la patience (immobile), bon score

### 🟠 DIFFICILE (Avancé)
6. **🦑 Calmar** - Rapide, flash court (1.2-1.8s), profondeurs, pattern falling
7. **🐙 Pieuvre** - Très méfiant (20-40%), énorme stamina (90-130), fond uniquement

### 🔴 TRÈS DIFFICILE (Expert)
8. **🐋 Baleine** - Très méfiant (15-30%), tension MAX, combat épuisant (150-220 stamina)
9. **🧜‍♀️ Sirène** - **BOSS FINAL** - 10-25% de chance, pattern complexe, légendaire

---

## 🎣 Patterns d'Appât (détection au curseur, 20px autour du poisson)

Tous les patterns sont détectés via le CURSEUR de la souris. Ils doivent être réalisés dans un rayon de 20px autour du poisson ciblé pendant 3 secondes. Si le pattern correspond à celui préféré par l’espèce, la probabilité de morsure est portée à ≥ 90%.

### Description des 6 Patterns

| Pattern | Description | Détection (curseur) | Exécution |
|---------|-------------|---------------------|-----------|
| **`devant`** | Curseur devant la direction du poisson | 20px/3s dans l’hémiplan avant du poisson | Reste devant le poisson qui avance |
| **`derriere`** | Curseur derrière le poisson | 20px/3s dans l’hémiplan arrière | Reste derrière en le suivant |
| **`au_dessus`** | Curseur au-dessus | 20px/3s avec y < y_poisson | Survole au-dessus |
| **`au_dessous`** | Curseur au-dessous | 20px/3s avec y > y_poisson | Reste sous le poisson |
| **`toucher`** | Curseur sur le poisson | 3s à ≤ 8px du centre | Pose le curseur dessus |
| **`complete`** | Couverture complète | Avoir été au-dessus, au-dessous, gauche et droite dans les 3 dernières secondes | Balayer les 4 quadrants |

### Bonus de Pattern

| Situation | Multiplicateur | Exemple |
|-----------|----------------|---------|
| **Pattern parfait** | ×1.0 à ×2.0 | 🐡 Ballon + immobile = ×2.0 |
| **Pattern "any"** | ×1.2 | 🐟 Commun + n'importe quoi = ×1.2 |
| **Pattern inconnu** | ×0.8 | Début du lancer, pas assez de données |
| **Mauvais pattern** | ×0.4 | 🐡 Ballon + mouvement rapide = ×0.4 |

**Exemple concret** :
- 🐡 Poisson Ballon (affinité 40%, pattern `still`)
  - Avec hameçon immobile : 40% × 2.0 = **80% de chance de mordre** ✅
  - Avec hameçon qui bouge vite : 40% × 0.4 = **16% de chance** ❌

---

## 💡 Conseils Généraux

### Mécanique de Base
- **Bonus de temps** : Chaque poisson capturé ajoute **+3 secondes** au chronomètre
- **Tension et taille** : Plus le poisson est gros, plus la ligne est tendue (multiplicateur 0.2× à 1.0×)
- **Casse de ligne** : Si la tension reste > 85% pendant 2.5 secondes, la ligne casse !
- **Pattern matching** : Le bon pattern peut doubler (×2.0) tes chances de capture

### Stratégies Avancées

#### 🎯 Maximiser le Score
1. Cible les **gros poissons** (🐋 Baleine, 🧜‍♀️ Sirène) pour 150-230 points
2. Les **Pieuvres** (🐙) offrent un bon ratio difficulté/points (65-85 pts)
3. Évite les Méduses (🪼) sauf pour gagner du temps d'urgence

#### ⏱️ Maximiser le Temps
1. Capture des **poissons faciles** (🐟 Commun, 🪼 Méduse) = +3s chacun
2. Chaque capture rapide permet de tenter plus de gros poissons après
3. La stratégie "spam méduse" peut donner +30-40 secondes en début de partie

#### 🧠 Lecture du Jeu
1. **Observe l'emoji** qui s'approche avant de modifier ton pattern
2. **Attends l'attraction** : les poissons viennent vers l'hameçon si personne n'a mordu
3. **Gère le refus** : Si un poisson refuse (ne mord pas), il ignorera l'appât pendant 1-3 secondes
4. **Flash = Ferrage** : Quand le poisson clignote, clique rapidement pour ferrer (durée variable 1.0-3.5s)

#### ⚡ Techniques de Combat
1. **Tension basse** : Alterne rembobinage et pause pour les gros poissons
2. **Stamina** : Les poissons se fatiguent en tirant, attends qu'ils s'épuisent
3. **Hors de l'eau** : La tension tombe à 0 quand l'hameçon sort de l'eau (pas de risque)

### Erreurs à Éviter
- ❌ Rembobiner en continu sur une **🐋 Baleine** → ligne cassée garantie
- ❌ Bouger l'hameçon devant un **🐡 Poisson Ballon** → refus quasi certain
- ❌ Rester en surface pour une **🐙 Pieuvre** → elle ne montera jamais
- ❌ Aller au fond pour une **🪼 Méduse** → elle reste en surface
- ❌ Ignorer le pattern → perdre 60% de chances de capture

---

## 🏆 Objectifs de Maîtrise

### Bronze 🥉
- Capturer 5 poissons en 60 secondes
- Capturer un 🐙 Pieuvre
- Score de 150 points

### Argent 🥈
- Capturer 10 poissons en 90 secondes (avec bonus temps)
- Capturer une 🐋 Baleine sans casser la ligne
- Score de 300 points

### Or 🥇
- Capturer 15 poissons en 120 secondes
- Capturer une 🧜‍♀️ Sirène
- Score de 500+ points

### Platine 💎
- Capturer les 9 espèces différentes en une seule partie
- Score de 800+ points
- Capturer 2+ Sirènes

---

## 📈 Tableau Récapitulatif Complet

| Emoji | Nom | Taille | Vitesse | Points | Stamina | Profondeur | Affinité | Flash | Pattern | Tension |
|-------|-----|--------|---------|--------|---------|------------|----------|-------|---------|---------|
| 🦐 | Crevette | 8-12 | 1.5-2.2 | 11-15 | 30-50 | 60-90% | 50-70% | 1.5-2.0s | `moving` | 0.36-0.44× |
| 🐠 | Tropical | 14-18 | 1.2-1.8 | 27-32 | 50-70 | 40-80% | 40-60% | 1.8-2.2s | `jigging` | 0.48-0.56× |
| 🐡 | Ballon | 16-22 | 0.8-1.3 | 28-48 | 60-90 | 50-85% | 30-50% | 2.0-2.5s | `still` | 0.52-0.64× |
| 🐟 | Commun | 12-16 | 1.0-1.6 | 20-24 | 40-60 | 30-70% | 45-65% | 1.5-2.0s | `any` | 0.44-0.52× |
| 🦑 | Calmar | 18-26 | 1.8-2.5 | 34-67 | 70-100 | 60-100% | 25-45% | 1.2-1.8s | `falling` | 0.56-0.72× |
| 🐙 | Pieuvre | 20-30 | 0.9-1.5 | 65-85 | 90-130 | 70-100% | 20-40% | 2.2-2.8s | `still` | 0.60-0.80× |
| 🐋 | Baleine | 35-50 | 0.4-0.8 | 172-225 | 150-220 | 40-70% | 15-30% | 2.5-3.5s | `slow` | 0.90-1.0× |
| 🪼 | Méduse | 10-16 | 0.5-0.9 | 8-11 | 20-40 | 20-60% | 60-80% | 1.0-1.5s | `rising` | 0.40-0.52× |
| 🧜‍♀️ | Sirène | 28-38 | 1.0-1.6 | 192-232 | 120-180 | 30-80% | 10-25% | 2.8-3.5s | `erratic` | 0.76-0.96× |

---

**Bonne pêche ! 🎣🌊✨**

*Version 1.2 - Mini-Jeu de Pêche Pyrus Control*

