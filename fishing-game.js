// Plugin Mini-Jeu de Pêche pour Pyrus Control
// Un jeu de pêche interactif avec score et animations
(function(){
    'use strict';

    // Configuration du jeu
    const GAME_CONFIG = {
        canvas: { width: 800, height: 245 },
        water: { level: 120, color: '#1e3a8a' },
        rod: { length: 15, thickness: 1 },
        hook: { size: 8, color: '#dc2626' },
        timeBonusPerCatch: 3, // Secondes ajoutées au timer par poisson capturé
        physics: {
            gravity: 980, // px/s^2
            airDrag: 0.12, // coefficient traînée air
            waterDrag: 1.8, // coefficient traînée eau (extrêmement augmenté à 1.8)
            reelSpeed: 190, // px/s rembobinage (un peu plus rapide)
            maxLineLength: 1400, // longueur max de ligne (portée très accrue pour atteindre tout l'écran)
            castSpeedFactor: 22.0, // facteur vitesse initiale (lancer puissant pour atteindre le bord)
            waterVerticalDamp: 0.94, // amortissement supplémentaire sur l'axe vertical sous l'eau (proche du maximum à 0.94)
            maxWaterVerticalSpeed: 50, // limite d'amplitude de vitesse verticale sous l'eau (extrêmement réduit à 50 px/s)
            fishStrength: 1.2, // multiplicateur de force des poissons (encore plus faible)
            attachedBuoyancy: 260, // poussée vers le haut quand poisson accroché (réduit la descente)
            breakTensionThreshold: 0.85, // tension au-dessus de laquelle la casse peut se produire (plus résistant)
            breakTimeSeconds: 2.5 // durée au-dessus du seuil avant casse (augmenté)
        },
        fish: {
            types: [
                { 
                    emoji: '🦐', name: 'Crevette',
                    sizeRange: [8, 12], speedRange: [1.5, 2.2], 
                    pointsPerSize: 0.8, basePoints: 5,
                    staminaRange: [30, 50], depthRange: [0.0, 1.0],
                    biteAffinityRange: [0.5, 0.7], aggressionRange: [0.3, 0.5],
                    flashDuration: [1.5, 2.0],
                    baitPattern: 'moving' // Avance rapidement devant le poisson
                },
                { 
                    emoji: '🐠', name: 'Poisson Tropical',
                    sizeRange: [14, 18], speedRange: [1.2, 1.8], 
                    pointsPerSize: 1.2, basePoints: 10,
                    staminaRange: [50, 70], depthRange: [0.4, 0.8],
                    biteAffinityRange: [0.4, 0.6], aggressionRange: [0.4, 0.6],
                    flashDuration: [1.8, 2.2],
                    baitPattern: 'hover' // Reste sur le poisson pendant 3 secondes
                },
                { 
                    emoji: '🐡', name: 'Poisson Ballon',
                    sizeRange: [16, 22], speedRange: [0.8, 1.3], 
                    pointsPerSize: 1.5, basePoints: 15,
                    staminaRange: [60, 90], depthRange: [0.5, 0.85],
                    biteAffinityRange: [0.3, 0.5], aggressionRange: [0.2, 0.4],
                    flashDuration: [2.0, 2.5],
                    baitPattern: 'still' // Immobile au fond
                },
                { 
                    emoji: '🐟', name: 'Poisson Commun',
                    sizeRange: [12, 16], speedRange: [1.0, 1.6], 
                    pointsPerSize: 1.0, basePoints: 8,
                    staminaRange: [40, 60], depthRange: [0.3, 0.7],
                    biteAffinityRange: [0.45, 0.65], aggressionRange: [0.5, 0.7],
                    flashDuration: [1.5, 2.0],
                    baitPattern: 'any' // Mord facilement, pas de préférence
                },
                { 
                    emoji: '🦑', name: 'Calmar',
                    sizeRange: [18, 26], speedRange: [1.8, 2.5], 
                    pointsPerSize: 1.8, basePoints: 20,
                    staminaRange: [70, 100], depthRange: [0.6, 1.0],
                    biteAffinityRange: [0.25, 0.45], aggressionRange: [0.6, 0.8],
                    flashDuration: [1.2, 1.8],
                    baitPattern: 'falling' // Coule à pic à proximité du poisson
                },
                { 
                    emoji: '🐙', name: 'Pieuvre',
                    sizeRange: [20, 30], speedRange: [0.9, 1.5], 
                    pointsPerSize: 2.0, basePoints: 25,
                    staminaRange: [90, 130], depthRange: [0.7, 1.0],
                    biteAffinityRange: [0.2, 0.4], aggressionRange: [0.3, 0.5],
                    flashDuration: [2.2, 2.8],
                    baitPattern: 'still' // Immobile au fond
                },
                { 
                    emoji: '🐋', name: 'Baleine',
                    sizeRange: [35, 50], speedRange: [0.4, 0.8], 
                    pointsPerSize: 3.5, basePoints: 50,
                    staminaRange: [150, 220], depthRange: [0.4, 0.7],
                    biteAffinityRange: [0.15, 0.3], aggressionRange: [0.1, 0.3],
                    flashDuration: [2.5, 3.5],
                    baitPattern: 'hover' // Reste sur le poisson pendant 5 secondes
                },
                { 
                    emoji: '🪼', name: 'Méduse',
                    sizeRange: [10, 16], speedRange: [0.5, 0.9], 
                    pointsPerSize: 0.5, basePoints: 3,
                    staminaRange: [20, 40], depthRange: [0.2, 0.6],
                    biteAffinityRange: [0.6, 0.8], aggressionRange: [0.2, 0.3],
                    flashDuration: [1.0, 1.5],
                    baitPattern: 'moving' // Avance rapidement devant le poisson
                },
                { 
                    emoji: '🧜‍♀️', name: 'Sirène',
                    sizeRange: [22, 30], speedRange: [1.0, 1.6], 
                    pointsPerSize: 4.0, basePoints: 80,
                    staminaRange: [120, 180], depthRange: [0.3, 0.8],
                    biteAffinityRange: [0.1, 0.25], aggressionRange: [0.4, 0.7],
                    flashDuration: [2.8, 3.5],
                    baitPattern: 'falling' // Coule à pic à proximité du poisson
                },
                { emoji:'👾', name:'Créature Mystérieuse', sizeRange:[18,28], speedRange:[1.6,2.4], pointsPerSize:2.8, basePoints:60, staminaRange:[80,140], depthRange:[0.2,0.8], biteAffinityRange:[0.2,0.4], aggressionRange:[0.5,0.8], flashDuration:[1.5,2.2], baitPattern:'active' },
                { emoji:'🐊', name:'Crocodile Marin', sizeRange:[26,38], speedRange:[1.2,2.0], pointsPerSize:3.0, basePoints:70, staminaRange:[110,170], depthRange:[0.1,0.4], biteAffinityRange:[0.2,0.35], aggressionRange:[0.6,0.9], flashDuration:[1.2,1.8], baitPattern:'moving' },
                { emoji:'🐢', name:'Tortue de Mer', sizeRange:[20,34], speedRange:[0.6,1.0], pointsPerSize:2.2, basePoints:40, staminaRange:[130,180], depthRange:[0.5,0.9], biteAffinityRange:[0.25,0.45], aggressionRange:[0.1,0.3], flashDuration:[2.2,3.0], baitPattern:'still' },
                { emoji:'🦭', name:'Phoque Curieux', sizeRange:[18,26], speedRange:[1.4,2.0], pointsPerSize:2.4, basePoints:45, staminaRange:[80,120], depthRange:[0.2,0.6], biteAffinityRange:[0.35,0.6], aggressionRange:[0.2,0.5], flashDuration:[1.6,2.4], baitPattern:'hover' },
                { emoji:'🦈', name:'Requin', sizeRange:[28,44], speedRange:[2.0,3.0], pointsPerSize:3.6, basePoints:90, staminaRange:[160,220], depthRange:[0.3,0.7], biteAffinityRange:[0.15,0.35], aggressionRange:[0.7,0.95], flashDuration:[1.0,1.6], baitPattern:'moving' },
                { emoji:'🐬', name:'Dauphin', sizeRange:[22,32], speedRange:[1.8,2.6], pointsPerSize:3.2, basePoints:65, staminaRange:[100,150], depthRange:[0.2,0.6], biteAffinityRange:[0.4,0.7], aggressionRange:[0.2,0.5], flashDuration:[1.4,2.0], baitPattern:'active' },
                { emoji:'🐉', name:'Dragon Marin', sizeRange:[30,50], speedRange:[1.2,2.0], pointsPerSize:4.5, basePoints:120, staminaRange:[200,280], depthRange:[0.4,0.9], biteAffinityRange:[0.1,0.25], aggressionRange:[0.5,0.8], flashDuration:[2.5,3.5], baitPattern:'deep' },
                { emoji:'🦞', name:'Homard Géant', sizeRange:[18,28], speedRange:[0.8,1.2], pointsPerSize:2.6, basePoints:55, staminaRange:[120,170], depthRange:[0.7,1.0], biteAffinityRange:[0.2,0.4], aggressionRange:[0.3,0.6], flashDuration:[1.8,2.6], baitPattern:'bottom' },
                { emoji:'🦀', name:'Crabe Colossal', sizeRange:[16,26], speedRange:[0.9,1.3], pointsPerSize:2.4, basePoints:48, staminaRange:[110,160], depthRange:[0.7,1.0], biteAffinityRange:[0.25,0.45], aggressionRange:[0.2,0.5], flashDuration:[1.8,2.8], baitPattern:'still' },
                { emoji:'🧜‍♂️', name:'Triton', sizeRange:[24,34], speedRange:[1.4,2.2], pointsPerSize:3.8, basePoints:95, staminaRange:[140,200], depthRange:[0.8,0.9], biteAffinityRange:[0.15,0.35], aggressionRange:[0.4,0.7], flashDuration:[2.0,3.0], baitPattern:'hover' },
                { emoji:'🧜', name:'Néréide', sizeRange:[20,30], speedRange:[1.2,1.8], pointsPerSize:3.5, basePoints:85, staminaRange:[120,180], depthRange:[0.3,0.8], biteAffinityRange:[0.2,0.4], aggressionRange:[0.3,0.6], flashDuration:[2.0,3.0], baitPattern:'hover' },
                { emoji:'🥾', name:'Botte Perdue', sizeRange:[14,20], speedRange:[0.2,0.6], pointsPerSize:0.2, basePoints:0, staminaRange:[10,20], depthRange:[0.6,1.0], biteAffinityRange:[0.0,0.1], aggressionRange:[0,0.1], flashDuration:[0.5,1.0], baitPattern:'bottom' }
            ],
            spawnPerSecond: 1.5, // Augmenté de 0.9 à 1.5 (67% plus rapide)
            maxCount: 6
        },
        bubbles: { count: 8, speed: 0.5 },
        waves: { amplitude: 4, frequency: 0.035 },
        seabed: { height: 80, color: '#0f2a6b', decorCount: 20, emojis: ['🌿','🌾','🪸','🪨'] }
    };

    // Remplacer les espèces par le catalogue externe s'il est présent
    if (window.FISH_CATALOG && Array.isArray(window.FISH_CATALOG.types) && window.FISH_CATALOG.types.length > 0) {
        GAME_CONFIG.fish.types = window.FISH_CATALOG.types;
    }

    // Overlay d'information gameplay pour progression vierge
    function showGameplayInfoOverlay() {
        if (document.getElementById('fishing-gameplay-info')) return;
        const overlay = document.createElement('div');
        overlay.id = 'fishing-gameplay-info';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: radial-gradient(1200px 600px at 50% 85%, rgba(11,18,40,0.92), rgba(11,18,40,0.86) 30%, rgba(0,0,0,0.7) 70%);
            z-index: 30000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(2px);
        `;
        const panel = document.createElement('div');
        panel.style.cssText = `
            width: min(840px, 92vw);
            max-height: 82vh;
            overflow: auto;
            background: linear-gradient(160deg, rgba(15,42,107,0.96), rgba(30,58,138,0.96));
            color: #fff;
            padding: 24px 26px;
            border-radius: 18px;
            box-shadow: 0 30px 90px rgba(0,0,0,0.65), inset 0 0 60px rgba(255,255,255,0.05);
            border: 2px solid rgba(255,255,255,0.08);
            font-family: 'Concert One', 'Segoe UI', system-ui, sans-serif;
        `;
        panel.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:10px;">
                <h2 style="margin:0; font-size:26px; letter-spacing:0.5px; text-shadow:0 2px 8px rgba(0,0,0,0.35);">🌊 Bienvenue dans la Pêche</h2>
                <div style="opacity:.9; font-size:18px;">🎣</div>
            </div>
            <p style="margin:0 0 16px 0; opacity:.92; font-size:14px;">Découvre les mécaniques principales pour progresser :</p>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:12px;">
                <div style="background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px;">
                    <div style="font-size:16px; margin-bottom:6px;">🎯 Lancer</div>
                    <div style="opacity:.9; font-size:13px;">Maintiens puis relâche pour jeter l'hameçon. Vise les zones de poissons.</div>
                </div>
                <div style="background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px;">
                    <div style="font-size:16px; margin-bottom:6px;">🧩 Patterns</div>
                    <div style="opacity:.9; font-size:13px;">Chaque espèce préfère un pattern (moving/hover/still/falling). Consulte le Guide 📙.</div>
                </div>
                <div style="background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px;">
                    <div style="font-size:16px; margin-bottom:6px;">⚡ Tension</div>
                    <div style="opacity:.9; font-size:13px;">Reste en zone sûre pour éviter la casse. Maîtrise le rembobinage.</div>
                </div>
                <div style="background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px;">
                    <div style="font-size:16px; margin-bottom:6px;">⏱️ Chrono</div>
                    <div style="opacity:.9; font-size:13px;">Clique l'⏱️ en bas pour <u>activer/désactiver</u> le timer. Sans chrono: score/achievements et certaines stats sont désactivés.</div>
                </div>
                <div style="background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px;">
                    <div style="font-size:16px; margin-bottom:6px;">📏 Profondeurs</div>
                    <div style="opacity:.9; font-size:13px;">Surface → shallow → mid → deep → abyssal. Certaines espèces n'apparaissent qu'à certaines profondeurs.</div>
                </div>
                <div style="background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px;">
                    <div style="font-size:16px; margin-bottom:6px;">🌤️ Cycle</div>
                    <div style="opacity:.9; font-size:13px;">Heure, météo et saisons influencent couleur et comportements.</div>
                </div>
                <div style="background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px; grid-column: span 2;">
                    <div style="font-size:16px; margin-bottom:6px;">🪟 Taille de fenêtre</div>
                    <div style="opacity:.9; font-size:13px;">La fenêtre s'agrandit avec ton <strong>poids cumulé</strong> pour atteindre de nouvelles profondeurs. Plus tu pêches lourd, plus tu explores !</div>
                </div>
                <div style="background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 14px;">
                    <div style="font-size:16px; margin-bottom:6px;">🏅 Progression</div>
                    <div style="opacity:.9; font-size:13px;">Cumule <em>kg</em> et <em>score</em>, débloque des chapeaux 🎩 et des espèces.</div>
                </div>
            </div>
            <div style="margin-top:16px; display:flex; gap:10px;">
                <button id="info-open-guide" style="background: linear-gradient(45deg, #10b981, #059669); color:#fff; border:none; border-radius:10px; padding:10px 14px; cursor:pointer; box-shadow:0 4px 12px rgba(16,185,129,0.35);">Ouvrir le Guide 📙</button>
                <button id="info-close" style="background: linear-gradient(45deg, #6b7280, #4b5563); color:#fff; border:none; border-radius:10px; padding:10px 14px; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.25);">Commencer</button>
            </div>
        `;
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        const close = ()=>{ if (overlay && overlay.parentNode) overlay.remove(); };
        panel.querySelector('#info-close')?.addEventListener('click', close);
        panel.querySelector('#info-open-guide')?.addEventListener('click', ()=>{ close(); showGuide(); });
    }

    // Échelle de profondeur basée sur la fenêtre du navigateur
    let depthScale = {
        // Valeurs de référence en pixels pour une fenêtre de 1920x1080
        referenceWindow: { width: 1920, height: 1080 },
        referenceDepth: 420, // Profondeur de référence en pixels
        currentScale: 1.0,   // Échelle actuelle (sera calculée)
        zones: {
            surface: 20,      // Zone de surface
            shallow: 100,      // Zone peu profonde  
            mid: 420,         // Zone du milieu
            deep: 600,        // Zone profonde
            abyssal: 600       // Zone abyssale
        }
    };

    // État du jeu
    let gameState = {
        score: 0,
        level: 1,
        totalWeight: 0, // Poids total des poissons capturés en grammes
        isPlaying: false,
        isCasting: false,
        isReeling: false,
        reelHold: false,
        reelIntensity: 0,
        hookPosition: { x: 0, y: 0 },
        hookVelocity: { x: 0, y: 0 },
        hookPrevPosition: { x: 0, y: 0 }, // Position précédente pour calculer le mouvement
        hookMovementHistory: [], // Historique des mouvements (max 60 frames = 1 sec)
        lineOrigin: { x: 0, y: 0 },
        lineLength: 0,
        castStartTs: 0,
        hookDepth: 0,
        maxDepth: 0,
        fish: [],
        attachedFish: [],
        bubbles: [],
        waves: [],
        rodAngle: 0,
        castPower: 0,
        maxCastPower: 100,
        isPreviewingCast: false,
        previewPoints: [],
        spawnAccumulator: 0,
        lineTension: 0.0,
        struggleTime: 0,
        timeLeft: 60,
        gameStartTime: 0,
        timerEnabled: false, // État du timer (activé/désactivé) - Désactivé par défaut
        mouseX: 0,
        mouseY: 0,
        isMouseDown: false,
        highScore: parseInt(localStorage.getItem('fishingHighScore') || '0'),
        breakAccum: 0, // Accumulateur de temps de tension au-dessus du seuil
        pendingBiteFish: null, // poisson ayant "pris" l'appât, en attente de ferrage
        seabedDecor: [], // éléments fixes de décor sur le fond (emojis et tailles)
        clouds: [], // Nuages animés
        timeOfDay: 0.4, // 0 à 1 (0=minuit, 0.25=aube/lever, 0.5=midi, 0.75=crépuscule/coucher, 1=minuit)
        renderTimeOfDay: 0.4, // temps lissé utilisé pour le rendu (couleurs/soleil-lune/UI)
        weather: 'clear', // 'clear', 'cloudy', 'rainy', 'stormy'
        targetWeather: 'clear', // Météo cible pour transition en fondu
        weatherTransition: 0, // 0 à 1 pour transition douce entre météos
        dayNightSpeed: 0.00133, // Vitesse du cycle jour/nuit (30 secondes par cycle)
        weatherChangeTimer: 0, // Timer pour changement de météo
        // Système de saisons
        season: 'spring', // 'spring', 'summer', 'autumn', 'winter'
        seasonProgress: 0, // 0 à 1 dans la saison actuelle
        seasonSpeed: 0.0003, // Vitesse de changement de saison (1 saison = ~55 minutes)
        lineSnapped: false, // true quand la ligne casse (masque le rendu de ligne)
        caughtFish: [], // liste des emojis des poissons capturés
        biggestCatch: null, // {emoji,name,size,estimatedWeight}
        progress: loadProgress(),
        // Facteur de poids de l'hameçon (1 par défaut); surchargé par progression.features.hookWeightFactor
        hookWeightFactor: 1,
        // Effets visuels temporaires (ex: étincelles de pattern)
        effects: [],
        _hatSpawnAccumulator: 0,
        bottomHoldSeconds: 0,
        surfaceHoldSeconds: 0,
        _wasDeep: false,
        _wasNearSurface: false,
        // Chapeaux flottants
        floatingHats: [], // Liste des chapeaux qui flottent à la surface
        hatItems: [
            { emoji:'🎩', name:'Haut-de-forme', rarity:'rare', unlock:"Atteindre 5 000 pts cumulés", key:'score5000', perk:'+20% points pour tous les poissons' },
            { emoji:'🎓', name:'Diplôme', rarity:'rare', unlock:"Effectuer 300 lancers", key:'casts300', perk:'+15% précision de lancer' },
            { emoji:'👒', name:'Capeline', rarity:'commun', unlock:"Rester 600s en surface (cumulé)", key:'surface600', perk:'+30% vitesse de rembobinage en surface' },
            { emoji:'🐭', name:'Oreilles Souris', rarity:'épique', unlock:"Capturer 200 poissons", key:'catches200', perk:'+25% chance de morsure' },
            { emoji:'🐹', name:'Oreilles Hamster', rarity:'épique', unlock:"Visiter le fond 1000 fois", key:'deep1000', perk:'+40% résistance à la tension en profondeur' },
            { emoji:'🐼', name:'Oreilles Panda', rarity:'légendaire', unlock:"Poids cumulé 2 000 kg", key:'kg2000', perk:'+50% poids des poissons capturés' },
            { emoji:'🤡', name:'Masque de Clown', rarity:'commun', unlock:"Casser 10 lignes", key:'breaks10', perk:'+100% agressivité des poissons' },
            { emoji:'👹', name:'Masque Oni', rarity:'rare', unlock:"Capturer 50 sirènes", key:'sirens50', perk:'Force le spawn de sirènes' },
            { emoji:'👺', name:'Masque Kitsune', rarity:'rare', unlock:"1000 détections de pattern hover", key:'hover1000', perk:'+60% efficacité du pattern hover' },
            { emoji:'🤖', name:'Casque Robot', rarity:'épique', unlock:"Score parfait (300+ sans casser)", key:'perfect300', perk:'Ligne incassable' },
            { emoji:'💩', name:'Chapeau Caca', rarity:'commun', unlock:"Capturer 5 poissons en 10s", key:'fast5', perk:'+200% chance de spawn méduse' },
            { emoji:'🦊', name:'Masque Renard', rarity:'rare', unlock:"Capturer 100 poulpes", key:'octopus100', perk:'+80% efficacité du pattern still' },
            { emoji:'🐯', name:'Masque Tigre', rarity:'épique', unlock:"Capturer 20 baleines", key:'whales20', perk:'+150% poids des baleines' },
            { emoji:'🐺', name:'Masque Loup', rarity:'rare', unlock:"Série de 50 captures sans casser", key:'streak50', perk:'+40% vitesse de tous les poissons' },
            { emoji:'🐱', name:'Masque Chat', rarity:'commun', unlock:"Capturer 500 crevettes", key:'shrimp500', perk:'+90% chance de spawn crevettes' },
            { emoji:'🦁', name:'Masque Lion', rarity:'légendaire', unlock:"Score cumulé 100 000", key:'score100k', perk:'+100% points pour tous les poissons' },
            { emoji:'🐷', name:'Masque Cochon', rarity:'commun', unlock:"Capturer 200 poissons ballons", key:'puffer200', perk:'+60% taille des poissons ballons' },
            { emoji:'🐻‍❄️', name:'Masque Ours Polaire', rarity:'rare', unlock:"Rester 1000s au fond (cumulé)", key:'bottom1000', perk:'+50% résistance au froid (tension réduite)' },
            { emoji:'🐻', name:'Masque Ours', rarity:'rare', unlock:"Capturer 100 calmars", key:'squid100', perk:'+70% efficacité du pattern falling' },
            { emoji:'🐰', name:'Masque Lapin', rarity:'commun', unlock:"Capturer 1000 poissons tropicaux", key:'tropical1000', perk:'+120% vitesse de spawn poissons tropicaux' },
            { emoji:'🐸', name:'Masque Grenouille', rarity:'rare', unlock:"Capturer 50 méduses", key:'jellyfish50', perk:'+80% efficacité du pattern moving' },
            { emoji:'🐲', name:'Masque Dragon', rarity:'mythique', unlock:"Capturer 10 dragons", key:'dragons10', perk:'+200% agressivité + ligne dorée' },
            { emoji:'🧨', name:'Chapeau Explosif', rarity:'rare', unlock:"Casser 25 lignes", key:'breaks25', perk:'Explosion lors de la capture (+50% points)' },
            { emoji:'✨', name:'Chapeau Étoilé', rarity:'légendaire', unlock:"Score parfait 10 fois", key:'perfect10', perk:'+300% chance de spawn espèces rares' },
            { emoji:'🎃', name:'Chapeau Citrouille', rarity:'commun', unlock:"Capturer 100 poissons la nuit", key:'night100', perk:'+50% efficacité la nuit' },
            { emoji:'👓', name:'Lunettes', rarity:'commun', unlock:"Détecter 500 patterns still", key:'still500', perk:'+60% efficacité du pattern still' },
            { emoji:'🕶️', name:'Lunettes de Soleil', rarity:'rare', unlock:"Jouer 1000s en plein jour", key:'day1000', perk:'+40% efficacité en plein jour' },
            { emoji:'🪮', name:'Chapeau Élégant', rarity:'rare', unlock:"Capturer 50 sirènes mâles", key:'mermen50', perk:'+100% chance de spawn sirènes mâles' },
            { emoji:'🧢', name:'Casquette', rarity:'commun', unlock:"Capturer 300 poissons", key:'catches300', perk:'+20% vitesse de rembobinage' },
            { emoji:'🪖', name:'Casque Militaire', rarity:'épique', unlock:"Survivre 1000s avec tension >80%", key:'tension1000', perk:'+80% résistance à la tension' },
            { emoji:'⛑️', name:'Casque de Sécurité', rarity:'rare', unlock:"Capturer 250 poissons (stamina > 0)", key:'stamina250', perk:'+30% résistance aux cassures' },
            { emoji:'👑', name:'Couronne', rarity:'mythique', unlock:"Débloquer tous les autres chapeaux", key:'allHats', perk:'+500% points + tous les perks' },
            { emoji:'🎲', name:'Chapeau Dé', rarity:'rare', unlock:"Capturer 200 poissons aléatoirement", key:'random200', perk:'Effets aléatoires à chaque capture' },
            { emoji:'🪅', name:'Chapeau Piñata', rarity:'rare', unlock:"Capturer 100 poissons en 1 partie", key:'game100', perk:'+150% points si 100+ captures' },
            { emoji:'🗿', name:'Chapeau Moaï', rarity:'légendaire', unlock:"Capturer 50 poissons géants", key:'giant50', perk:'+200% taille des poissons' },
            { emoji:'🪦', name:'Chapeau Tombstone', rarity:'rare', unlock:"Mourir 50 fois", key:'deaths50', perk:'+100% chance de ressusciter' },
            { emoji:'🍔', name:'Chapeau Burger', rarity:'commun', unlock:"Capturer 500 poissons", key:'catches500', perk:'+30% taille des poissons' },
            { emoji:'🍜', name:'Chapeau Ramen', rarity:'rare', unlock:"Capturer 100 calmars", key:'squid100', perk:'+70% efficacité du pattern falling' },
            { emoji:'🍭', name:'Chapeau Sucette', rarity:'commun', unlock:"Capturer 200 crevettes", key:'shrimp200', perk:'+50% vitesse des crevettes' },
            { emoji:'🍉', name:'Chapeau Pastèque', rarity:'rare', unlock:"Capturer 100 poissons en été", key:'summer100', perk:'+60% efficacité en été' },
            { emoji:'🍍', name:'Chapeau Ananas', rarity:'rare', unlock:"Capturer 100 poissons tropicaux", key:'tropical100', perk:'+80% chance de spawn tropicaux' },
            { emoji:'🌻', name:'Chapeau Tournesol', rarity:'commun', unlock:"Capturer 200 poissons au lever du soleil", key:'dawn200', perk:'+40% efficacité à l\'aube' },
            { emoji:'🥀', name:'Chapeau Rose Fanée', rarity:'rare', unlock:"Capturer 50 poissons en automne", key:'autumn50', perk:'+70% efficacité en automne' },
            { emoji:'🌴', name:'Chapeau Palmier', rarity:'rare', unlock:"Capturer 100 poissons en été", key:'summer100', perk:'+60% efficacité en été' },
            { emoji:'🪹', name:'Chapeau Nid', rarity:'commun', unlock:"Capturer 300 poissons", key:'catches300', perk:'+20% vitesse de rembobinage' },
            { emoji:'🏳️‍🌈', name:'Chapeau Arc-en-ciel', rarity:'légendaire', unlock:"Capturer 1 de chaque espèce", key:'allSpecies', perk:'+100% points + couleurs arc-en-ciel' },
            { emoji:'🏳️‍⚧️', name:'Chapeau Trans', rarity:'rare', unlock:"Capturer 100 poissons", key:'catches100', perk:'+30% chance de transformation' },
            { emoji:'🏴‍☠️', name:'Chapeau Pirate', rarity:'épique', unlock:"Capturer 50 trésors", key:'treasure50', perk:'+200% chance de trésors' },
            { emoji:'🚩', name:'Chapeau Drapeau', rarity:'commun', unlock:"Capturer 100 poissons", key:'catches100', perk:'+20% points pour tous les poissons' },
            { emoji:'🗻', name:'Chapeau Montagne', rarity:'légendaire', unlock:"Capturer 1000 poissons", key:'catches1000', perk:'+150% poids des poissons' },
            { emoji:'🔥', name:'Chapeau Feu', rarity:'rare', unlock:"Capturer 200 poissons en été", key:'summer200', perk:'+80% efficacité en été' },
            { emoji:'❤️‍🔥', name:'Chapeau Cœur en Feu', rarity:'légendaire', unlock:"Capturer 500 poissons", key:'catches500', perk:'+100% chance de morsure' },
            { emoji:'💢', name:'Chapeau Colère', rarity:'rare', unlock:"Casser 50 lignes", key:'breaks50', perk:'+150% agressivité des poissons' },
            { emoji:'💤', name:'Chapeau Sommeil', rarity:'commun', unlock:"Jouer 2000s", key:'play2000', perk:'+50% lenteur des poissons' },
            { emoji:'💫', name:'Chapeau Étoile Filante', rarity:'légendaire', unlock:"Score parfait 25 fois", key:'perfect25', perk:'+400% chance de spawn espèces mythiques' },
            { emoji:'💬', name:'Chapeau Bulle', rarity:'rare', unlock:"Capturer 200 poissons transformés", key:'transform200', perk:'+60% efficacité sociale' }
        ],
        hatSpawns: [], // objets spawnés dans l'eau {emoji,x,y,vx,vy}
    };

    // Remplacer les chapeaux par le catalogue externe s'il est présent
    if (window.HAT_CATALOG && Array.isArray(window.HAT_CATALOG.hats) && window.HAT_CATALOG.hats.length > 0) {
        gameState.hatItems = window.HAT_CATALOG.hats;
    }

    // Synchroniser totalWeight avec la progression sauvegardée
    if (gameState.progress?.stats?.cumulativeWeightKg) {
        gameState.totalWeight = gameState.progress.stats.cumulativeWeightKg * 1000; // Convertir kg en grammes
    }

    // Variables pour l'animation
    let animationId = null;
    let lastTime = 0;

    // Accumulateur de spawn
    // (utiliser gameState.spawnAccumulator)

    // Fonction pour injecter les styles CSS
    function injectStyles() {
        if (document.getElementById('fishing-game-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'fishing-game-styles';
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Concert+One&display=swap');
            .fishing-game-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: min(${GAME_CONFIG.canvas.width}px, 90vw);
                height: min(${GAME_CONFIG.canvas.height}px, 90vh);
                max-width: 100vw;
                max-height: 100vh;
                min-width: 800px;
                min-height: 245px;
                background: rgba(0, 0, 0, 0.35);
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.35);
                border: 1px solid rgba(255,255,255,0.08);
                z-index: 9999;
                user-select: none;
                resize: both;
                overflow: hidden;
                --uiScale: 0.8; /* Échelle UI responsive (réduit) */
                font-family: 'Concert One', 'Segoe UI', system-ui, -apple-system, Roboto, Arial, sans-serif;
            }
            
            /* Appliquer la police à tous les éléments internes */
            .fishing-game-container * {
                font-family: inherit;
            }
            
            .fishing-game-drag-handle {
                position: absolute;
                top: 0; left: 0; right: 0; height: 24px;
                cursor: move;
                background: linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0));
                z-index: 3;
            }
            
            /* En-tête contenant la liste des poissons capturés */
            .fishing-game-header {
                position: absolute;
                bottom: 8px;
                left: calc(12px * var(--uiScale));
                z-index: 3;
                display: flex;
                align-items: center;
                pointer-events: none; /* ne bloque pas les clics */
                max-width: 150px; /* Limiter la largeur pour éviter le chevauchement */
            }
            #fishing-caught-display {
                display: flex; /* sera masqué/affiché en JS au besoin */
                align-items: center;
                gap: calc(4px * var(--uiScale));
                font-size: clamp(12px, calc(16px * var(--uiScale)), 18px);
                color: #fff;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.6);
                pointer-events: none;
            }
            
            /* Assurer que le canvas reste derrière l'UI */
            .fishing-game-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                cursor: none;
                object-fit: contain;
                max-width: 100%;
                max-height: 100%;
            }
            
            .fishing-timer-display {
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 14px;
                padding: 6px 12px;
                border-radius: 6px;
                background: rgba(0,0,0,0.2);
                color: #fff;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                backdrop-filter: blur(6px);
                z-index: 10000;
                display: block;
                width: auto;
                min-width: 240px;
                max-width: 85%;
                height: 36px;
                box-sizing: border-box;
            }
            .fishing-timer-display .timer-row {
                display: flex; 
                align-items: center; 
                justify-content: center;
                width: 100%;
                height: 100%;
                gap: 8px;
                flex-wrap: wrap;
            }
            .fishing-timer-display .scores-inline {
                display: flex; 
                gap: 8px;
                font-size: 12px;
                opacity: 0.95;
            }
            .fishing-score-corner { display:flex; }
            
            .fishing-game-controls {
                display: none;
            }
            
            .fishing-btn-primary {
                background: linear-gradient(45deg, #10b981, #059669);
                color: white;
                border: none;
                padding: clamp(6px, calc(8px * var(--uiScale)), 12px) clamp(10px, calc(16px * var(--uiScale)), 20px);
                font-size: clamp(13px, calc(15px * var(--uiScale)), 17px);
                border-radius: calc(8px * var(--uiScale));
                min-height: calc(36px * var(--uiScale));
                min-width: calc(140px * var(--uiScale));
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            
            .fishing-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.6);
            }
            
            .fishing-btn-primary.tension-medium {
                background: linear-gradient(45deg, #f59e0b, #d97706);
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.5);
            }
            
            .fishing-btn-primary.tension-high {
                background: linear-gradient(45deg, #ef4444, #dc2626);
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.6);
            }
            
            .fishing-btn-secondary {
                background: linear-gradient(45deg, #ef4444, #dc2626);
                color: white;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                padding: clamp(6px, calc(8px * var(--uiScale)), 12px) clamp(10px, calc(16px * var(--uiScale)), 20px);
                font-size: clamp(13px, calc(15px * var(--uiScale)), 17px);
                border-radius: calc(8px * var(--uiScale));
                min-height: calc(36px * var(--uiScale));
                min-width: calc(140px * var(--uiScale));
            }

            .fishing-btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
            }

            .fishing-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none !important;
            }

            .fishing-power-bar {
                display: none;
            }

            .fishing-power-fill {
                display: none;
            }

            @keyframes bonusFadeUp {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                50% {
                    opacity: 1;
                    transform: translate(-50%, -80%) scale(1.2);
                }
                100% {
                    opacity: 0;
                    transform: translate(-50%, -120%) scale(1);
                }
            }

            .fishing-instructions {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                max-width: 400px;
                font-size: 16px;
                line-height: 1.6;
                z-index: 10005;
            }

            .fishing-instructions h2 {
                margin: 0 0 15px 0;
                color: #f59e0b;
                font-size: 24px;
            }

            .fishing-instructions ul {
                text-align: left;
                margin: 15px 0;
            }

            .fishing-instructions li {
                margin: 8px 0;
            }

            .fishing-game-over {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, rgba(15, 42, 107, 0.98), rgba(30, 58, 138, 0.98));
                color: white;
                padding: 50px 60px;
                border-radius: 30px;
                text-align: center;
                max-width: 550px;
                font-size: 18px;
                line-height: 1.8;
                z-index: 10006;
                box-shadow: 0 20px 60px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.1);
                border: 3px solid rgba(16, 185, 129, 0.3);
                backdrop-filter: blur(10px);
                animation: fadeInScale 0.4s ease-out;
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }

            .fishing-game-over h2 {
                margin: 0 0 30px 0;
                color: #10b981;
                font-size: 42px;
                text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
                font-weight: 800;
                letter-spacing: 1px;
            }
            
            .fishing-stats-container {
                background: rgba(0,0,0,0.3);
                border-radius: 20px;
                padding: 25px;
                margin: 25px 0;
                border: 2px solid rgba(255,255,255,0.1);
            }

            .fishing-score {
                font-size: 36px;
                margin: 15px 0;
                color: #10b981;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }

            .fishing-high-score {
                font-size: 24px;
                margin: 10px 0;
                color: #f59e0b;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .fishing-caught-count {
                font-size: 20px;
                margin: 15px 0;
                color: #60a5fa;
                font-weight: 600;
            }
            
            .fishing-caught-gallery {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 8px;
                margin: 20px 0;
                font-size: 32px;
            }

            .fishing-close-btn {
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Fonction pour mettre à jour la taille de la fenêtre basée sur le poids total
    function updateWindowSizeBasedOnWeight() {
        const container = document.querySelector('.fishing-game-container');
        if (!container) return;
        
        const maxSize = calculateMaxWindowSize();
        const currentWeight = Math.max(gameState.totalWeight, (gameState.progress?.stats?.cumulativeWeightKg || 0) * 1000);
        
        if (currentWeight > 0) {
            // Mettre à jour les tailles maximales
            container.style.maxWidth = maxSize.width + 'px';
            container.style.maxHeight = maxSize.height + 'px';
        }
    }

    // Fonction pour calculer la taille maximale de la fenêtre basée sur le poids total
    function calculateMaxWindowSize() {
        const maxWeight = 1000000; // 1 tonne = 1 000 000 grammes
        const baseWidth = 800;
        const baseHeight = 245;
        
        // Taille maximale basée sur la fenêtre du navigateur (90% pour laisser de la marge)
        const browserMaxWidth = Math.floor(window.innerWidth * 0.9);
        const browserMaxHeight = Math.floor(window.innerHeight * 0.9);
        
        // Utiliser le poids total depuis la progression sauvegardée (en kg converti en grammes)
        const savedWeight = (gameState.progress?.stats?.cumulativeWeightKg || 0) * 1000;
        const currentWeight = Math.max(gameState.totalWeight, savedWeight);
        
        // Calculer le ratio de progression (0 à 1)
        const progress = Math.min(1, currentWeight / maxWeight);
        
        // Courbe de décroissance exponentielle : plus de progression au début, moins à la fin
        // Utilise une fonction exponentielle inverse : 1 - e^(-k*x) où k contrôle la pente
        const k = 3; // Facteur de décroissance (plus k est grand, plus la progression est rapide au début)
        const exponentialProgress = 1 - Math.exp(-k * progress);
        
        // Interpolation basée sur la courbe exponentielle
        const currentWidth = Math.round(baseWidth + (browserMaxWidth - baseWidth) * exponentialProgress);
        const currentHeight = Math.round(baseHeight + (browserMaxHeight - baseHeight) * exponentialProgress);
        
        
        return { width: currentWidth, height: currentHeight };
    }

    // Fonction pour faire spawner un chapeau flottant à la surface
    function spawnFloatingHat(emoji) {
        const canvas = document.querySelector('.fishing-game-canvas');
        if (!canvas) return;
        
        const hat = {
            emoji: emoji,
            x: Math.random() * (canvas.width - 60) + 30, // Position aléatoire sur la largeur
            y: 50, // Surface de l'eau
            vx: (Math.random() - 0.5) * 20, // Vitesse horizontale aléatoire
            vy: 0, // Pas de vitesse verticale initiale
            bobPhase: Math.random() * Math.PI * 2, // Phase pour le mouvement de flottement
            bobSpeed: 0.02 + Math.random() * 0.01, // Vitesse de flottement
            bobAmplitude: 3 + Math.random() * 2, // Amplitude du flottement
            size: 24 + Math.random() * 8, // Taille légèrement variable
            collected: false,
            collectionTimer: 0
        };
        
        gameState.floatingHats.push(hat);
        console.log(`[Chapeau] ${emoji} spawné à la surface`);
    }

    // Fonction pour mettre à jour la physique des chapeaux flottants
    function updateFloatingHats(deltaSec, canvas) {
        gameState.floatingHats.forEach((hat, index) => {
            if (hat.collected) {
                hat.collectionTimer += deltaSec;
                if (hat.collectionTimer > 1.0) { // Disparaît après 1 seconde
                    gameState.floatingHats.splice(index, 1);
                }
                return;
            }
            
            // Mouvement de flottement vertical
            hat.bobPhase += hat.bobSpeed * deltaSec * 60;
            const waterLevel = GAME_CONFIG.water.level;
            hat.y = waterLevel + Math.sin(hat.bobPhase) * hat.bobAmplitude; // à la ligne de surface
            
            // Mouvement horizontal (dérive)
            hat.x += hat.vx * deltaSec;
            
            // Rebond sur les bords
            if (hat.x < 30) {
                hat.x = 30;
                hat.vx = Math.abs(hat.vx);
            } else if (hat.x > canvas.width - 30) {
                hat.x = canvas.width - 30;
                hat.vx = -Math.abs(hat.vx);
            }
            
            // Légère friction
            hat.vx *= 0.98;
        });
    }

    // Fonction pour vérifier la collision entre l'hameçon et les chapeaux
    function checkHatCollision() {
        if (!gameState.hookPosition) return;
        
        gameState.floatingHats.forEach((hat, index) => {
            if (hat.collected) return;
            
            const distance = Math.hypot(
                gameState.hookPosition.x - hat.x,
                gameState.hookPosition.y - hat.y
            );
            
            if (distance < 25) { // Distance de collision
                collectHat(hat, index);
            }
        });
    }

    // Fonction pour collecter un chapeau
    function collectHat(hat, index) {
        hat.collected = true;
        hat.collectionTimer = 0;
        
        // Ajouter le chapeau à la collection du joueur
        const hats = gameState.progress.hats || { unlocked:[], owned:[], equipped:null };
        if (!hats.owned) hats.owned = [];
        if (!hats.owned.includes(hat.emoji)) {
            hats.owned.push(hat.emoji);
        }
        
        // Sauvegarder la progression
        saveProgress();
        
        // Afficher une notification
        showUnlockToast(hat.emoji, 'Chapeau collecté !');
        
        console.log(`[Chapeau] ${hat.emoji} collecté par le joueur`);
    }

    // Fonction pour dessiner les chapeaux flottants
    function drawFloatingHats(ctx, canvas) {
        gameState.floatingHats.forEach(hat => {
            if (hat.collected) {
                // Animation de collection (scaling et fade)
                const progress = Math.min(1, hat.collectionTimer);
                const scale = 1 + progress * 0.5;
                const alpha = 1 - progress;
                
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `${hat.size * scale}px sans-serif`;
                ctx.fillText(hat.emoji, hat.x, hat.y);
                ctx.restore();
            } else {
                // Rendu normal
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = `${hat.size}px sans-serif`;
                ctx.fillText(hat.emoji, hat.x, hat.y);
                ctx.restore();
            }
        });
    }

    // Fonction pour équiper un chapeau
    function equipHat(hatEmoji) {
        const hats = gameState.progress.hats || { unlocked:[], owned:[], equipped:null };
        if (hats.owned && hats.owned.includes(hatEmoji)) {
            hats.equipped = hatEmoji;
            saveProgress();
            showUnlockToast(hatEmoji, 'Chapeau équipé !');
            console.log(`[Chapeau] ${hatEmoji} équipé`);
        }
    }

    // Fonction pour déséquiper le chapeau actuel
    function unequipHat() {
        const hats = gameState.progress.hats || { unlocked:[], owned:[], equipped:null };
        hats.equipped = null;
        saveProgress();
        console.log('[Chapeau] Chapeau déséquipé');
    }

    // Fonction pour afficher le menu de sélection de chapeaux
    function showHatSelectionMenu() {
        const ownedHats = gameState.progress?.hats?.owned || [];
        const equippedHat = gameState.progress?.hats?.equipped;
        
        if (ownedHats.length === 0) {
            showUnlockToast('🎩', 'Aucun chapeau collecté');
            return;
        }
        
        // Créer la fenêtre de sélection
        const menu = document.createElement('div');
        menu.className = 'hat-selection-menu';
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(15, 42, 107, 0.98), rgba(30, 58, 138, 0.98));
            color: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            z-index: 10007;
            box-shadow: 0 20px 60px rgba(0,0,0,0.7);
            border: 3px solid rgba(16, 185, 129, 0.3);
            backdrop-filter: blur(10px);
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        menu.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #10b981; font-size: 28px;">🎩 Chapeaux Collectés</h2>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; margin: 20px 0;">
                ${ownedHats.map(hatEmoji => {
                    const isEquipped = hatEmoji === equippedHat;
                    return `
                        <div class="hat-item" style="
                            background: ${isEquipped ? 'linear-gradient(45deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)'};
                            padding: 15px;
                            border-radius: 12px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            border: 2px solid ${isEquipped ? '#10b981' : 'transparent'};
                            min-width: 80px;
                        " data-hat="${hatEmoji}">
                            <div style="font-size: 32px; margin-bottom: 8px;">${hatEmoji}</div>
                            <div style="font-size: 12px; opacity: 0.8;">
                                ${isEquipped ? 'ÉQUIPÉ' : 'Cliquer pour équiper'}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div style="margin-top: 20px;">
                <button id="unequip-hat-btn" style="
                    background: linear-gradient(45deg, #ef4444, #dc2626);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-right: 10px;
                    font-size: 14px;
                ">Déséquiper</button>
                <button id="close-hat-menu-btn" style="
                    background: linear-gradient(45deg, #6b7280, #4b5563);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                ">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Gestionnaires d'événements
        menu.querySelectorAll('.hat-item').forEach(item => {
            item.addEventListener('click', () => {
                const hatEmoji = item.dataset.hat;
                equipHat(hatEmoji);
                menu.remove();
            });
            
            item.addEventListener('mouseenter', () => {
                if (item.dataset.hat !== equippedHat) {
                    item.style.transform = 'scale(1.05)';
                    item.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
                item.style.boxShadow = 'none';
            });
        });
        
        document.getElementById('unequip-hat-btn').addEventListener('click', () => {
            unequipHat();
            menu.remove();
        });
        
        document.getElementById('close-hat-menu-btn').addEventListener('click', () => {
            menu.remove();
        });
        
        // Fermer en cliquant à l'extérieur
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                menu.remove();
            }
        });
    }

    // Fonction pour calculer le nombre maximum de poissons basé sur l'aire de la fenêtre
    function calculateMaxFishCount() {
        const container = document.querySelector('.fishing-game-container');
        if (!container) return GAME_CONFIG.fish.maxCount;
        
        const rect = container.getBoundingClientRect();
        const area = rect.width * rect.height;
        
        // Aire de référence pour 8 poissons (800x245 = 196000 pixels carrés)
        const referenceArea = 800 * 245;
        const referenceFishCount = 8; // Augmenté de 6 à 8
        
        // Calculer le ratio d'aire
        const areaRatio = area / referenceArea;
        
        // Calculer le nombre de poissons (minimum 4, maximum 20) - densité augmentée
        const calculatedCount = Math.round(referenceFishCount * areaRatio);
        const maxFishCount = Math.max(4, Math.min(20, calculatedCount));
        
        
        return maxFishCount;
    }

    // Fonction pour ajuster la taille du canvas
    function adjustCanvasSize() {
        const canvas = document.getElementById('fishing-canvas');
        const container = document.querySelector('.fishing-game-container');
        if (canvas && container) {
            const containerRect = container.getBoundingClientRect();
            const maxWidth = containerRect.width;
            const maxHeight = containerRect.height - 60; // Réserver de l'espace pour l'UI
            
            // Calculer les dimensions optimales en gardant le ratio 800:245
            const aspectRatio = 800 / 245; // width/height
            let canvasWidth = maxWidth;
            let canvasHeight = maxWidth / aspectRatio;
            
            if (canvasHeight > maxHeight) {
                canvasHeight = maxHeight;
                canvasWidth = maxHeight * aspectRatio;
            }
            
            // Appliquer les dimensions
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            canvas.style.width = canvasWidth + 'px';
            canvas.style.height = canvasHeight + 'px';
        }
    }

    // Fonction pour créer l'interface du jeu
    function createGameInterface() {
        const container = document.createElement('div');
        container.className = 'fishing-game-container';
        
        container.innerHTML = `
            <div class="fishing-game-drag-handle"></div>
            <div class="fishing-game-header">
                <div id="fishing-caught-display" style="font-size:18px;font-weight:bold;color:white;text-shadow:2px 2px 4px rgba(0,0,0,0.6);display:flex;align-items:center;gap:6px;">
                    <span id="fishing-caught-list"></span>
                </div>
            </div>
            
            <canvas id="fishing-canvas" class="fishing-game-canvas" width="800" height="245" style="width: 100%; height: 100%; object-fit: contain;"></canvas>
            
            <div id="fishing-timer-display" class="fishing-timer-display" style="display:block;">
                <div class="timer-row">
                    ⏱️ <span id="fishing-time">60</span>s
                    <span id="fishing-time-of-day" style="margin-left:10px;"></span>
                    <span id="fishing-season" style="margin-left:8px;"></span>
                    <div class="scores-inline">
                        <div>Score: <span id="fishing-score">0</span></div>
                        <div>Meilleur: <span id="fishing-high-score">${gameState.highScore}</span></div>
                        <div>Poids: <span id="fishing-weight">0g</span></div>
                    </div>
                    
                </div>
            </div>
            
            <!-- Slider de poids d'hameçon en overlay côté gauche, aligné verticalement comme la jauge de profondeur -->
            <div id="hook-weight-slider-wrap" style="display:none; position:absolute; left:8px; top:50%; transform:translateY(-50%); width:36px; height:160px; z-index:10001; align-items:center; justify-content:center;">
                <div title="Poids de l'hameçon" style="position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:12px; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.5);">🪝</div>
                <input id="hook-weight-slider" type="range" min="0.5" max="1.2" step="0.1" value="${(Math.max(0.5, Math.min(1.2, gameState.progress?.features?.hookWeightFactor||1)))}" style="-webkit-appearance: none; appearance: none; position:absolute; left:50%; top:50%; transform: translate(-50%, -50%) rotate(-90deg); width:140px; height:6px; border-radius:4px; background:linear-gradient(90deg,#fca5a5,#ef4444); outline:none;">
                <div id="hook-weight-value" style="position:absolute; bottom:-18px; left:50%; transform:translateX(-50%); font-size:11px; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,.5);">${(gameState.progress?.features?.hookWeightFactor||1).toFixed(1)}×</div>
            </div>

            <div id="fishing-score-corner" class="fishing-score-corner">
                <div>Score: <span id="fishing-score">0</span></div>
                <div>Meilleur: <span id="fishing-high-score">${gameState.highScore}</span></div>
            </div>
            
            <div id="fishing-instructions" class="fishing-instructions">
                <h2>🎣 Instructions</h2>
                <p>Bienvenue dans le mini-jeu de pêche !</p>
                <ul>
                    <li><strong>Lancer la ligne :</strong> Maintenez le bouton pour charger la puissance</li>
                    <li><strong>Rembobiner :</strong> Cliquez pour remonter la ligne et attraper les poissons</li>
                    <li><strong>Objectif :</strong> Attrapez le maximum de poissons en 60 secondes</li>
                    <li><strong>Points :</strong> Plus le poisson est gros, plus il vaut de points</li>
                </ul>
                <button id="fishing-start-btn" class="fishing-btn fishing-btn-primary">Commencer</button>
            </div>
            
            <button class="fishing-close-btn" id="fishing-close-btn">×</button>
        `;
        
        document.body.appendChild(container);
        
        // Restaurer la taille et position sauvegardées après l'ajout au DOM
        const savedWindowState = getCookie('fishingWindowState');
        if (savedWindowState) {
            try {
                // getCookie fait déjà le décodage et parsing JSON
                const windowState = savedWindowState;
                // Utiliser setTimeout pour s'assurer que le DOM est rendu
                setTimeout(() => {
                    container.style.width = windowState.width + 'px';
                    container.style.height = windowState.height + 'px';
                    container.style.left = windowState.left + 'px';
                    container.style.top = windowState.top + 'px';
                    container.style.transform = 'none'; // Désactiver le centrage automatique
                    // Calculer le nombre maximum de poissons après restauration
                    const initialMaxCount = calculateMaxFishCount();
                }, 50); // Augmenter le délai pour être sûr
            } catch (e) {
            }
        }
        
        // Ajouter la fonctionnalité de déplacement
        makeDraggable(container);
        
        // Bouton guide (fixe en haut-gauche)
        let guideBtn = document.getElementById('fishing-guide-btn-fixed');
        if (!guideBtn) {
            guideBtn = document.createElement('button');
            guideBtn.id = 'fishing-guide-btn-fixed';
            guideBtn.title = 'Guide';
            guideBtn.setAttribute('aria-label', 'Guide');
            guideBtn.textContent = '📙';
            guideBtn.style.cssText = 'position:fixed;top:10px;left:10px;z-index:10010;background:linear-gradient(135deg, rgba(15, 42, 107, 0.98), rgba(30, 58, 138, 0.98));color:white;border:none;border-radius:8px;padding:6px 10px;font-size:16px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3)';
            document.body.appendChild(guideBtn);
        }
        guideBtn.onclick = showGuide;

        // Affichage auto d'un écran d'information si progression vierge
        try {
            const st = gameState.progress?.stats || {};
            const isZero = (st.totalCasts||0) === 0 && (st.cumulativeWeightKg||0) === 0 && (st.cumulativeScore||0) === 0;
            if (isZero) {
                showGameplayInfoOverlay();
            }
        } catch(e) { /* noop */ }

        // Initialiser le slider de poids d'hameçon si débloqué
        const features = gameState.progress.features || (gameState.progress.features = { hookWeightUnlocked:false, hookWeightFactor:1 });
        const sliderWrap = container.querySelector('#hook-weight-slider-wrap');
        const slider = container.querySelector('#hook-weight-slider');
        const sliderVal = container.querySelector('#hook-weight-value');
        if (sliderWrap && slider && sliderVal) {
            if (features.hookWeightUnlocked) {
                sliderWrap.style.display = 'inline-flex';
            }
            const current = Math.max(0.5, Math.min(1.2, Number(features.hookWeightFactor || 1)));
            slider.value = String(current);
            sliderVal.textContent = `${current.toFixed(1)}×`;
            gameState.hookWeightFactor = current;
            slider.addEventListener('input', () => {
                const v = Math.max(0.5, Math.min(1.2, Number(slider.value)));
                gameState.hookWeightFactor = v;
                features.hookWeightFactor = v;
                sliderVal.textContent = `${v.toFixed(1)}×`;
                saveProgress();
            });
        }
        
        // Créer le bouton gestionnaire de cookies en dehors du conteneur (sur le fond)
        let floatingCookieBtn = document.getElementById('fishing-cookie-floating-btn');
        if (!floatingCookieBtn) {
            floatingCookieBtn = document.createElement('button');
            floatingCookieBtn.id = 'fishing-cookie-floating-btn';
            floatingCookieBtn.title = 'Gestionnaire de Cookies';
            floatingCookieBtn.setAttribute('aria-label', 'Gestionnaire de Cookies');
            floatingCookieBtn.textContent = '🔧';
            floatingCookieBtn.style.position = 'fixed';
            floatingCookieBtn.style.zIndex = '9000'; /* sous le conteneur (9999), mais visible */
            floatingCookieBtn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            floatingCookieBtn.style.color = 'white';
            floatingCookieBtn.style.border = 'none';
            floatingCookieBtn.style.padding = '6px 10px';
            floatingCookieBtn.style.fontSize = '16px';
            floatingCookieBtn.style.borderRadius = '10px';
            floatingCookieBtn.style.boxShadow = '0 4px 12px rgba(16,185,129,0.45)';
            floatingCookieBtn.style.cursor = 'pointer';
            floatingCookieBtn.style.opacity = '0.95';
            document.body.appendChild(floatingCookieBtn);
            floatingCookieBtn.addEventListener('click', showCookieManager);
        }

        // Positionner le bouton flottant aligné avec le cartouche UI (timer centré en bas)
        const positionFloatingCookieBtn = () => {
            const rect = container.getBoundingClientRect();
            const timerHeight = 36; // hauteur CSS réduite du timer
            const bottomPadding = 8; // comme dans le CSS du timer
            const btnRect = floatingCookieBtn.getBoundingClientRect();
            const btnHalfH = btnRect.height ? btnRect.height / 2 : 16;
            const y = rect.bottom - bottomPadding - (timerHeight / 2) - btnHalfH + window.scrollY;
            const x = rect.right + 10 + window.scrollX; // à droite du conteneur
            floatingCookieBtn.style.top = `${Math.max(10, y)}px`;
            floatingCookieBtn.style.left = `${x}px`;
        };

        // Mettre à jour la position régulièrement et sur resize/scroll
        positionFloatingCookieBtn();
        window.addEventListener('resize', positionFloatingCookieBtn);
        window.addEventListener('scroll', positionFloatingCookieBtn, { passive: true });
        const posInterval = setInterval(() => {
            if (!document.body.contains(container) || !document.body.contains(floatingCookieBtn)) {
                clearInterval(posInterval);
                return;
            }
            positionFloatingCookieBtn();
        }, 150);
        
        // Calculer le nombre maximum de poissons initial même sans restauration
        setTimeout(() => {
            const initialMaxCount = calculateMaxFishCount();
            // Mettre uniquement à jour les limites max, pas la taille définie par l'utilisateur
            const maxSize = calculateMaxWindowSize();
            container.style.maxWidth = maxSize.width + 'px';
            container.style.maxHeight = maxSize.height + 'px';
        }, 100);
        
        return container;
    }
    
    // Fonction pour rendre la fenêtre déplaçable
    function makeDraggable(element) {
        const dragHandle = element.querySelector('.fishing-game-drag-handle');
        if (!dragHandle) return;
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        
        dragHandle.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
        
        function dragStart(e) {
            // Ne pas interférer avec le bouton de fermeture
            if (e.target.closest('.fishing-close-btn')) return;
            
            initialX = e.clientX - (parseInt(element.style.left) || 0);
            initialY = e.clientY - (parseInt(element.style.top) || 0);
            
            if (e.target === dragHandle || dragHandle.contains(e.target)) {
                isDragging = true;
                element.style.transform = 'none'; // Retirer le centrage
            }
        }
        
        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                
                element.style.left = currentX + 'px';
                element.style.top = currentY + 'px';
            }
        }
        
        function dragEnd() {
            isDragging = false;
        }
        
        // Observer pour appliquer l'échelle UI lors du redimensionnement (sans forcer le ratio)
        let resizeTimeout;
        const resizeObserver = new ResizeObserver(entries => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Appliquer l'échelle UI
                applyUiScale(element);
            }, 50);
        });
        resizeObserver.observe(element);
        
        // Appliquer une échelle initiale
        applyUiScale(element);
    }

    // Calculer et appliquer l'échelle UI en fonction de la largeur du conteneur
    function applyUiScale(container) {
        try {
            const baseW = GAME_CONFIG.canvas.width;
            const rect = container.getBoundingClientRect();
            const scale = Math.max(0.6, Math.min(1.6, rect.width / baseW));
            container.style.setProperty('--uiScale', String(scale));
        } catch (e) { /* noop */ }
    }

    // Fonction pour initialiser le canvas et le contexte
    function initCanvas() {
        const canvas = document.getElementById('fishing-canvas');
        const ctx = canvas.getContext('2d');
        
        // Adapter la taille du canvas à son conteneur
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Initialiser les vagues
        for (let i = 0; i < canvas.width; i += 10) {
            gameState.waves.push({
                x: i,
                phase: Math.random() * Math.PI * 2
            });
        }
        
        // Initialiser les bulles
        for (let i = 0; i < GAME_CONFIG.bubbles.count; i++) {
            gameState.bubbles.push({
                x: Math.random() * canvas.width,
                y: GAME_CONFIG.water.level + Math.random() * (canvas.height - GAME_CONFIG.water.level),
                size: 1 + Math.random() * 3,
                speed: 0.6 + Math.random() * 1.2
            });
        }
        
        // Initialiser le motif fixe du fond marin
        // Les plus gros objets sont dessinés en premier (arrière-plan)
        gameState.seabedDecor = [];
        const decorCount = GAME_CONFIG.seabed?.decorCount || 20;
        const emojis = GAME_CONFIG.seabed?.emojis || ['🌿','🌾','🪸','🪨'];
        for (let i=0;i<decorCount;i++){
            // La taille diminue progressivement : grand (80px) → petit (20px)
            const progress = i / (decorCount - 1); // 0 à 1
            const maxSize = 80 - (progress * 60); // 80px → 20px
            const minSize = Math.max(15, maxSize - 25); // Variation autour de la taille max
            const size = minSize + Math.floor(Math.random() * (maxSize - minSize));
            
            gameState.seabedDecor.push({
                xNorm: Math.random(), // Position horizontale complètement aléatoire
                emoji: emojis[Math.floor(Math.random()*emojis.length)],
                size: size
            });
        }
        
        // Observer les changements de taille du conteneur
        const resizeObserver = new ResizeObserver(() => {
            const newRect = container.getBoundingClientRect();
            canvas.width = newRect.width;
            canvas.height = newRect.height;
            
            // Supprimer la ligne en cours lors du redimensionnement
            removeLineOnResize();
            
            // Réinitialiser les vagues après redimensionnement
            gameState.waves = [];
            for (let i = 0; i < canvas.width; i += 10) {
                gameState.waves.push({
                    x: i,
                    phase: Math.random() * Math.PI * 2
                });
            }
        });
        resizeObserver.observe(container);
        
        return { canvas, ctx };
    }

    // Fonction pour supprimer la ligne lors du redimensionnement
    function removeLineOnResize() {
        // Vérifier si on est en train de pêcher (avec ou sans poisson)
        if (gameState.isCasting) {
            // Libérer les poissons attachés s'il y en a
            if (gameState.attachedFish.length > 0) {
                gameState.attachedFish.forEach(att => {
                    if (att.fish) {
                        // Marquer le poisson comme "s'échappant"
                        att.fish.escaping = true;
                        att.fish.escapeStartTime = performance.now();
                        att.fish.escapeVx = -(200 + Math.random() * 150);
                        att.fish.escapeVy = 50 + Math.random() * 100;
                    }
                });
                
                // Incrémenter le compteur de casses seulement si le timer est activé
                if (gameState.timerEnabled && gameState.progress?.stats) {
                    gameState.progress.stats.lineBreaks = (gameState.progress.stats.lineBreaks || 0) + 1;
                    gameState.progress.stats.currentNoBreakStreak = 0;
                    gameState.progress.stats.gameDeaths = (gameState.progress.stats.gameDeaths || 0) + 1;
                    saveProgress();
                }
            }
            
            // Réinitialiser la ligne (avec ou sans poisson)
            gameState.attachedFish = [];
            gameState.reelIntensity = 0;
            gameState.isReeling = false;
            gameState.lineTension = 0;
            gameState.isCasting = false;
            gameState.lineSnapped = false;
            gameState.breakAccum = 0;
            
            // Repositionner l'hameçon
            const canvasEl = document.getElementById('fishing-canvas');
            if (canvasEl) {
                gameState.hookPosition.x = canvasEl.width - 100;
                gameState.hookPosition.y = 88;
            }
            
            // Afficher un message
            showToast('Ligne supprimée lors du redimensionnement !', 'warning');
        }
    }

    // Initialiser les nuages
    function initClouds(canvas) {
        const weatherEmojis = {
            clear: ['☁️'],
            cloudy: ['☁️'],
            rainy: ['🌧️', '☁️'],
            stormy: ['⛈️', '🌩️', '🌨️']
        };
        const count = gameState.weather === 'clear' ? 3 : gameState.weather === 'cloudy' ? 5 : 7;
        const emojis = weatherEmojis[gameState.weather] || weatherEmojis.clear;
        
        gameState.clouds = [];
        const skyHeight = 30; // Hauteur fixe de 30 pixels pour les nuages
        
        // Ajouter le soleil ou la lune selon l'heure
        const t = gameState.timeOfDay;
        const isDaytime = t >= 0.25 && t < 0.75; // Jour entre 6h et 18h
        
        if (isDaytime) {
            // Ajouter le soleil dans le coin haut à gauche
            gameState.clouds.push({
                x: 40,
                y: 30,
                speed: 0, // Immobile
                emoji: '☀️',
                size: 60,
                opacity: 1.0,
                isSun: true
            });
        } else {
            // Ajouter la lune dans le coin haut à gauche
            gameState.clouds.push({
                x: 40,
                y: 30,
                speed: 0, // Immobile
                emoji: '🌖',
                size: 55,
                opacity: 0.95,
                isMoon: true
            });
        }
        
        // Ajouter les nuages normaux (dans les 30 pixels du haut)
        for (let i = 0; i < count; i++) {
            gameState.clouds.push({
                x: Math.random() * (canvas.width - 150), // Éviter la zone du soleil/lune
                y: 5 + Math.random() * (skyHeight - 10), // Entre 5px et 30px du haut
                speed: 8 + Math.random() * 15, // Plus rapide
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
                size: 25 + Math.random() * 25, // Plus gros
                opacity: 0.7 + Math.random() * 0.3
            });
        }
    }

    // Mettre à jour et dessiner les nuages
    function drawClouds(ctx, canvas) {
        if (!gameState.clouds || gameState.clouds.length === 0) {
            initClouds(canvas);
        }
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Helpers pour animer soleil/lune selon l'heure
        const clamp01 = (x) => Math.max(0, Math.min(1, x));
        const smoothstep = (a, b, x) => {
            const t = clamp01((x - a) / Math.max(1e-6, (b - a)));
            return t * t * (3 - 2 * t);
        };
        const updateSunMoonPositions = (set) => {
            const t = (gameState.renderTimeOfDay || gameState.timeOfDay || 0);
            // Soleil/Lune: trajet d'une période entière
            // Soleil: de matin (t≈0.30) à soir (début crépuscule t≈0.85)
            // Lune: de nuit (t≈0.85) à matin (t≈0.30, wrap)
            const cx = canvas.width * 0.5;
            const ySurface = GAME_CONFIG.water.level;
            const apexY = ySurface * 0.4; // sommet de l'arc
            const w = canvas.width;       // largeur totale du parcours
            // Paramètres de périodes
            const SUN_START = 0.30, SUN_END = 0.85;     // matin -> soir
            const MOON_START = 0.85, MOON_END = 0.30;   // nuit -> matin (wrap)
            const sunActive = (t >= SUN_START && t < SUN_END);
            const tn = (t < SUN_START) ? t + 1 : t;      // facilite le wrap pour la lune
            const moonActive = (tn >= MOON_START && tn < (1 + MOON_END));
            // Courbes d'opacité progressives aux extrémités
            const fadeInOut = (s) => {
                const a = smoothstep(0.0, 0.1, s);
                const b = 1 - smoothstep(0.9, 1.0, s);
                return clamp01(a * b);
            };
            // Soleil
            const sunU = clamp01((t - SUN_START) / (SUN_END - SUN_START)); // 0..1 pendant la journée utile
            const sunX = -w/2 + w * sunU;
            // Parabole: centre (x=0) à apexY, bords (|x|=w/2) à ySurface
            const sunY = apexY + (ySurface - apexY) * Math.pow((sunX) / (w/2), 2);
            const sunAlpha = sunActive ? fadeInOut(sunU) : 0;
            // Lune (wrap nuit -> matin)
            const moonU = clamp01((tn - MOON_START) / ((1 + MOON_END) - MOON_START));
            const moonX = -w/2 + w * moonU;
            const moonY = apexY + (ySurface - apexY) * Math.pow((moonX) / (w/2), 2);
            const moonAlpha = moonActive ? 0.95 * fadeInOut(moonU) : 0;
            for (const c of set) {
                if (c.isSun) {
                    c.x = cx + sunX;
                    c.y = sunY;
                    c._alphaOverride = sunAlpha;
                } else if (c.isMoon) {
                    c.x = cx + moonX;
                    c.y = moonY;
                    c._alphaOverride = moonAlpha;
                } else {
                    c._alphaOverride = undefined;
                }
            }
        };
        const drawSet = (set, alphaScale) => {
            updateSunMoonPositions(set || []);
            for (const cloud of set) {
                if (!cloud.isSun && !cloud.isMoon) {
                    cloud.x += cloud.speed * 0.016; // ~60fps
                    if (cloud.x > canvas.width + 50) {
                        cloud.x = -50;
                        cloud.y = 5 + Math.random() * 25; // Respawn dans les 30 pixels du haut
                    }
                }
                // Dessiner
                const baseAlpha = (cloud.opacity ?? 1);
                const over = (cloud._alphaOverride === undefined) ? 1 : cloud._alphaOverride;
                ctx.globalAlpha = baseAlpha * over * alphaScale;
                ctx.font = `${cloud.size}px sans-serif`;
                ctx.fillText(cloud.emoji, cloud.x, cloud.y);
            }
        };
        const baseDayNight = 0.0035;
        const speedFactor = ((gameState.dayNightSpeed ?? baseDayNight) / baseDayNight);
        const cf = gameState.cloudsCrossfade ?? 1;
        if (gameState.cloudsOld && gameState.cloudsNew && cf < 1) {
            // Appliquer easing doux pour les nuages aussi
            const easedCf = cf < 0.5 ? 
                2 * cf * cf : 
                1 - Math.pow(-2 * cf + 2, 3) / 2; // easeInOutQuad
            drawSet(gameState.cloudsOld, Math.max(0, 1 - easedCf));
            drawSet(gameState.cloudsNew, Math.min(1, easedCf));
            gameState.cloudsCrossfade = Math.min(1, cf + 0.005 * speedFactor); // transition plus lente
            if (gameState.cloudsCrossfade >= 1) {
                gameState.clouds = gameState.cloudsNew;
                gameState.cloudsOld = null;
                gameState.cloudsNew = null;
            }
        } else {
            drawSet(gameState.clouds, 1);
        }
        
        ctx.restore();
    }

    // Mettre à jour le cycle jour/nuit
    function updateDayNightCycle(deltaSec) {
        const oldTime = gameState.timeOfDay;
        gameState.timeOfDay += ((gameState.dayNightSpeed ?? 0.0035) * deltaSec);
        if (gameState.timeOfDay >= 1) {
            gameState.timeOfDay -= 1;
        }
        // Lissage du temps pour synchroniser couleurs/soleil/UI
        const prev = gameState.renderTimeOfDay || gameState.timeOfDay;
        const baseDayNight = 0.0035;
        const speedFactor = ((gameState.dayNightSpeed ?? baseDayNight) / baseDayNight);
        const alpha = Math.max(0.05, Math.min(0.3, 0.08 * speedFactor)); // lerp factor dépendant de la vitesse
        let r = prev + (gameState.timeOfDay - prev) * alpha;
        // Corriger wrap-around (0..1)
        const diff = gameState.timeOfDay - prev;
        if (Math.abs(diff) > 0.5) { // traversée 1->0
            if (prev > gameState.timeOfDay) {
                r = prev + ((gameState.timeOfDay + 1) - prev) * alpha;
                if (r >= 1) r -= 1;
            } else {
                r = (prev - (1 - gameState.timeOfDay)) * (1 - alpha);
                if (r < 0) r += 1;
            }
        }
        gameState.renderTimeOfDay = r;

        // Ne pas forcer de "snap": on laisse le fondu continu gérer la transition de période
        
        // Vérifier si on passe de jour à nuit ou vice versa (pour changer soleil/lune)
        const wasDay = oldTime >= 0.25 && oldTime < 0.75;
        const isDay = gameState.renderTimeOfDay >= 0.25 && gameState.renderTimeOfDay < 0.75;
        
        // Si changement jour/nuit, réinitialiser les nuages (pour changer soleil ↔ lune)
        if (wasDay !== isDay && gameState.clouds.length > 0) {
            const canvas = document.getElementById('fishing-canvas');
            if (canvas) initClouds(canvas);
        }
    }

    // Mettre à jour le système de saisons
    function updateSeasons(deltaSec) {
        const oldSeason = gameState.season;
        // Lier la vitesse de saison à dayNightSpeed (ex: 1 saison ≈ 10 cycles jour/nuit)
        const baseDayNight = 0.0035;
        const speedFactor = ((gameState.dayNightSpeed ?? baseDayNight) / baseDayNight);
        const seasonCyclesPerSeason = 10; // 10 cycles jour/nuit par saison
        const seasonRate = ((gameState.dayNightSpeed ?? baseDayNight) / seasonCyclesPerSeason);
        gameState.seasonProgress += seasonRate * deltaSec;
        
        // Changer de saison quand on atteint 1.0
        if (gameState.seasonProgress >= 1) {
            gameState.seasonProgress -= 1;
            const seasons = ['spring', 'summer', 'autumn', 'winter'];
            const currentIdx = seasons.indexOf(gameState.season);
            const nextSeason = seasons[(currentIdx + 1) % 4];
            gameState.season = nextSeason;
            // Forcer un resync immédiat de la palette de fond au changement de saison
            try {
                const snap = getSkyColors();
                gameState.prevColors = snap;
                gameState._prevPeriodBG = null; // laisse drawBackground recalculer la période et snap si besoin
                gameState.bgCrossfade = 1;
            } catch(e) { /* noop */ }
            
            // Notification de changement de saison
            if (gameState.isPlaying) {
                const seasonNames = {
                    spring: 'Printemps 🌸',
                    summer: 'Été ☀️',
                    autumn: 'Automne 🍂',
                    winter: 'Hiver ❄️'
                };
                showSeasonToast(seasonNames[gameState.season]);
            }
        }
    }

    // Obtenir l'heure du jour en format lisible
    function getTimeOfDayLabel() {
        const t = gameState.renderTimeOfDay || gameState.timeOfDay;
        if (t < 0.30 || t >= 0.85) return 'Nuit 🌙';
        if (t < 0.35) return 'Aube 🌅';
        if (t < 0.40) return 'Matin ☀️';
        if (t < 0.60) return 'Midi ☀️';
        if (t < 0.70) return 'Après-midi ☀️';
        if (t < 0.85) return 'Crépuscule 🌇';
        return 'Nuit 🌙';
    }

    // Vérifier si c'est le jour, la nuit, l'aube, etc.
    function getTimeOfDayPeriod() {
        const t = gameState.renderTimeOfDay || gameState.timeOfDay;
        if (t < 0.30 || t >= 0.85) return 'night';
        if (t < 0.40) return 'dawn';
        if (t < 0.70) return 'day';
        if (t < 0.85) return 'dusk';
        return 'night';
    }

    // Mettre à jour la météo
    function updateWeather(deltaSec, canvas) {
        gameState.weatherChangeTimer += deltaSec;
        
        // Transition progressive vers la météo cible
        if (gameState.weatherTransition < 1) {
            const baseDayNight = 0.0035;
            const speedFactor = ((gameState.dayNightSpeed ?? baseDayNight) / baseDayNight);
            gameState.weatherTransition += deltaSec * 0.02 * speedFactor; // transition beaucoup plus lente
            if (gameState.weatherTransition >= 1) {
                gameState.weatherTransition = 1;
                gameState.weather = gameState.targetWeather; // Transition complète
                // Finir le crossfade de nuages
                if (gameState.cloudsNew) {
                    gameState.clouds = gameState.cloudsNew;
                    gameState.cloudsNew = null;
                    gameState.cloudsOld = null;
                    gameState.cloudsCrossfade = 1;
                }
            }
        }
        
        // Changer de météo toutes les 120-180 secondes (beaucoup plus lent)
        if (gameState.weatherChangeTimer > 120 + Math.random() * 60) {
            gameState.weatherChangeTimer = 0;
            const weathers = ['clear', 'clear', 'clear', 'cloudy', 'cloudy', 'cloudy', 'rainy', 'stormy'];
            const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
            
            // Lancer une nouvelle transition si la météo change
            if (newWeather !== gameState.targetWeather) {
                gameState.targetWeather = newWeather;
                gameState.weatherTransition = 0; // Commencer transition
                // Préparer crossfade nuages
                try {
                    gameState.cloudsOld = (gameState.clouds || []).map(c => ({ ...c }));
                } catch(e) { gameState.cloudsOld = gameState.clouds || []; }
                // Recomposer un nouveau set de nuages pour la météo cible
                const weatherEmojis = {
                    clear: ['☁️'],
                    cloudy: ['☁️'],
                    rainy: ['🌧️','☁️'],
                    stormy: ['⛈️','🌩️','🌨️']
                };
                const count = newWeather === 'clear' ? 3 : newWeather === 'cloudy' ? 5 : 7;
                const emojis = weatherEmojis[newWeather] || weatherEmojis.clear;
                const t = gameState.timeOfDay;
                const isDaytime = t >= 0.25 && t < 0.75;
                const set = [];
                // Soleil/Lune
                set.push({ x: 40, y: 30, speed: 0, emoji: isDaytime ? '☀️' : '🌖', size: isDaytime ? 60 : 55, opacity: 1.0, isSun: isDaytime, isMoon: !isDaytime });
                for (let i = 0; i < count; i++) {
                    set.push({ x: Math.random() * (canvas.width - 150), y: 5 + Math.random() * 25, speed: 8 + Math.random() * 15, emoji: emojis[Math.floor(Math.random()*emojis.length)], size: 25 + Math.random() * 25, opacity: 0.7 + Math.random() * 0.3 });
                }
                gameState.cloudsNew = set;
                gameState.cloudsCrossfade = 0;
            }
        }
    }

    // Fonction utilitaire: mélange linéaire entre deux couleurs hex
    function lerpHex(c1, c2, t) {
        const a = hexToRgb(c1);
        const b = hexToRgb(c2);
        const r = Math.round(a.r + (b.r - a.r) * t);
        const g = Math.round(a.g + (b.g - a.g) * t);
        const bch = Math.round(a.b + (b.b - a.b) * t);
        return `rgb(${r},${g},${bch})`;
    }

    // Définition des palettes par saison et période pour un dégradé à 6 zones
    // Périodes: night, dawn, day, dusk (avec night couvrant [0..0.2] et [0.85..1])
    // Zones: [skyTop, skyBottom, surface, shallow, mid, deep, abyssal]
    const BACKGROUND_PALETTES = {
        spring: {
            night:   ['#0a1128','#1e2a4a','#1e2a4a','#183460','#13386e','#0f2f63','#0b2249'],
            dawn:    ['#ff6b9d','#ffa07a','#ffa07a','#c77b91','#8aa1b8','#4b6fa3','#27406a'],
            day:     ['#87ceeb','#4a90d9','#4a90d9','#3e79c2','#2f60a6','#254e8c','#1b3c73'],
            dusk:    ['#ff6b35','#ff8c42','#ff8c42','#cf6f4a','#9a5a5b','#4d4b7a','#28375c']
        },
        summer: {
            night:   ['#081022','#152235','#152235','#11305a','#0f3568','#0b2c57','#071f3d'],
            dawn:    ['#ff9e80','#ffccbc','#ffccbc','#caa6a5','#9bb1b8','#5a7ea6','#2c4f78'],
            day:     ['#4fc3f7','#0288d1','#0288d1','#0275b6','#01609a','#014a7b','#013a62'],
            dusk:    ['#ff5722','#ff7043','#ff7043','#cb5a53','#95576a','#4e4d7e','#2a3a62']
        },
        autumn: {
            night:   ['#160d08','#24140c','#24140c','#2d2219','#2e2c28','#232b3a','#172136'],
            dawn:    ['#ff6f00','#ff9e40','#ff9e40','#d7894a','#a37655','#5b5a62','#2e3f62'],
            day:     ['#ff8a65','#ff6f00','#ff6f00','#d96108','#b3540a','#8a430d','#5e3210'],
            dusk:    ['#bf360c','#d84315','#d84315','#b34a31','#8a524d','#4f4e76','#2b3a60']
        },
        winter: {
            night:   ['#0a1020','#1a2430','#1a2430','#1a2e44','#17314a','#122a41','#0b1d2d'],
            dawn:    ['#90caf9','#bbdefb','#bbdefb','#8db2d2','#6b8dac','#486b88','#2b4861'],
            day:     ['#b0bec5','#607d8b','#607d8b','#516c80','#445a6a','#394857','#2b3742'],
            dusk:    ['#5c6bc0','#7986cb','#7986cb','#6575b3','#505f97','#3d4b7b','#2b375f']
        }
    };

    // Calcule la période courante
    function getCurrentPeriod(t) {
        if (t < 0.2) return 'night';
        if (t < 0.3) return 'dawn';
        if (t < 0.7) return 'day';
        if (t < 0.85) return 'dusk';
        return 'night';
    }

    // Retourne la palette complète (6 zones + ciel) selon saison/période et météo
    function getBackgroundPalette() {
        const t = gameState.renderTimeOfDay || gameState.timeOfDay || 0;
        const season = (gameState.season === 'spring' || gameState.season === 'summer' || gameState.season === 'autumn' || gameState.season === 'winter') ? gameState.season : 'spring';
        const period = getCurrentPeriod(t);
        const base = BACKGROUND_PALETTES[season][period];
        // base = [skyTop, skyBottom, surface, shallow, mid, deep, abyssal]

        // Influence météo: assombrissement léger et teinte sur le ciel
        const weather = gameState.weather;
        const target = gameState.targetWeather;
        const transition = gameState.weatherTransition || 0;
        const eased = transition < 0.5 ? 2*transition*transition : 1 - Math.pow(-2*transition + 2, 3)/2;
        const darknessMap = { clear: 0, cloudy: 0.04, rainy: 0.08, stormy: 0.14 };
        const skyTintMap = {
            clear:  '#000000',
            cloudy: '#808080',
            rainy:  '#4060a0',
            stormy: '#203050'
        };
        const d1 = darknessMap[weather] || 0;
        const d2 = darknessMap[target] || 0;
        const darken = d1 + (d2 - d1) * eased;
        const tint1 = skyTintMap[weather] || '#000000';
        const tint2 = skyTintMap[target] || '#000000';
        const skyTint = lerpHex(tint1, tint2, eased);

        // Appliquer assombrissement et légère teinte sur skyTop/skyBottom, et assombrir progressivement les zones
        const darkenColorHex = (hex, f) => darkenColor(hex, f);
        const tintMix = (hex, tint, amount) => lerpColor(hex, tint, amount);

        const skyTop = tintMix(darkenColorHex(base[0], darken), skyTint, Math.min(0.12 + darken*0.6, 0.35));
        const skyBottom = tintMix(darkenColorHex(base[1], Math.min(darken*1.1, 0.5)), skyTint, Math.min(0.16 + darken*0.7, 0.4));
        let surface = darkenColorHex(base[2], darken * 0.9);
        let shallow = darkenColorHex(base[3], darken * 1.1);
        let mid     = darkenColorHex(base[4], darken * 1.25);
        let deep    = darkenColorHex(base[5], darken * 1.45);
        let abyssal = darkenColorHex(base[6], Math.min(darken * 1.6, 0.9));

        // Assombrissement supplémentaire demandé: eau plus sombre globalement vers le bas
        const extra = { surface: 0.12, shallow: 0.2, mid: 0.35, deep: 0.55, abyssal: 0.75 };
        surface = darkenColorHex(surface, extra.surface);
        shallow = darkenColorHex(shallow, extra.shallow);
        mid     = darkenColorHex(mid, extra.mid);
        deep    = darkenColorHex(deep, extra.deep);
        abyssal = darkenColorHex(abyssal, extra.abyssal);

        return { skyTop, skyBottom, surface, shallow, mid, deep, abyssal };
    }

    // Fonction pour obtenir les couleurs selon l'heure, la météo et la saison (compat: renvoie ciel + eau)
    function getSkyColors() {
        const t = gameState.renderTimeOfDay || gameState.timeOfDay;
        let skyTop, skyBottom, waterColor;
        
        // Couleurs de base selon la saison
        const seasonColors = {
            spring: { dayTop: '#87ceeb', dayBottom: '#4a90d9', water: '#1e3a8a' },
            summer: { dayTop: '#4fc3f7', dayBottom: '#0288d1', water: '#1565c0' },
            autumn: { dayTop: '#ff8a65', dayBottom: '#ff6f00', water: '#e65100' },
            winter: { dayTop: '#b0bec5', dayBottom: '#607d8b', water: '#37474f' }
        };
        
        // Sélection robuste de la saison (fallback clair)
        const curSeason = (gameState.season === 'spring' || gameState.season === 'summer' || gameState.season === 'autumn' || gameState.season === 'winter') ? gameState.season : 'spring';
        const seasonColor = seasonColors[curSeason];
        const tRender = gameState.renderTimeOfDay || gameState.timeOfDay;
        
        // Cycle jour/nuit avec couleurs de saison
        if (tRender < 0.2) { // Nuit (0.0 - 0.2)
            skyTop = '#0a1128';
            skyBottom = '#1e2a4a';
            waterColor = '#0d1b3a';
        } else if (tRender < 0.3) { // Aube (0.2 - 0.3)
            const fade = (tRender - 0.2) / 0.1;
        const dawnColors = {
                spring: { top: '#ff6b9d', bottom: '#ffa07a' },
            summer: { top: '#ff9e80', bottom: '#ffccbc' },
            autumn: { top: '#ff6f00', bottom: '#ff9e40' },
            winter: { top: '#90caf9', bottom: '#bbdefb' }
            };
        const dawn = dawnColors[curSeason] || dawnColors.spring;
            skyTop = lerpColor('#0a1128', dawn.top, fade);
            skyBottom = lerpColor('#1e2a4a', dawn.bottom, fade);
            waterColor = '#1e3a5a';
        } else if (tRender < 0.7) { // Jour (0.3 - 0.7)
            skyTop = seasonColor.dayTop;
            skyBottom = seasonColor.dayBottom;
            waterColor = seasonColor.water;
        } else if (tRender < 0.85) { // Crépuscule (0.7 - 0.85)
            const fade = (tRender - 0.7) / 0.15;
        const duskColors = {
                spring: { top: '#ff6b35', bottom: '#ff8c42' },
            summer: { top: '#ff5722', bottom: '#ff7043' },
            autumn: { top: '#bf360c', bottom: '#d84315' },
            winter: { top: '#5c6bc0', bottom: '#7986cb' }
            };
        const dusk = duskColors[curSeason] || duskColors.spring;
            skyTop = lerpColor(seasonColor.dayTop, dusk.top, fade);
            skyBottom = lerpColor(seasonColor.dayBottom, dusk.bottom, fade);
            waterColor = '#2a4a7a';
        } else { // Nuit (0.85 - 1.0)
            const fade = (tRender - 0.85) / 0.15;
            skyTop = lerpColor('#ff6b35', '#0a1128', fade);
            skyBottom = lerpColor('#ff8c42', '#1e2a4a', fade);
            waterColor = '#0d1b3a';
        }
        
        // Assombrir progressivement selon la météo cible et la transition
        const transition = gameState.weatherTransition;
        let darkenFactor = 0;
        
        // Calculer le facteur d'assombrissement basé sur la météo actuelle et cible
        const currentWeather = gameState.weather;
        const targetWeather = gameState.targetWeather;
        
        // Facteurs d'assombrissement par météo (réduits pour moins de visibilité)
        const weatherDarkness = {
            'clear': 0,
            'cloudy': 0.02,
            'rainy': 0.06,
            'stormy': 0.12
        };
        
        const currentDarkness = weatherDarkness[currentWeather] || 0;
        const targetDarkness = weatherDarkness[targetWeather] || 0;
        
        // Interpoler entre météo actuelle et cible avec easing doux
        const easedTransition = transition < 0.5 ? 
            2 * transition * transition : 
            1 - Math.pow(-2 * transition + 2, 3) / 2; // easeInOutQuad
        darkenFactor = currentDarkness + (targetDarkness - currentDarkness) * easedTransition;
        
        // Appliquer l'assombrissement progressif
        if (darkenFactor > 0) {
            skyTop = darkenColor(skyTop, darkenFactor);
            skyBottom = darkenColor(skyBottom, darkenFactor);
            waterColor = darkenColor(waterColor, darkenFactor * 0.7);
        }
        
        return { skyTop, skyBottom, waterColor };
    }

    // Interpolation linéaire entre deux couleurs
    function lerpColor(color1, color2, t) {
        const c1 = hexToRgb(color1);
        const c2 = hexToRgb(color2);
        const r = Math.round(c1.r + (c2.r - c1.r) * t);
        const g = Math.round(c1.g + (c2.g - c1.g) * t);
        const b = Math.round(c1.b + (c2.b - c1.b) * t);
        return `rgb(${r},${g},${b})`;
    }

    // Assombrir une couleur
    function darkenColor(color, factor) {
        const rgb = hexToRgb(color);
        const r = Math.round(rgb.r * (1 - factor));
        const g = Math.round(rgb.g * (1 - factor));
        const b = Math.round(rgb.b * (1 - factor));
        return `rgb(${r},${g},${b})`;
    }

    // Convertir hex en RGB
    function hexToRgb(hex) {
        if (typeof hex === 'string') {
            const mRgb = hex.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
            if (mRgb) {
                return { r: parseInt(mRgb[1], 10), g: parseInt(mRgb[2], 10), b: parseInt(mRgb[3], 10) };
            }
            const mHex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (mHex) {
                return { r: parseInt(mHex[1], 16), g: parseInt(mHex[2], 16), b: parseInt(mHex[3], 16) };
            }
        }
        return { r: 135, g: 206, b: 235 };
    }

    // Fonction pour appliquer les perks des chapeaux (actuellement désactivé)
    function applyHatPerks() {
        return {
            lineColor: null,
            lineGlow: false,
            spawnMultiplier: 1,
            pointMultiplier: 1
        };
    }

    // Fonction pour afficher des messages toast
    function showToast(message, type = 'info') {
        // Supprimer les toasts existants
        const existingToasts = document.querySelectorAll('.fishing-toast');
        existingToasts.forEach(toast => toast.remove());

        // Créer le toast
        const toast = document.createElement('div');
        toast.className = 'fishing-toast';
        
        // Couleurs selon le type
        const colors = {
            success: { bg: '#10b981', text: '#ffffff' },
            warning: { bg: '#f59e0b', text: '#ffffff' },
            error: { bg: '#ef4444', text: '#ffffff' },
            info: { bg: '#3b82f6', text: '#ffffff' }
        };
        
        const color = colors[type] || colors.info;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10020;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        toast.textContent = message;
        
        // Ajouter l'animation CSS si elle n'existe pas
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Ajouter au DOM
        document.body.appendChild(toast);
        
        // Supprimer automatiquement après 3 secondes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    // Fonction pour dessiner le fond et l'eau
    function drawBackground(ctx, canvas) {
        // Filet de sécurité: si le cycle jour/nuit n'avance pas (p.ex. si updateDayNightCycle n'est pas appelé),
        // faire progresser timeOfDay ici de manière conservatrice.
        try {
            const nowTs = performance.now();
            const lastObs = gameState._lastObservedTOD ?? gameState.timeOfDay ?? 0;
            const lastObsTs = gameState._lastObservedTODTs ?? nowTs;
            const dt = Math.max(0, (nowTs - lastObsTs) / 1000);
            const epsilon = 1e-4;
            if (dt > 0.2 && Math.abs((gameState.timeOfDay ?? 0) - lastObs) < epsilon) {
                const baseDayNight = 0.0035;
                const speed = (gameState.dayNightSpeed ?? baseDayNight);
                gameState.timeOfDay = ( (gameState.timeOfDay || 0) + speed * dt ) % 1;
            }
            gameState._lastObservedTOD = gameState.timeOfDay;
            gameState._lastObservedTODTs = nowTs;
        } catch (e) { /* noop */ }

        const colors = getSkyColors();
        // Lissage exponentiel du fond: approche progressive vers les couleurs cibles, lié à dayNightSpeed
        const prev = gameState.prevColors || colors;
        const baseDayNight = 0.0035;
        const speedFactor = ((gameState.dayNightSpeed ?? baseDayNight) / baseDayNight);
        const baseLerp = (GAME_CONFIG.visuals && GAME_CONFIG.visuals.backgroundLerp) ? GAME_CONFIG.visuals.backgroundLerp : 0.09;
        // Lerping plus rapide pour que les changements de couleurs soient visibles
        const k = Math.max(0.15, Math.min(0.8, (baseLerp * 2) / (1 + (speedFactor-1)*0.3)));
        const clamp01 = (x) => Math.max(0, Math.min(1, x));
        const lerp = (c1, c2, a) => lerpColor(c1, c2, clamp01(a));
        // Détecter les changements de période (jour/nuit) et forcer la mise à jour
        const tRender = gameState.renderTimeOfDay || gameState.timeOfDay || 0;
        const currentPeriod = (tRender < 0.2 || tRender >= 0.85) ? 'night' : (tRender < 0.3 ? 'dawn' : (tRender < 0.7 ? 'day' : (tRender < 0.85 ? 'dusk' : 'night')));
        const nowTs = performance.now();
        
        // Vérifier si on doit forcer les couleurs (changement de période ou timeout)
        const shouldForceColors = (gameState._lastPeriod !== currentPeriod) || 
                                 (!gameState._lastColorUpdateTs || (nowTs - gameState._lastColorUpdateTs) > 2000);
        
        // Si on vient de forcer les couleurs récemment, éviter le lissage pendant un moment
        const recentlyForced = gameState._lastColorUpdateTs && (nowTs - gameState._lastColorUpdateTs) < 100;
        
        // Vérifier si les couleurs cibles sont stables (pas de changement significatif)
        const colorsStable = gameState._lastTargetColors && 
                            Math.abs(hexToRgb(colors.skyTop).r - hexToRgb(gameState._lastTargetColors.skyTop).r) < 5 &&
                            Math.abs(hexToRgb(colors.skyTop).g - hexToRgb(gameState._lastTargetColors.skyTop).g) < 5 &&
                            Math.abs(hexToRgb(colors.skyTop).b - hexToRgb(gameState._lastTargetColors.skyTop).b) < 5;
        
        let blend;
        if (shouldForceColors || recentlyForced || colorsStable) {
            // Forcer les couleurs cibles directement ou maintenir si récemment forcées ou stables
            blend = {
                skyTop: colors.skyTop,
                skyBottom: colors.skyBottom,
                waterColor: colors.waterColor
            };
            // Mettre à jour les couleurs précédentes pour éviter le re-lissage
            gameState.prevColors = blend;
            if (gameState._lastPeriod !== currentPeriod) {
                gameState._lastPeriod = currentPeriod;
            }
            if (shouldForceColors) {
                gameState._lastColorUpdateTs = nowTs;
            }
            // Sauvegarder les couleurs cibles pour la vérification de stabilité
            gameState._lastTargetColors = {
                skyTop: colors.skyTop,
                skyBottom: colors.skyBottom,
                waterColor: colors.waterColor
            };
        } else {
            // Lissage normal vers les couleurs cibles
            blend = {
            skyTop: lerp(prev.skyTop, colors.skyTop, k),
            skyBottom: lerp(prev.skyBottom, colors.skyBottom, k),
            waterColor: lerp(prev.waterColor, colors.waterColor, k)
        };
        }
        
        // Log palette utilisée (throttle ~ 500ms)
        try {
            const nowTs = performance.now();
            if (!gameState._lastPaletteLogTs || (nowTs - gameState._lastPaletteLogTs) > 500) {
        const tRender = gameState.renderTimeOfDay || gameState.timeOfDay || 0;
                const period = (tRender < 0.2 || tRender >= 0.85) ? 'night' : (tRender < 0.3 ? 'dawn' : (tRender < 0.7 ? 'day' : (tRender < 0.85 ? 'dusk' : 'night')));
                const toHex = (col) => {
                    if (!col) return col;
                    if (typeof col === 'string' && col.startsWith('#')) return col.toLowerCase();
                    const m = typeof col === 'string' && col.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
                    if (m) {
                        const r = Number(m[1]).toString(16).padStart(2, '0');
                        const g = Number(m[2]).toString(16).padStart(2, '0');
                        const b = Number(m[3]).toString(16).padStart(2, '0');
                        return `#${r}${g}${b}`;
                    }
                    return col;
                };
                gameState._lastPaletteLogTs = nowTs;
            }
        } catch (e) { /* noop */ }

        // Dégradé complet du ciel à l'eau (plus fluide)
        // Forcer un mode de composition et une opacité neutres pour éviter qu'un mode précédent n'altère le fond
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        const waterLevel = GAME_CONFIG.water.level;
        const waterDepth = canvas.height - waterLevel;
        const seabedY = canvas.height - (GAME_CONFIG.seabed?.height || 40);
        
        // Gradient principal : ciel → horizon → zones de profondeur détaillées
        const mainGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        
        // Calculer les positions des zones de profondeur avec clamp
        const waterDepthForZones = seabedY - waterLevel;
        const depthZones = calculateDepthZones(waterDepthForZones);
        const surfaceZoneHeight = depthZones.surface;
        const shallowZoneHeight = depthZones.shallow;
        const midZoneHeight = depthZones.mid;
        const deepZoneHeight = depthZones.deep;
        const abyssalZoneHeight = depthZones.abyssal;
        
        // Positions relatives dans le canvas
        const surfaceEnd = waterLevel + surfaceZoneHeight;
        const shallowEnd = surfaceEnd + shallowZoneHeight;
        const midEnd = shallowEnd + midZoneHeight;
        const deepEnd = midEnd + deepZoneHeight;
        const abyssalEnd = deepEnd + abyssalZoneHeight;
        
        // Utiliser la palette 6 zones dépendante saison/période/météo
        const pal = getBackgroundPalette();
        // Ciel
        mainGradient.addColorStop(0, pal.skyTop);
        mainGradient.addColorStop(Math.max(0.001, (waterLevel - 1) / canvas.height), pal.skyBottom);
        // Bandes d'eau
        mainGradient.addColorStop(surfaceEnd / canvas.height, pal.surface);
        mainGradient.addColorStop(shallowEnd / canvas.height, pal.shallow);
        mainGradient.addColorStop(midEnd / canvas.height, pal.mid);
        mainGradient.addColorStop(deepEnd / canvas.height, pal.deep);
        mainGradient.addColorStop(abyssalEnd / canvas.height, pal.abyssal);
        // Fond marin: presque noir
        const seabedColor = darkenColor(pal.abyssal, 0.92);
        mainGradient.addColorStop(seabedY / canvas.height, seabedColor);
        mainGradient.addColorStop(1, darkenColor(seabedColor, 0.04));
        
        // Nettoyer complètement le canvas puis appliquer le fond pour éviter toute rémanence
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.fillStyle = mainGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // (debug palette supprimé)
        
        // Nuages (par-dessus le dégradé)
        drawClouds(ctx, canvas);
        
        // Fond marin (par-dessus le dégradé pour avoir une couleur solide)
        ctx.fillStyle = GAME_CONFIG.seabed?.color || '#0f2a6b';
        ctx.fillRect(0, seabedY, canvas.width, canvas.height - seabedY);
        // Décor sur la surface du fond
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        if (Array.isArray(gameState.seabedDecor) && gameState.seabedDecor.length){
            for (const item of gameState.seabedDecor){
                const x = Math.max(0, Math.min(canvas.width, item.xNorm * canvas.width));
                ctx.font = `${item.size || 20}px sans-serif`;
                ctx.fillText(item.emoji || '🌿', x, seabedY + 4);
            }
        }
        ctx.restore();
        
        // Vagues
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        // Échantillonnage plus grossier et lissage quadratique
        const step = 20; // moins de points => surface plus simple
        let prevX = 0;
        let prevY = GAME_CONFIG.water.level + Math.sin(gameState.waves[0].phase) * GAME_CONFIG.waves.amplitude;
        ctx.beginPath();
        ctx.moveTo(0, prevY);
        for (let x = step; x <= canvas.width; x += step){
            // trouver le wave le plus proche de x
            const idx = Math.min(gameState.waves.length - 1, Math.round(x / 10));
            const w = gameState.waves[idx];
            const y = GAME_CONFIG.water.level + Math.sin(w.phase) * GAME_CONFIG.waves.amplitude;
            // point médian pour la courbe quadratique
            const midX = (prevX + x) / 2;
            const midY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);
            prevX = x; prevY = y;
        }
        // avancer la phase (moins de mises à jour pour fluidité)
        for (let i=0;i<gameState.waves.length;i+=2){
            gameState.waves[i].phase += GAME_CONFIG.waves.frequency;
        }
        ctx.stroke();
    }

    // Fonction pour dessiner les bulles
    function drawBubbles(ctx, canvas) {
        // Rendu des bulles avec l'emoji 🫧, plus petites et transparentes
        ctx.globalAlpha = 0.2; // Plus transparent
        
        gameState.bubbles.forEach(bubble => {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.translate(bubble.x, bubble.y);
            // Rotation lente des bulles
            if (!bubble.rotation) bubble.rotation = Math.random() * Math.PI * 2;
            if (!bubble.rotationSpeed) bubble.rotationSpeed = (Math.random() - 0.5) * 0.05;
            bubble.rotation += bubble.rotationSpeed;
            ctx.rotate(bubble.rotation);
            // Taille réduite
            const fontSize = Math.max(6, Math.floor(4 * bubble.size + 4)); // Plus petites
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillText('🫧', 0, 0);
            ctx.restore();
            
            bubble.y -= bubble.speed;
            // Éclater plus bas que la surface (marge 24-40px sous la surface)
            const popMargin = 24 + Math.random() * 16;
            if (bubble.y < GAME_CONFIG.water.level + popMargin) {
                bubble.y = canvas.height - Math.random() * 50;
                bubble.x = Math.random() * canvas.width;
                // Taille plus petite et discrète
                bubble.size = 0.8 + Math.random() * 1.5; // 0.8..2.3 (réduit)
                bubble.speed = 0.6 + Math.random() * 1.2; // 0.6..1.8
                bubble.rotation = Math.random() * Math.PI * 2;
                bubble.rotationSpeed = (Math.random() - 0.5) * 0.05;
            }
        });
        ctx.globalAlpha = 1;
    }

    // Fonction pour dessiner la canne à pêche
    function drawFishingRod(ctx, canvas) {
        const rodX = canvas.width - 100;
        const rodY = 88;

        // Plateforme sous le pêcheur (emoji 🏝️)
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 1;
        const islandSize = 120;
        ctx.font = `${islandSize}px sans-serif`;
        ctx.fillText('🏝️', rodX + 30, rodY -5);
        ctx.restore();

        // Sprite du pêcheur (emoji 🦖) derrière la canne
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 1;
        const fisherSize = 34; // taille lisible
        ctx.font = `${fisherSize}px sans-serif`;
        // Positionner légèrement à droite et sous le point d'ancrage visuel
        ctx.fillText('🦖', rodX + 8, rodY + 2);
        ctx.restore();

        // Afficher le chapeau équipé au-dessus du pêcheur
        const equippedHat = gameState.progress?.hats?.equipped;
        if (equippedHat) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 1;
            const hatSize = 20;
            ctx.font = `${hatSize}px sans-serif`;
            // Positionner et appliquer une rotation de +25°
            ctx.translate(rodX + 8, rodY - 15);
            ctx.rotate(25 * Math.PI / 180);
            ctx.fillText(equippedHat, 0, 0);
            ctx.restore();
        }
        
        // (Compteur chapeaux déplacé dans l'onglet du guide)

        // Canne
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = GAME_CONFIG.rod.thickness;
        ctx.beginPath();
        ctx.moveTo(rodX, rodY);
        
        const endX = rodX - Math.cos(gameState.rodAngle) * GAME_CONFIG.rod.length;
        const endY = rodY + Math.sin(gameState.rodAngle) * GAME_CONFIG.rod.length;
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Ligne de pêche avec courbure (sag) qui diminue avec la tension
        // Ne pas dessiner la ligne si elle est cassée
        if (gameState.isCasting && !gameState.lineSnapped) {
            const start = { x: endX, y: endY };
            const endRaw = { x: gameState.hookPosition.x, y: gameState.hookPosition.y };
            const dxr = endRaw.x - start.x;
            const dyr = endRaw.y - start.y;
            const distr = Math.hypot(dxr, dyr) || 1;
            // Point d'ancrage visuel sur l'anneau de l'hameçon (légèrement en amont de la pointe)
            const ux = dxr / distr;
            const uy = dyr / distr;
            const anchorBack = GAME_CONFIG.hook.size * 0.9; // davantage sur la gauche de l'emoji
            const end = { x: endRaw.x - ux * anchorBack, y: endRaw.y - uy * anchorBack };
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const dist = Math.hypot(dx, dy);
            const tension = Math.max(0, Math.min(1, gameState.lineTension || 0));
            // La courbure diminue avec la tension (ligne plus droite quand tendue)
            // Courbure de la ligne: accentuer légèrement selon le poids de l'hameçon sous l'eau
            const isUnder = end.y > GAME_CONFIG.water.level;
            let baseSag = Math.min(40, dist * 0.12) * (isUnder ? 1.2 : 0.6);
            if (isUnder) {
                const weight = Math.max(0.5, Math.min(1.2, gameState.hookWeightFactor || (gameState.progress?.features?.hookWeightFactor || 1)));
                baseSag *= (1 + 0.20 * (weight - 1));
            }
            const sag = baseSag * (1 - tension * 0.8); // 20% de courbure max quand très tendu
            const ctrl1 = { x: start.x + dx * 0.33, y: start.y + dy * 0.33 + sag };
            const ctrl2 = { x: start.x + dx * 0.66, y: start.y + dy * 0.66 + sag };
            // Couleur en fonction de la tension
            const t = Math.max(0, Math.min(1, gameState.lineTension || 0));
            // Appliquer les perks visuels
            const perks = applyHatPerks();
            
            let color;
            // Ligne dorée (chapeau dragon 🐲)
            if (perks.goldenLine) {
                const brightness = 180 + Math.sin(Date.now() * 0.005) * 30;
                color = `rgb(${brightness}, ${brightness - 40}, 0)`;
            }
            // Couleurs arc-en-ciel (chapeau 🏳️‍🌈)
            else if (perks.rainbowColors) {
                const hue = (Date.now() * 0.1) % 360;
                color = `hsl(${hue}, 80%, 60%)`;
            }
            // Interpolation normale: vert (0) -> jaune (0.5) -> rouge (1)
            else if (t < 0.5){
                const k = t / 0.5; // 0..1
                const r = Math.round(16 + (255-16) * k);
                const g = Math.round(185 + (206-185) * k);
                const b = 129; // teinte verte->jaune
                color = `rgb(${r},${g},${b})`;
            } else {
                const k = (t - 0.5) / 0.5; // 0..1
                const r = 255;
                const g = Math.round(206 - 180 * k);
                const b = Math.round(129 - 120 * k);
                color = `rgb(${r},${g},${b})`;
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5 + t * 1.2; // épaissit avec la tension
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.bezierCurveTo(ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, end.x, end.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Hameçon
        if (gameState.isCasting) {
            // Orienter l'emoji dans l'axe de la ligne et aligner l'anneau au point d'ancrage
            const startX = endX, startY = endY;
            const hx = gameState.hookPosition.x, hy = gameState.hookPosition.y;
            const dx = hx - startX, dy = hy - startY;
            const d = Math.hypot(dx, dy) || 1;
            const ux = dx / d, uy = dy / d;
            // Mise à l'échelle visuelle de l'hameçon en fonction du poids (slider)
            const hookWeight = Math.max(0.5, Math.min(1.2, gameState.hookWeightFactor || (gameState.progress?.features?.hookWeightFactor || 1)));
            const hookScale = hookWeight; // échelle 1:1 par simplicité et lisibilité
            const anchorBack = (GAME_CONFIG.hook.size * hookScale) * -0.2; // davantage vers la gauche
            const angle = Math.atan2(dy, dx);
            ctx.save();
            ctx.translate(hx, hy);
            // rotation principale pour que l'anneau regarde vers la canne
            // l'emoji 🪝 a une orientation visuelle; petit ajustement d'offset si nécessaire
            const ROT_ADJUST = -Math.PI / 2; // ajuste la rotation pour mieux aligner l'anneau
            ctx.rotate(angle + ROT_ADJUST);
            ctx.translate(-anchorBack, 0); // reculer pour que l'anneau colle au point d'ancrage
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const fontSize = Math.max(14, Math.floor(GAME_CONFIG.hook.size * hookScale * 2.6));
            ctx.font = `${fontSize}px sans-serif`;
            // Forcer un rendu 100% opaque sans effets
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowColor = 'rgba(0,0,0,0)';
            ctx.filter = 'none';
            // Contour noir léger pour augmenter la lisibilité
            ctx.lineWidth = Math.max(1, Math.floor(fontSize * 0.07));
            ctx.strokeStyle = 'rgba(0,0,0,1)';
            ctx.strokeText('🪝', 0, 0);
            // Remplissage emoji
            ctx.fillText('🪝', 0, 0);
            ctx.restore();
        }
    }

    // Fonction pour dessiner les poissons
    function drawFish(ctx) {
        // Dessiner d'abord ceux non attachés
        gameState.fish.forEach(fish => {
            if (gameState.attachedFish.find(a => a.fish === fish)) return;
            const ang = typeof fish.angle === 'number' ? fish.angle : 0;
            // Clignotement si morsure en attente
            let emoji = fish.emoji || '🐟';
            const isPending = gameState.pendingBiteFish && gameState.pendingBiteFish.fish === fish;
            if (isPending) {
                // Variation rapide de teinte (hue-rotate) pour signaler la morsure en attente
                const blink = Math.floor(performance.now() * 0.02) % 2 === 0; // ~50 ms alternance
                ctx.save();
                ctx.filter = blink ? 'hue-rotate(160deg) saturate(1.3)' : 'hue-rotate(-20deg) saturate(1.1)';
                drawSingleFish(ctx, fish.x, fish.y, fish.size, emoji, ang);
                ctx.restore();
            } else {
                drawSingleFish(ctx, fish.x, fish.y, fish.size, emoji, ang);
            }

            // Debug visuel: quadrants et cercle de détection
            if (gameState.debugQuadrants) {
                ctx.save();
                ctx.globalAlpha = 0.25;
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(fish.x - 40, fish.y);
                ctx.lineTo(fish.x + 40, fish.y);
                ctx.moveTo(fish.x, fish.y - 40);
                ctx.lineTo(fish.x, fish.y + 40);
                ctx.stroke();
                // Cercle de proximité (rayon 28)
                ctx.globalAlpha = 0.18;
                ctx.beginPath();
                ctx.arc(fish.x, fish.y, 28, 0, Math.PI * 2);
                ctx.fillStyle = '#3b82f6';
                ctx.fill();

                // Dessiner le cadran ACTIF selon la position du curseur
                const mx = gameState.mouseX ?? 0;
                const my = gameState.mouseY ?? 0;
                const dx = mx - fish.x;
                const dy = my - fish.y;
                const r = 28;
                // Choisir l'axe dominant (horizontal vs vertical)
                const horiz = Math.abs(dx) >= Math.abs(dy);
                let dir = null;
                if (horiz) {
                    if (dx <= -2) dir = 'left'; else if (dx >= 2) dir = 'right';
                } else {
                    if (dy <= -2) dir = 'up'; else if (dy >= 2) dir = 'down';
                }
                if (dir) {
                    ctx.globalAlpha = 0.16;
                    ctx.fillStyle = '#f59e0b';
                    if (dir === 'up')      ctx.fillRect(fish.x - r, fish.y - r, r*2, r);
                    else if (dir === 'down') ctx.fillRect(fish.x - r, fish.y, r*2, r);
                    else if (dir === 'left') ctx.fillRect(fish.x - r, fish.y - r, r, r*2);
                    else if (dir === 'right')ctx.fillRect(fish.x, fish.y - r, r, r*2);
                    // Petite flèche au centre
                    ctx.globalAlpha = 0.9;
                    ctx.fillStyle = '#f59e0b';
                    ctx.font = '12px sans-serif';
                    const arrow = dir === 'up' ? '↑' : dir === 'down' ? '↓' : dir === 'left' ? '←' : '→';
                    ctx.fillText(arrow, fish.x, fish.y - (dir==='up'?10:dir==='down'?-10:0));
                }

                // Rayon de l'hameçon (150px) autour du poisson
                const hx = gameState.hookPosition?.x ?? -9999;
                const hy = gameState.hookPosition?.y ?? -9999;
                const dh = Math.hypot(hx - fish.x, hy - fish.y);
                ctx.globalAlpha = 0.15;
                ctx.beginPath();
                ctx.arc(fish.x, fish.y, 150, 0, Math.PI * 2);
                ctx.strokeStyle = dh <= 150 ? '#ef4444' : '#22c55e'; // rouge si le hook est dans le rayon, vert sinon
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Afficher le temps restant pour valider le pattern (estimation locale)
                try {
                    const history = gameState.cursorMovementHistory || [];
                    const nowTs = performance.now();
                    const windowMs = 3500;
                    const samples = history.filter(h => nowTs - h.ts <= windowMs);
                    let fx = 1, fy = 0;
                    if (typeof fish.angle === 'number') { fx = Math.cos(fish.angle); fy = Math.sin(fish.angle); }
                    const nearRadius = 28;
                    let msAbove = 0, msBelow = 0, msLeft = 0, msRight = 0, msFront = 0, msBack = 0;
                    for (let i = 1; i < samples.length; i++) {
                        const a = samples[i-1], b = samples[i];
                        const dt = Math.max(0, b.ts - a.ts);
                        if (dt <= 0) continue;
                        const ddx = (b.x - fish.x); const ddy = (b.y - fish.y);
                        const dist = Math.hypot(ddx, ddy);
                        if (dist > nearRadius) continue;
                        if (b.y <= fish.y - 2) msAbove += dt; else if (b.y >= fish.y + 2) msBelow += dt;
                        if (b.x <= fish.x - 2) msLeft += dt; else if (b.x >= fish.x + 2) msRight += dt;
                        const dot = ddx * fx + ddy * fy;
                        if (dot >= 0) msFront += dt; else msBack += dt;
                    }
                    const needed = 1000;
                    let activeType = 'unknown';
                    let spent = 0;
                    if (msFront >= msBack + 200 && msFront >= msAbove && msFront >= msBelow) { activeType = 'devant'; spent = msFront; }
                    else if (msBack >= msFront + 200 && msBack >= msAbove && msBack >= msBelow) { activeType = 'derriere'; spent = msBack; }
                    else if (msAbove >= msBelow + 200 && msAbove >= msFront && msAbove >= msBack) { activeType = 'au_dessus'; spent = msAbove; }
                    else if (msBelow >= msAbove + 200 && msBelow >= msFront && msBelow >= msBack) { activeType = 'au_dessous'; spent = msBelow; }
                    const remaining = Math.max(0, needed - spent);
                    ctx.save();
                    ctx.globalAlpha = 0.95;
                    ctx.fillStyle = remaining === 0 ? '#10b981' : '#fde68a';
                    ctx.font = '12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    const label = remaining === 0 ? 'OK' : `${(remaining/1000).toFixed(1)}s`;
                    ctx.fillText(label, fish.x, fish.y - r - 6);
                    ctx.restore();

                    // Trait rouge entre l'hameçon et le poisson si le pattern actuel correspond à son baitPattern
                    const detected = activeType;
                    if (detected !== 'unknown' && fish.baitPattern === detected) {
                        ctx.save();
                        ctx.globalAlpha = 0.8;
                        ctx.strokeStyle = '#ef4444';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(fish.x, fish.y);
                        ctx.lineTo(hx, hy);
                        ctx.stroke();
                        ctx.restore();
                    }
                } catch (e) {}
                ctx.restore();
            }
        });
        // Dessiner les poissons attachés au hook
        const hx = gameState.hookPosition.x;
        const hy = gameState.hookPosition.y;
        const hvx = gameState.hookVelocity.x || 0;
        const hvy = gameState.hookVelocity.y || 0;
        const hookAngle = Math.atan2(hvy, hvx || 0.0001);
        gameState.attachedFish.forEach(att => {
            // Pas d'oscillation: position calée sur l'offset de base autour de l'hameçon
            const ox = att.baseOffX;
            const oy = att.baseOffY;
            const x = hx + ox;
            const y = hy + oy;
            drawSingleFish(ctx, x, y, att.fish.size, att.fish.emoji || '🐟', hookAngle);
            // Barre de stamina au-dessus du poisson
            const s = Math.max(0, Math.min(1, (att.fish.stamina || 0) / (80 + att.fish.size * 4)));
            const barW = Math.max(24, att.fish.size * 1.5);
            const barH = 5;
            ctx.save();
            ctx.translate(x, y - att.fish.size - 8);
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(-barW/2, -barH/2, barW, barH);
            const grad = ctx.createLinearGradient(-barW/2, 0, barW/2, 0);
            grad.addColorStop(0, '#10b981');
            grad.addColorStop(0.5, '#f59e0b');
            grad.addColorStop(1, '#ef4444');
            ctx.fillStyle = grad;
            ctx.fillRect(-barW/2, -barH/2, barW * s, barH);
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 1;
            ctx.strokeRect(-barW/2, -barH/2, barW, barH);
            ctx.restore();
        });
    }

    function drawSingleFish(ctx, x, y, size, emoji, angle){
        ctx.save();
        ctx.translate(x, y);
        // Les emojis de poissons regardent par défaut vers la gauche.
        // Si le mouvement est vers la droite (cos(angle) > 0), on fait un flip horizontal.
        const a = angle || 0;
        const movingRight = Math.cos(a) > 0;
        if (movingRight) ctx.scale(-1, 1);
        // Légère inclinaison pour refléter la direction sans rendre le texte illisible
        ctx.rotate(a * 0.15);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.max(12, Math.floor(size * 2));
        ctx.font = `${fontSize}px sans-serif`;
        // S'assurer qu'aucune opacité précédente ne s'applique
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#000'; // couleur pleine; les emojis couleur ne sont pas recolorés, mais bénéficient de l'alpha 1
        ctx.fillText(emoji || '🐟', 0, 0);
        ctx.restore();
    }

    // Accumulateur de spawn
    // (utiliser gameState.spawnAccumulator)

    // Fonction pour générer de nouveaux poissons (taux par seconde, plafonné)
    function spawnFishTimed(deltaSec, canvas) {
        const maxFishCount = calculateMaxFishCount();
        if (gameState.fish.length >= maxFishCount) return;
        gameState.spawnAccumulator += GAME_CONFIG.fish.spawnPerSecond * deltaSec;
        while (gameState.spawnAccumulator >= 1 && gameState.fish.length < maxFishCount) {
            gameState.spawnAccumulator -= 1;

            // Appliquer les perks des chapeaux
            const perks = applyHatPerks();

            // Filtrer sur espèces débloquées
            const unlocked = new Set(gameState.progress?.unlockedSpecies || []);
            const availableTypes = GAME_CONFIG.fish.types.filter(t => unlocked.has(t.emoji));
            const pool = availableTypes.length > 0 ? availableTypes : GAME_CONFIG.fish.types.filter(t=>['🦐','🐟'].includes(t.emoji));
            
            // Calculer la profondeur disponible AVANT de choisir l'espèce
            const waterLevel = GAME_CONFIG.water.level;
            const seabedY = canvas.height - (GAME_CONFIG.seabed?.height || 40);
            const waterDepth = seabedY - waterLevel;

            // Restreindre la pool aux espèces compatibles avec la profondeur actuelle
            const depthCompatiblePool = pool.filter(t => canFishSpawnInDepth(t, waterDepth));
            if (depthCompatiblePool.length === 0) {
                // Si rien n'est compatible, on passe cette itération pour éviter des spawns hors zone
                continue;
            }

            // Forcer spawn de sirènes avec chapeau 👹 (dans la pool compatible seulement)
            let fishType;
            if (perks.forceSirenSpawn && Math.random() < 0.5) {
                const sirenTypes = depthCompatiblePool.filter(t => ['🧜‍♀️', '🧜‍♂️'].includes(t.emoji));
                fishType = sirenTypes.length > 0 ? sirenTypes[Math.floor(Math.random() * sirenTypes.length)] : depthCompatiblePool[Math.floor(Math.random() * depthCompatiblePool.length)];
            } else {
                // Appliquer les bonus de spawn pour espèces spécifiques
                let weights = depthCompatiblePool.map(t => {
                    let weight = 1.0;
                    if (t.emoji === '🪼' && perks.jellyfishSpawnRate) weight *= perks.jellyfishSpawnRate;
                    if (t.emoji === '🦐' && perks.shrimpSpawnRate) weight *= perks.shrimpSpawnRate;
                    if (['🐠', '🐡'].includes(t.emoji) && perks.tropicalSpawnRate) weight *= perks.tropicalSpawnRate;
                    if (t.emoji === '🧜‍♂️' && perks.mermenSpawnRate) weight *= perks.mermenSpawnRate;
                    if (t.rarity === 'rare' && perks.rareSpawnRate) weight *= perks.rareSpawnRate;
                    if (t.rarity === 'mythique' && perks.mythicSpawnRate) weight *= perks.mythicSpawnRate;
                    if (t.emoji === '💎' && perks.treasureChance) weight *= perks.treasureChance;
                    return weight;
                });
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                let rand = Math.random() * totalWeight;
                let idx = 0;
                for (let i = 0; i < weights.length; i++) {
                    rand -= weights[i];
                    if (rand <= 0) { idx = i; break; }
                }
                fishType = depthCompatiblePool[idx];
            }
            
            // Générer des caractéristiques aléatoires dans les plages définies
            let size = fishType.sizeRange[0] + Math.random() * (fishType.sizeRange[1] - fishType.sizeRange[0]);
            
            // Appliquer les bonus de taille
            if (perks.fishSizeBonus) {
                size *= perks.fishSizeBonus;
            }
            if (fishType.emoji === '🐡' && perks.pufferSizeBonus) {
                size *= perks.pufferSizeBonus;
            }
            
            // Vitesse de base tirée de la plage
            const baseSpeed = fishType.speedRange[0] + Math.random() * (fishType.speedRange[1] - fishType.speedRange[0]);
            // Ajuster la vitesse max en fonction de la taille
            const sizeNorm = (size - fishType.sizeRange[0]) / Math.max(1e-6, (fishType.sizeRange[1] - fishType.sizeRange[0]));
            const speedFactor = 1.0 - 0.4 * sizeNorm;
            let speed = Math.max(fishType.speedRange[0] * 0.6, Math.min(fishType.speedRange[1], baseSpeed * speedFactor));
            
            // Appliquer les bonus de vitesse
            if (perks.fishSpeed) {
                speed *= perks.fishSpeed;
            }
            if (fishType.emoji === '🦐' && perks.shrimpSpeed) {
                speed *= perks.shrimpSpeed;
            }
            
            const stamina = fishType.staminaRange[0] + Math.random() * (fishType.staminaRange[1] - fishType.staminaRange[0]);
            const biteAffinity = fishType.biteAffinityRange[0] + Math.random() * (fishType.biteAffinityRange[1] - fishType.biteAffinityRange[0]);
            let aggression = fishType.aggressionRange[0] + Math.random() * (fishType.aggressionRange[1] - fishType.aggressionRange[0]);
            
            // Appliquer les bonus d'agressivité
            if (perks.fishAggression) {
                aggression *= perks.fishAggression;
            }
            const flashDuration = fishType.flashDuration[0] + Math.random() * (fishType.flashDuration[1] - fishType.flashDuration[0]);
            
            // Points basés sur la taille
            const points = Math.round(fishType.basePoints + size * fishType.pointsPerSize);
            
            // Profondeur de spawn basée sur des pixels fixes avec clamp (déjà calculée ci-dessus)
            
            // Vérifier si le poisson peut spawner dans la profondeur disponible
            if (!canFishSpawnInDepth(fishType, waterDepth)) {
                const availableZones = getAvailableDepthZones(waterDepth);
                const zoneNames = availableZones.map(z => z.name).join(', ');
                continue; // Passer au prochain poisson
            }
            
            const depthZones = calculateDepthZones(waterDepth);
            const effectiveDepthTotal = depthZones.total;
            
            // Calculer la profondeur relative dans l'échelle effective (0.0 = surface, 1.0 = fond)
            const minDepthRatio = fishType.depthRange[0]; // 0.0 à 1.0
            const maxDepthRatio = fishType.depthRange[1]; // 0.0 à 1.0
            const randomDepthRatio = minDepthRatio + Math.random() * (maxDepthRatio - minDepthRatio);
            
            // Convertir en pixels absolus dans l'échelle effective
            const spawnY = waterLevel + (randomDepthRatio * effectiveDepthTotal);
            
            // S'assurer que le poisson reste dans l'eau (pas dans le ciel)
            const finalSpawnY = Math.max(waterLevel + 5, Math.min(seabedY - 5, spawnY));

            const fish = {
                x: Math.random() * canvas.width,
                y: finalSpawnY,
                direction: Math.random() < 0.5 ? -1 : 1,
                name: fishType.name,
                emoji: fishType.emoji,
                size: size,
                speed: speed,
                points: points,
                stamina: stamina,
                maxStamina: stamina,
                biteAffinity: biteAffinity,
                aggression: aggression,
                flashUntil: 0,
                flashPhase: 0,
                biteAffinityBase: biteAffinity,
                refusedUntil: 0,
                baitPattern: fishType.baitPattern,
                angle: 0,
                isAttached: false,
                escaping: false
            };
            gameState.fish.push(fish);
            
            // Log détaillé du spawn du poisson - Informations unifiées
            const speciesInfo = {
                // Identification
                emoji: fish.emoji,
                name: fish.name,
                
                // Position de spawn
                coordinates: { 
                    x: Math.round(fish.x), 
                    y: Math.round(fish.y) 
                },
                
                // Zone de l'espèce
                speciesZone: {
                    range: `${(minDepthRatio * 100).toFixed(1)}% - ${(maxDepthRatio * 100).toFixed(1)}%`,
                    pixels: `${Math.round(waterLevel + (minDepthRatio * effectiveDepthTotal))}px - ${Math.round(waterLevel + (maxDepthRatio * effectiveDepthTotal))}px`
                },
                
                // Zones de spawn globales (avec clamp)
                spawnZones: {
                    surface: depthZones.surface,
                    shallow: depthZones.shallow,
                    mid: depthZones.mid,
                    deep: depthZones.deep,
                    abyssal: depthZones.abyssal,
                    total: effectiveDepthTotal
                },
                
                // Niveaux d'eau
                waterLevel: waterLevel,
                seabedLevel: seabedY,
                
                // Propriétés du poisson
                size: fish.size,
                speed: fish.speed,
                points: fish.points,
                stamina: fish.stamina,
                biteAffinity: fish.biteAffinity,
                aggression: fish.aggression,
                baitPattern: fish.baitPattern
            };
            
        }
    }

    // Fonction pour mettre à jour les poissons
    function updateFish(canvas) {
        gameState.fish.forEach(fish => {
            // Ne pas bouger les poissons si le jeu est terminé
            if (!gameState.isPlaying) {
                return;
            }
            
            // Poisson en fuite après casse de ligne
            if (fish.escaping) {
                const deltaSec = 1/60; // approximation
                fish.x += fish.escapeVx * deltaSec;
                fish.y += fish.escapeVy * deltaSec;
                // Angle de fuite
                fish.angle = Math.atan2(fish.escapeVy, fish.escapeVx);
                // L'hameçon ne suit plus le poisson (ligne cassée)
                // Retirer le poisson s'il sort de l'écran (ou après 2 secondes de fuite)
                const margin = 100;
                const escapeTime = (performance.now() - fish.escapeStartTime) / 1000;
                const shouldRemove = (fish.x < -margin || fish.x > canvas.width + margin || 
                    fish.y < -margin || fish.y > canvas.height + margin) || escapeTime > 2.0;
                
                if (shouldRemove) {
                    fish.removeMe = true; // Marquer pour suppression (le poisson disparaît)
                }
                return;
            }
            
            if (!fish.caught) {
                // Mise à jour de l'humeur (curieux/méfiant) périodiquement
                if (!fish.mood || Date.now() > (fish.moodUntil || 0)){
                    fish.mood = (Math.random() < 0.5 ? 'curious' : 'wary');
                    fish.moodUntil = Date.now() + (1500 + Math.random()*3500);
                    fish.moodStrength = 0.5 + Math.random()*0.8;
                }
                // Mouvement de base avec lissage
                fish.x += fish.direction * fish.speed;
                
                // Biais vers la gauche pour les gros poissons (profondeur)
                // Plus le poisson est gros, plus il préfère rester à gauche
                const sizeBias = Math.max(0, (fish.size - 15) / 35); // 0 pour petits, 1 pour très gros (taille 50)
                const leftBias = sizeBias * 0.08; // Force de biais max = 0.08
                
                // Appliquer le biais vers la gauche si le poisson est à droite du centre
                const centerX = canvas.width * 0.5;
                if (fish.x > centerX) {
                    const rightDistance = (fish.x - centerX) / (canvas.width * 0.5); // 0 à 1
                    fish.direction -= leftBias * rightDistance; // Plus on est à droite, plus on tire vers la gauche
                }
                
                // Changer de direction aux bords avec transition douce
                const margin = fish.size * 2; // Zone de transition plus large
                if (fish.x < margin) {
                    // Approche du bord gauche : tourner progressivement à droite
                    const turnForce = (margin - fish.x) / margin; // 0 à 1
                    fish.direction += turnForce * 0.1; // Rotation progressive
                    fish.direction = Math.max(-1, Math.min(1, fish.direction)); // Clamp
                    if (fish.direction < 0) fish.direction = 0.1; // Forcer vers la droite
                } else if (fish.x > canvas.width - margin) {
                    // Approche du bord droit : tourner progressivement à gauche
                    const turnForce = (fish.x - (canvas.width - margin)) / margin; // 0 à 1
                    fish.direction -= turnForce * 0.1; // Rotation progressive
                    fish.direction = Math.max(-1, Math.min(1, fish.direction)); // Clamp
                    if (fish.direction > 0) fish.direction = -0.1; // Forcer vers la gauche
                }
                
                // Normaliser la direction pour éviter la dérive
                if (Math.abs(fish.direction) < 0.5) {
                    fish.direction = fish.direction > 0 ? 1 : -1;
                }
                
                // Mouvement vertical léger
                fish.y += Math.sin(Date.now() * 0.001 + fish.x * 0.01) * 0.5;
                const seabedY = canvas.height - (GAME_CONFIG.seabed?.height || 40);
                // Contrainte position: seulement pour les poissons NON attrapés
                const isAttached = gameState.attachedFish.some(att => att.fish === fish);
                if (!isAttached) {
                    fish.y = Math.max(GAME_CONFIG.water.level + fish.size,
                                      Math.min(seabedY - fish.size, fish.y));
                } else {
                    // Poisson attrapé: seulement empêcher de traverser le fond
                    fish.y = Math.min(seabedY - fish.size, fish.y);
                }
                // Attraction / répulsion près de l'hameçon
                if (gameState.isCasting){
                    const dx = gameState.hookPosition.x - fish.x;
                    const dy = gameState.hookPosition.y - fish.y;
                    const d = Math.hypot(dx, dy) || 1;
                    const near = d < 220;
                    if (near){
                        const ux = dx / d; const uy = dy / d;
                        const now = Date.now();
                        const refused = fish.refusedUntil && now < fish.refusedUntil;
                        
                        // Si aucun poisson n'a mordu ET qu'aucun poisson n'est accroché, tous sont attirés
                        let attractionForce = 0;
                        if (!gameState.pendingBiteFish && gameState.attachedFish.length === 0) {
                            // Attraction active : tous les poissons viennent vers l'hameçon
                            attractionForce = fish.moodStrength * (refused ? 0.3 : 1.0);
                        } else {
                            // Un poisson a mordu ou est accroché : comportement normal (curiosité/méfiance)
                            const k = (fish.mood === 'curious' ? 1 : -1) * fish.moodStrength;
                            const avoidBoost = refused ? -0.8 : 0;
                            attractionForce = k + avoidBoost;
                        }
                        
                        // intensité décroît avec la distance (courbe douce)
                        const falloff = Math.pow(Math.max(0, 1 - d/220), 2); // Courbe quadratique pour transition douce
                        const moveX = ux * attractionForce * falloff * 0.5; // Réduit pour mouvement plus fluide
                        const moveY = uy * attractionForce * falloff * 0.35;
                        
                        // Appliquer mouvement avec lissage
                        fish.x += moveX;
                        fish.y += moveY;
                        
                        // Ajuster la direction horizontale progressivement
                        if (Math.abs(ux) > 0.1 && Math.abs(moveX) > 0.1) {
                            const targetDir = ux >= 0 ? 1 : -1;
                            fish.direction += (targetDir - fish.direction) * 0.15; // Transition douce (15% par frame)
                        }
                    }
                }
                // Angle vers la direction du mouvement
                const vx = fish.direction * fish.speed;
                const vy = Math.cos(Date.now() * 0.001 + fish.x * 0.01) * 0.2;
                fish.angle = Math.atan2(vy, vx || 0.0001);
            }
        });
        
        // Retirer les poissons marqués pour suppression
        gameState.fish = gameState.fish.filter(f => !f.removeMe);
    }

    // Fonction pour vérifier les collisions avec l'hameçon
    // Fonction pour analyser le pattern de mouvement du curseur
    function analyzeBaitPattern(targetFishOverride) {
        // Nouvelle mécanique: 6 patterns à 20px autour du poisson, maintien 3s
        // Patterns: 'devant', 'derriere', 'au_dessus', 'au_dessous', 'toucher', 'complete'
        const history = gameState.cursorMovementHistory || [];
        if (!history.length) return { type: 'unknown', score: 0 };
        
        // Sélection du poisson cible
        let targetFish = targetFishOverride || (gameState.pendingBiteFish ? gameState.pendingBiteFish.fish : null);
        if (!targetFish) {
            let best = null; let bestD = Infinity;
            const mx = gameState.mouseX || 0; const my = gameState.mouseY || 0;
            for (const f of gameState.fish) {
                if (f.caught) continue;
                const d = Math.hypot(mx - f.x, my - f.y);
                if (d < bestD) { bestD = d; best = f; }
            }
            targetFish = best;
        }
        if (!targetFish) return { type: 'unknown', score: 0 };
        
        // Historique des 3 dernières secondes (élargi si nécessaire)
        const nowTs = performance.now();
        const windowMs = 3500;
        const samples = history.filter(h => nowTs - h.ts <= windowMs);
        if (samples.length < 2) return { type: 'unknown', score: 0 };
        
        // Paramètres (tolérance un peu augmentée pour fiabilité)
        const nearRadius = 28;
        
        // Direction du poisson pour devant/derrière
        let fx = 1, fy = 0;
        if (typeof targetFish.angle === 'number') {
            fx = Math.cos(targetFish.angle);
            fy = Math.sin(targetFish.angle);
        } else {
            const vLen = Math.hypot(targetFish.vx||0, targetFish.vy||0) || 1;
            fx = (targetFish.vx||0) / vLen; fy = (targetFish.vy||0) / vLen;
        }
        
        // Accumulateurs
        let msAbove = 0, msBelow = 0, msLeft = 0, msRight = 0, msFront = 0, msBack = 0;
        let seenAbove = false, seenBelow = false, seenLeft = false, seenRight = false;
        
        for (let i = 1; i < samples.length; i++) {
            const b = samples[i];
            const a = samples[i-1];
            const dt = Math.max(0, b.ts - a.ts);
            if (dt <= 0) continue;
            const dx = (b.x ?? 0) - (targetFish.x ?? 0);
            const dy = (b.y ?? 0) - (targetFish.y ?? 0);
            const dist = Math.hypot(dx, dy);
            if (dist > nearRadius) continue;
            // Marges pour éviter que les points très proches de l'axe basculent de côté à cause du bruit
            const fyAbs = targetFish.y ?? 0;
            const fxAbs = targetFish.x ?? 0;
            if (b.y <= fyAbs - 2) { msAbove += dt; seenAbove = true; }
            else if (b.y >= fyAbs + 2) { msBelow += dt; seenBelow = true; }
            if (b.x <= fxAbs - 2) { msLeft += dt; seenLeft = true; }
            else if (b.x >= fxAbs + 2) { msRight += dt; seenRight = true; }
            const dot = dx*fx + dy*fy;
            if (dot >= 0) msFront += dt; else msBack += dt;
        }
        
        const needed = 1000;
        let detected = 'unknown';
        let score = 0;
        let spentMs = 0;
        
        // Priorité aux patterns directionnels maintenus
        if (msFront >= needed && msFront > msBack + 200) {
            detected = 'devant';
            score = Math.min(1, msFront / needed);
            spentMs = msFront;
        } else if (msBack >= needed && msBack > msFront + 200) {
            detected = 'derriere';
            score = Math.min(1, msBack / needed);
            spentMs = msBack;
        } else if (msAbove >= needed && msAbove > msBelow + 200) {
            detected = 'au_dessus';
            score = Math.min(1, msAbove / needed);
            spentMs = msAbove;
        } else if (msBelow >= needed && msBelow > msAbove + 200) {
            detected = 'au_dessous';
            score = Math.min(1, msBelow / needed);
            spentMs = msBelow;
        } /*
        else if (seenAbove && seenBelow && seenLeft && seenRight) {
            // COMPLETE (désactivé temporairement pour diagnostic)
            const minPerQuadrant = 250; // ms
            if (msAbove >= minPerQuadrant && msBelow >= minPerQuadrant && msLeft >= minPerQuadrant && msRight >= minPerQuadrant) {
                detected = 'complete';
                const coverMs = (msAbove + msBelow + msLeft + msRight) / 4;
                score = Math.min(1, coverMs / needed);
            }
        }
        */
        
        // Log + effet visuel quand un pattern est détecté (même sans morsure), avec un petit throttle
        if (detected !== 'unknown') {
            try {
                const now = performance.now();
                const fishLabel = (targetFish && (targetFish.emoji || targetFish.name)) ? (targetFish.emoji || targetFish.name) : 'poisson';
                if (gameState._lastPatternLogType !== detected || !gameState._lastPatternLogTs || (now - gameState._lastPatternLogTs) > 500) {
                    console.log(`[Pattern/curseur] détecté: ${detected} près de ${fishLabel}`);
                    gameState._lastPatternLogType = detected;
                    gameState._lastPatternLogTs = now;
                }
                // Effet ✨ sur le poisson ciblé quand la validation vient d'aboutir
                if (targetFish) {
                    const lastFx = targetFish._lastPatternEffectTs || 0;
                    if (spentMs >= needed && (now - lastFx) > 900) {
                        spawnPatternSparkle(targetFish.x, targetFish.y, `valid:${detected}`);
                        targetFish._lastPatternEffectTs = now;
                        // Accorder une fenêtre de 5s pendant laquelle la morsure sera garantie
                        try {
                            targetFish._patternBoostUntil = Date.now() + 5000;
                            targetFish._patternBoostType = detected;
                            console.log(`[Pattern/boost] ${detected} actif sur ${(targetFish.emoji||targetFish.name||'poisson')} pendant 5s`);
                        } catch (e) {}
                    }
                }
        } catch (e) {}
        }
        gameState._lastPatternType = detected;
        return { type: detected, score };
    }

    function checkHookCollisions() {
        if (!gameState.isCasting) return;
        if (gameState.attachedFish.length > 0) return; // un seul poisson à la fois
        
        const baitPattern = { type: 'unknown', score: 0 }; // placeholder avant la boucle
        const hookR = GAME_CONFIG.hook.size * 1.2;
        
        for (let i=0;i<gameState.fish.length;i++){
            const fish = gameState.fish[i];
            if (fish.caught) continue;
            const dx = fish.x - gameState.hookPosition.x;
            const dy = fish.y - gameState.hookPosition.y;
            const distance = Math.sqrt(dx*dx + dy*dy);
            const hitRadius = fish.size * 0.9 + hookR;
            if (distance < hitRadius) {
                // Analyser le pattern par rapport à CE poisson précis
                const baitPattern = analyzeBaitPattern(fish);
                // Le poisson décide s'il mord ou refuse
                const now = Date.now();
                const underRefusal = fish.refusedUntil && now < fish.refusedUntil;
                
                // Appliquer les perks des chapeaux
                const perks = applyHatPerks();
                
                // Nouvelle règle: si le pattern correspond à l'espèce, la morsure est GARANTIE
                // Les espèces peuvent définir baitPattern parmi: 'devant','derriere','au_dessus','au_dessous','complete','any'
                let biteProb = underRefusal ? 0 : (fish.biteAffinity || 0.5);
                let patternGuaranteed = false;
                if (fish.baitPattern === 'any') {
                    // Léger bonus générique
                    biteProb *= 1.2;
                } else if (
                    (baitPattern.type && fish.baitPattern && baitPattern.type === fish.baitPattern) ||
                    (fish._patternBoostUntil && Date.now() < fish._patternBoostUntil && (!fish.baitPattern || fish._patternBoostType === fish.baitPattern))
                ) {
                    // Pattern réussi ou boost actif → morsure garantie
                    biteProb = 1.0;
                    patternGuaranteed = true;
                } else if (baitPattern.type === 'unknown') {
                    biteProb *= 0.8;
                } else {
                    biteProb *= 0.6;
                }
                
                // Appliquer le bonus de chance de morsure
                if (perks.biteChance) {
                    biteProb *= perks.biteChance;
                }
                
                // Appliquer les perks contextuels selon moment de la journée et saison
                const timeOfDay = getTimeOfDayPeriod();
                if (timeOfDay === 'night' && perks.nightEfficiency) {
                    biteProb *= perks.nightEfficiency;
                }
                if (timeOfDay === 'day' && perks.dayEfficiency) {
                    biteProb *= perks.dayEfficiency;
                }
                if (timeOfDay === 'dawn' && perks.dawnEfficiency) {
                    biteProb *= perks.dawnEfficiency;
                }
                if (gameState.season === 'summer' && perks.summerEfficiency) {
                    biteProb *= perks.summerEfficiency;
                }
                if (gameState.season === 'autumn' && perks.autumnEfficiency) {
                    biteProb *= perks.autumnEfficiency;
                }
                
                // Si pattern garanti, ignorer les autres modificateurs
                if (patternGuaranteed) biteProb = 1.0;
                biteProb = Math.min(1.0, biteProb); // Cap à 100%
                
                if (Math.random() < biteProb) {
                    // Effet ✨ si morsure déclenchée par un pattern correspondant
                    try {
                        if (baitPattern.type && fish.baitPattern && baitPattern.type === fish.baitPattern) {
                            spawnPatternSparkle(fish.x, fish.y, `${baitPattern.type} → ${fish.name || fish.emoji}`);
                        }
                    } catch (e) {}
                    // Entrer en état de morsure en attente (durée basée sur flashDuration)
                    const flashDur = fish.flashDuration || 2000;
                    
                    // Transformation magique au moment de la morsure (chapeau Trans 🏳️‍⚧️)
                    if (perks.transformationChance && Math.random() < (perks.transformationChance - 1)) {
                        const unlocked = gameState.progress?.unlockedSpecies || [];
                        const availableTypes = GAME_CONFIG.fish.types.filter(t => unlocked.includes(t.emoji) && t.emoji !== fish.emoji);
                        if (availableTypes.length > 0) {
                            const rarityWeights = availableTypes.map(t => {
                                if (t.rarity === 'mythique') return 10;
                                if (t.rarity === 'légendaire') return 5;
                                if (t.rarity === 'épique') return 3;
                                if (t.rarity === 'rare') return 2;
                                return 1;
                            });
                            const totalWeight = rarityWeights.reduce((a, b) => a + b, 0);
                            let rand = Math.random() * totalWeight;
                            let transformedType = availableTypes[0];
                            for (let i = 0; i < rarityWeights.length; i++) {
                                rand -= rarityWeights[i];
                                if (rand <= 0) { transformedType = availableTypes[i]; break; }
                            }
                            showTransformationToast(fish.emoji, transformedType.emoji);
                            // Appliquer la transformation directement au poisson qui mord
                            fish.emoji = transformedType.emoji;
                            fish.name = transformedType.name;
                            fish._wasTransformed = true;
                            // Optionnel: ajuster légèrement la taille/points si nécessaire
                            // (on garde la taille/points d'origine pour l'équilibre)
                        }
                    }
                    
                    // Incrémenter le compteur global de morsures déclenchées
                    try {
                        if (!gameState.progress.stats) gameState.progress.stats = {};
                        gameState.progress.stats.totalBites = (gameState.progress.stats.totalBites || 0) + 1;
                        saveProgress();
                    } catch (e) {}

                    gameState.pendingBiteFish = {
                        fish,
                        expiresAt: now + flashDur
                    };
                    fish.flashState = 1; // activer clignotement
                } else {
                    // Refus: le poisson ignore l'appât pour un court moment
                    fish.refusedUntil = now + (1000 + Math.random()*2000); // 1-3s
                }
            }
        }
    }

    // Fonction pour créer un effet de capture
    function createCaptureEffect(x, y) {
        // Animation simple de particules
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                // Effet visuel temporaire
            }, i * 50);
        }
    }

    // Effet visuel discret lors d'une morsure déclenchée par pattern
    function spawnPatternSparkle(x, y, info) {
        // Une étincelle ✨ qui grossit et disparaît rapidement
        gameState.effects.push({
            type: 'sparkle',
            x, y,
            age: 0,
            life: 0.9, // durée plus longue (s)
            size: 14 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2
        });
        try { console.log(`[Pattern✨] Effet déclenché ${info ? '('+info+') ' : ''}à x=${Math.round(x)}, y=${Math.round(y)}`); } catch (e) {}
    }

    function updateEffects(deltaSec) {
        if (!gameState.effects) return;
        gameState.effects.forEach(e => { e.age += deltaSec; });
        gameState.effects = gameState.effects.filter(e => e.age < e.life);
    }

    function drawEffects(ctx) {
        if (!gameState.effects) return;
        gameState.effects.forEach(e => {
            const t = Math.min(1, e.age / e.life);
            const alpha = 1 - t * 0.9; // fade plus lent
            const scale = 0.9 + 0.5 * t; // un peu plus d'ampleur
            ctx.save();
            ctx.globalAlpha = alpha * 0.9;
            ctx.translate(e.x, e.y);
            ctx.rotate(e.rotation);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `${(e.size * scale).toFixed(0)}px sans-serif`;
            ctx.fillText('✨', 0, 0);
            ctx.restore();
        });
    }


    // Fonction pour mettre à jour l'affichage de l'heure du jour et de la saison
    function updateTimeAndSeasonDisplay() {
        const timeElement = document.getElementById('fishing-time-of-day');
        const seasonElement = document.getElementById('fishing-season');
        
        if (timeElement) {
            timeElement.textContent = getTimeOfDayLabel();
        }
        
        if (seasonElement) {
            const seasonEmojis = {
                spring: '🌸',
                summer: '☀️',
                autumn: '🍂',
                winter: '❄️'
            };
            seasonElement.textContent = seasonEmojis[gameState.season] || '🌸';
        }
        
        // Ajouter le gestionnaire de clic sur le timer s'il n'existe pas déjà
        const timerElement = document.getElementById('fishing-time');
        if (timerElement && !timerElement.hasAttribute('data-click-handler-added')) {
            timerElement.style.cursor = 'pointer';
            timerElement.setAttribute('data-click-handler-added', 'true');
            timerElement.addEventListener('click', toggleTimer);
        }
        
    }

    // Fonction pour basculer l'état du timer
    function toggleTimer() {
        gameState.timerEnabled = !gameState.timerEnabled;
        
        // Afficher un message de feedback
        const message = gameState.timerEnabled ? 
            'Timer activé - Score et achievements réactivés' : 
            'Timer désactivé - Score et achievements désactivés';
        
        showToast(message, gameState.timerEnabled ? 'success' : 'warning');
        
        // Mettre à jour l'affichage du score pour refléter l'état
        updateScoreDisplay();
    }

    // Fonction pour mettre à jour l'affichage du score avec l'état du timer
    function updateScoreDisplay() {
        const scoreElement = document.getElementById('fishing-score');
        const highScoreElement = document.getElementById('fishing-high-score');
        const levelElement = document.getElementById('fishing-level');
        
        // Mettre à jour le contenu du score
        if (scoreElement) {
            scoreElement.textContent = gameState.score;
            if (!gameState.timerEnabled) {
                scoreElement.style.opacity = '0.5';
                scoreElement.style.textDecoration = 'line-through';
            } else {
                scoreElement.style.opacity = '1';
                scoreElement.style.textDecoration = 'none';
            }
        }
        
        // Mettre à jour le contenu du high score
        if (highScoreElement) {
            if (!gameState.timerEnabled) {
                highScoreElement.style.opacity = '0.5';
                highScoreElement.style.textDecoration = 'line-through';
            } else {
                highScoreElement.style.opacity = '1';
                highScoreElement.style.textDecoration = 'none';
            }
        }
        
        // Mettre à jour le niveau
        if (levelElement) {
            gameState.level = Math.floor(gameState.score / 100) + 1;
            levelElement.textContent = gameState.level;
            if (!gameState.timerEnabled) {
                levelElement.style.opacity = '0.5';
                levelElement.style.textDecoration = 'line-through';
            } else {
                levelElement.style.opacity = '1';
                levelElement.style.textDecoration = 'none';
            }
        }
        
        // Mettre à jour le poids total
        const weightElement = document.getElementById('fishing-weight');
        if (weightElement) {
            // Afficher le poids en format lisible (kg si > 1000g)
            const weight = gameState.totalWeight;
            if (weight >= 1000) {
                weightElement.textContent = `${(weight / 1000).toFixed(1)}kg`;
            } else {
                weightElement.textContent = `${Math.round(weight)}g`;
            }
            
            // En mode sans chrono, le poids compte aussi: pas d'effet barré/atténué
                weightElement.style.opacity = '1';
                weightElement.style.textDecoration = 'none';
        }
        
    }

    function updateCaughtFishDisplay() {
        const caughtListElement = document.getElementById('fishing-caught-list');
        if (caughtListElement) {
            if (!gameState.caughtFish || gameState.caughtFish.length === 0) {
                caughtListElement.textContent = '';
            } else {
                // Résumé compact: regrouper par emoji et compter, afficher "emoji xN"
                const counts = {};
                for (const e of gameState.caughtFish) counts[e] = (counts[e]||0) + 1;
                // Trier par fréquence décroissante puis par emoji
                const summary = Object.entries(counts)
                    .sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0]))
                    .slice(0, 8)
                    .map(([emoji, n]) => `${emoji}x${n}`)
                    .join('  ');
                caughtListElement.textContent = summary;
            }
        }
    }

    // Fonction pour afficher l'effet de bonus de temps
    function showTimeBonusEffect(seconds) {
        const timeElement = document.getElementById('fishing-time');
        if (!timeElement) return;
        
        // Créer l'élément de bonus
        const bonusDiv = document.createElement('div');
        bonusDiv.textContent = `+${seconds}s`;
        bonusDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 36px;
            font-weight: bold;
            color: #10b981;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.8);
            pointer-events: none;
            animation: bonusFadeUp 1.5s ease-out forwards;
            z-index: 10000;
        `;
        
        const container = document.querySelector('.fishing-game-container');
        if (container) {
            container.appendChild(bonusDiv);
            
            // Retirer après l'animation
            setTimeout(() => {
                if (bonusDiv.parentNode) {
                    bonusDiv.parentNode.removeChild(bonusDiv);
                }
            }, 1500);
        }
    }

    // Fonction pour mettre à jour le temps
    function updateTime() {
        if (gameState.isPlaying) {
            // Ne décompter que si le timer est activé et a été démarré (après le premier lancer)
            if (gameState.gameStartTime === 0) {
                gameState.timeLeft = 60; // Rester à 60s tant que pas lancé
            } else if (gameState.timerEnabled) {
                const elapsed = (Date.now() - gameState.gameStartTime) / 1000;
                gameState.timeLeft = Math.max(0, 60 - elapsed);
            }
            // Si le timer est désactivé, garder le temps actuel
            
            const timeElement = document.getElementById('fishing-time');
            if (timeElement) {
                timeElement.textContent = Math.ceil(gameState.timeLeft);
                // Ajouter un indicateur visuel si le timer est désactivé
                if (!gameState.timerEnabled) {
                    timeElement.style.opacity = '0.5';
                    timeElement.style.textDecoration = 'line-through';
                } else {
                    timeElement.style.opacity = '1';
                    timeElement.style.textDecoration = 'none';
                }
            }
            
        if (gameState.timeLeft <= 0 && gameState.timerEnabled) {
            // Tracking score parfait (300+ sans casser)
            if (gameState.score >= 300 && (gameState.progress?.stats?.lineBreaks || 0) === 0) {
                gameState.progress.stats.perfectScores = (gameState.progress.stats.perfectScores || 0) + 1;
            }
            endGame();
        }
        }
    }

    // Fonction pour lancer la ligne
    function castLine() {
        if (!gameState.isCasting && gameState.castPower > 0) {
            // Démarrer le timer au premier lancer et afficher l'UI
            if (gameState.gameStartTime === 0) {
                gameState.gameStartTime = Date.now();
                // Afficher l'UI du jeu
                const caughtDisplay = document.getElementById('fishing-caught-display');
                const timerDisplay = document.getElementById('fishing-timer-display');
                const scoreCorner = document.getElementById('fishing-score-corner');
                if (caughtDisplay) caughtDisplay.style.display = 'flex';
                if (timerDisplay) timerDisplay.style.display = 'block';
                if (scoreCorner) scoreCorner.style.display = 'flex';
            }
            
            const canvas = document.getElementById('fishing-canvas');
            const rodX = canvas.width - 100;
            const rodY = 88;
            const originX = rodX - Math.cos(gameState.rodAngle) * GAME_CONFIG.rod.length;
            const originY = rodY + Math.sin(gameState.rodAngle) * GAME_CONFIG.rod.length;
            const powerNorm = Math.min(1, Math.max(0, gameState.castPower / gameState.maxCastPower));
            let speed = powerNorm * GAME_CONFIG.physics.castSpeedFactor * 100; // px/s
            
            // Appliquer le perk de précision de lancer
            const perks = applyHatPerks();
            if (perks.castAccuracy) {
                speed *= perks.castAccuracy; // Meilleure précision = lancer plus puissant
            }
            
            const angle = gameState.rodAngle;
            gameState.isCasting = true;
            // Réinitialiser tout rembobinage résiduel
            gameState.isReeling = false;
            gameState.reelHold = false;
            gameState.reelIntensity = 0;
            gameState.hookPosition.x = originX;
            gameState.hookPosition.y = originY;
            gameState.hookPrevPosition.x = originX;
            gameState.hookPrevPosition.y = originY;
            gameState.hookMovementHistory = []; // Réinitialiser l'historique
            gameState.hookVelocity = {
                x: Math.max(-500, Math.min(500, Math.cos(angle) * -speed)),
                y: Math.sin(angle) * speed
            };
            gameState.lineOrigin = { x: originX, y: originY };
            gameState.lineLength = 0;
            gameState.castStartTs = performance.now();
            // reset puissance et preview
            gameState.castPower = 0;
            updatePowerBar();
            gameState.isPreviewingCast = false;
            gameState.previewPoints = [];
            // Stat lancers
            gameState.progress.stats.totalCasts = (gameState.progress.stats.totalCasts || 0) + 1;
            saveProgress();
            checkUnlocks();
        }
    }

    // Mise à jour physique de l'hameçon
    function updateHookPhysics(deltaSec, canvas){
        if (!gameState.isCasting || !canvas || !gameState.isPlaying) return;
        const isUnderWater = gameState.hookPosition.y >= GAME_CONFIG.water.level;
        // Détection d'entrée dans l'eau pour amortir l'horizontale
        if (!gameState._wasUnderWater && isUnderWater) {
            // Perdre 80% de la vitesse horizontale: conserver 20%
            gameState.hookVelocity.x *= 0.2;
        }
        gameState._wasUnderWater = isUnderWater;
        const drag = isUnderWater ? GAME_CONFIG.physics.waterDrag : GAME_CONFIG.physics.airDrag;
        // Gravité (le poids de l'hameçon ne s'applique que sous l'eau)
        const hookWeight = Math.max(0.5, Math.min(1.2, gameState.hookWeightFactor || (gameState.progress?.features?.hookWeightFactor || 1)));
        if (isUnderWater) {
            // Effet plus fort du poids: gravité accrue proportionnelle au carré du facteur
            const weightForce = hookWeight * hookWeight; // quadratique
            gameState.hookVelocity.y += GAME_CONFIG.physics.gravity * weightForce * deltaSec * 0.50; // 0.35 -> 0.50
            // Flottabilité uniforme (même comportement vide/avec poisson), atténuée par le poids
            const buoyMul = 1 / (0.7 + 0.3 * hookWeight); // 1x à 0.5x
            gameState.hookVelocity.y -= (GAME_CONFIG.physics.attachedBuoyancy || 0) * buoyMul * deltaSec;
        } else {
            gameState.hookVelocity.y += GAME_CONFIG.physics.gravity * deltaSec;
        }
        // Ralentir spécifiquement le mouvement vertical sous l'eau
        if (isUnderWater) {
            // amortissement multiplicatif supplémentaire sur l'axe vertical
            const baseDamp = GAME_CONFIG.physics.waterVerticalDamp || 1;
            // Hameçon plus lourd => moins d'amortissement vertical
            const damp = 1 - (1 - baseDamp) / Math.max(1, hookWeight);
            gameState.hookVelocity.y *= (1 - Math.min(0.95, Math.max(0, (1 - damp)) ) * Math.min(1, deltaSec * 5));
            // limiter la vitesse verticale max sous l'eau (plus lourds => plafond plus élevé)
            const baseVmaxY = GAME_CONFIG.physics.maxWaterVerticalSpeed || 200;
            const vmaxY = baseVmaxY * (0.9 + 0.6 * Math.max(1, hookWeight));
            if (gameState.hookVelocity.y > vmaxY) gameState.hookVelocity.y = vmaxY;
            if (gameState.hookVelocity.y < -vmaxY) gameState.hookVelocity.y = -vmaxY;
        }
        // Lutte du poisson attaché
        if (gameState.attachedFish.length){
            // Temps de lutte pour moduler les phases d'effort
            gameState.struggleTime = (gameState.struggleTime || 0) + deltaSec;
            const att = gameState.attachedFish[0];
            const fish = att.fish;
            const isUnderWater = gameState.hookPosition.y >= GAME_CONFIG.water.level;

            // Déterminer si le poisson tire (force active) en fonction de sa stamina et d'un rythme basique
            const pullActive = fish.stamina > 1 && (Math.sin(gameState.struggleTime * (1 + fish.speed*0.3)) > 0.2 || (gameState.lineTension > 0.3));

            // (flottabilité déjà appliquée uniformément plus haut)

            // Cas 1: poisson tire et rembobinage NON cliqué
            if (pullActive && !gameState.isReeling) {
                // Le poisson se déplace (forces d'échappement)
                const toOriginX = gameState.lineOrigin.x - gameState.hookPosition.x;
                const toOriginY = gameState.lineOrigin.y - gameState.hookPosition.y;
                const distO = Math.hypot(toOriginX, toOriginY) || 1;
                const nx = toOriginX / distO; const ny = toOriginY / distO; const tx = -ny; const ty = nx;
                const staminaNorm = Math.max(0, Math.min(1, fish.stamina / (80 + fish.size * 4)));
                const envMul = isUnderWater ? 1.1 : 0.8;
                const radial = (12 + fish.size) * envMul * (0.5 + 0.5 * staminaNorm) * GAME_CONFIG.physics.fishStrength;
                const tang = (10 + fish.size * 0.8) * (isUnderWater ? 1.0 : 0.6) * GAME_CONFIG.physics.fishStrength;
                gameState.hookVelocity.x -= nx * radial * deltaSec;
                gameState.hookVelocity.y -= ny * radial * deltaSec;
                gameState.hookVelocity.x += tx * tang * deltaSec;
                gameState.hookVelocity.y += ty * tang * deltaSec;
                // Stamina baisse (réduite) quand le poisson tire seul
                fish.stamina -= 18 * deltaSec;
            }
            // Cas 2: poisson NE tire pas et rembobinage cliqué
            else if (!pullActive && gameState.isReeling) {
                // Le poisson suit la ligne (pas de perte d'endurance)
                fish.stamina += 5 * deltaSec; // légère récup (réduit de 8 à 5)
            }
            // Cas 3: poisson tire et rembobinage cliqué
            else if (pullActive && gameState.isReeling) {
                // Forces opposées
                const toOriginX = gameState.lineOrigin.x - gameState.hookPosition.x;
                const toOriginY = gameState.lineOrigin.y - gameState.hookPosition.y;
                const distO = Math.hypot(toOriginX, toOriginY) || 1;
                const nx = toOriginX / distO; const ny = toOriginY / distO; const tx = -ny; const ty = nx;
                const staminaNorm = Math.max(0, Math.min(1, fish.stamina / (80 + fish.size * 4)));
                const envMul = isUnderWater ? 1.25 : 0.9;
                const radial = (16 + fish.size * 1.2) * envMul * (0.6 + 0.6 * staminaNorm) * GAME_CONFIG.physics.fishStrength;
                const tang = (12 + fish.size) * (isUnderWater ? 1.0 : 0.7) * GAME_CONFIG.physics.fishStrength;
                gameState.hookVelocity.x -= nx * radial * deltaSec;
                gameState.hookVelocity.y -= ny * radial * deltaSec;
                gameState.hookVelocity.x += tx * tang * deltaSec;
                gameState.hookVelocity.y += ty * tang * deltaSec;
                // Stamina baisse en opposition (réduite)
                fish.stamina -= 24 * deltaSec;
            }
            else {
                // Aucun tirage et pas de rembobinage: stamina récupère doucement (augmentée)
                fish.stamina += 12 * deltaSec;
            }

            // Contraintes stamina
            const maxStamina = 80 + fish.size * 4;
            fish.stamina = Math.max(0, Math.min(maxStamina, fish.stamina));
            // Si la stamina est à 0, le poisson ne peut plus tirer
            if (fish.stamina === 0) {
                // annule le tirage actif pour les prochains ticks
                // la logique pullActive se recalculera faux au prochain passage
            }

        } else {
            gameState.struggleTime = 0;
        }
        // Traînée simple (amortissement)
        // Sous l'eau: un hameçon plus lourd subit légèrement moins la traînée
        // Hors de l'eau: traînée inchangée par le poids
        if (isUnderWater) {
            // Réduction supplémentaire de la traînée quand l'hameçon est lourd
            const dragMul = 1 - (drag * deltaSec) / (0.5 + 0.5 * hookWeight); // plus sensible au poids
            gameState.hookVelocity.x *= dragMul;
            gameState.hookVelocity.y *= dragMul;
        } else {
            const dragMul = 1 - drag * deltaSec;
            gameState.hookVelocity.x *= dragMul;
            gameState.hookVelocity.y *= dragMul;
        }
        // Déplacement
        gameState.hookPosition.x += gameState.hookVelocity.x * deltaSec;
        gameState.hookPosition.y += gameState.hookVelocity.y * deltaSec;
        // Pas de collisions avec les bords de l'écran: l'hameçon peut sortir et revenir

        // Collision avec le fond marin (empêcher l'hameçon de traverser)
        const seabedY = canvas.height - (GAME_CONFIG.seabed?.height || 40);
        if (gameState.hookPosition.y > seabedY) {
            gameState.hookPosition.y = seabedY;
            if (gameState.hookVelocity.y > 0) gameState.hookVelocity.y = 0; // stopper descente
            gameState.hookVelocity.x *= 0.85; // friction au sol
        }

        // Tracking du mouvement de l'hameçon pour les patterns
        const movementDx = gameState.hookPosition.x - gameState.hookPrevPosition.x;
        const movementDy = gameState.hookPosition.y - gameState.hookPrevPosition.y;
        const movementSpeed = Math.hypot(movementDx, movementDy) / Math.max(deltaSec, 0.001);
        
        // Enregistrer le mouvement dans l'historique (garder max 60 frames = ~1 sec)
        gameState.hookMovementHistory.push({
            dx: movementDx,
            dy: movementDy,
            speed: movementSpeed,
            timestamp: performance.now()
        });
        if (gameState.hookMovementHistory.length > 60) {
            gameState.hookMovementHistory.shift();
        }
        
        // Mettre à jour la position précédente
        gameState.hookPrevPosition.x = gameState.hookPosition.x;
        gameState.hookPrevPosition.y = gameState.hookPosition.y;

        // Longueur de ligne et contrainte
        const dx = gameState.hookPosition.x - gameState.lineOrigin.x;
        const dy = gameState.hookPosition.y - gameState.lineOrigin.y;
        const dist = Math.hypot(dx, dy);
        const maxLen = GAME_CONFIG.physics.maxLineLength;
        if (dist > maxLen){
            const ratio = maxLen / Math.max(1e-6, dist);
            gameState.hookPosition.x = gameState.lineOrigin.x + dx * ratio;
            gameState.hookPosition.y = gameState.lineOrigin.y + dy * ratio;
            gameState.hookVelocity.x *= 0.6;
            gameState.hookVelocity.y *= 0.6;
        }
        // Direction de la ligne
        const lx = (dist > 0 ? dx / dist : 1);
        const ly = (dist > 0 ? dy / dist : 0);

        // Tension: forces opposées (poisson vs rembobinage) → valeur 0..1 agressive
        let tension = 0;
        const hookAboveWater = gameState.hookPosition.y < GAME_CONFIG.water.level;
        
        // Si l'hameçon est hors de l'eau, tension tombe rapidement à 0
        if (hookAboveWater) {
            const maxDelta = 2.5 * deltaSec; // descente très rapide
            tension = Math.max(0, (gameState.lineTension || 0) - maxDelta);
        } else if (gameState.attachedFish.length) {
            const fish = gameState.attachedFish[0].fish;
            const staminaNorm = Math.max(0, Math.min(1, fish.stamina / (80 + fish.size * 4)));
            const fishForce = (18 + fish.size * 1.5) * (0.6 + 0.6 * staminaNorm) * GAME_CONFIG.physics.fishStrength;
            const reelForce = (gameState.isReeling ? GAME_CONFIG.physics.reelSpeed * (0.25 + 0.75 * gameState.reelIntensity) : 0.0001);
            
            // Multiplicateur de tension basé sur la taille du poisson
            // Petits poissons (8-12) : ~0.25-0.35×, Gros poissons (40-50) : ~0.8-1.0×
            const sizeMultiplier = Math.max(0.2, Math.min(1.0, 0.2 + (fish.size / 50)));
            
            // Calcul direct: rembobinage augmente tension, absence de rembobinage la baisse
            let targetTension = 0.10; // base minimale
            
            // Déterminer si le poisson tire activement (même logique que updateHookPhysics)
            const pullActive = fish.stamina > 1 && (Math.sin(gameState.struggleTime * (1 + fish.speed*0.3)) > 0.2 || (gameState.lineTension > 0.3));
            
            // Composante du poisson (force radiale) - multipliée par la taille
            const pullComponent = fishForce * (0.004 + 0.002 * staminaNorm) * sizeMultiplier;
            
            // Composante du rembobinage (force de traction) - multipliée par la taille
            const reelComponent = gameState.isReeling ? reelForce * (0.006 + 0.005 * (gameState.reelIntensity || 0)) * sizeMultiplier : 0;
            
            // Cas 1: poisson tire ET rembobinage → tension élevée (forces opposées)
            if (pullActive && gameState.isReeling) {
                targetTension += pullComponent + reelComponent;
                const intensity = gameState.reelIntensity || 0;
                targetTension = Math.max(targetTension, (0.25 + 0.3 * intensity) * sizeMultiplier);
            }
            // Cas 2: poisson tire SANS rembobinage → tension faible/modérée (poisson peut se déplacer, ligne se détend)
            else if (pullActive && !gameState.isReeling) {
                targetTension += pullComponent * 0.35; // Tension réduite car le poisson peut fuir
                targetTension = Math.max(0.08, targetTension - 0.1); // Baisse progressive
            }
            // Cas 3: poisson ne tire pas AVEC rembobinage → tension modérée (juste la traction)
            else if (!pullActive && gameState.isReeling) {
                targetTension += reelComponent;
                const intensity = gameState.reelIntensity || 0;
                targetTension = Math.max(targetTension, (0.15 + 0.25 * intensity) * sizeMultiplier);
            }
            // Cas 4: poisson ne tire pas SANS rembobinage → tension minimale (détente complète)
            else {
                targetTension = Math.max(0.05, targetTension - 0.15);
            }
            
            // Bonus si proche de la longueur max
            if (dist > maxLen * 0.95) targetTension += 0.12;
            
            // Clamper entre 0 et 1 sans tanh saturant
            targetTension = Math.max(0, Math.min(1, targetTension));
            
            // Si le poisson n'a plus de stamina, plafonner la tension à 0.7 (70%)
            if (gameState.attachedFish.length) {
                const fish = gameState.attachedFish[0].fish;
                if (fish && fish.stamina <= 1) {
                    targetTension = Math.min(targetTension, 0.7);
                }
            }
            
            // Appliquer les perks de résistance à la tension
            const perks = applyHatPerks();
            if (perks.tensionResistance) {
                targetTension /= perks.tensionResistance; // Réduire la tension
            }
            // Résistance à la tension en profondeur
            const hookY = gameState.hookPosition.y;
            const waterLevel = GAME_CONFIG.water.level;
            const seabedY = canvas.height - (GAME_CONFIG.seabed?.height || 40);
            const depth = (hookY - waterLevel) / (seabedY - waterLevel); // 0 = surface, 1 = fond
            if (depth > 0.7 && perks.deepTensionResistance) {
                targetTension /= perks.deepTensionResistance;
            }
            // Résistance au froid (réduit la tension)
            if (perks.coldResistance) {
                targetTension /= perks.coldResistance;
            }
            
            // Lissage temporel: montée lente, descente rapide
            const maxDelta = (targetTension > (gameState.lineTension || 0)) ? 0.7 * deltaSec : 1.8 * deltaSec;
            if (targetTension > (gameState.lineTension || 0)) {
                tension = Math.min(targetTension, (gameState.lineTension || 0) + maxDelta);
            } else {
                tension = Math.max(targetTension, (gameState.lineTension || 0) - maxDelta);
            }
        } else {
            // Ligne vide: logique alignée, mais l'effet du poids sur la tension est fortement réduit
            const hookWeight = Math.max(0.5, Math.min(1.2, gameState.hookWeightFactor || (gameState.progress?.features?.hookWeightFactor || 1)));
            const sizeMultiplier = 0.45; // quasi constant pour minimiser l'impact du poids
            const reelForce = (gameState.isReeling ? GAME_CONFIG.physics.reelSpeed * (0.25 + 0.75 * gameState.reelIntensity) : 0.0001);
            let targetTension = 0.10;
            // Composante de rembobinage similaire à la branche avec poisson
            const intensity = gameState.reelIntensity || 0;
            const reelComponent = gameState.isReeling ? reelForce * (0.006 + 0.005 * intensity) * sizeMultiplier : 0;
            if (gameState.isReeling) {
                targetTension += reelComponent;
                targetTension = Math.max(targetTension, (0.15 + 0.25 * intensity) * sizeMultiplier);
            } else {
                // Influence du poids quasi nulle sur la tension
                if (isUnderWater) targetTension += 0.01 * (hookWeight - 1) * sizeMultiplier;
                targetTension = Math.max(0.05, targetTension - 0.12);
            }
            // Bonus si proche de la longueur max
            if (dist > maxLen * 0.95) targetTension += 0.12;
            // Clamp 0..1
            targetTension = Math.max(0, Math.min(1, targetTension));
            // Lissage identique: montée lente, descente rapide
            const maxDelta = (targetTension > (gameState.lineTension || 0)) ? 0.7 * deltaSec : 1.8 * deltaSec;
            if (targetTension > (gameState.lineTension || 0)) {
                tension = Math.min(targetTension, (gameState.lineTension || 0) + maxDelta);
            } else {
                tension = Math.max(targetTension, (gameState.lineTension || 0) - maxDelta);
            }
        }
        gameState.lineTension = Math.max(0, Math.min(1, tension));

        // Casse de ligne en fonction de la tension
        if (!gameState.breakAccum) gameState.breakAccum = 0;
        const castAge = (performance.now() - (gameState.castStartTs || 0)) / 1000;
        const gracePeriod = castAge < 2.0;
        const t = gameState.lineTension;
        let base = (GAME_CONFIG.physics.breakTensionThreshold || 0.8);
        
        // Appliquer les perks des chapeaux
        const perks = applyHatPerks();
        
        // Résistance aux cassures (chapeau casque de sécurité)
        if (perks.breakResistance) {
            base *= perks.breakResistance;
        }
        
        // Ligne incassable (chapeau robot)
        if (perks.unbreakableLine) {
            base = 999; // Pratiquement incassable
        }
        
        // Vérifier si le poisson a encore de la stamina
        let fishHasStamina = false;
        if (gameState.attachedFish.length) {
            const fish = gameState.attachedFish[0].fish;
            fishHasStamina = fish.stamina > 1;
        }
        
        // La ligne ne peut se casser que si le poisson a encore de la stamina
        if (t > base && !gracePeriod && fishHasStamina) {
            const rate = Math.pow((t - base) / Math.max(0.01, 1 - base), 2) * 1.5;
            gameState.breakAccum += rate * deltaSec;
        } else {
            gameState.breakAccum = Math.max(0, gameState.breakAccum - deltaSec * 0.6);
        }
        if (gameState.breakAccum >= 1) {
            // La ligne casse : le poisson s'enfuit
            if (gameState.attachedFish.length){
                const escapingFish = gameState.attachedFish[0].fish;
                // Marquer le poisson comme "s'échappant" et lui donner une vitesse de fuite
                escapingFish.escaping = true;
                escapingFish.escapeStartTime = performance.now();
                // Vitesse de fuite vers la gauche et légèrement vers le bas
                escapingFish.escapeVx = -(200 + Math.random() * 150);
                escapingFish.escapeVy = 50 + Math.random() * 100;
            }
            
            // Incrémenter le compteur de casses et réinitialiser le streak sans casse
            if (gameState.progress?.stats) {
                gameState.progress.stats.lineBreaks = (gameState.progress.stats.lineBreaks || 0) + 1;
                gameState.progress.stats.currentNoBreakStreak = 0;
                // Tracking morts de jeu (ligne cassée)
                gameState.progress.stats.gameDeaths = (gameState.progress.stats.gameDeaths || 0) + 1;
                saveProgress();
            }
            
            // Réinitialiser immédiatement la ligne et l'hameçon (ne pas attendre la disparition du poisson)
            gameState.attachedFish = [];
            gameState.reelIntensity = 0;
            gameState.isReeling = false;
            gameState.lineTension = 0;
            gameState.isCasting = false;
            gameState.lineSnapped = false; // Pas besoin de masquer la ligne, elle est réinitialisée
            gameState.breakAccum = 0;
            
            // Repositionner l'hameçon à l'origine immédiatement
            const canvasEl = document.getElementById('fishing-canvas');
            if (canvasEl) {
                const rodX = canvasEl.width - 100;
                const rodY = 88;
                const originX = rodX - Math.cos(gameState.rodAngle) * GAME_CONFIG.rod.length;
                const originY = rodY + Math.sin(gameState.rodAngle) * GAME_CONFIG.rod.length;
                gameState.hookPosition.x = originX;
                gameState.hookPosition.y = originY;
                gameState.hookVelocity.x = 0;
                gameState.hookVelocity.y = 0;
            }
            
            return;
        }
	}

    // Rembobinage progressif
    function reelUpdate(deltaSec){
        if (!gameState.isCasting) return;
        // Gestion de l'intensité via maintien du bouton
        const accel = 2.2; // par seconde
        if (gameState.reelHold) {
            gameState.reelIntensity = Math.min(1, gameState.reelIntensity + accel * deltaSec);
            gameState.isReeling = true; // Force active quand on maintient
        } else {
            gameState.reelIntensity = Math.max(0, gameState.reelIntensity - accel * 1.5 * deltaSec);
            if (gameState.reelIntensity <= 0) {
                gameState.isReeling = false; // Arrêt quand intensité nulle
            }
        }
        if (gameState.reelIntensity <= 0) return;
        // Mouvement vers l'anneau
        const toOrigin = {
            x: gameState.lineOrigin.x - gameState.hookPosition.x,
            y: gameState.lineOrigin.y - gameState.hookPosition.y
        };
        const d = Math.hypot(toOrigin.x, toOrigin.y);
        // Capturer le poisson quand il touche le pêcheur (position de la canne)
        const canvas = document.getElementById('fishing-canvas');
        const rodX = canvas ? canvas.width - 100 : 500;
        const rodY = 88;
        const distToPecheur = Math.hypot(gameState.hookPosition.x - rodX, gameState.hookPosition.y - rodY);
        if (distToPecheur < 40){
            if (gameState.attachedFish.length){
                let gained = 0;
                let fishCount = 0;
                // Appliquer les perks des chapeaux
                const perks = applyHatPerks();
                
                gameState.attachedFish.forEach(att => { 
                    let points = att.fish.points;
                    
                    // Multiplicateur de points
                    if (perks.pointMultiplier) {
                        points *= perks.pointMultiplier;
                    }
                    
                    // Bonus pour captures élevées (chapeau piñata)
                    if (perks.highCatchBonus && gameState.caughtFish && gameState.caughtFish.length >= 100) {
                        points *= perks.highCatchBonus;
                    }
                    
                    // Explosion de capture (chapeau explosif)
                    if (perks.explosiveCapture) {
                        points *= perks.explosiveCapture;
                    }
                    
                    // Effets aléatoires (chapeau dé)
                    if (perks.randomEffects) {
                        const randomEffect = Math.random();
                        if (randomEffect < 0.3) points *= 2; // 30% chance de double points
                        else if (randomEffect < 0.5) points *= 0.5; // 20% chance de demi points
                        else if (randomEffect < 0.7) points += 50; // 20% chance de +50 points
                    }
                    
                    gained += Math.round(points);
                    fishCount++;
                    // Ajouter l'emoji du poisson capturé
                    if (!gameState.caughtFish) gameState.caughtFish = [];
                    gameState.caughtFish.push(att.fish.emoji || '🐟');
                    // Mettre à jour le plus gros poisson capturé
                    if (!gameState.biggestCatch || att.fish.size > gameState.biggestCatch.size) {
                        const estimatedWeight = Math.max(0.1, (att.fish.size / 10)); // Poids simple ~ taille/10
                        gameState.biggestCatch = {
                            emoji: att.fish.emoji,
                            name: att.fish.name,
                            size: Math.round(att.fish.size),
                            estimatedWeight: Number(estimatedWeight.toFixed(1))
                        };
                    }
                    
                    // Tracking par espèce pour les achievements
                    const emoji = att.fish.emoji || '🐟';
                    if (emoji === '🧜‍♀️') gameState.progress.stats.sirensCaught = (gameState.progress.stats.sirensCaught || 0) + 1;
                    if (emoji === '🐙') gameState.progress.stats.octopusCaught = (gameState.progress.stats.octopusCaught || 0) + 1;
                    if (emoji === '🐋') gameState.progress.stats.whalesCaught = (gameState.progress.stats.whalesCaught || 0) + 1;
                    if (emoji === '🦐') gameState.progress.stats.shrimpCaught = (gameState.progress.stats.shrimpCaught || 0) + 1;
                    if (emoji === '🐡') gameState.progress.stats.pufferCaught = (gameState.progress.stats.pufferCaught || 0) + 1;
                    if (emoji === '🦑') gameState.progress.stats.squidCaught = (gameState.progress.stats.squidCaught || 0) + 1;
                    if (emoji === '🐠') gameState.progress.stats.tropicalCaught = (gameState.progress.stats.tropicalCaught || 0) + 1;
                    if (emoji === '🪼') gameState.progress.stats.jellyfishCaught = (gameState.progress.stats.jellyfishCaught || 0) + 1;
                    if (emoji === '🐉') gameState.progress.stats.dragonsCaught = (gameState.progress.stats.dragonsCaught || 0) + 1;
                    if (emoji === '🧜‍♂️') gameState.progress.stats.mermenCaught = (gameState.progress.stats.mermenCaught || 0) + 1;
                    
                    // Tracking poissons géants (taille > 30)
                    if (att.fish.size > 30) {
                        gameState.progress.stats.giantFishCaught = (gameState.progress.stats.giantFishCaught || 0) + 1;
                    }
                });
                // Ajouter le score seulement si le timer est activé
                if (gameState.timerEnabled) {
                gameState.score += gained;
                }
                updateScoreDisplay();
                updateCaughtFishDisplay();
                
                // Bonus de temps pour chaque poisson capturé (seulement si timer activé)
                if (gameState.gameStartTime > 0 && gameState.timerEnabled) {
                    const bonusSeconds = GAME_CONFIG.timeBonusPerCatch * fishCount;
                    gameState.gameStartTime += bonusSeconds * 1000; // Décaler le temps de départ
                    // Effet visuel de bonus
                    showTimeBonusEffect(bonusSeconds);
                }
                
                // Mettre à jour les statistiques de captures (toutes espèces confondues) seulement si timer activé
                if (gameState.timerEnabled) {
                if (!gameState.progress.stats) gameState.progress.stats = {};
                gameState.progress.stats.totalCatches = (gameState.progress.stats.totalCatches || 0) + fishCount;
                }
                // Captures transformées (compter seulement celles marquées _wasTransformed) seulement si timer activé
                if (gameState.timerEnabled) {
                const transformedNow = gameState.attachedFish.reduce((acc, att) => acc + (att.fish._wasTransformed ? 1 : 0), 0);
                if (transformedNow > 0) {
                    gameState.progress.stats.transformedCatches = (gameState.progress.stats.transformedCatches || 0) + transformedNow;
                }
                }
                // Captures avec stamina encore > 0 seulement si timer activé
                if (gameState.timerEnabled) {
                const staminaAliveNow = gameState.attachedFish.reduce((acc, att) => acc + ((att.fish.stamina || 0) > 0 ? 1 : 0), 0);
                if (staminaAliveNow > 0) {
                    gameState.progress.stats.staminaAliveCatches = (gameState.progress.stats.staminaAliveCatches || 0) + staminaAliveNow;
                }
                }
                // Score cumulé seulement si timer activé
                if (gameState.timerEnabled) {
                gameState.progress.stats.cumulativeScore = (gameState.progress.stats.cumulativeScore || 0) + gained;
                }
                // Poids cumulé (somme des poids de chaque poisson capturé) — COMPTE TOUJOURS, même sans chrono
                let capturedWeight = 0;
                gameState.attachedFish.forEach(att => {
                    let w = Math.max(0.1, (att.fish.size / 10));
                    
                    // Appliquer les bonus de poids
                    if (perks.weightMultiplier) {
                        w *= perks.weightMultiplier;
                    }
                    if (att.fish.emoji === '🐋' && perks.whaleWeightBonus) {
                        w *= perks.whaleWeightBonus;
                    }
                    
                    capturedWeight += w;
                });
                gameState.progress.stats.cumulativeWeightKg = (gameState.progress.stats.cumulativeWeightKg || 0) + Number(capturedWeight.toFixed(2));
                    
                    // Ajouter au poids total pour le déblocage de taille (en grammes)
                    gameState.totalWeight += capturedWeight * 1000; // Convertir kg en grammes
                    
                // Mettre à jour les limites max selon le poids (sans forcer la taille)
                    updateWindowSizeBasedOnWeight();
                // Vérifier les déblocages immédiatement après mise à jour du poids
                checkUnlocks();
                // Streak sans casse seulement si timer activé
                if (gameState.timerEnabled) {
                gameState.progress.stats.currentNoBreakStreak = (gameState.progress.stats.currentNoBreakStreak || 0) + fishCount;
                gameState.progress.stats.bestNoBreakStreak = Math.max((gameState.progress.stats.bestNoBreakStreak || 0), gameState.progress.stats.currentNoBreakStreak);
                }
                // Botte capturée ? seulement si timer activé
                if (gameState.timerEnabled) {
                const bootsCaptured = gameState.attachedFish.filter(att => att.fish.emoji === '🥾').length;
                if (bootsCaptured > 0) {
                    gameState.progress.stats.bootsCaught = (gameState.progress.stats.bootsCaught || 0) + bootsCaptured;
                    }
                }
                
                // Tracking captures rapides (5 en 10s) seulement si timer activé
                if (gameState.timerEnabled && fishCount >= 5 && gameState.gameStartTime > 0) {
                    const gameTime = (Date.now() - gameState.gameStartTime) / 1000;
                    if (gameTime <= 10) {
                        gameState.progress.stats.fastCatches = (gameState.progress.stats.fastCatches || 0) + 1;
                    }
                }
                
                // Tracking captures selon moment de la journée seulement si timer activé
                if (gameState.timerEnabled) {
                const timeOfDay = getTimeOfDayPeriod();
                if (timeOfDay === 'night') {
                    gameState.progress.stats.nightCatches = (gameState.progress.stats.nightCatches || 0) + fishCount;
                }
                if (timeOfDay === 'dawn') {
                    gameState.progress.stats.dawnCatches = (gameState.progress.stats.dawnCatches || 0) + fishCount;
                }
                if (timeOfDay === 'day') {
                    gameState.progress.stats.dayCatches = (gameState.progress.stats.dayCatches || 0) + fishCount;
                    }
                }
                
                // Tracking captures selon saison seulement si timer activé
                if (gameState.timerEnabled) {
                if (gameState.season === 'summer') {
                    gameState.progress.stats.summerCatches = (gameState.progress.stats.summerCatches || 0) + fishCount;
                }
                if (gameState.season === 'autumn') {
                    gameState.progress.stats.autumnCatches = (gameState.progress.stats.autumnCatches || 0) + fishCount;
                }
                if (gameState.season === 'winter') {
                    gameState.progress.stats.winterCatches = (gameState.progress.stats.winterCatches || 0) + fishCount;
                }
                if (gameState.season === 'spring') {
                    gameState.progress.stats.springCatches = (gameState.progress.stats.springCatches || 0) + fishCount;
                    }
                }
                
                // Tracking captures sûres (sans casser la ligne) seulement si timer activé
                if (gameState.timerEnabled) {
                if (gameState.currentNoBreakStreak >= 100) {
                    gameState.progress.stats.safeCatches = (gameState.progress.stats.safeCatches || 0) + fishCount;
                }
                
                // Tracking captures aléatoires (score impair)
                if (gained % 2 === 1) {
                    gameState.progress.stats.randomCatches = (gameState.progress.stats.randomCatches || 0) + fishCount;
                }
                
                // Tracking max captures par partie
                const currentGameCatches = gameState.caughtFish ? gameState.caughtFish.length : 0;
                gameState.progress.stats.maxGameCatches = Math.max((gameState.progress.stats.maxGameCatches || 0), currentGameCatches);
                
                // Tracking espèces uniques capturées
                const uniqueSpecies = new Set(gameState.caughtFish || []);
                gameState.progress.stats.uniqueSpeciesCaught = Math.max((gameState.progress.stats.uniqueSpeciesCaught || 0), uniqueSpecies.size);
                saveProgress();
                checkUnlocks();
                }
                
                // Retirer les poissons attrapés du monde
                const toRemove = new Set(gameState.attachedFish.map(att => att.fish));
                gameState.fish = gameState.fish.filter(f => !toRemove.has(f));
            }
            gameState.attachedFish = [];
            gameState.isCasting = false;
            gameState.isReeling = false;
            gameState.reelIntensity = 0;
            return;
        }
        let base = GAME_CONFIG.physics.reelSpeed;
        const isUnderWater = gameState.hookPosition.y >= GAME_CONFIG.water.level;
        const envFactor = isUnderWater ? 1.0 : 1.6;
        let staminaFactor = 1;
        let resistFactor = 0; // fraction de vitesse retirée par la résistance du poisson
        
        // Appliquer les perks des chapeaux
        const perks = applyHatPerks();
        
        // Vitesse de rembobinage générale
        if (perks.reelSpeed) {
            base *= perks.reelSpeed;
        }
        
        // Vitesse de rembobinage en surface
        if (perks.surfaceReelSpeed && !isUnderWater) {
            base *= perks.surfaceReelSpeed;
        }
        
        if (gameState.attachedFish.length){
            const fish = gameState.attachedFish[0].fish;
            const s = Math.max(0, Math.min(1, fish.stamina / (80 + fish.size * 4)));
            const envResist = isUnderWater ? 1.0 : 0.6;
            resistFactor = Math.max(0, Math.min(0.85, (0.28 + 0.4 * s) * (0.35 + 0.5 * gameState.lineTension) * envResist * GAME_CONFIG.physics.fishStrength));
            staminaFactor = 0.6 + 0.6 * (1 - s); // 0.6..1.2
        }
        
        // Appliquer la résistance directement sur la vitesse de rembobinage
        const speed = base * 1.0 * (0.2 + 0.6 * gameState.reelIntensity) * envFactor * staminaFactor * (1 - resistFactor);
        const ux = toOrigin.x / (d || 1);
        const uy = toOrigin.y / (d || 1);
        gameState.hookPosition.x += ux * speed * deltaSec;
        gameState.hookPosition.y += uy * speed * deltaSec;
        // amortir la vitesse propre
        gameState.hookVelocity.x *= 0.82;
        gameState.hookVelocity.y *= 0.82;
        // assistance légère anti-gravité quand on est hors de l'eau
        if (!isUnderWater) {
            gameState.hookVelocity.y -= 30 * deltaSec;
        }
    }

    // Fonction pour rembobiner la ligne
    function reelLine() {
        if (gameState.isCasting) {
            gameState.isCasting = false;
            gameState.castPower = 0;
            updatePowerBar();
            
        }
    }

    // Fonction pour mettre à jour la barre de puissance
    function updatePowerBar() {
        const powerFill = document.getElementById('fishing-power-fill');
        if (powerFill) {
            powerFill.style.width = `${gameState.castPower}%`;
        }
    }

    // Fonction pour charger la puissance de lancer
    function chargePower() {
        if (!gameState.isCasting && gameState.isPlaying) {
            gameState.castPower = Math.min(gameState.maxCastPower, gameState.castPower + 2);
            updatePowerBar();
        }
    }

    // Fonction pour dessiner le jeu
    function drawGame(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground(ctx, canvas);
        drawBubbles(ctx, canvas);
        drawFish(ctx);
        drawFloatingHats(ctx, canvas);
        drawFishingRod(ctx, canvas);
        drawCastPreview(ctx);
        drawMouseIndicator(ctx);
        drawCustomCursor(ctx);
        drawDepthIndicator(ctx, canvas);
        // Dessiner les effets en dernier (par-dessus tout)
        drawEffects(ctx);
    }
    
    // Dessiner l'indicateur circulaire sous la souris
    function drawMouseIndicator(ctx) {
        const x = gameState.mouseX;
        const y = gameState.mouseY;
        
        // Initialiser l'animation si nécessaire
        if (!gameState.indicatorScale) gameState.indicatorScale = 0;
        if (!gameState.indicatorOpacity) gameState.indicatorOpacity = 0;
        
        // Animation d'apparition/disparition
        const targetScale = gameState.isMouseDown ? 1 : 0;
        const targetOpacity = gameState.isMouseDown ? 1 : 0;
        
        // Interpolation fluide
        gameState.indicatorScale += (targetScale - gameState.indicatorScale) * 0.3;
        gameState.indicatorOpacity += (targetOpacity - gameState.indicatorOpacity) * 0.25;
        
        // Ne pas dessiner si presque invisible
        if (gameState.indicatorOpacity < 0.01) return;
        if (!x || !y) return;
        
        const t = Math.max(0, Math.min(1, gameState.lineTension || 0));
        
        // Calculer la couleur selon la tension (même logique que le bouton)
        let color;
        if (t < 0.5) {
            const k = t / 0.5; // 0..1
            const r = Math.round(16 + (255-16) * k);
            const g = Math.round(185 + (206-185) * k);
            const b = 129;
            color = `rgb(${r},${g},${b})`;
        } else {
            const k = (t - 0.5) / 0.5; // 0..1
            const r = 255;
            const g = Math.round(206 - 180 * k);
            const b = Math.round(129 - 120 * k);
            color = `rgb(${r},${g},${b})`;
        }
        
        // Diamètre basé sur la tension : petit (15px) à grand (50px)
        const minRadius = 15;
        const maxRadius = 50;
        const tensionRadius = minRadius + (maxRadius - minRadius) * t;
        const finalRadius = tensionRadius * gameState.indicatorScale;
        
        // Dessiner le cercle principal avec le corps coloré
        ctx.save();
        ctx.globalAlpha = gameState.indicatorOpacity;
        
        // Cercle extérieur pulse si tension très haute
        if (t > 0.85) {
            const pulseScale = 1 + Math.sin(Date.now() / 150) * 0.15;
            ctx.beginPath();
            ctx.arc(x, y, finalRadius * pulseScale, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = gameState.indicatorOpacity * 0.3;
            ctx.fill();
        }
        
        // Cercle principal
        ctx.globalAlpha = gameState.indicatorOpacity;
        ctx.beginPath();
        ctx.arc(x, y, finalRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Cercle intérieur pour effet de profondeur
        ctx.beginPath();
        ctx.arc(x, y, finalRadius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fill();
        
        ctx.restore();
    }
    
    // Dessiner le curseur personnalisé (petit carré)
    function drawCustomCursor(ctx) {
        if (!gameState.mouseX || !gameState.mouseY) return;
        
        const x = gameState.mouseX;
        const y = gameState.mouseY;
        const t = Math.max(0, Math.min(1, gameState.lineTension || 0));
        
        // Calculer la couleur selon la tension
        let color;
        if (t < 0.5) {
            const k = t / 0.5;
            const r = Math.round(16 + (255-16) * k);
            const g = Math.round(185 + (206-185) * k);
            const b = 129;
            color = `rgb(${r},${g},${b})`;
        } else {
            const k = (t - 0.5) / 0.5;
            const r = 255;
            const g = Math.round(206 - 180 * k);
            const b = Math.round(129 - 120 * k);
            color = `rgb(${r},${g},${b})`;
        }
        
        // Dessiner le petit carré
        ctx.save();
        const size = 8;
        ctx.fillStyle = color;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Bordure blanche fine
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - size/2, y - size/2, size, size);
        
        ctx.restore();
    }

    // Fonction pour calculer l'échelle de profondeur basée sur la fenêtre du navigateur
    function calculateDepthScale() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Calculer l'échelle basée sur la hauteur de la fenêtre
        const heightScale = windowHeight / depthScale.referenceWindow.height;
        
        // Calculer l'échelle basée sur la largeur de la fenêtre (pour l'équilibre)
        const widthScale = windowWidth / depthScale.referenceWindow.width;
        
        // Utiliser la moyenne des deux échelles pour un équilibre
        const averageScale = (heightScale + widthScale) / 2;
        
        // Appliquer un facteur de correction pour éviter les échelles trop extrêmes
        const correctedScale = Math.max(0.3, Math.min(3.0, averageScale));
        
        depthScale.currentScale = correctedScale;
        
        
        return correctedScale;
    }

    // Fonction pour obtenir les zones de profondeur adaptées à la fenêtre
    function getScaledDepthZones() {
        const scale = depthScale.currentScale;
        
        return {
            surface: Math.round(depthScale.zones.surface * scale),
            shallow: Math.round(depthScale.zones.shallow * scale),
            mid: Math.round(depthScale.zones.mid * scale),
            deep: Math.round(depthScale.zones.deep * scale),
            abyssal: Math.round(depthScale.zones.abyssal * scale),
            total: Math.round(depthScale.referenceDepth * scale)
        };
    }

    // Fonction pour déterminer quelles zones de profondeur sont disponibles
    function getAvailableDepthZones(waterDepth) {
        const scaledZones = getScaledDepthZones();
        const availableZones = [];
        let currentDepth = 0;
        
        // Zone surface (0-20px)
        if (currentDepth < waterDepth) {
            const surfaceEnd = Math.min(currentDepth + scaledZones.surface, waterDepth);
            if (surfaceEnd > currentDepth) {
                availableZones.push({
                    name: 'surface',
                    start: currentDepth,
                    end: surfaceEnd,
                    depth: surfaceEnd - currentDepth
                });
                currentDepth = surfaceEnd;
            }
        }
        
        // Zone shallow (20-120px)
        if (currentDepth < waterDepth) {
            const shallowEnd = Math.min(currentDepth + scaledZones.shallow, waterDepth);
            if (shallowEnd > currentDepth) {
                availableZones.push({
                    name: 'shallow',
                    start: currentDepth,
                    end: shallowEnd,
                    depth: shallowEnd - currentDepth
                });
                currentDepth = shallowEnd;
            }
        }
        
        // Zone mid (120-540px)
        if (currentDepth < waterDepth) {
            const midEnd = Math.min(currentDepth + scaledZones.mid, waterDepth);
            if (midEnd > currentDepth) {
                availableZones.push({
                    name: 'mid',
                    start: currentDepth,
                    end: midEnd,
                    depth: midEnd - currentDepth
                });
                currentDepth = midEnd;
            }
        }
        
        // Zone deep (540-1140px)
        if (currentDepth < waterDepth) {
            const deepEnd = Math.min(currentDepth + scaledZones.deep, waterDepth);
            if (deepEnd > currentDepth) {
                availableZones.push({
                    name: 'deep',
                    start: currentDepth,
                    end: deepEnd,
                    depth: deepEnd - currentDepth
                });
                currentDepth = deepEnd;
            }
        }
        
        // Zone abyssal (1140-1740px)
        if (currentDepth < waterDepth) {
            const abyssalEnd = Math.min(currentDepth + scaledZones.abyssal, waterDepth);
            if (abyssalEnd > currentDepth) {
                availableZones.push({
                    name: 'abyssal',
                    start: currentDepth,
                    end: abyssalEnd,
                    depth: abyssalEnd - currentDepth
                });
                currentDepth = abyssalEnd;
            }
        }
        
        return availableZones;
    }

    // Fonction pour vérifier si un poisson peut spawner dans la profondeur disponible
    function canFishSpawnInDepth(fishType, waterDepth) {
        const availableZones = getAvailableDepthZones(waterDepth);
        const minDepthRatio = fishType.depthRange[0];
        const maxDepthRatio = fishType.depthRange[1];
        
        // Convertir les ratios en pixels basés sur la profondeur totale de référence
        const totalReferenceDepth = depthScale.zones.surface + depthScale.zones.shallow + depthScale.zones.mid + depthScale.zones.deep + depthScale.zones.abyssal;
        const minDepthPixels = minDepthRatio * totalReferenceDepth;
        const maxDepthPixels = maxDepthRatio * totalReferenceDepth;
        
        // Vérifier si la zone de profondeur du poisson existe dans les zones disponibles
        for (const zone of availableZones) {
            const zoneStart = zone.start;
            const zoneEnd = zone.end;
            
            // Si la zone du poisson chevauche avec une zone disponible
            if (minDepthPixels < zoneEnd && maxDepthPixels > zoneStart) {
                return true;
            }
        }
        
        return false;
    }

    // Fonction pour calculer les zones de profondeur adaptées à la profondeur d'eau disponible
    function calculateDepthZones(waterDepth) {
        const scaledZones = getScaledDepthZones();
        
        // Toujours adapter les zones à la profondeur d'eau disponible
        const zones = [];
        let remainingDepth = waterDepth;
        
        // Zone surface (priorité 1)
        if (remainingDepth > 0) {
            const surfaceHeight = Math.min(remainingDepth, scaledZones.surface);
            zones.push({ name: 'surface', height: surfaceHeight });
            remainingDepth -= surfaceHeight;
        }
        
        // Zone peu profonde (priorité 2)
        if (remainingDepth > 0) {
            const shallowHeight = Math.min(remainingDepth, scaledZones.shallow);
            zones.push({ name: 'shallow', height: shallowHeight });
            remainingDepth -= shallowHeight;
        }
        
        // Zone milieu (priorité 3)
        if (remainingDepth > 0) {
            const midHeight = Math.min(remainingDepth, scaledZones.mid);
            zones.push({ name: 'mid', height: midHeight });
            remainingDepth -= midHeight;
        }
        
        // Zone profonde (priorité 4)
        if (remainingDepth > 0) {
            const deepHeight = Math.min(remainingDepth, scaledZones.deep);
            zones.push({ name: 'deep', height: deepHeight });
            remainingDepth -= deepHeight;
        }
        
        // Zone abyssale (priorité 5)
        if (remainingDepth > 0) {
            const abyssalHeight = Math.min(remainingDepth, scaledZones.abyssal);
            zones.push({ name: 'abyssal', height: abyssalHeight });
            remainingDepth -= abyssalHeight;
        }
        
        // Retourner les zones calculées
        const result = {
            surface: zones.find(z => z.name === 'surface')?.height || 0,
            shallow: zones.find(z => z.name === 'shallow')?.height || 0,
            mid: zones.find(z => z.name === 'mid')?.height || 0,
            deep: zones.find(z => z.name === 'deep')?.height || 0,
            abyssal: zones.find(z => z.name === 'abyssal')?.height || 0,
            total: waterDepth
        };
        
        return result;
    }

    // Fonction pour dessiner l'indicateur de profondeur
    function drawDepthIndicator(ctx, canvas) {
        const waterLevel = GAME_CONFIG.water.level;
        const seabedY = canvas.height - (GAME_CONFIG.seabed?.height || 40);
        const waterDepth = seabedY - waterLevel; // Profondeur réelle de l'eau
        
        // Position de l'indicateur (côté droit)
        const indicatorX = canvas.width - 25;
        const indicatorWidth = 20;
        const indicatorTop = waterLevel;
        const indicatorHeight = waterDepth;
        
        ctx.save();
        
        // Fond de l'indicateur
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(indicatorX, indicatorTop, indicatorWidth, indicatorHeight);
        
        // Bordure
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(indicatorX, indicatorTop, indicatorWidth, indicatorHeight);
        
        // Zones de profondeur calculées avec clamp
        const depthZones = calculateDepthZones(waterDepth);
        
        // Créer les zones à afficher basées sur les zones calculées
        const zonesToDisplay = [];
        
        if (depthZones.surface > 0) {
            zonesToDisplay.push({
                name: 'Surface',
                height: depthZones.surface,
                color: 'rgba(135, 206, 235, 0.3)',
                label: `${depthZones.surface}px`
            });
        }
        
        if (depthZones.shallow > 0) {
            zonesToDisplay.push({
                name: 'Peu profonde',
                height: depthZones.shallow,
                color: 'rgba(100, 180, 220, 0.4)',
                label: `${depthZones.shallow}px`
            });
        }
        
        if (depthZones.mid > 0) {
            zonesToDisplay.push({
                name: 'Milieu',
                height: depthZones.mid,
                color: 'rgba(30, 58, 138, 0.5)',
                label: `${depthZones.mid}px`
            });
        }
        
        if (depthZones.deep > 0) {
            zonesToDisplay.push({
                name: 'Profonde',
                height: depthZones.deep,
                color: 'rgba(15, 42, 107, 0.6)',
                label: `${depthZones.deep}px`
            });
        }
        
        if (depthZones.abyssal > 0) {
            zonesToDisplay.push({
                name: 'Abyssale',
                height: depthZones.abyssal,
                color: 'rgba(5, 15, 40, 0.8)',
                label: `${depthZones.abyssal}px`
            });
        }
        
        // Dessiner uniquement les zones qui correspondent à la profondeur d'eau
        let currentY = indicatorTop;
        zonesToDisplay.forEach((zone, index) => {
            ctx.fillStyle = zone.color;
            ctx.fillRect(indicatorX, currentY, indicatorWidth, zone.height);
            currentY += zone.height;
        });
        
        // Position actuelle de l'hameçon
        if (gameState.hookPosition) {
            const hookY = gameState.hookPosition.y;
            if (hookY >= waterLevel && hookY <= seabedY) {
                const indicatorY = hookY;
                
                // Marqueur de position
                ctx.fillStyle = '#ff6b35';
                ctx.fillRect(indicatorX - 2, indicatorY - 2, indicatorWidth + 4, 4);
                
                // Point lumineux
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(indicatorX + indicatorWidth/2, indicatorY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Labels des zones affichées
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '7px Arial';
        ctx.textAlign = 'center';
        
        // Afficher les labels seulement pour les zones qui sont réellement affichées
        let labelY = indicatorTop;
        zonesToDisplay.forEach((zone, index) => {
            ctx.fillText(zone.label, indicatorX + indicatorWidth/2, labelY + zone.height/2 + 2);
            labelY += zone.height;
        });
        
        // Ligne de séparation pour 50% de l'échelle effective
        const halfEffectiveDepth = waterDepth * 0.5;
        const halfDepthY = waterLevel + halfEffectiveDepth;
        if (halfDepthY >= waterLevel && halfDepthY <= seabedY) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(indicatorX, halfDepthY);
            ctx.lineTo(indicatorX + indicatorWidth, halfDepthY);
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Label avec pixels seulement (échelle effective)
            ctx.fillText(`${Math.round(halfEffectiveDepth)}px`, indicatorX + indicatorWidth/2, halfDepthY - 2);
        }
        
        // Affichage de la profondeur totale en bas (zones affichées)
        const totalDisplayedDepth = zonesToDisplay.reduce((sum, zone) => sum + zone.height, 0);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '7px Arial';
        ctx.fillText(`Total: ${totalDisplayedDepth}px`, indicatorX + indicatorWidth/2, seabedY - 2);
        
        ctx.restore();
    }

    // Fonction de boucle de jeu
    function gameLoop(timestamp) {
        if (!gameState.isPlaying) return;
        const now = performance.now();
        const deltaSec = (now - lastTime) / 1000;
        lastTime = now;
        
        // Récupérer le canvas de rendu
        const canvasEl = document.getElementById('fishing-canvas');
        
        // Mise à jour temps/jour/météo/saisons
        updateDayNightCycle(deltaSec);
        updateSeasons(deltaSec);
        if (canvasEl) updateWeather(deltaSec, canvasEl);
        
        // Mise à jour de l'affichage temps réel
        updateTimeAndSeasonDisplay();
        
        // Tracking temps global
        if (gameState.progress?.stats) {
            gameState.progress.stats.totalPlayTime = (gameState.progress.stats.totalPlayTime || 0) + deltaSec;
            
            // Tracking temps de jeu en jour (timeOfDay entre 0.3 et 0.7)
            if (gameState.timeOfDay >= 0.3 && gameState.timeOfDay <= 0.7) {
                gameState.progress.stats.dayPlayTime = (gameState.progress.stats.dayPlayTime || 0) + deltaSec;
            }
            
            // Tracking temps avec tension élevée (>80%)
            if (gameState.lineTension > 0.8) {
                gameState.progress.stats.highTensionTime = (gameState.progress.stats.highTensionTime || 0) + deltaSec;
            }
        }
        
        // Tracking: hameçon au fond pour achievement et autres stats
        if (canvasEl) {
            const seabedY = canvasEl.height - GAME_CONFIG.seabed.height;
            const waterLevel = GAME_CONFIG.water.level;
            const screenHeight = canvasEl.height;
            const depthFromSurface = gameState.hookPosition.y - waterLevel;
            const depthRatio = Math.max(0, Math.min(1, depthFromSurface / screenHeight));
            const atBottom = depthRatio > 0.98; // très proche du fond
            const nearSurface = depthRatio < 0.15; // proche surface
            const inDeep = depthRatio > 0.8;
            const inMid = depthRatio >= 0.3 && depthRatio <= 0.7;
            if (gameState.isCasting && atBottom) {
                gameState.bottomHoldSeconds += deltaSec;
                gameState.progress.stats.longestBottomHold = Math.max(gameState.progress.stats.longestBottomHold, gameState.bottomHoldSeconds);
                // cumul bas niveau (pour homard)
                gameState.progress.stats.bottomHoldCumulative = (gameState.progress.stats.bottomHoldCumulative || 0) + deltaSec;
                if (!gameState.progress.achievements.bottomHold40 && gameState.bottomHoldSeconds >= 40) {
                    gameState.progress.achievements.bottomHold40 = true;
                    if (!gameState.progress.unlockedSpecies.includes('🐙')) gameState.progress.unlockedSpecies.push('🐙');
                    saveProgress();
                }
            } else {
                gameState.bottomHoldSeconds = 0;
            }
            if (gameState.isCasting && nearSurface) {
                gameState.surfaceHoldSeconds += deltaSec;
                gameState.progress.stats.surfaceHoldCumulative = (gameState.progress.stats.surfaceHoldCumulative || 0) + deltaSec;
            }
            if (gameState.isCasting && inMid) {
                gameState.progress.stats.midHoldCumulative = (gameState.progress.stats.midHoldCumulative || 0) + deltaSec;
            }
            // Comptage des visites profondes (frontière franchie vers la zone >0.8)
            if (inDeep && !gameState._wasDeep) {
                gameState._wasDeep = true;
                gameState.progress.stats.deepVisits = (gameState.progress.stats.deepVisits || 0) + 1;
            } else if (!inDeep && gameState._wasDeep) {
                gameState._wasDeep = false;
            }
            saveProgress();
            checkUnlocks();
        }
        
        updateTime();
        // Mettre à jour l'angle de la canne avant la preview pour que l'arc suive
        updateRodAngle(deltaSec);
        updateCastPreview();
        // Enregistrer les mouvements du curseur pour la détection de pattern
        if (!gameState.cursorMovementHistory) gameState.cursorMovementHistory = [];
        const lastCursor = gameState._lastCursor || { x: gameState.mouseX || 0, y: gameState.mouseY || 0 };
        const curX = (gameState.mouseX || 0);
        const curY = (gameState.mouseY || 0);
        const dxC = curX - lastCursor.x;
        const dyC = curY - lastCursor.y;
        const speedC = Math.hypot(dxC, dyC) / Math.max(0.016, deltaSec);
        gameState.cursorMovementHistory.push({ x: curX, y: curY, dx: dxC, dy: dyC, speed: speedC, ts: performance.now() });
        if (gameState.cursorMovementHistory.length > 120) gameState.cursorMovementHistory.shift();
        gameState._lastCursor = { x: curX, y: curY };
        if (canvasEl) {
            spawnFishTimed(deltaSec, canvasEl);
            updateHookPhysics(deltaSec, canvasEl);
            updateFish(canvasEl);
            updateFloatingHats(deltaSec, canvasEl);
            updateEffects(deltaSec);
            // Respawn passif des chapeaux débloqués mais non attrapés
            gameState._hatSpawnAccumulator += deltaSec;
            if (gameState._hatSpawnAccumulator >= 10) { // toutes les ~10s
                gameState._hatSpawnAccumulator = 0;
                try {
                    const hatsCatalog = gameState.hatItems || [];
                    const unlocked = (gameState.progress?.hats?.unlocked) || [];
                    const owned = (gameState.progress?.hats?.owned) || [];
                    const candidates = hatsCatalog.filter(h => unlocked.includes(h.emoji) && !owned.includes(h.emoji));
                    if (candidates.length) {
                        const candidate = candidates[Math.floor(Math.random() * candidates.length)];
                        const already = gameState.floatingHats.some(fh => fh.emoji === candidate.emoji);
                        if (!already) spawnFloatingHat(candidate.emoji);
                    }
                } catch (e) {}
            }
        }
        checkHookCollisions();
        checkHatCollision();
        reelUpdate(deltaSec);
        // Dessin principal
        const canvasNode = document.getElementById('fishing-canvas');
        if (canvasNode) {
            const ctx = canvasNode.getContext('2d');
            drawGame(ctx, canvasNode);
        }
        
        animationId = requestAnimationFrame(gameLoop);
    }

    // Fonction pour commencer le jeu
    function startGame() {
        gameState.isPlaying = true;
        gameState.score = 0;
        gameState.level = 1;
        gameState.timeLeft = 60;
        gameState.gameStartTime = 0; // Ne pas démarrer le timer tout de suite
        // Recalculer la liste des poissons à chaque nouvelle partie
        gameState.fish = [];
        gameState.attachedFish = [];
        gameState.lineTension = 0;
        gameState.spawnAccumulator = 0;
        gameState.caughtFish = []; // Vider la liste des poissons capturés
        gameState.biggestCatch = null; // Réinitialiser le plus gros poisson
        gameState.bottomHoldSeconds = 0;
        gameState.progress = loadProgress();
        gameState.isCasting = false; // Réinitialiser l'état de lancer
        gameState.isReeling = false;
        gameState.reelHold = false;
        gameState.reelIntensity = 0;
        gameState.lineSnapped = false;
        gameState.breakAccum = 0;
        gameState.pendingBiteFish = null;
        
        // Réinitialiser position de l'hameçon
        const canvasEl = document.getElementById('fishing-canvas');
        if (canvasEl) {
            const rodX = canvasEl.width - 100;
            const rodY = 88;
            const originX = rodX - Math.cos(gameState.rodAngle) * GAME_CONFIG.rod.length;
            const originY = rodY + Math.sin(gameState.rodAngle) * GAME_CONFIG.rod.length;
            gameState.hookPosition.x = originX;
            gameState.hookPosition.y = originY;
            gameState.hookVelocity.x = 0;
            gameState.hookVelocity.y = 0;
        }
        
        // Masquer les instructions
        const instructions = document.getElementById('fishing-instructions');
        if (instructions) instructions.style.display = 'none';
        
        // Afficher l'UI du jeu immédiatement
        const caughtDisplay = document.getElementById('fishing-caught-display');
        const timerDisplay = document.getElementById('fishing-timer-display');
        const scoreCorner = document.getElementById('fishing-score-corner');
        if (caughtDisplay) caughtDisplay.style.display = 'flex';
        if (timerDisplay) timerDisplay.style.display = 'block';
        if (scoreCorner) scoreCorner.style.display = 'flex';
        
        // Mettre à jour l'affichage
        updateCaughtFishDisplay();
        updateScoreDisplay();
        
        // Démarrer la boucle de jeu
        lastTime = performance.now();
        gameLoop(lastTime);
    }

    // Fonction pour terminer le jeu
    function endGame() {
        // Laisser l'animation et l'écran du jeu continuer de bouger
        // Désactiver simplement le chrono pour éviter de relancer endGame
        gameState.timerEnabled = false;
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            localStorage.setItem('fishingHighScore', String(gameState.highScore));
        }
        // Déblocage sirène si highscore >=200
        if (!gameState.progress.achievements.highscore200 && gameState.highScore >= 200) {
            gameState.progress.achievements.highscore200 = true;
            if (!gameState.progress.unlockedSpecies.includes('🧜‍♀️')) gameState.progress.unlockedSpecies.push('🧜‍♀️');
        }
        checkUnlocks();
        saveProgress();
        // reset puissance/preview
        gameState.castPower = 0;
        updatePowerBar();
        gameState.isPreviewingCast = false;
        gameState.previewPoints = [];
        // Libérer tous les poissons attachés
        gameState.attachedFish = [];
        gameState.pendingBiteFish = null;
        showGameOver();
    }

    // Fonction pour fermer le jeu
    function closeGame() {
        const container = document.querySelector('.fishing-game-container');
        if (container) { 
            // Sauvegarder l'état de la fenêtre avant de fermer
            saveWindowState();
            
            // Nettoyer l'intervalle de vérification de position
            if (container._positionCheckInterval) {
                clearInterval(container._positionCheckInterval);
            }
            container.remove(); 
        }
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        // reset puissance/preview
        gameState.castPower = 0;
        updatePowerBar();
        gameState.isPreviewingCast = false;
        gameState.previewPoints = [];
        // Réinitialiser l'état de jeu pour un prochain lancement
        gameState.isPlaying = false;
        gameState.isCasting = false;
        gameState.isReeling = false;
        gameState.reelHold = false;
        gameState.reelIntensity = 0;
        gameState.fish = [];
        gameState.attachedFish = [];
        gameState.pendingBiteFish = null;
        gameState.lineSnapped = false;
        gameState.breakAccum = 0;
        lastTime = 0;
    }

    // Fonction pour ajouter le bouton de lancement du jeu
    function addFishingButton() {
        // Chercher un endroit approprié pour ajouter le bouton
        const header = document.querySelector('.header-right');
        const existingFloating = document.getElementById('fishing-launch-btn');
        
        if (header && !header.querySelector('#fishing-launch-btn-header')) {
            const fishingBtn = document.createElement('button');
            fishingBtn.id = 'fishing-launch-btn-header';
            fishingBtn.innerHTML = '🎣';
            fishingBtn.title = 'Mini-Jeu de Pêche';
            fishingBtn.style.cssText = `
                background: linear-gradient(45deg, #10b981, #059669);
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
                box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
                transition: all 0.3s ease;
            `;
            
            fishingBtn.addEventListener('mouseenter', () => {
                fishingBtn.style.transform = 'scale(1.1)';
                fishingBtn.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.5)';
            });
            
            fishingBtn.addEventListener('mouseleave', () => {
                fishingBtn.style.transform = 'scale(1)';
                fishingBtn.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
            });
            
            fishingBtn.addEventListener('click', () => {
                // Vérifier si le jeu n'est pas déjà ouvert
                if (!document.querySelector('.fishing-game-container')) {
                    // Reset time base pour éviter freeze
                    lastTime = performance.now();
                    // Initialiser heure et météo aléatoires
                    gameState.timeOfDay = Math.random(); // 0-1 (cycle complet)
                    const weathers = ['clear', 'clear', 'cloudy', 'cloudy', 'rainy', 'stormy'];
                    gameState.weather = weathers[Math.floor(Math.random() * weathers.length)];
                    gameState.weatherChangeTimer = Math.random() * 20; // Démarrer avec un offset aléatoire
                    
                    injectStyles();
                    createGameInterface();
                    initCanvas();
                    setupEventListeners();
                    // Démarrer immédiatement l'animation du fond et le spawn des poissons
                    initBackgroundAnimation();
                    // Démarrer automatiquement la partie
                    startGame();
                }
            });
            
            header.appendChild(fishingBtn);
        } else if (!existingFloating) {
            // Fallback : bouton flottant en bas à droite si aucun header compatible
            const floatBtn = document.createElement('button');
            floatBtn.id = 'fishing-launch-btn';
            floatBtn.innerHTML = '🎣';
            floatBtn.title = 'Mini-Jeu de Pêche';
            floatBtn.style.cssText = `
                position: fixed;
                right: 20px;
                bottom: 20px;
                z-index: 2147483647;
                background: linear-gradient(45deg, #10b981, #059669);
                color: white;
                border: none;
                border-radius: 50%;
                width: 52px;
                height: 52px;
                font-size: 22px;
                cursor: pointer;
                box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            `;
            
            floatBtn.addEventListener('mouseenter', () => {
                floatBtn.style.transform = 'scale(1.07)';
                floatBtn.style.boxShadow = '0 10px 24px rgba(16, 185, 129, 0.55)';
            });
            floatBtn.addEventListener('mouseleave', () => {
                floatBtn.style.transform = 'scale(1)';
                floatBtn.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.45)';
            });
            floatBtn.addEventListener('click', () => {
                if (!document.querySelector('.fishing-game-container')) {
                    // Initialiser heure et météo aléatoires
                    gameState.timeOfDay = Math.random(); // 0-1 (cycle complet)
                    const weathers = ['clear', 'clear', 'cloudy', 'cloudy', 'rainy', 'stormy'];
                    gameState.weather = weathers[Math.floor(Math.random() * weathers.length)];
                    gameState.weatherChangeTimer = Math.random() * 20; // Démarrer avec un offset aléatoire
                    
                    injectStyles();
                    createGameInterface();
                    initCanvas();
                    setupEventListeners();
                    // Démarrer immédiatement l'animation du fond et le spawn des poissons
                    initBackgroundAnimation();
                    // Démarrer automatiquement la partie
                    startGame();
                }
            });
            document.body.appendChild(floatBtn);
        }
    }

    // Fonction pour initialiser l'animation du fond et le spawn des poissons
    function initBackgroundAnimation() {
        // Masquer les instructions immédiatement
        const instructions = document.getElementById('fishing-instructions');
        if (instructions) instructions.style.display = 'none';
        
        // Démarrer une boucle d'animation pour le fond et les poissons
        const canvas = document.getElementById('fishing-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        function backgroundLoop(currentTime) {
            // Mettre à jour le cycle jour/nuit, saisons et la météo
            const deltaSec = 1/60;
            updateDayNightCycle(deltaSec);
            updateSeasons(deltaSec);
            updateWeather(deltaSec, canvas);
            
            // Mise à jour de l'affichage temps réel
            updateTimeAndSeasonDisplay();
            
            // Dessiner uniquement le fond, les poissons, les bulles, la canne
            // Désactivation du 2e appel de drawBackground quand le jeu tourne
            if (!gameState.isPlaying) {
                drawBackground(ctx, canvas);
            }
            drawBubbles(ctx, canvas);
            
            // Spawn des poissons en continu
            spawnFishTimed(deltaSec, canvas);
            updateFish(canvas);
            drawFish(ctx, canvas);
            
            // Dessiner la canne et l'île
            drawFishingRod(ctx, canvas);
            
            // Continuer la boucle tant que le jeu n'est pas démarré
            if (!gameState.isPlaying) {
                requestAnimationFrame(backgroundLoop);
            }
        }
        
        requestAnimationFrame(backgroundLoop);
    }
    
    // Fonction pour configurer les événements
    function setupEventListeners() {
        // Bouton de fermeture
        const closeBtn = document.getElementById('fishing-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeGame);
        }
        
        // Touche Échap pour fermer
        const handleEscape = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                closeGame();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        // Redimensionnement de la fenêtre du navigateur - recalculer l'échelle de profondeur
        let windowResizeTimeout;
        const handleWindowResize = () => {
            clearTimeout(windowResizeTimeout);
            windowResizeTimeout = setTimeout(() => {
                calculateDepthScale();
                // Recalculer aussi le nombre maximum de poissons
                const newMaxCount = calculateMaxFishCount();
                
                // Mettre à jour la taille maximale de la fenêtre
                const container = document.querySelector('.fishing-game-container');
                if (container) {
                    const maxSize = calculateMaxWindowSize();
                    container.style.maxWidth = maxSize.width + 'px';
                    container.style.maxHeight = maxSize.height + 'px';
                }
            }, 100);
        };
        window.addEventListener('resize', handleWindowResize);
        
        // Gestionnaire pour les changements de position et taille de la fenêtre de jeu
        const gameContainer = document.querySelector('.fishing-game-container');
        if (gameContainer) {
            // Observer les changements de position et taille du conteneur de jeu
            const gameResizeObserver = new ResizeObserver(() => {
                removeLineOnResize();
                saveWindowState(); // Sauvegarder la nouvelle taille
                // Recalculer le nombre maximum de poissons
                const newMaxCount = calculateMaxFishCount();
            });
            gameResizeObserver.observe(gameContainer);
            
            // Détecter les changements de position via MutationObserver
            const positionObserver = new MutationObserver(() => {
                removeLineOnResize();
                saveWindowState(); // Sauvegarder la nouvelle position
            });
            positionObserver.observe(gameContainer, {
                attributes: true,
                attributeFilter: ['style']
            });
            
            // Détecter les changements de position via les événements de la fenêtre
            let lastPosition = { x: 0, y: 0 };
            const checkPosition = () => {
                const rect = gameContainer.getBoundingClientRect();
                const currentPosition = { x: rect.left, y: rect.top };
                
                if (lastPosition.x !== currentPosition.x || lastPosition.y !== currentPosition.y) {
                    removeLineOnResize();
                    lastPosition = currentPosition;
                    saveWindowState(); // Sauvegarder la nouvelle position
                }
            };
            
            // Vérifier la position périodiquement
            const positionCheckInterval = setInterval(checkPosition, 100);
            
            // Nettoyer l'intervalle quand le jeu se ferme
            // Stocker l'intervalle pour le nettoyer plus tard
            gameContainer._positionCheckInterval = positionCheckInterval;
        }
        
        // Bouton de démarrage
        const startBtn = document.getElementById('fishing-start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', startGame);
        }
        
        // Événements sur le canvas
        const canvas = document.getElementById('fishing-canvas');
        if (canvas) {
            let powerInterval = null;
            
            // Activer le curseur dès que la souris entre dans le canvas
            canvas.addEventListener('mouseenter', (e) => {
                const rect = canvas.getBoundingClientRect();
                gameState.mouseX = e.clientX - rect.left;
                gameState.mouseY = e.clientY - rect.top;
            });
            
            // Stocker la position de la souris pour l'indicateur
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                gameState.mouseX = e.clientX - rect.left;
                gameState.mouseY = e.clientY - rect.top;
            });
            
            canvas.addEventListener('mousedown', (e) => {
                const rect = canvas.getBoundingClientRect();
                gameState.mouseX = e.clientX - rect.left;
                gameState.mouseY = e.clientY - rect.top;
                gameState.isMouseDown = true;
                
                // Vérifier si on clique sur l'indicateur de chapeaux
                if (gameState.hatIndicatorPos) {
                    const clickX = gameState.mouseX;
                    const clickY = gameState.mouseY;
                    const indicator = gameState.hatIndicatorPos;
                    
                    if (clickX >= indicator.x && clickX <= indicator.x + indicator.width &&
                        clickY >= indicator.y && clickY <= indicator.y + indicator.height) {
                        // Ouvrir le menu de sélection de chapeaux
                        showHatSelectionMenu();
                        return;
                    }
                }
                
                // Le jeu démarre automatiquement maintenant, pas besoin d'attendre le premier clic
                if (!gameState.isCasting) {
                    // Mode lancer: charger la puissance + preview
                    // S'assurer qu'aucun état de rembobinage ne persiste
                    gameState.isReeling = false;
                    gameState.reelHold = false;
                    gameState.reelIntensity = 0;
                    gameState.isPreviewingCast = true;
                    powerInterval = setInterval(() => { chargePower(); updateCastPreview(); }, 50);
                } else {
                    // Mode rembobiner
                    // Si une morsure est en attente et encore valide, on valide la prise
                    const now = Date.now();
                    if (gameState.pendingBiteFish && now < gameState.pendingBiteFish.expiresAt) {
                        const pb = gameState.pendingBiteFish;
                        const fish = pb.fish;
                        // Vérifier que l'hameçon est proche du poisson qui clignote
                        const dx = fish.x - gameState.hookPosition.x;
                        const dy = fish.y - gameState.hookPosition.y;
                        const distance = Math.hypot(dx, dy);
                        const catchRadius = fish.size * 2.5; // Zone de ferrage proche du poisson
                        
                        if (distance <= catchRadius) {
                            // Attacher maintenant (l'hameçon est assez proche)
                            const baseOffX = dx * 0.15;
                            const baseOffY = dy * 0.15;
                            fish.caught = true;
                            fish.stamina = Math.max(1, 60 + fish.size * 4);
                            fish.rushUntil = performance.now() + 1500;
                            gameState.attachedFish.push({ fish, offsetX: baseOffX, offsetY: baseOffY, baseOffX, baseOffY, phase: Math.random() * Math.PI * 2 });
                            createCaptureEffect(fish.x, fish.y);
                            gameState.pendingBiteFish = null;
                            fish.flashState = 0;
                        } else {
                            // Trop loin : le poisson refuse et s'enfuit
                            fish.refusedUntil = now + (1500 + Math.random()*2000);
                            fish.flashState = 0;
                            gameState.pendingBiteFish = null;
                        }
                    }
                    gameState.isReeling = true;
                    gameState.reelHold = true;
                }
            });
            
            canvas.addEventListener('mouseup', () => {
                gameState.isMouseDown = false;
                if (!gameState.isCasting) {
                    if (powerInterval) { clearInterval(powerInterval); powerInterval = null; }
                    gameState.isPreviewingCast = false;
                    castLine();
                } else {
                    gameState.reelHold = false;
                }
            });
            
            canvas.addEventListener('mouseleave', () => {
                gameState.isMouseDown = false;
                if (powerInterval) { clearInterval(powerInterval); powerInterval = null; }
                gameState.isPreviewingCast = false;
                gameState.reelHold = false;
            });
        }
        
        // Double-clic sur le fond de la page pour remettre la fenêtre à sa taille et position par défaut
        document.addEventListener('dblclick', (e) => {
            // Vérifier que le clic n'est pas sur un élément de jeu
            if (e.target.closest('.fishing-game-container') || 
                e.target.closest('.fishing-btn') || 
                e.target.closest('.fishing-float-btn')) {
                return; // Ne pas traiter le double-clic sur les éléments de jeu
            }
            
            const container = document.querySelector('.fishing-game-container');
            if (container) {
                // Remettre à la taille et position par défaut
                container.style.width = '';
                container.style.height = '';
                container.style.left = '';
                container.style.top = '';
                container.style.transform = 'translate(-50%, -50%)';
                
                // Supprimer le cookie de sauvegarde de position
                document.cookie = 'fishingWindowState=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                
                // Afficher un message de confirmation
                showToast('Fenêtre remise à sa taille et position par défaut', 'success');
            }
        });
    }

    // Génère une prévisualisation de trajectoire
    function updateCastPreview(){
        const canvas = document.getElementById('fishing-canvas');
        if (!canvas) return;
        // Utiliser les mêmes valeurs que drawFishingRod pour la cohérence
        const rodX = canvas.width - 100;
        const rodY = 88;
        const originX = rodX - Math.cos(gameState.rodAngle) * GAME_CONFIG.rod.length;
        const originY = rodY + Math.sin(gameState.rodAngle) * GAME_CONFIG.rod.length;
        const powerNorm = Math.min(1, Math.max(0, gameState.castPower / gameState.maxCastPower));
        const speed = powerNorm * GAME_CONFIG.physics.castSpeedFactor * 100;
        const angle = gameState.rodAngle;
        let vx = Math.max(-500, Math.min(500, Math.cos(angle) * -speed));
        let vy = Math.sin(angle) * speed;
        let x = originX, y = originY;
        const points = [{x,y}];
        const dt = 0.016;
        let wasUnder = (y >= GAME_CONFIG.water.level);
        const waterLevel = GAME_CONFIG.water.level;
        let hitWater = false;
        
        // Continuer jusqu'au premier contact avec l'eau ou qu'on dépasse 200 itérations
        for (let i=0; i<200 && !hitWater; i++){
            const isUnderWater = y >= waterLevel;
            const drag = isUnderWater ? GAME_CONFIG.physics.waterDrag : GAME_CONFIG.physics.airDrag;
            
            // Vérifier si on vient de toucher l'eau pour la première fois
            if (!wasUnder && isUnderWater) {
                // Ajuster la position exacte au niveau de l'eau
                y = waterLevel;
                hitWater = true;
                // Ajouter le point de contact avec l'eau
                points.push({x, y});
                break;
            }
            
            wasUnder = isUnderWater;
            vy += GAME_CONFIG.physics.gravity * dt * (isUnderWater ? 0.35 : 1);
            vx *= (1 - drag * dt);
            vy *= (1 - drag * dt);
            // Amortissement vertical sous l'eau + clamp
            if (isUnderWater) {
                const damp = GAME_CONFIG.physics.waterVerticalDamp || 1;
                vy *= (1 - Math.min(0.95, Math.max(0, (1 - damp))) * Math.min(1, dt * 5));
                const vmaxY = GAME_CONFIG.physics.maxWaterVerticalSpeed || 200;
                if (vy > vmaxY) vy = vmaxY; if (vy < -vmaxY) vy = -vmaxY;
            }
            x += vx * dt;
            y += vy * dt;
            
            // contrainte de longueur
            const dx = x - originX, dy = y - originY; const dist = Math.hypot(dx, dy);
            const maxLen = GAME_CONFIG.physics.maxLineLength;
            if (dist > maxLen){ const r = maxLen / dist; x = originX + dx * r; y = originY + dy * r; vx *= 0.7; vy *= 0.7; }
            // collision fond marin (pas de rebond)
            const seabedY = canvas.height - (GAME_CONFIG.seabed?.height || 40);
            if (y > seabedY) { y = seabedY; if (vy > 0) vy = 0; vx *= 0.85; }
            // Ne pas interrompre si hors écran: permettre une trajectoire qui sort/revient
            points.push({x,y});
        }
        gameState.previewPoints = points;
    }

    function drawCastPreview(ctx){
        if (!gameState.isPreviewingCast || !gameState.previewPoints.length) return;
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.setLineDash([6,4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        const pts = gameState.previewPoints;
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }


    // Afficher l'écran de fin de partie dans une nouvelle fenêtre
    function showGameOver() {
        // Supprimer un ancien écran de fin s'il existe
        const existing = document.querySelector('.fishing-game-over-window');
        if (existing) existing.remove();
        
        const caughtCount = gameState.caughtFish ? gameState.caughtFish.length : 0;
        const isNewRecord = gameState.score > (parseInt(localStorage.getItem('fishingHighScore') || '0'));
        const caughtFishDisplay = gameState.caughtFish && gameState.caughtFish.length > 0 
            ? `<div class="fishing-caught-gallery">${gameState.caughtFish.join(' ')}</div>`
            : '<div style="color:#94a3b8;font-style:italic;">Aucun poisson capturé</div>';
        const biggest = gameState.biggestCatch ? `${gameState.biggestCatch.emoji} ${gameState.biggestCatch.name} — ${gameState.biggestCatch.size}px · ${gameState.biggestCatch.estimatedWeight} kg` : '—';
        
        // Créer une nouvelle fenêtre
        const gameOverWindow = document.createElement('div');
        gameOverWindow.className = 'fishing-game-over-window';
        gameOverWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            max-width: 90vw;
            max-height: 80vh;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border: 2px solid #475569;
            border-radius: 16px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.5);
            z-index: 20000;
            padding: 30px;
            color: white;
            font-family: 'Concert One', 'Segoe UI', system-ui, sans-serif;
            overflow-y: auto;
        `;
        
        gameOverWindow.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 24px;">🎣 ${isNewRecord ? '🏆 Nouveau Record ! 🏆' : 'Fin de Partie !'}</h2>
                <button id="fishing-game-over-close" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 5px;">×</button>
            </div>
            
            <div class="fishing-stats-container" style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div style="text-align: center; padding: 10px; background: rgba(59, 130, 246, 0.2); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: bold; color: #60a5fa;">Score</div>
                        <div style="font-size: 24px;">${gameState.score} pts</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(245, 158, 11, 0.2); border-radius: 8px;">
                        <div style="font-size: 18px; font-weight: bold; color: #fbbf24;">Meilleur</div>
                        <div style="font-size: 24px;">${gameState.highScore} pts</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="text-align: center; padding: 10px; background: rgba(34, 197, 94, 0.2); border-radius: 8px;">
                        <div style="font-size: 16px; font-weight: bold; color: #4ade80;">Poissons</div>
                        <div style="font-size: 20px;">${caughtCount}</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: rgba(168, 85, 247, 0.2); border-radius: 8px;">
                        <div style="font-size: 16px; font-weight: bold; color: #a78bfa;">Plus gros</div>
                        <div style="font-size: 14px;">${biggest}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; font-size: 18px;">🐟 Poissons capturés</h3>
            ${caughtFishDisplay}
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="fishing-restart-btn" style="
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Rejouer</button>
                <button id="fishing-close-game-btn" style="
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                ">Fermer</button>
            </div>
        `;
        
        document.body.appendChild(gameOverWindow);
        
        // Bouton de fermeture
        const closeBtn = document.getElementById('fishing-game-over-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                // Relancer une partie sans chrono et fermer la modale
                gameOverWindow.remove();
                gameState.timerEnabled = false;
                startGame();
            });
        }
        
        // Bouton rejouer
        const restartBtn = document.getElementById('fishing-restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                gameOverWindow.remove();
            startGame();
            });
        }
        
        // Bouton fermer le jeu
        const closeGameBtn = document.getElementById('fishing-close-game-btn');
        if (closeGameBtn) {
            closeGameBtn.addEventListener('click', () => {
                // Relancer une partie sans chrono et fermer la modale
                gameOverWindow.remove();
                gameState.timerEnabled = false;
                startGame();
            });
        }
        
        // Fermer en cliquant à l'extérieur
        gameOverWindow.addEventListener('click', (e) => {
            if (e.target === gameOverWindow) {
                gameOverWindow.remove();
            }
        });
    }

    // Fonction d'initialisation
    function init() {
        // Attendre que le DOM soit chargé
        const tryStart = () => {
            if (!document.querySelector('.fishing-game-container')) {
                // Forcer la tension à 0 à l'ouverture
                gameState.lineTension = 0.0;
                
                // Initialiser l'échelle de profondeur basée sur la fenêtre du navigateur
                calculateDepthScale();
                
                // Initialiser heure et météo aléatoires
                gameState.timeOfDay = Math.random(); // 0-1 (cycle complet)
                const weathers = ['clear', 'clear', 'cloudy', 'cloudy', 'rainy', 'stormy'];
                gameState.weather = weathers[Math.floor(Math.random() * weathers.length)];
                gameState.weatherChangeTimer = Math.random() * 20; // Démarrer avec un offset aléatoire
                
                injectStyles();
                createGameInterface();
                initCanvas();
                setupEventListeners();
                // Démarrer immédiatement l'animation du fond et le spawn des poissons
                initBackgroundAnimation();
                // Démarrer automatiquement la partie
                startGame();
            }
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryStart);
        } else {
            tryStart();
        }
    }

    // Démarrer le plugin
    init();

    // Helpers cookies JSON (stockage progression)
    function setCookie(name, value, days) {
        try {
            const expires = new Date(Date.now() + days*24*60*60*1000).toUTCString();
            const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(value))));
            document.cookie = `${name}=${encoded}; expires=${expires}; path=/`;
        } catch (_) {}
    }
    function getCookie(name) {
        try {
            const match = document.cookie.split('; ').find(c => c.startsWith(name + '='));
            if (!match) return null;
            const encoded = match.split('=')[1];
            return JSON.parse(decodeURIComponent(escape(atob(encoded))));
        } catch (_) { return null; }
    }

    // Fonction pour créer la fenêtre de gestion des cookies avancée
    function showCookieManager() {
        // Supprimer la fenêtre existante si elle existe
        const existingWindow = document.getElementById('cookie-manager-window');
        if (existingWindow) {
            existingWindow.remove();
        }

        // Créer la fenêtre modale
        const window = document.createElement('div');
        window.id = 'cookie-manager-window';
        window.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(15, 42, 107, 0.98), rgba(30, 58, 138, 0.98));
            color: white;
            padding: 20px;
            border-radius: 20px;
            text-align: center;
            max-width: 90vw;
            max-height: 90vh;
            width: 1200px;
            font-size: 14px;
            line-height: 1.6;
            z-index: 10010;
            box-shadow: 0 20px 60px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.1);
            border: 3px solid rgba(16, 185, 129, 0.3);
            backdrop-filter: blur(10px);
            animation: fadeInScale 0.4s ease-out;
            overflow-y: auto;
        `;

        // Charger les données du cookie
        const cookieData = getCookie('fishingProgress') || {};
        const windowState = getCookie('fishingWindowState') || {};

        // Créer le contenu HTML avec onglets
        window.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #10b981; font-size: 24px;">🔧 Éditeur de Cookies Avancé</h2>
                <button id="close-cookie-manager" style="background: linear-gradient(135deg, #6b7280, #4b5563); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    ❌ Fermer
                </button>
            </div>

            <!-- Onglets -->
            <div style="display: flex; gap: 5px; margin-bottom: 20px; border-bottom: 2px solid rgba(255,255,255,0.1);">
                <button id="tab-raw" class="cookie-tab active" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    📝 Édition Raw
                </button>
                <button id="tab-progress" class="cookie-tab" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    📊 Progression
                </button>
                <button id="tab-stats" class="cookie-tab" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    📈 Statistiques
                </button>
                <button id="tab-achievements" class="cookie-tab" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    🏆 Succès
                </button>
                <button id="tab-species" class="cookie-tab" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    🐟 Espèces
                </button>
                <button id="tab-window" class="cookie-tab" style="background: rgba(255,255,255,0.1); color: white; border: none; padding: 10px 20px; border-radius: 8px 8px 0 0; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    🪟 Fenêtre
                </button>
            </div>

            <!-- Contenu des onglets -->
            <div id="tab-content" style="text-align: left; min-height: 400px; max-height: 60vh; overflow-y: auto;">
                <!-- Onglet Raw -->
                <div id="content-raw" class="tab-content active">
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #60a5fa; margin-bottom: 10px;">📊 Progression du Jeu (fishingProgress)</h3>
                        <textarea id="progress-data" style="width: 100%; height: 300px; background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 8px; padding: 10px; font-family: 'Consolas', 'Monaco', monospace; font-size: 12px; resize: vertical;">${JSON.stringify(cookieData, null, 2)}</textarea>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #60a5fa; margin-bottom: 10px;">🪟 État de la Fenêtre (fishingWindowState)</h3>
                        <textarea id="window-data" style="width: 100%; height: 150px; background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 8px; padding: 10px; font-family: 'Consolas', 'Monaco', monospace; font-size: 12px; resize: vertical;">${JSON.stringify(windowState, null, 2)}</textarea>
                    </div>
                </div>

                <!-- Onglet Progression -->
                <div id="content-progress" class="tab-content" style="display: none;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3 style="color: #60a5fa; margin-bottom: 15px;">🎯 Espèces Débloquées</h3>
                            <div id="species-editor" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                                <!-- Sera rempli dynamiquement -->
                            </div>
                        </div>
                        <div>
                            <h3 style="color: #60a5fa; margin-bottom: 15px;">🎩 Chapeaux</h3>
                            <div id="hats-editor" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                                <!-- Sera rempli dynamiquement -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Onglet Statistiques -->
                <div id="content-stats" class="tab-content" style="display: none;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3 style="color: #60a5fa; margin-bottom: 15px;">📊 Statistiques Générales</h3>
                            <div id="general-stats" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                                <!-- Sera rempli dynamiquement -->
                            </div>
                        </div>
                        <div>
                            <h3 style="color: #60a5fa; margin-bottom: 15px;">🎣 Statistiques de Pêche</h3>
                            <div id="fishing-stats" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                                <!-- Sera rempli dynamiquement -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Onglet Succès -->
                <div id="content-achievements" class="tab-content" style="display: none;">
                    <div id="achievements-editor" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                        <!-- Sera rempli dynamiquement -->
                    </div>
                </div>

                <!-- Onglet Espèces -->
                <div id="content-species" class="tab-content" style="display: none;">
                    <div id="species-list" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                        <!-- Sera rempli dynamiquement -->
                    </div>
                </div>

                <!-- Onglet Fenêtre -->
                <div id="content-window" class="tab-content" style="display: none;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <h3 style="color: #60a5fa; margin-bottom: 15px;">📏 Dimensions</h3>
                            <div id="window-size-editor" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                                <!-- Sera rempli dynamiquement -->
                            </div>
                        </div>
                        <div>
                            <h3 style="color: #60a5fa; margin-bottom: 15px;">📍 Position</h3>
                            <div id="window-position-editor" style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border: 1px solid #374151;">
                                <!-- Sera rempli dynamiquement -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Barre d'actions -->
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin: 20px 0; padding-top: 20px; border-top: 2px solid rgba(255,255,255,0.1);">
                <button id="save-cookies" style="background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    💾 Sauvegarder
                </button>
                <button id="reset-progress" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    🔄 Reset Progression
                </button>
                <button id="reset-window" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    🪟 Reset Fenêtre
                </button>
                <button id="export-cookies" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    📤 Exporter
                </button>
                <button id="import-cookies" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    📥 Importer
                </button>
                <button id="validate-json" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    ✅ Valider JSON
                </button>
                <button id="format-json" style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    🎨 Formater JSON
                </button>
                <button id="toggle-quadrants" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: all 0.2s;">
                    🧭 Quadrants Patterns
                </button>
            </div>

            <div style="margin-bottom: 20px;">
                <input type="file" id="import-file" accept=".json" style="display: none;">
            </div>

            <div id="cookie-status" style="margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; font-size: 14px; display: none;"></div>
        `;

        // Ajouter la fenêtre au DOM
        document.body.appendChild(window);

        // Gestionnaires d'événements
        const progressTextarea = document.getElementById('progress-data');
        const windowTextarea = document.getElementById('window-data');
        const saveBtn = document.getElementById('save-cookies');
        const resetProgressBtn = document.getElementById('reset-progress');
        const resetWindowBtn = document.getElementById('reset-window');
        const exportBtn = document.getElementById('export-cookies');
        const importBtn = document.getElementById('import-cookies');
        const toggleQuadrantsBtn = document.getElementById('toggle-quadrants');
        const importFile = document.getElementById('import-file');
        const closeBtn = document.getElementById('close-cookie-manager');
        const statusDiv = document.getElementById('cookie-status');

        // Fonction pour afficher un message de statut
        function showStatus(message, isError = false) {
            statusDiv.textContent = message;
            statusDiv.style.display = 'block';
            statusDiv.style.background = isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
            statusDiv.style.color = isError ? '#fca5a5' : '#a7f3d0';
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }

        // Fonction pour changer d'onglet
        function switchTab(tabName) {
            // Désactiver tous les onglets
            document.querySelectorAll('.cookie-tab').forEach(tab => {
                tab.style.background = 'rgba(255,255,255,0.1)';
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });

            // Activer l'onglet sélectionné
            const activeTab = document.getElementById(`tab-${tabName}`);
            const activeContent = document.getElementById(`content-${tabName}`);
            if (activeTab) activeTab.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            if (activeContent) activeContent.style.display = 'block';

            // Remplir le contenu de l'onglet
            fillTabContent(tabName);
        }

        // Fonction pour remplir le contenu des onglets
        function fillTabContent(tabName) {
            const progressData = JSON.parse(progressTextarea.value);
            const windowData = JSON.parse(windowTextarea.value);

            switch(tabName) {
                case 'progress':
                    fillProgressTab(progressData);
                    break;
                case 'stats':
                    fillStatsTab(progressData);
                    break;
                case 'achievements':
                    fillAchievementsTab(progressData);
                    break;
                case 'species':
                    fillSpeciesTab(progressData);
                    break;
                case 'window':
                    fillWindowTab(windowData);
                    break;
            }
        }

        // Remplir l'onglet Progression
        function fillProgressTab(data) {
            const speciesEditor = document.getElementById('species-editor');
            const hatsEditor = document.getElementById('hats-editor');
            
            // Espèces débloquées
            const species = data.unlockedSpecies || [];
            speciesEditor.innerHTML = `
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">
                    ${species.map(emoji => `
                        <div style="display: flex; align-items: center; background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 5px;">
                            <span style="font-size: 20px; margin-right: 5px;">${emoji}</span>
                            <button onclick="removeSpecies('${emoji}')" style="background: #ef4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">×</button>
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 10px;">
                    <select id="add-species-select" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 5px; padding: 5px;">
                        <option value="">Ajouter une espèce...</option>
                        ${GAME_CONFIG.species.map(s => `<option value="${s.emoji}">${s.emoji} ${s.name}</option>`).join('')}
                    </select>
                    <button onclick="addSpecies()" style="background: #10b981; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">Ajouter</button>
                </div>
            `;

            // Chapeaux
            const hats = data.hats || { unlocked: [], owned: [], equipped: null };
            hatsEditor.innerHTML = `
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #a7f3d0; margin-bottom: 10px;">Chapeaux débloqués (${hats.unlocked.length})</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                        ${hats.unlocked.map(emoji => `<span style="font-size: 20px; background: rgba(255,255,255,0.1); padding: 5px; border-radius: 5px;">${emoji}</span>`).join('')}
                    </div>
                </div>
                <div style="margin-bottom: 15px;">
                    <h4 style="color: #a7f3d0; margin-bottom: 10px;">Chapeau équipé</h4>
                    <select id="equipped-hat" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 5px; padding: 5px; width: 100%;">
                        <option value="">Aucun</option>
                        ${hats.owned.map(emoji => `<option value="${emoji}" ${hats.equipped === emoji ? 'selected' : ''}>${emoji}</option>`).join('')}
                    </select>
                    <div style="font-size: 12px; color:#9ca3af; margin-top:6px;">Astuce: un chapeau débloqué doit d'abord être <strong>attrapé</strong> à la surface pour être équipable.</div>
                </div>
            `;
        }

        // Remplir l'onglet Statistiques
        function fillStatsTab(data) {
            const generalStats = document.getElementById('general-stats');
            const fishingStats = document.getElementById('fishing-stats');
            const stats = data.stats || {};

            generalStats.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div><strong>Score cumulé:</strong> <input type="number" value="${stats.cumulativeScore || 0}" onchange="updateStat('cumulativeScore', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Poids total (kg):</strong> <input type="number" value="${stats.cumulativeWeightKg || 0}" onchange="updateStat('cumulativeWeightKg', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Captures totales:</strong> <input type="number" value="${stats.totalCatches || 0}" onchange="updateStat('totalCatches', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Lancers totaux:</strong> <input type="number" value="${stats.totalCasts || 0}" onchange="updateStat('totalCasts', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Temps de jeu (s):</strong> <input type="number" value="${stats.totalPlayTime || 0}" onchange="updateStat('totalPlayTime', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Lignes cassées:</strong> <input type="number" value="${stats.lineBreaks || 0}" onchange="updateStat('lineBreaks', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                </div>
            `;

            fishingStats.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div><strong>Morsures totales:</strong> <input type="number" value="${stats.totalBites || 0}" onchange="updateStat('totalBites', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Détections immobiles:</strong> <input type="number" value="${stats.stillDetections || 0}" onchange="updateStat('stillDetections', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Visites profondes:</strong> <input type="number" value="${stats.deepVisits || 0}" onchange="updateStat('deepVisits', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Tenue surface (s):</strong> <input type="number" value="${stats.surfaceHoldCumulative || 0}" onchange="updateStat('surfaceHoldCumulative', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Tenue milieu (s):</strong> <input type="number" value="${stats.midHoldCumulative || 0}" onchange="updateStat('midHoldCumulative', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                    <div><strong>Tenue fond (s):</strong> <input type="number" value="${stats.bottomHoldCumulative || 0}" onchange="updateStat('bottomHoldCumulative', this.value)" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 3px; width: 80px;"></div>
                </div>
            `;
        }

        // Remplir l'onglet Succès
        function fillAchievementsTab(data) {
            const achievementsEditor = document.getElementById('achievements-editor');
            const achievements = data.achievements || {};

            achievementsEditor.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    ${Object.entries(achievements).map(([key, value]) => `
                        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px;">
                            <span style="font-weight: bold;">${key}</span>
                            <label style="display: flex; align-items: center; cursor: pointer;">
                                <input type="checkbox" ${value ? 'checked' : ''} onchange="updateAchievement('${key}', this.checked)" style="margin-right: 5px;">
                                ${value ? '✅' : '❌'}
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        // Remplir l'onglet Espèces
        function fillSpeciesTab(data) {
            const speciesList = document.getElementById('species-list');
            const species = data.unlockedSpecies || [];

            speciesList.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                    ${GAME_CONFIG.species.map(s => {
                        const isUnlocked = species.includes(s.emoji);
                        return `
                            <div style="background: ${isUnlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; padding: 10px; border-radius: 5px; border: 1px solid ${isUnlocked ? '#10b981' : '#ef4444'};">
                                <div style="display: flex; align-items: center; margin-bottom: 5px;">
                                    <span style="font-size: 24px; margin-right: 10px;">${s.emoji}</span>
                                    <span style="font-weight: bold;">${s.name}</span>
                                </div>
                                <div style="font-size: 12px; color: #a7f3d0; margin-bottom: 10px;">
                                    ${s.rarity} • ${s.points} pts
                                </div>
                                <button onclick="toggleSpecies('${s.emoji}')" style="background: ${isUnlocked ? '#ef4444' : '#10b981'}; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; width: 100%;">
                                    ${isUnlocked ? 'Débloquer' : 'Débloquer'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        // Remplir l'onglet Fenêtre
        function fillWindowTab(data) {
            const windowSizeEditor = document.getElementById('window-size-editor');
            const windowPositionEditor = document.getElementById('window-position-editor');

            windowSizeEditor.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Largeur (px)</label>
                        <input type="number" id="window-width" value="${data.width || ''}" onchange="updateWindowData()" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 5px; width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Hauteur (px)</label>
                        <input type="number" id="window-height" value="${data.height || ''}" onchange="updateWindowData()" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 5px; width: 100%;">
                    </div>
                </div>
            `;

            windowPositionEditor.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Position X (px)</label>
                        <input type="number" id="window-left" value="${data.left || ''}" onchange="updateWindowData()" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 5px; width: 100%;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Position Y (px)</label>
                        <input type="number" id="window-top" value="${data.top || ''}" onchange="updateWindowData()" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid #374151; border-radius: 3px; padding: 5px; width: 100%;">
                    </div>
                </div>
            `;
        }

        // Fonctions utilitaires pour les onglets (locales)
        function addSpecies() {
            const select = document.getElementById('add-species-select');
            const emoji = select.value;
            if (emoji) {
                const progressData = JSON.parse(progressTextarea.value);
                if (!progressData.unlockedSpecies) progressData.unlockedSpecies = [];
                if (!progressData.unlockedSpecies.includes(emoji)) {
                    progressData.unlockedSpecies.push(emoji);
                    progressTextarea.value = JSON.stringify(progressData, null, 2);
                    fillTabContent('progress');
                    showStatus('✅ Espèce ajoutée');
                }
            }
        }

        function removeSpecies(emoji) {
            const progressData = JSON.parse(progressTextarea.value);
            if (progressData.unlockedSpecies) {
                progressData.unlockedSpecies = progressData.unlockedSpecies.filter(s => s !== emoji);
                progressTextarea.value = JSON.stringify(progressData, null, 2);
                fillTabContent('progress');
                showStatus('❌ Espèce supprimée');
            }
        }

        function updateStat(statName, value) {
            const progressData = JSON.parse(progressTextarea.value);
            if (!progressData.stats) progressData.stats = {};
            progressData.stats[statName] = parseFloat(value) || 0;
            progressTextarea.value = JSON.stringify(progressData, null, 2);
        }

        function updateAchievement(achievementName, value) {
            const progressData = JSON.parse(progressTextarea.value);
            if (!progressData.achievements) progressData.achievements = {};
            progressData.achievements[achievementName] = value;
            progressTextarea.value = JSON.stringify(progressData, null, 2);
        }

        function toggleSpecies(emoji) {
            const progressData = JSON.parse(progressTextarea.value);
            if (!progressData.unlockedSpecies) progressData.unlockedSpecies = [];
            const index = progressData.unlockedSpecies.indexOf(emoji);
            if (index > -1) {
                progressData.unlockedSpecies.splice(index, 1);
            } else {
                progressData.unlockedSpecies.push(emoji);
            }
            progressTextarea.value = JSON.stringify(progressData, null, 2);
            fillTabContent('species');
        }

        function updateWindowData() {
            const windowData = {
                width: document.getElementById('window-width').value || undefined,
                height: document.getElementById('window-height').value || undefined,
                left: document.getElementById('window-left').value || undefined,
                top: document.getElementById('window-top').value || undefined
            };
            // Nettoyer les valeurs vides
            Object.keys(windowData).forEach(key => {
                if (windowData[key] === undefined || windowData[key] === '') {
                    delete windowData[key];
                }
            });
            windowTextarea.value = JSON.stringify(windowData, null, 2);
        }

        // Attacher les fonctions au contexte global pour les appels onclick
        window.addSpecies = addSpecies;
        window.removeSpecies = removeSpecies;
        window.updateStat = updateStat;
        window.updateAchievement = updateAchievement;
        window.toggleSpecies = toggleSpecies;
        window.updateWindowData = updateWindowData;

        // Gestionnaires d'événements pour les onglets
        document.querySelectorAll('.cookie-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.id.replace('tab-', '');
                switchTab(tabName);
            });
        });

        // Gestionnaires d'événements pour les nouveaux boutons
        const validateBtn = document.getElementById('validate-json');
        const formatBtn = document.getElementById('format-json');

        validateBtn.addEventListener('click', () => {
            try {
                JSON.parse(progressTextarea.value);
                JSON.parse(windowTextarea.value);
                showStatus('✅ JSON valide !');
            } catch (error) {
                showStatus('❌ Erreur JSON: ' + error.message, true);
            }
        });

        formatBtn.addEventListener('click', () => {
            try {
                const progressData = JSON.parse(progressTextarea.value);
                const windowData = JSON.parse(windowTextarea.value);
                progressTextarea.value = JSON.stringify(progressData, null, 2);
                windowTextarea.value = JSON.stringify(windowData, null, 2);
                showStatus('🎨 JSON formaté !');
            } catch (error) {
                showStatus('❌ Erreur JSON: ' + error.message, true);
            }
        });

        // Sauvegarder les cookies
        saveBtn.addEventListener('click', () => {
            try {
                const progressData = JSON.parse(progressTextarea.value);
                const windowData = JSON.parse(windowTextarea.value);
                
                setCookie('fishingProgress', progressData, 365);
                setCookie('fishingWindowState', windowData, 365);
                
                // Recharger la progression dans le jeu
                gameState.progress = progressData;
                
                // Mettre à jour l'interface avec les nouvelles données
                updateScoreDisplay();
                updateCaughtFishDisplay();
                updateTimeAndSeasonDisplay();
                
                // Appliquer les nouvelles données de fenêtre si elles existent
                if (windowData.width && windowData.height) {
                    const container = document.querySelector('.fishing-game-container');
                    if (container) {
                        container.style.width = windowData.width + 'px';
                        container.style.height = windowData.height + 'px';
                        if (windowData.left) container.style.left = windowData.left + 'px';
                        if (windowData.top) container.style.top = windowData.top + 'px';
                        container.style.transform = 'none';
                    }
                }
                
                showStatus('✅ Cookies sauvegardés et appliqués avec succès !');
            } catch (error) {
                showStatus('❌ Erreur JSON: ' + error.message, true);
            }
        });

        // Reset progression
        resetProgressBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser toute la progression ?')) {
                const defaultProgress = {
                    unlockedSpecies: ['🦐','🐟'],
                    achievements: { 
                        bottomHold40: false, 
                        highscore200: false,
                        firstCatch: false,
                        tenCatches: false,
                        fiftyCatches: false,
                        hundredCatches: false,
                        firstCast: false,
                        tenCasts: false,
                        hundredCasts: false,
                        firstDeep: false,
                        firstSurface: false,
                        firstNight: false,
                        firstDay: false,
                        firstPerfect: false,
                        firstBreak: false,
                        firstTransformation: false,
                        firstGiant: false,
                        firstBoot: false,
                        firstSiren: false,
                        firstWhale: false,
                        firstShrimp: false,
                        firstPuffer: false,
                        firstSquid: false,
                        firstTropical: false,
                        firstJellyfish: false,
                        firstDragon: false,
                        firstMerman: false,
                        firstOctopus: false
                    },
                    stats: {
                        longestBottomHold: 0,
                        surfaceHoldCumulative: 0,
                        deepVisits: 0,
                        totalCatches: 0,
                        totalCasts: 0,
                        cumulativeScore: 0,
                        cumulativeWeightKg: 0,
                        totalPlayTime: 0,
                        midHoldCumulative: 0,
                        lineBreaks: 0,
                        totalBites: 0,
                        currentNoBreakStreak: 0,
                        bestNoBreakStreak: 0,
                        bottomHoldCumulative: 0,
                        stillDetections: 0,
                        hoverDetections: 0,
                        movingDetections: 0,
                        totalWeight: 0,
                        // Statistiques pour les chapeaux
                        sirensCaught: 0,
                        octopusCaught: 0,
                        whalesCaught: 0,
                        shrimpCaught: 0,
                        pufferCaught: 0,
                        squidCaught: 0,
                        tropicalCaught: 0,
                        jellyfishCaught: 0,
                        dragonsCaught: 0,
                        mermenCaught: 0,
                        perfectScores: 0,
                        fastCatches: 0,
                        nightCatches: 0,
                        staminaAliveCatches: 0,
                        dayPlayTime: 0,
                        highTensionTime: 0,
                        gameDeaths: 0,
                        uniqueSpeciesCaught: 0,
                        maxGameCatches: 0,
                        transformedCatches: 0,
                        giantFishCaught: 0,
                        bootsCaught: 0,
                        dawnCatches: 0,
                        dayCatches: 0,
                        summerCatches: 0,
                        autumnCatches: 0,
                        winterCatches: 0,
                        springCatches: 0,
                        safeCatches: 0,
                        randomCatches: 0
                    },
                    hats: { unlocked: [], owned: [], equipped: null }
                };
                progressTextarea.value = JSON.stringify(defaultProgress, null, 2);
                
                // Appliquer immédiatement la réinitialisation
                setCookie('fishingProgress', defaultProgress, 365);
                gameState.progress = defaultProgress;
                updateScoreDisplay();
                updateCaughtFishDisplay();
                updateTimeAndSeasonDisplay();
                
                showStatus('🔄 Progression réinitialisée et appliquée');
            }
        });

        // Reset fenêtre
        resetWindowBtn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser l\'état de la fenêtre ?')) {
                const defaultWindow = {};
                windowTextarea.value = JSON.stringify(defaultWindow, null, 2);
                
                // Appliquer immédiatement la réinitialisation de la fenêtre
                setCookie('fishingWindowState', defaultWindow, 365);
                const container = document.querySelector('.fishing-game-container');
                if (container) {
                    container.style.width = '';
                    container.style.height = '';
                    container.style.left = '';
                    container.style.top = '';
                    container.style.transform = '';
                }
                
                showStatus('🪟 État de fenêtre réinitialisé et appliqué');
            }
        });

        // Exporter les cookies
        exportBtn.addEventListener('click', () => {
            try {
                const exportData = {
                    fishingProgress: JSON.parse(progressTextarea.value),
                    fishingWindowState: JSON.parse(windowTextarea.value),
                    exportDate: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fishing-game-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                
                showStatus('📤 Cookies exportés avec succès !');
            } catch (error) {
                showStatus('❌ Erreur lors de l\'export: ' + error.message, true);
            }
        });

        // Importer les cookies
        importBtn.addEventListener('click', () => {
            importFile.click();
        });

        // Activer l'affichage des quadrants de détection autour des poissons
        if (toggleQuadrantsBtn) {
            toggleQuadrantsBtn.addEventListener('click', () => {
                gameState.debugQuadrants = !gameState.debugQuadrants;
                showToast(gameState.debugQuadrants ? 'Quadrants affichés' : 'Quadrants masqués', 'info');
            });
        }

        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importData = JSON.parse(event.target.result);
                        
                        if (importData.fishingProgress) {
                            progressTextarea.value = JSON.stringify(importData.fishingProgress, null, 2);
                            // Appliquer immédiatement la progression importée
                            setCookie('fishingProgress', importData.fishingProgress, 365);
                            gameState.progress = importData.fishingProgress;
                            updateScoreDisplay();
                            updateCaughtFishDisplay();
                            updateTimeAndSeasonDisplay();
                        }
                        if (importData.fishingWindowState) {
                            windowTextarea.value = JSON.stringify(importData.fishingWindowState, null, 2);
                            // Appliquer immédiatement l'état de fenêtre importé
                            setCookie('fishingWindowState', importData.fishingWindowState, 365);
                            const container = document.querySelector('.fishing-game-container');
                            if (container && importData.fishingWindowState.width && importData.fishingWindowState.height) {
                                container.style.width = importData.fishingWindowState.width + 'px';
                                container.style.height = importData.fishingWindowState.height + 'px';
                                if (importData.fishingWindowState.left) container.style.left = importData.fishingWindowState.left + 'px';
                                if (importData.fishingWindowState.top) container.style.top = importData.fishingWindowState.top + 'px';
                                container.style.transform = 'none';
                            }
                        }
                        
                        showStatus('📥 Cookies importés et appliqués avec succès !');
                    } catch (error) {
                        showStatus('❌ Erreur lors de l\'import: ' + error.message, true);
                    }
                };
                reader.readAsText(file);
            }
        });

        // Fonction de nettoyage
        function cleanup() {
            // Supprimer les fonctions globales
            delete window.addSpecies;
            delete window.removeSpecies;
            delete window.updateStat;
            delete window.updateAchievement;
            delete window.toggleSpecies;
            delete window.updateWindowData;
        }

        // Fermer la fenêtre
        closeBtn.addEventListener('click', () => {
            cleanup();
            window.remove();
        });

        // Fermer en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target === window) {
                cleanup();
                window.remove();
            }
        });

        // Empêcher la propagation des clics dans le contenu
        window.querySelector('div').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    function loadProgress() {
        const def = {
            unlockedSpecies: ['🦐','🐟'], // espèces de départ
            achievements: { bottomHold40:false, highscore200:false },
            stats: {
                longestBottomHold: 0,
                surfaceHoldCumulative: 0, // cumul proche surface (s)
                deepVisits: 0,            // passages en zone profonde
                totalCatches: 0,          // captures totales
                totalCasts: 0,            // lancers totaux
                cumulativeScore: 0,       // score cumulé sur toutes les parties
                cumulativeWeightKg: 0,    // poids cumulé (kg) des poissons capturés
                totalPlayTime: 0,
                midHoldCumulative: 0,
                lineBreaks: 0,
                totalBites: 0,
                currentNoBreakStreak: 0,
                bestNoBreakStreak: 0,
                bottomHoldCumulative: 0,
                stillDetections: 0,
                hoverDetections: 0,
                movingDetections: 0,
                bootsCaught: 0,
                // Nouvelles stats pour les chapeaux
                sirensCaught: 0,
                perfectScores: 0,
                fastCatches: 0,
                octopusCaught: 0,
                whalesCaught: 0,
                shrimpCaught: 0,
                pufferCaught: 0,
                squidCaught: 0,
                tropicalCaught: 0,
                jellyfishCaught: 0,
                dragonsCaught: 0,
                nightCatches: 0,
                dayPlayTime: 0,
                mermenCaught: 0,
                highTensionTime: 0,
                safeCatches: 0,
                randomCatches: 0,
                maxGameCatches: 0,
                giantFishCaught: 0,
                gameDeaths: 0,
                summerCatches: 0,
                dawnCatches: 0,
                autumnCatches: 0,
                uniqueSpeciesCaught: 0,
                treasuresCaught: 0,
                talkCatches: 0,
                transformedCatches: 0
            },
            hats: {
                unlocked: [],  // emojis de chapeaux débloqués
                owned: [],     // emojis possédés (attrapés)
                equipped: null // emoji équipé
            },
            // Fonctionnalités débloquables et réglages persistés
            features: {
                hookWeightUnlocked: false,
                hookWeightFactor: 1
            }
        };
        const saved = getCookie('fishingProgress');
        const merged = saved ? { ...def, ...saved, achievements: { ...def.achievements, ...(saved.achievements||{}) }, stats: { ...def.stats, ...(saved.stats||{}) } } : def;
        return merged;
    }
    function saveProgress() {
        setCookie('fishingProgress', gameState.progress, 365);
    }
    
    // Fonction pour sauvegarder l'état de la fenêtre
    function saveWindowState() {
        const container = document.querySelector('.fishing-game-container');
        if (container) {
            const rect = container.getBoundingClientRect();
            const windowState = {
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top
            };
            setCookie('fishingWindowState', windowState, 30); // Sauvegarder 30 jours
        }
    }

    // Données du guide extraites de GAME_CONFIG et informations complémentaires
    function getSpeciesGuideData(emoji) {
        const fishType = GAME_CONFIG.fish.types.find(t => t.emoji === emoji);
        if (!fishType) return null;
        
        // Descriptions et stratégies par espèce
        const guideInfo = {
            '🦐': { 
                difficulty: '🟢 FACILE', 
                desc: 'Poisson facile pour débuter', 
                patternDesc: 'Rembobine rapidement pour créer un mouvement horizontal rapide (vitesse > 100 px/s). La crevette est attirée par les appâts qui bougent vite.',
                strategy: 'Facile à attraper. Bouge vite l\'appât de gauche à droite. Idéal pour débuter et gagner du temps rapidement.' 
            },
            '🐠': { 
                difficulty: '🟡 MOYEN', 
                desc: 'Poisson de profondeur moyenne', 
                patternDesc: 'Garde l\'hameçon IMMOBILE près du poisson pendant au moins 3 secondes (vitesse < 30 px/s). Le poisson tropical observe l\'appât avant de mordre.',
                strategy: 'Approche l\'hameçon du poisson et reste près de lui pendant 3 secondes sans bouger. Patience et proximité sont clés.' 
            },
            '🐡': { 
                difficulty: '🟡 MOYEN', 
                desc: 'Poisson calme nécessitant de la patience', 
                patternDesc: 'Pose l\'hameçon AU FOND (profondeur > 80%) et ne bouge PLUS (vitesse < 20 px/s). Le poisson ballon est très méfiant des appâts qui bougent.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. La patience est récompensée ! Attend qu\'il s\'approche et reste immobile.' 
            },
            '🐟': { 
                difficulty: '🟢 FACILE', 
                desc: 'Le plus facile à attraper', 
                patternDesc: 'AUCUNE préférence ! Le poisson commun mord sur n\'importe quel mouvement. Bonus automatique de ×1.2 sur les chances de morsure.',
                strategy: 'Le plus facile ! Mord avec n\'importe quel mouvement d\'appât. Bonus de ×1.2 sur la probabilité de morsure. Parfait pour les débutants.' 
            },
            '🦑': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Prédateur rapide des profondeurs', 
                patternDesc: 'Laisse l\'hameçon COULER RAPIDEMENT vers le calmar (mouvement vertical > 50 px + vitesse > 40). Il attaque les proies qui tombent.',
                strategy: 'Approche l\'hameçon du poisson et laisse-le couler rapidement vers lui. Mouvement vertical et rapide pour déclencher la morsure. Fenêtre de ferrage très courte (1.2-1.8s), réagis vite !' 
            },
            '🐙': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Créature du fond, très résistante', 
                patternDesc: 'Pose l\'hameçon AU FOND (profondeur > 80%) et reste IMMOBILE (vitesse < 20 px/s). La pieuvre vit cachée au fond et n\'aime pas le mouvement.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. Combat long et difficile avec une stamina énorme. Gère bien la tension de la ligne !' 
            },
            '🐋': { 
                difficulty: '🔴 TRÈS DIFFICILE', 
                desc: 'Boss de grande taille, capture légendaire ⭐', 
                patternDesc: 'Garde l\'hameçon IMMOBILE près de la baleine pendant au moins 5 SECONDES (vitesse < 30 px/s). Elle est très méfiante et observe longuement.',
                strategy: 'Approche l\'hameçon du poisson et reste près de lui pendant 5 secondes sans bouger. Combat extrêmement difficile avec tension maximale. Risque élevé de casser la ligne ! Gère parfaitement le rembobinage.' 
            },
            '🪼': { 
                difficulty: '🟢 FACILE', 
                desc: 'Créature facile de surface', 
                patternDesc: 'Rembobine RAPIDEMENT pour créer un mouvement horizontal rapide (vitesse > 100 px/s). La méduse suit les mouvements rapides en surface.',
                strategy: 'Bouge rapidement l\'hameçon devant le poisson. Capture très facile mais peu de points. Idéal pour gagner du temps bonus rapidement.' 
            },
            '🧜‍♀️': { 
                difficulty: '🔴 TRÈS DIFFICILE', 
                desc: 'Capture ultime, la plus difficile ⭐⭐', 
                patternDesc: 'Laisse l\'hameçon COULER À PIC près d\'elle (mouvement vertical > 50 px + vitesse > 40). La sirène est attirée par les mouvements de chute rapides.',
                strategy: 'Approche l\'hameçon du poisson et laisse-le couler rapidement vers lui. La capture la plus difficile du jeu ! Seulement 10-25% de chance de mordre. 👑🔥' 
            },
            '👾': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Créature mystérieuse', 
                patternDesc: 'Laisse l\'hameçon COULER RAPIDEMENT vers la créature mystérieuse (mouvement vertical > 50 px + vitesse > 40). Elle est très méfiante et observe longuement.',
                strategy: 'Approche l\'hameçon du poisson et laisse-le couler rapidement vers lui. Mouvement vertical et rapide pour déclencher la morsure. Fenêtre de ferrage très courte (1.2-1.8s), réagis vite !' 
            },
            '🐊': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Crocodile marin', 
                patternDesc: 'Laisse l\'hameçon COULER RAPIDEMENT vers le crocodile marin (mouvement vertical > 50 px + vitesse > 40). Il est très méfiant et observe longuement.',
                strategy: 'Approche l\'hameçon du poisson et laisse-le couler rapidement vers lui. Mouvement vertical et rapide pour déclencher la morsure. Fenêtre de ferrage très courte (1.2-1.8s), réagis vite !' 
            },
            '🐢': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Tortue de mer', 
                patternDesc: 'Laisse l\'hameçon COULER RAPIDEMENT vers la tortue de mer (mouvement vertical > 50 px + vitesse > 40). Elle est très méfiante et observe longuement.',
                strategy: 'Approche l\'hameçon du poisson et laisse-le couler rapidement vers lui. Mouvement vertical et rapide pour déclencher la morsure. Fenêtre de ferrage très courte (1.2-1.8s), réagis vite !' 
            },
            '🦭': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Phoque curieux', 
                patternDesc: 'Laisse l\'hameçon RESTER IMMOBILE près du poisson pendant au moins 3 secondes (vitesse < 20 px/s). Le phoque curieux est très méfiant des appâts qui bougent.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. La patience est récompensée ! Attend qu\'il s\'approche et reste immobile.' 
            },
            '🦈': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Requin', 
                patternDesc: 'Laisse l\'hameçon COULER RAPIDEMENT vers le requin (mouvement vertical > 50 px + vitesse > 40). Il est très méfiant et observe longuement.',
                strategy: 'Approche l\'hameçon du poisson et laisse-le couler rapidement vers lui. Mouvement vertical et rapide pour déclencher la morsure. Fenêtre de ferrage très courte (1.2-1.8s), réagis vite !' 
            },
            '🐬': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Dauphin', 
                patternDesc: 'Laisse l\'hameçon RESTER IMMOBILE près du poisson pendant au moins 3 secondes (vitesse < 20 px/s). Le dauphin est très méfiant des appâts qui bougent.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. La patience est récompensée ! Attend qu\'il s\'approche et reste immobile.' 
            },
            '🐉': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Dragon marin', 
                patternDesc: 'Laisse l\'hameçon COULER RAPIDEMENT vers le dragon marin (mouvement vertical > 50 px + vitesse > 40). Il est très méfiant et observe longuement.',
                strategy: 'Approche l\'hameçon du poisson et laisse-le couler rapidement vers lui. Mouvement vertical et rapide pour déclencher la morsure. Fenêtre de ferrage très courte (1.2-1.8s), réagis vite !' 
            },
            '🦞': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Homard géant', 
                patternDesc: 'Laisse l\'hameçon RESTER IMMOBILE près du poisson pendant au moins 3 secondes (vitesse < 20 px/s). L\'homard géant est très méfiant des appâts qui bougent.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. La patience est récompensée ! Attend qu\'il s\'approche et reste immobile.' 
            },
            '🦀': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Crabe colossal', 
                patternDesc: 'Laisse l\'hameçon RESTER IMMOBILE près du poisson pendant au moins 3 secondes (vitesse < 20 px/s). Le crabe colossal est très méfiant des appâts qui bougent.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. Combat long et difficile avec une stamina énorme. Gère bien la tension de la ligne !' 
            },
            '🧜‍♂️': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Triton', 
                patternDesc: 'Laisse l\'hameçon RESTER IMMOBILE près du poisson pendant au moins 3 secondes (vitesse < 20 px/s). Le triton est très méfiant des appâts qui bougent.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. La patience est récompensée ! Attend qu\'il s\'approche et reste immobile.' 
            },
            '🧜': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Néréide', 
                patternDesc: 'Laisse l\'hameçon RESTER IMMOBILE près du poisson pendant au moins 3 secondes (vitesse < 20 px/s). La néréide est très méfiante des appâts qui bougent.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. La patience est récompensée ! Attend qu\'il s\'approche et reste immobile.' 
            },
            '🥾': { 
                difficulty: '🟠 DIFFICILE', 
                desc: 'Botte perdue', 
                patternDesc: 'Laisse l\'hameçon RESTER IMMOBILE près du poisson pendant au moins 3 secondes (vitesse < 20 px/s). La botte perdue est très méfiante des appâts qui bougent.',
                strategy: 'Laisse l\'hameçon au fond et ne bouge plus. La patience est récompensée ! Attend qu\'il s\'approche et reste immobile.' 
            }
        };
        
        const info = guideInfo[emoji] || { difficulty: '—', desc: '', patternDesc: '', strategy: '' };
        return {
            emoji,
            name: fishType.name,
            difficulty: info.difficulty,
            desc: info.desc,
            patternDesc: info.patternDesc,
            sizeMin: fishType.sizeRange[0],
            sizeMax: fishType.sizeRange[1],
            speedMin: fishType.speedRange[0].toFixed(1),
            speedMax: fishType.speedRange[1].toFixed(1),
            pointsMin: fishType.basePoints + Math.round(fishType.sizeRange[0] * fishType.pointsPerSize),
            pointsMax: fishType.basePoints + Math.round(fishType.sizeRange[1] * fishType.pointsPerSize),
            staminaMin: fishType.staminaRange[0],
            staminaMax: fishType.staminaRange[1],
            depthMin: Math.round(fishType.depthRange[0] * 100),
            depthMax: Math.round(fishType.depthRange[1] * 100),
            affinityMin: Math.round(fishType.biteAffinityRange[0] * 100),
            affinityMax: Math.round(fishType.biteAffinityRange[1] * 100),
            aggressionMin: Math.round(fishType.aggressionRange[0] * 100),
            aggressionMax: Math.round(fishType.aggressionRange[1] * 100),
            flashMin: fishType.flashDuration[0].toFixed(1),
            flashMax: fishType.flashDuration[1].toFixed(1),
            pattern: fishType.baitPattern,
            strategy: info.strategy
        };
    }

    // Panneau Guide de pêche (livre ouvert) dans une nouvelle fenêtre
    function showGuide() {
        // Supprimer un ancien guide s'il existe
        const existing = document.querySelector('.fishing-guide-window');
        if (existing) existing.remove();
        
        const unlocked = new Set((gameState.progress?.unlockedSpecies)||[]);
        const allTypes = GAME_CONFIG.fish.types.slice();

        function getHighScore() {
            const local = parseInt(localStorage.getItem('fishingHighScore') || '0');
            return Math.max(local || 0, gameState.highScore || 0);
        }

        // Créer une nouvelle fenêtre pour le guide
        const guideWindow = document.createElement('div');
        guideWindow.className = 'fishing-guide-window';
        guideWindow.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90vw;
            max-width: 1200px;
            height: 80vh;
            max-height: 800px;
            background: linear-gradient(to right, #f5e6d3 0%, #f5e6d3 49%, #2c1810 49.5%, #f5e6d3 50%, #f5e6d3 100%);
            border-radius: 16px;
            box-shadow: 0 25px 70px rgba(0,0,0,.8), inset 0 0 80px rgba(139,69,19,.15);
            z-index: 20000;
            display: flex;
            flex-direction: column;
            font-family: 'Concert One', 'Segoe UI', system-ui, sans-serif;
            overflow: hidden;
        `;
        
        guideWindow.innerHTML = `
            <div id="guide-header" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 2px solid #8b4513; cursor: move; user-select: none;">
                <h2 style="margin: 0; font-size: 24px; color: #8b4513;">📖 Guide de Pêche</h2>
                <button id="guide-close" style="background: none; border: none; color: #8b4513; font-size: 24px; cursor: pointer; padding: 5px;">×</button>
            </div>
            
            <!-- Onglets -->
            <div style="display: flex; border-bottom: 2px solid #8b4513;">
                <button id="tab-species" class="guide-tab active" style="flex: 1; padding: 15px; background: #8b4513; color: white; border: none; font-size: 16px; cursor: pointer; font-family: inherit;">
                    🐟 Espèces
                </button>
                <button id="tab-patterns" class="guide-tab" style="flex: 1; padding: 15px; background: #d6c7b3; color: #8b4513; border: none; font-size: 16px; cursor: pointer; font-family: inherit;">
                    🧩 Patterns
                </button>
                <button id="tab-hats" class="guide-tab" style="flex: 1; padding: 15px; background: #d6c7b3; color: #8b4513; border: none; font-size: 16px; cursor: pointer; font-family: inherit;">
                    🎩 Chapeaux
                </button>
                <button id="tab-achievements" class="guide-tab" style="flex: 1; padding: 15px; background: #d6c7b3; color: #8b4513; border: none; font-size: 16px; cursor: pointer; font-family: inherit;">
                    🏆 Achievements
                </button>
            </div>
            
            <!-- Contenu des onglets -->
            <div style="flex: 1; overflow: hidden;">
                <!-- Onglet Espèces -->
                <div id="content-species" class="guide-content" style="display: flex; height: 100%;">
                    <div style="flex: 1; padding: 20px; overflow-y: auto; border-right: 2px solid #8b4513;">
                        <h3 style="color: #8b4513; margin-bottom: 15px;">🐟 Espèces de Poissons</h3>
                        <div id="species-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                            <!-- Liste des espèces sera générée ici -->
                        </div>
                    </div>
                    
                    <div style="flex: 1; padding: 20px; overflow-y: auto;">
                        <h3 style="color: #8b4513; margin-bottom: 15px;">📋 Détails</h3>
                        <div id="species-details" style="text-align: center; opacity: 1; margin-top: 80px; font-style: italic;">
                            Sélectionne une espèce pour voir ses détails
                        </div>
                    </div>
                </div>
                
                <!-- Onglet Patterns -->
                <div id="content-patterns" class="guide-content" style="display: none; height: 100%;">
                    <div style="flex: 1; padding: 20px; overflow-y: auto;">
                        <h3 style="color: #8b4513; margin-bottom: 15px;">🧩 Patterns d'Appât (détection au curseur)</h3>
                        <div id="patterns-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;">
                            <!-- Liste des patterns -->
                        </div>
                        <div style="margin-top: 12px; font-size: 13px; color: #555;">
                            Règle générale: réaliser le pattern dans un rayon de <strong>20px</strong> autour du poisson pendant <strong>3s</strong>. Si le pattern correspond au préféré de l'espèce ⇒ probabilité de morsure ≥ <strong>90%</strong>.
                        </div>
                    </div>
                </div>
                
                <!-- Onglet Chapeaux -->
                <div id="content-hats" class="guide-content" style="display: none; height: 100%;">
                    <div style="flex: 1; padding: 20px; overflow-y: auto; border-right: 2px solid #8b4513;">
                <h3 style="color: #8b4513; margin-bottom: 15px;">🎩 Chapeaux Disponibles <span id="hats-counter" style="font-size:14px;color:#5b3a1a;opacity:0.9;margin-left:8px;"></span></h3>
                        <div id="hats-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                            <!-- Liste des chapeaux sera générée ici -->
                        </div>
                    </div>
                    
                    <div style="flex: 1; padding: 20px; overflow-y: auto;">
                        <h3 style="color: #8b4513; margin-bottom: 15px;">📋 Détails du Chapeau</h3>
                        <div id="hats-details" style="text-align: center; opacity: 1; margin-top: 80px; font-style: italic;">
                            Sélectionne un chapeau pour voir ses détails
                        </div>
                    </div>
                </div>
                
                <!-- Onglet Achievements -->
                <div id="content-achievements" class="guide-content" style="display: none; height: 100%;">
                    <div style="flex: 1; padding: 20px; overflow-y: auto;">
                        <h3 style="color: #8b4513; margin-bottom: 15px;">🏆 Achievements</h3>
                        <div id="achievements-list" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; max-width: 100%;">
                            <!-- Liste des achievements sera générée ici -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(guideWindow);
        // Chargement état sauvegardé (position/taille) ou centrage par défaut
        const saveGuideState = () => {
            try {
                const r = guideWindow.getBoundingClientRect();
                const state = { left: parseInt(guideWindow.style.left||r.left||0,10), top: parseInt(guideWindow.style.top||r.top||0,10), width: r.width, height: r.height };
                localStorage.setItem('fishingGuideWindow', JSON.stringify(state));
            } catch(e){ /* noop */ }
        };
        const loadGuideState = () => {
            try {
                const raw = localStorage.getItem('fishingGuideWindow');
                if (!raw) return false;
                const state = JSON.parse(raw);
                if (!state || typeof state !== 'object') return false;
                guideWindow.style.transform = 'none';
                if (state.width && state.height) {
                    guideWindow.style.width = Math.max(680, Math.min(window.innerWidth-20, Math.round(state.width))) + 'px';
                    guideWindow.style.height = Math.max(420, Math.min(window.innerHeight-20, Math.round(state.height))) + 'px';
                }
                if (typeof state.left === 'number' && typeof state.top === 'number') {
                    const r = guideWindow.getBoundingClientRect();
                    const left = Math.min(window.innerWidth - 40, Math.max(-r.width + 40, state.left));
                    const top = Math.min(window.innerHeight - 40, Math.max(0, state.top));
                    guideWindow.style.left = left + 'px';
                    guideWindow.style.top = top + 'px';
                }
                return true;
            } catch(e){ return false; }
        };
        if (!loadGuideState()) {
            try {
                const rect = guideWindow.getBoundingClientRect();
                guideWindow.style.transform = 'none';
                guideWindow.style.left = Math.max(10, Math.round((window.innerWidth - rect.width) / 2)) + 'px';
                guideWindow.style.top = Math.max(10, Math.round((window.innerHeight - rect.height) / 2)) + 'px';
            } catch (e) { /* noop */ }
        }
        // Drag simple via l'en-tête
        (function(winEl){
            const header = winEl.querySelector('#guide-header');
            if (!header) return;
            let dragging=false, sx=0, sy=0, ox=0, oy=0;
            header.addEventListener('mousedown', (e)=>{
                if (e.target && (e.target.id==='guide-close' || e.target.closest('#guide-close'))) return;
                dragging=true; sx=e.clientX; sy=e.clientY; ox=parseInt(winEl.style.left||'0',10); oy=parseInt(winEl.style.top||'0',10); document.body.style.userSelect='none';
            });
            window.addEventListener('mousemove', (e)=>{
                if (!dragging) return;
                const dx=e.clientX-sx, dy=e.clientY-sy; const r=winEl.getBoundingClientRect();
                let nl=ox+dx, nt=oy+dy; nl=Math.min(window.innerWidth-40, Math.max(-r.width+40, nl)); nt=Math.min(window.innerHeight-40, Math.max(0, nt));
                winEl.style.left=nl+'px'; winEl.style.top=nt+'px';
            });
            window.addEventListener('mouseup', ()=>{ if(dragging){ dragging=false; document.body.style.userSelect=''; saveGuideState(); } });
        })(guideWindow);
        // Resizer en bas-droit
        const resizer=document.createElement('div'); resizer.id='guide-resizer'; resizer.style.cssText='position:absolute;right:0;bottom:0;width:16px;height:16px;cursor:se-resize;background:linear-gradient(135deg, rgba(139,69,19,0.25), rgba(139,69,19,0.05));border-top-left-radius:4px;'; guideWindow.appendChild(resizer);
        (function(winEl,handle){ let resizing=false,sx=0,sy=0,sw=0,sh=0; handle.addEventListener('mousedown',(e)=>{e.preventDefault();resizing=true;const r=winEl.getBoundingClientRect();sx=e.clientX;sy=e.clientY;sw=r.width;sh=r.height;document.body.style.userSelect='none';}); window.addEventListener('mousemove',(e)=>{ if(!resizing) return; const dx=e.clientX-sx, dy=e.clientY-sy; const minW=680,minH=420,maxW=Math.max(minW,window.innerWidth-20),maxH=Math.max(minH,window.innerHeight-20); winEl.style.width=Math.max(minW,Math.min(maxW,Math.round(sw+dx)))+'px'; winEl.style.height=Math.max(minH,Math.min(maxH,Math.round(sh+dy)))+'px'; }); window.addEventListener('mouseup',()=>{ if(resizing){ resizing=false; document.body.style.userSelect=''; saveGuideState(); } }); })(guideWindow,resizer);

        // Sauvegarder à la fermeture (handler ajouté plus bas aussi, on utilise un id différent local)
        const closeBtnForSave = document.getElementById('guide-close');
        if (closeBtnForSave) closeBtnForSave.addEventListener('click', saveGuideState, { once:true });
        
        // Fonction pour obtenir les conditions de déblocage d'une espèce
        function getSpeciesUnlockInfo(emoji) {
            const stats = gameState.progress?.stats || {};
            
            const unlockConditions = {
                '🦐': { condition: 'Débloqué par défaut', progress: 1, current: 1, target: 1 },
                '🐟': { condition: 'Débloqué par défaut', progress: 1, current: 1, target: 1 },
                '🪼': { condition: 'Rester 350s en surface (cumulé)', progress: Math.min(1, (stats.surfaceHoldCumulative || 0) / 350), current: Math.round(stats.surfaceHoldCumulative || 0), target: 350 },
                '🐠': { condition: 'Effectuer 70 lancers', progress: Math.min(1, (stats.totalCasts || 0) / 70), current: stats.totalCasts || 0, target: 70 },
                '🐡': { condition: 'Capturer 100 poissons', progress: Math.min(1, (stats.totalCatches || 0) / 100), current: stats.totalCatches || 0, target: 100 },
                '🦑': { condition: 'Visiter 450 fois le fond', progress: Math.min(1, (stats.deepVisits || 0) / 450), current: stats.deepVisits || 0, target: 450 },
                '🐋': { condition: 'Poids cumulé 1000 kg', progress: Math.min(1, (stats.cumulativeWeightKg || 0) / 1000), current: Math.round(stats.cumulativeWeightKg || 0), target: 1000 },
                '🧜‍♀️': { condition: 'Score cumulé 50000', progress: Math.min(1, (stats.cumulativeScore || 0) / 50000), current: stats.cumulativeScore || 0, target: 50000 },
                '👾': { condition: 'Capturer 50 poissons', progress: Math.min(1, (stats.totalCatches || 0) / 50), current: stats.totalCatches || 0, target: 50 },
                '🐊': { condition: 'Rester 120s au milieu (cumulé)', progress: Math.min(1, (stats.midHoldCumulative || 0) / 120), current: Math.round(stats.midHoldCumulative || 0), target: 120 },
                '🐢': { condition: 'Jouer 3600s (1h)', progress: Math.min(1, (stats.totalPlayTime || 0) / 3600), current: Math.round(stats.totalPlayTime || 0), target: 3600 },
                '🦭': { condition: 'Effectuer 200 lancers', progress: Math.min(1, (stats.totalCasts || 0) / 200), current: stats.totalCasts || 0, target: 200 },
                '🦈': { condition: 'Casser 20 lignes', progress: Math.min(1, (stats.lineBreaks || 0) / 20), current: stats.lineBreaks || 0, target: 20 },
                '🐬': { condition: '100 morsures', progress: Math.min(1, (stats.totalBites || 0) / 100), current: stats.totalBites || 0, target: 100 },
                '🐉': { condition: 'Série de 10 captures', progress: Math.min(1, (stats.bestNoBreakStreak || 0) / 10), current: stats.bestNoBreakStreak || 0, target: 10 },
                '🦞': { condition: 'Rester 300s au fond (cumulé)', progress: Math.min(1, (stats.bottomHoldCumulative || 0) / 300), current: Math.round(stats.bottomHoldCumulative || 0), target: 300 },
                '🦀': { condition: '500 détections immobiles', progress: Math.min(1, (stats.stillDetections || 0) / 500), current: stats.stillDetections || 0, target: 500 },
                '🧜‍♂️': { condition: '100 détections hover', progress: Math.min(1, (stats.hoverDetections || 0) / 100), current: stats.hoverDetections || 0, target: 100 },
                '🧜': { condition: '200 détections mouvement', progress: Math.min(1, (stats.movingDetections || 0) / 200), current: stats.movingDetections || 0, target: 200 },
                '🥾': { condition: 'Capturer 50 bottes', progress: Math.min(1, (stats.bootsCaught || 0) / 50), current: stats.bootsCaught || 0, target: 50 },
                '🐙': { condition: 'Rester 40s au fond', progress: Math.min(1, (stats.longestBottomHold || 0) / 40), current: Math.round(stats.longestBottomHold || 0), target: 40 }
            };
            
            return unlockConditions[emoji] || { condition: 'Condition inconnue', progress: 0, current: 0, target: 1 };
        }

        // Fonction pour générer la liste des espèces
        function generateSpeciesList() {
            const speciesList = document.getElementById('species-list');
            if (!speciesList) return;
            
            speciesList.innerHTML = '';
            
            allTypes.forEach(fishType => {
                const isUnlocked = unlocked.has(fishType.emoji);
                const item = document.createElement('div');
                item.style.cssText = `
                    background: ${isUnlocked ? 'rgba(139,69,19,0.1)' : 'rgba(139,69,19,0.05)'};
                    border: 2px solid ${isUnlocked ? '#8b4513' : '#d6c7b3'};
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                    cursor: ${isUnlocked ? 'pointer' : 'default'};
                    transition: all 0.2s;
                    opacity: 1;
                `;
                
                // Toujours permettre l'interaction pour voir les détails
                item.addEventListener('mouseenter', () => { 
                    item.style.transform = 'translateY(-2px)'; 
                    item.style.boxShadow = '0 6px 16px rgba(44,24,16,0.18)'; 
                });
                item.addEventListener('mouseleave', () => { 
                    item.style.transform = 'none'; 
                    item.style.boxShadow = '0 2px 10px rgba(44,24,16,0.08)'; 
                });
                item.addEventListener('click', () => showSpeciesDetails(fishType.emoji));
                
                const shownEmoji = isUnlocked ? fishType.emoji : '❔';
                const shownName = isUnlocked ? fishType.name : '?????';
                
                // Obtenir les informations de déblocage
                const unlockInfo = getSpeciesUnlockInfo(fishType.emoji);
                const progressPercent = Math.round(unlockInfo.progress * 100);
                
                // Couleur de rareté
                const rarityColor = {
                    'commun': '#8b4513',
                    'rare': '#4169e1',
                    'épique': '#9932cc',
                    'légendaire': '#ffd700',
                    'mythique': '#ff4500'
                }[fishType.rarity] || '#8b4513';
                
                // Calculer la difficulté
                const difficulty = fishType.staminaRange[1] > 150 ? 'Difficile' : fishType.staminaRange[1] > 100 ? 'Moyen' : 'Facile';
                const difficultyColor = fishType.staminaRange[1] > 150 ? '#ff4500' : fishType.staminaRange[1] > 100 ? '#ff8c00' : '#32cd32';
                
                item.innerHTML = `
                    <div style="font-size: 32px; margin-bottom: 8px;">${shownEmoji}</div>
                    <div style="font-weight: bold; color: #8b4513; margin-bottom: 4px;">${shownName}</div>
                    ${isUnlocked ? `
                        <div style="font-size: 11px; color: ${rarityColor}; font-weight: bold; margin-bottom: 4px;">
                            ${fishType.rarity ? fishType.rarity.toUpperCase() : 'COMMUNE'}
                        </div>
                        <div style="font-size: 11px; color: #666; margin-bottom: 2px;">
                            Taille: ${fishType.sizeRange[0]}-${fishType.sizeRange[1]}px
                        </div>
                        <div style="font-size: 11px; color: #666; margin-bottom: 2px;">
                            Points: ${fishType.basePoints}-${fishType.basePoints + fishType.pointsPerSize * fishType.sizeRange[1]}
                        </div>
                        <div style="font-size: 11px; color: ${difficultyColor}; font-weight: bold;">
                            ${difficulty}
                        </div>
                    ` : `
                        <div style="font-size: 11px; color: #666; margin-bottom: 6px; line-height: 1.2;">
                            ${unlockInfo.condition}
                        </div>
                        <div style="background: rgba(0,0,0,0.1); border-radius: 4px; height: 6px; margin-bottom: 4px;">
                            <div style="background: #8b4513; height: 100%; border-radius: 4px; width: ${progressPercent}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 10px; color: #666;">
                            ${unlockInfo.current}/${unlockInfo.target} (${progressPercent}%)
                        </div>
                    `}
                `;
                
                speciesList.appendChild(item);
            });
        }
        
        // Fonction pour changer d'onglet
        function switchGuideTab(tabName) {
            // Désactiver tous les onglets
            document.querySelectorAll('.guide-tab').forEach(tab => {
                tab.style.background = '#d6c7b3';
                tab.style.color = '#8b4513';
            });
            document.querySelectorAll('.guide-content').forEach(content => {
                content.style.display = 'none';
            });

            // Activer l'onglet sélectionné
            const activeTab = document.getElementById(`tab-${tabName}`);
            const activeContent = document.getElementById(`content-${tabName}`);
            if (activeTab) {
                activeTab.style.background = '#8b4513';
                activeTab.style.color = 'white';
            }
            if (activeContent) {
                activeContent.style.display = 'flex';
            }

            // Générer le contenu de l'onglet
            if (tabName === 'species') {
                generateSpeciesList();
            } else if (tabName === 'patterns') {
                generatePatternsList();
            } else if (tabName === 'hats') {
                generateHatsList();
            } else if (tabName === 'achievements') {
                generateAchievementsList();
            }
        }

        // Fonction pour générer la liste des patterns
        function generatePatternsList() {
            const container = document.getElementById('patterns-list');
            if (!container) return;
            const patterns = [
                { key:'devant',    title:'Devant',    desc:"Rester devant la direction du poisson dans un rayon de 20px pendant 3s." },
                { key:'derriere',  title:'Derrière',  desc:"Rester derrière le poisson dans un rayon de 20px pendant 3s." },
                { key:'au_dessus', title:'Au‑dessus', desc:"Maintenir la souris au‑dessus du poisson (y plus petit) dans un rayon de 20px pendant 3s." },
                { key:'au_dessous',title:'Au‑dessous',desc:"Maintenir la souris au‑dessous du poisson (y plus grand) dans un rayon de 20px pendant 3s." },
                { key:'toucher',   title:'Toucher',   desc:"Garder le curseur directement sur le poisson (≤ 8px) pendant 3s." },
                { key:'complete',  title:'Complete',  desc:"Avoir été au‑dessus, au‑dessous, à gauche et à droite du poisson en 3s." }
            ];
            container.innerHTML = patterns.map(p => `
                <div style="background: rgba(139,69,19,0.08); border: 2px solid #8b4513; border-radius: 8px; padding: 12px;">
                    <div style="font-weight: 700; color:#8b4513; margin-bottom: 6px;">${p.title}</div>
                    <div style="font-size: 13px; color:#555; line-height:1.5;">${p.desc}</div>
                </div>
            `).join('');
        }

        // Fonction pour mettre à jour les listes en temps réel
        function updateGuideLists() {
            // Mettre à jour la liste des espèces si elle est visible
            const speciesContent = document.getElementById('content-species');
            if (speciesContent && speciesContent.style.display !== 'none') {
                generateSpeciesList();
            }
            const patternsContent = document.getElementById('content-patterns');
            if (patternsContent && patternsContent.style.display !== 'none') {
                generatePatternsList();
            }
            
            // Mettre à jour la liste des chapeaux si elle est visible
            const hatsContent = document.getElementById('content-hats');
            if (hatsContent && hatsContent.style.display !== 'none') {
                generateHatsList();
            }
            
            // Mettre à jour la liste des achievements si elle est visible
            const achievementsContent = document.getElementById('content-achievements');
            if (achievementsContent && achievementsContent.style.display !== 'none') {
                generateAchievementsList();
            }
        }

        // Fonction pour obtenir les informations de déblocage d'un chapeau
        function getHatUnlockInfo(hat) {
            const stats = gameState.progress?.stats || {};
            
            // Mapper les conditions de déblocage basées sur la clé du chapeau
            const unlockConditions = {
                'score5000': { 
                    condition: 'Atteindre 5 000 pts cumulés', 
                    progress: Math.min(1, (stats.cumulativeScore || 0) / 5000), 
                    current: stats.cumulativeScore || 0, 
                    target: 5000 
                },
                'casts300': { 
                    condition: 'Effectuer 300 lancers', 
                    progress: Math.min(1, (stats.totalCasts || 0) / 300), 
                    current: stats.totalCasts || 0, 
                    target: 300 
                },
                'surface600': { 
                    condition: 'Rester 600s en surface (cumulé)', 
                    progress: Math.min(1, (stats.surfaceHoldCumulative || 0) / 600), 
                    current: Math.round(stats.surfaceHoldCumulative || 0), 
                    target: 600 
                },
                'catches200': { 
                    condition: 'Capturer 200 poissons', 
                    progress: Math.min(1, (stats.totalCatches || 0) / 200), 
                    current: stats.totalCatches || 0, 
                    target: 200 
                },
                'deep1000': { 
                    condition: 'Visiter le fond 1000 fois', 
                    progress: Math.min(1, (stats.deepVisits || 0) / 1000), 
                    current: stats.deepVisits || 0, 
                    target: 1000 
                },
                'kg2000': { 
                    condition: 'Poids cumulé 2 000 kg', 
                    progress: Math.min(1, (stats.cumulativeWeightKg || 0) / 2000), 
                    current: Math.round(stats.cumulativeWeightKg || 0), 
                    target: 2000 
                },
                'breaks10': { 
                    condition: 'Casser 10 lignes', 
                    progress: Math.min(1, (stats.lineBreaks || 0) / 10), 
                    current: stats.lineBreaks || 0, 
                    target: 10 
                },
                'sirens50': { 
                    condition: 'Capturer 50 sirènes', 
                    progress: Math.min(1, (stats.sirensCaught || 0) / 50), 
                    current: stats.sirensCaught || 0, 
                    target: 50 
                },
                'hover1000': { 
                    condition: '1000 détections de pattern hover', 
                    progress: Math.min(1, (stats.hoverDetections || 0) / 1000), 
                    current: stats.hoverDetections || 0, 
                    target: 1000 
                },
                'perfect300': { 
                    condition: 'Score parfait (300+ sans casser)', 
                    progress: Math.min(1, (stats.perfectScores || 0) / 1), 
                    current: stats.perfectScores || 0, 
                    target: 1 
                },
                'fast5': { 
                    condition: 'Capturer 5 poissons en 10s', 
                    progress: Math.min(1, (stats.fastCatches || 0) / 1), 
                    current: stats.fastCatches || 0, 
                    target: 1 
                },
                'octopus100': { 
                    condition: 'Capturer 100 poulpes', 
                    progress: Math.min(1, (stats.octopusCaught || 0) / 100), 
                    current: stats.octopusCaught || 0, 
                    target: 100 
                },
                'whales20': { 
                    condition: 'Capturer 20 baleines', 
                    progress: Math.min(1, (stats.whalesCaught || 0) / 20), 
                    current: stats.whalesCaught || 0, 
                    target: 20 
                },
                'streak50': { 
                    condition: 'Série de 50 captures sans casser', 
                    progress: Math.min(1, (stats.currentNoBreakStreak || 0) / 50), 
                    current: stats.currentNoBreakStreak || 0, 
                    target: 50 
                },
                'shrimp500': { 
                    condition: 'Capturer 500 crevettes', 
                    progress: Math.min(1, (stats.shrimpCaught || 0) / 500), 
                    current: stats.shrimpCaught || 0, 
                    target: 500 
                },
                'score100k': { 
                    condition: 'Score cumulé 100 000', 
                    progress: Math.min(1, (stats.cumulativeScore || 0) / 100000), 
                    current: stats.cumulativeScore || 0, 
                    target: 100000 
                },
                'puffer200': { 
                    condition: 'Capturer 200 poissons ballons', 
                    progress: Math.min(1, (stats.pufferCaught || 0) / 200), 
                    current: stats.pufferCaught || 0, 
                    target: 200 
                },
                'bottom1000': { 
                    condition: 'Rester 1000s au fond (cumulé)', 
                    progress: Math.min(1, (stats.bottomHoldCumulative || 0) / 1000), 
                    current: Math.round(stats.bottomHoldCumulative || 0), 
                    target: 1000 
                },
                'squid100': { 
                    condition: 'Capturer 100 calmars', 
                    progress: Math.min(1, (stats.squidCaught || 0) / 100), 
                    current: stats.squidCaught || 0, 
                    target: 100 
                }
            };
            
            return unlockConditions[hat.key] || { condition: hat.unlock, progress: 0, current: 0, target: 1 };
        }

        // Fonction pour générer la liste des chapeaux
        function generateHatsList() {
            const hatsList = document.getElementById('hats-list');
            if (!hatsList) return;
            
            hatsList.innerHTML = '';
            
            const hats = gameState.hatItems || [];
            const unlockedHats = gameState.progress?.hats?.unlocked || [];
            const ownedHats = gameState.progress?.hats?.owned || [];
            const equippedHat = gameState.progress?.hats?.equipped;
            
            hats.forEach(hat => {
                const isUnlocked = unlockedHats.includes(hat.emoji);
                const isOwned = ownedHats.includes(hat.emoji);
                const isEquipped = equippedHat === hat.emoji;
                
                const item = document.createElement('div');
                item.style.cssText = `
                    background: ${isUnlocked ? (isEquipped ? 'rgba(139,69,19,0.2)' : 'rgba(139,69,19,0.1)') : 'rgba(139,69,19,0.05)'};
                    border: 2px solid ${isUnlocked ? (isEquipped ? '#b8860b' : '#8b4513') : '#d6c7b3'};
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                    cursor: ${isUnlocked ? 'pointer' : 'default'};
                    transition: all 0.2s;
                    opacity: 1;
                    position: relative;
                `;
                
                // Toujours permettre l'interaction pour voir les détails
                item.addEventListener('mouseenter', () => { 
                    item.style.transform = 'translateY(-2px)'; 
                    item.style.boxShadow = '0 6px 16px rgba(44,24,16,0.18)'; 
                });
                item.addEventListener('mouseleave', () => { 
                    item.style.transform = 'none'; 
                    item.style.boxShadow = '0 2px 10px rgba(44,24,16,0.08)'; 
                });
                item.addEventListener('click', () => showHatDetails(hat.emoji));
                
                const shownEmoji = isUnlocked ? hat.emoji : '❔';
                const shownName = isUnlocked ? hat.name : '?????';
                
                // Obtenir les informations de déblocage
                const unlockInfo = getHatUnlockInfo(hat);
                const progressPercent = Math.round(unlockInfo.progress * 100);
                
                const rarityColor = {
                    'commun': '#8b4513',
                    'rare': '#4169e1',
                    'épique': '#9932cc',
                    'légendaire': '#ffd700',
                    'mythique': '#ff4500'
                }[hat.rarity] || '#8b4513';
                
                item.innerHTML = `
                    ${isEquipped ? '<div style="position: absolute; top: 5px; right: 5px; background: #b8860b; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold;">ÉQUIPÉ</div>' : ''}
                    <div style="font-size: 32px; margin-bottom: 8px;">${shownEmoji}</div>
                    <div style="font-weight: bold; color: #8b4513; margin-bottom: 4px;">${shownName}</div>
                    <div style="font-size: 12px; color: ${rarityColor}; margin-bottom: 4px; font-weight: bold;">
                        ${isUnlocked ? hat.rarity.toUpperCase() : 'VERROUILLÉ'}
                    </div>
                    ${isUnlocked ? `
                        <div style="font-size: 11px; color: #666; line-height: 1.3;">
                            ${describeHatUnlock(hat.unlock, hat.unlockText)}
                        </div>
                    ` : `
                        <div style="font-size: 11px; color: #666; margin-bottom: 6px; line-height: 1.2;">
                            ${unlockInfo.condition}
                        </div>
                        <div style="background: rgba(0,0,0,0.1); border-radius: 4px; height: 6px; margin-bottom: 4px;">
                            <div style="background: #8b4513; height: 100%; border-radius: 4px; width: ${progressPercent}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 10px; color: #666;">
                            ${unlockInfo.current}/${unlockInfo.target} (${progressPercent}%)
                        </div>
                    `}
                `;
                
                hatsList.appendChild(item);
            });

            // Mettre à jour le compteur dans le titre
            const counter = document.getElementById('hats-counter');
            if (counter) {
                const unlocked = (gameState.progress?.hats?.unlocked || []).length;
                const owned = (gameState.progress?.hats?.owned || []).length;
                counter.textContent = `(${owned} possédés / ${unlocked} débloqués)`;
            }
        }

        // Fonction pour générer la liste des achievements
        function generateAchievementsList() {
            const achievementsList = document.getElementById('achievements-list');
            if (!achievementsList) return;
            
            achievementsList.innerHTML = '';
            
            const achievements = gameState.progress?.achievements || {};
            const stats = gameState.progress?.stats || {};
            
            // Définir la liste des achievements avec leurs conditions
            const achievementDefinitions = [
                {
                    key: 'firstCatch',
                    name: 'Première Capture',
                    description: 'Capturer votre premier poisson',
                    emoji: '🎣',
                    condition: () => (stats.totalCatches || 0) >= 1,
                    progress: () => Math.min(1, (stats.totalCatches || 0) / 1),
                    unlocked: achievements.firstCatch || false
                },
                {
                    key: 'tenCatches',
                    name: 'Débutant',
                    description: 'Capturer 10 poissons',
                    emoji: '🐟',
                    condition: () => (stats.totalCatches || 0) >= 10,
                    progress: () => Math.min(1, (stats.totalCatches || 0) / 10),
                    unlocked: achievements.tenCatches || false
                },
                {
                    key: 'fiftyCatches',
                    name: 'Pêcheur Expérimenté',
                    description: 'Capturer 50 poissons',
                    emoji: '🐠',
                    condition: () => (stats.totalCatches || 0) >= 50,
                    progress: () => Math.min(1, (stats.totalCatches || 0) / 50),
                    unlocked: achievements.fiftyCatches || false
                },
                {
                    key: 'hundredCatches',
                    name: 'Maître Pêcheur',
                    description: 'Capturer 100 poissons',
                    emoji: '🐋',
                    condition: () => (stats.totalCatches || 0) >= 100,
                    progress: () => Math.min(1, (stats.totalCatches || 0) / 100),
                    unlocked: achievements.hundredCatches || false
                },
                {
                    key: 'firstCast',
                    name: 'Premier Lancer',
                    description: 'Effectuer votre premier lancer',
                    emoji: '🎯',
                    condition: () => (stats.totalCasts || 0) >= 1,
                    progress: () => Math.min(1, (stats.totalCasts || 0) / 1),
                    unlocked: achievements.firstCast || false
                },
                {
                    key: 'tenCasts',
                    name: 'Lanceur',
                    description: 'Effectuer 10 lancers',
                    emoji: '🎪',
                    condition: () => (stats.totalCasts || 0) >= 10,
                    progress: () => Math.min(1, (stats.totalCasts || 0) / 10),
                    unlocked: achievements.tenCasts || false
                },
                {
                    key: 'hundredCasts',
                    name: 'Lanceur Expert',
                    description: 'Effectuer 100 lancers',
                    emoji: '🏹',
                    condition: () => (stats.totalCasts || 0) >= 100,
                    progress: () => Math.min(1, (stats.totalCasts || 0) / 100),
                    unlocked: achievements.hundredCasts || false
                },
                {
                    key: 'bottomHold40',
                    name: 'Fond Marin',
                    description: 'Rester 40 secondes au fond',
                    emoji: '🌊',
                    condition: () => (stats.longestBottomHold || 0) >= 40,
                    progress: () => Math.min(1, (stats.longestBottomHold || 0) / 40),
                    unlocked: achievements.bottomHold40 || false
                },
                {
                    key: 'highscore200',
                    name: 'Score Élevé',
                    description: 'Atteindre un score de 200',
                    emoji: '⭐',
                    condition: () => (gameState.highScore || 0) >= 200,
                    progress: () => Math.min(1, (gameState.highScore || 0) / 200),
                    unlocked: achievements.highscore200 || false
                },
                {
                    key: 'firstDeep',
                    name: 'Explorateur',
                    description: 'Visiter les profondeurs',
                    emoji: '🦑',
                    condition: () => (stats.deepVisits || 0) >= 1,
                    progress: () => Math.min(1, (stats.deepVisits || 0) / 1),
                    unlocked: achievements.firstDeep || false
                },
                {
                    key: 'firstSurface',
                    name: 'Surface',
                    description: 'Pêcher en surface',
                    emoji: '🌅',
                    condition: () => (stats.surfaceHoldCumulative || 0) >= 10,
                    progress: () => Math.min(1, (stats.surfaceHoldCumulative || 0) / 10),
                    unlocked: achievements.firstSurface || false
                },
                {
                    key: 'firstPerfect',
                    name: 'Parfait',
                    description: 'Obtenir un score parfait',
                    emoji: '✨',
                    condition: () => (stats.perfectScores || 0) >= 1,
                    progress: () => Math.min(1, (stats.perfectScores || 0) / 1),
                    unlocked: achievements.firstPerfect || false
                }
            ];
            
            achievementDefinitions.forEach(achievement => {
                const isUnlocked = achievement.unlocked || achievement.condition();
                const progress = achievement.progress();
                const progressPercent = Math.round(progress * 100);
                
                const item = document.createElement('div');
                item.style.cssText = `
                    background: ${isUnlocked ? 'rgba(139,69,19,0.2)' : 'rgba(139,69,19,0.1)'};
                    border: 2px solid ${isUnlocked ? '#b8860b' : '#8b4513'};
                    border-radius: 8px;
                    padding: 15px;
                    text-align: center;
                    transition: all 0.2s;
                    position: relative;
                    min-height: 180px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-sizing: border-box;
                `;
                
                item.innerHTML = `
                    ${isUnlocked ? '<div style="position: absolute; top: 5px; right: 5px; background: #b8860b; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold;">DÉBLOQUÉ</div>' : ''}
                    <div style="font-size: 32px; margin-bottom: 8px;">${achievement.emoji}</div>
                    <div style="font-weight: bold; color: #8b4513; margin-bottom: 4px;">${achievement.name}</div>
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px; line-height: 1.3;">${achievement.description}</div>
                    <div style="background: rgba(0,0,0,0.1); border-radius: 4px; height: 8px; margin-bottom: 4px;">
                        <div style="background: ${isUnlocked ? '#b8860b' : '#8b4513'}; height: 100%; border-radius: 4px; width: ${progressPercent}%; transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size: 11px; color: #666;">
                        ${progressPercent}% complété
                    </div>
                `;
                
                achievementsList.appendChild(item);
            });
        }

        // Génère une description lisible des perks d'un chapeau
        function describeHatPerks(perks) {
            if (!perks || typeof perks !== 'object') return 'Aucun effet spécial';
            const parts = [];
            const toPct = (v) => `${Math.round((v - 1) * 100)}%`;
            const toPctRaw = (v) => `${Math.round(v * 100)}%`;
            Object.entries(perks).forEach(([key, val]) => {
                switch (key) {
                    case 'pointsMultiplier':
                        parts.push(`+${toPct(val)} points`); break;
                    case 'weightMultiplier':
                        parts.push(`+${toPct(val)} poids des poissons`); break;
                    case 'biteChanceMultiplier':
                        parts.push(`+${toPct(val)} chance de morsure`); break;
                    case 'castAccuracyBonus':
                        parts.push(`+${toPctRaw(val)} précision de lancer`); break;
                    case 'reelSpeedMultiplier':
                        parts.push(`+${toPct(val)} vitesse de rembobinage`); break;
                    case 'surfaceReelSpeedMultiplier':
                        parts.push(`+${toPct(val)} rembobinage en surface`); break;
                    case 'deepTensionResistance':
                        parts.push(`+${toPct(val)} résistance à la tension en profondeur`); break;
                    case 'fishAggressionMultiplier':
                        parts.push(`+${toPct(val)} agressivité des poissons`); break;
                    case 'dawnEffectiveness':
                        parts.push(`+${toPct(val)} efficacité à l'aube`); break;
                    case 'summerEffectiveness':
                        parts.push(`+${toPct(val)} efficacité en été`); break;
                    case 'autumnEffectiveness':
                        parts.push(`+${toPct(val)} efficacité en automne`); break;
                    case 'treasureChance':
                        parts.push(`×${val} chance de trésors`); break;
                    case 'rainbowColors':
                        parts.push(`Effet arc‑en‑ciel cosmétique`); break;
                    case 'transformChanceMultiplier':
                        parts.push(`+${toPct(val)} chance d'effet de transformation`); break;
                    case 'mythicSpawnRate':
                        parts.push(`×${val} spawn des espèces mythiques`); break;
                    case 'nightEfficiency':
                        parts.push(`+${toPct(val)} efficacité la nuit`); break;
                    case 'dayEfficiency':
                        parts.push(`+${toPct(val)} efficacité de jour`); break;
                    case 'dawnEfficiency':
                        parts.push(`+${toPct(val)} efficacité à l'aube`); break;
                    case 'summerEfficiency':
                        parts.push(`+${toPct(val)} efficacité en été`); break;
                    default:
                        // fallback générique clé: valeur
                        parts.push(`${key}: ${typeof val === 'number' ? val : 'actif'}`);
                }
            });
            return parts.length ? `• ${parts.join('<br>• ')}` : 'Aucun effet spécial';
        }

        // Génère une description lisible de la condition de déblocage d'un chapeau
        function describeHatUnlock(unlock, fallbackText) {
            if (fallbackText) return fallbackText;
            if (!unlock || typeof unlock !== 'object') return 'Condition inconnue';
            const t = unlock.type;
            switch (t) {
                case 'always':
                    return 'Toujours disponible';
                case 'cumulative_score_at_least':
                    return `Atteindre ${unlock.value} points cumulés`;
                case 'casts_at_least':
                    return `Effectuer ${unlock.value} lancers`;
                case 'surface_seconds_at_least':
                    return `Rester ${unlock.value}s en surface (cumulé)`;
                case 'catches_at_least':
                    return `Capturer ${unlock.value} poissons`;
                case 'deep_visits_at_least':
                    return `Visiter le fond ${unlock.value} fois`;
                case 'cumulative_weight_kg_at_least':
                    return `Atteindre ${unlock.value} kg cumulés`;
                case 'line_breaks_at_least':
                    return `Casser ${unlock.value} lignes`;
                case 'catches_species_at_least':
                    return `Capturer ${unlock.value} × ${unlock.emoji || 'espèce cible'}`;
                case 'catches_at_time_of_day':
                    return `Capturer ${unlock.value} poissons au moment « ${unlock.period} »`;
                case 'catches_in_season_at_least':
                    return `Capturer ${unlock.value} poissons en ${unlock.season}`;
                case 'all_species_caught':
                    return 'Capturer 1 de chaque espèce';
                case 'treasures_at_least':
                    return `Capturer ${unlock.value} trésors`;
                case 'play_seconds_at_least':
                    return `Jouer ${unlock.value}s`;
                case 'perfect_games_at_least':
                    return `Réaliser ${unlock.value} scores parfaits`;
                case 'transformed_catches_at_least':
                    return `Capturer ${unlock.value} poissons transformés`;
                default:
                    try { return JSON.stringify(unlock); } catch { return 'Condition inconnue'; }
            }
        }

        // Fonction pour afficher les détails d'un chapeau
        function showHatDetails(emoji) {
            const detailsDiv = document.getElementById('hats-details');
            if (!detailsDiv) return;
            
            const hat = gameState.hatItems.find(h => h.emoji === emoji);
            if (!hat) return;
            
            const unlockedHats = gameState.progress?.hats?.unlocked || [];
            const ownedHats = gameState.progress?.hats?.owned || [];
            const equippedHat = gameState.progress?.hats?.equipped;
            
            const isUnlocked = unlockedHats.includes(hat.emoji);
            const isOwned = ownedHats.includes(hat.emoji);
            const isEquipped = equippedHat === hat.emoji;
            
            const rarityColor = {
                'commun': '#8b4513',
                'rare': '#4169e1',
                'épique': '#9932cc',
                'légendaire': '#ffd700',
                'mythique': '#ff4500'
            }[hat.rarity] || '#8b4513';
            
            detailsDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 64px; margin-bottom: 8px;">${isUnlocked ? hat.emoji : '❔'}</div>
                    <h2 style="margin: 0 0 4px 0; font-size: 24px; color: #8b4513;">${isUnlocked ? hat.name : '?????'}</h2>
                    <div style="font-size: 14px; color: ${rarityColor}; font-weight: bold; margin-bottom: 4px;">
                        ${isUnlocked ? hat.rarity.toUpperCase() : 'VERROUILLÉ'}
                    </div>
                    ${isEquipped ? '<div style="background: #b8860b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block;">ÉQUIPÉ</div>' : ''}
                    ${!isUnlocked ? '<div style="background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 8px;">VERROUILLÉ</div>' : ''}
                </div>
                
                <div style="background: rgba(139,69,19,0.08); padding: 12px; border-radius: 6px; border-left: 4px solid #8b4513; margin-bottom: 16px;">
                    <div style="font-weight: 700; margin-bottom: 4px; color: #8b4513;">Condition de déblocage:</div>
                    <div style="font-size: 14px; line-height: 1.4;">${describeHatUnlock(hat.unlock, hat.unlockText)}</div>
                </div>
                
                <div style="background: rgba(139,69,19,0.08); padding: 12px; border-radius: 6px; border-left: 4px solid ${rarityColor};">
                    <div style="font-weight: 700; margin-bottom: 4px; color: #8b4513;">Effets:</div>
                    <div style="font-size: 14px; line-height: 1.5; color: ${rarityColor};">${isUnlocked ? describeHatPerks(hat.perks || {}) : 'Informations verrouillées - Débloquez ce chapeau pour voir les effets'}</div>
                </div>
                
                ${!isUnlocked ? `
                    <!-- Informations de déblocage -->
                    <div style="background: rgba(255,107,107,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin-top: 15px;">
                        <h3 style="margin: 0 0 12px 0; color: #ff6b6b; font-size: 16px;">🔓 Comment Débloquer</h3>
                        <div style="font-size: 14px; line-height: 1.5; color: #666;">
                            ${getHatUnlockInfo(hat).condition}
                        </div>
                        <div style="background: rgba(0,0,0,0.1); border-radius: 4px; height: 8px; margin: 8px 0;">
                            <div style="background: #ff6b6b; height: 100%; border-radius: 4px; width: ${Math.round(getHatUnlockInfo(hat).progress * 100)}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 12px; color: #666;">
                            ${getHatUnlockInfo(hat).current}/${getHatUnlockInfo(hat).target} (${Math.round(getHatUnlockInfo(hat).progress * 100)}%)
                        </div>
                    </div>
                ` : ''}
                
                ${isUnlocked ? `
                    <div style="margin-top: 20px; text-align: center;">
                        <button id="equip-hat" style="background: ${isEquipped ? '#666' : (isOwned ? '#8b4513' : '#555')}; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: ${(isEquipped || !isOwned) ? 'default' : 'pointer'}; font-family: inherit;" ${!isOwned ? 'disabled' : ''}>
                            ${isEquipped ? 'ÉQUIPÉ' : 'ÉQUIPER'}
                        </button>
                        ${!isOwned ? '<div style="margin-top:6px; font-size:12px; color:#9ca3af;">Attrape ce chapeau à la surface pour pouvoir l\'équiper.</div>' : ''}
                    </div>
                ` : ''}
            `;
            
            // Gestionnaire pour le bouton d'équipement
            if (isUnlocked && isOwned && !isEquipped) {
                const equipBtn = document.getElementById('equip-hat');
                if (equipBtn) {
                    equipBtn.addEventListener('click', () => {
                        // Équiper le chapeau
                        if (gameState.progress.hats) {
                            gameState.progress.hats.equipped = hat.emoji;
                            saveProgress();
                            showHatDetails(emoji); // Rafraîchir l'affichage
                            showToast(`Chapeau ${hat.name} équipé !`, 'success');
                        }
                    });
                }
            }
        }

        // Fonction pour afficher les détails d'une espèce
        function showSpeciesDetails(emoji) {
            const detailsDiv = document.getElementById('species-details');
            if (!detailsDiv) return;
            
            const fishType = allTypes.find(f => f.emoji === emoji);
            if (!fishType) return;
            
            const isUnlocked = unlocked.has(emoji);
            
            // Calculer les valeurs min/max pour l'affichage
            const minPoints = fishType.basePoints;
            const maxPoints = fishType.basePoints + fishType.pointsPerSize * fishType.sizeRange[1];
            const minWeight = Math.max(0.1, (fishType.sizeRange[0] / 10)).toFixed(1);
            const maxWeight = Math.max(0.1, (fishType.sizeRange[1] / 10)).toFixed(1);
            
            // Couleur de rareté
            const rarityColor = {
                'commun': '#8b4513',
                'rare': '#4169e1',
                'épique': '#9932cc',
                'légendaire': '#ffd700',
                'mythique': '#ff4500'
            }[fishType.rarity] || '#8b4513';
            
            // Libellés et descriptions des patterns (6 nouveaux + générique)
            const patternInfoMap = {
                'devant':    { label: 'Devant',    desc: 'Rester DEVANT le poisson (≤20px) pendant 3s.' },
                'derriere':  { label: 'Derrière',  desc: 'Rester DERRIÈRE le poisson (≤20px) pendant 3s.' },
                'au_dessus': { label: 'Au‑dessus', desc: 'Maintenir la souris AU‑DESSUS du poisson (≤20px) pendant 3s.' },
                'au_dessous':{ label: 'Au‑dessous',desc: 'Maintenir la souris AU‑DESSOUS du poisson (≤20px) pendant 3s.' },
                'toucher':   { label: 'Toucher',   desc: 'Garder le curseur SUR le poisson (≤8px) pendant 3s.' },
                'complete':  { label: 'Complete',  desc: 'Couvrir HAUT/BAS/GAUCHE/DROITE autour du poisson en 3s (≤20px).' },
                'any':       { label: 'Any',       desc: 'Aucun pattern spécial requis (léger bonus quelles que soient les positions).' }
            };
            const patternData = patternInfoMap[fishType.baitPattern] || { label: 'Aucun', desc: 'Aucun pattern spécial.' };
            
            detailsDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="font-size: 64px; margin-bottom: 8px;">${isUnlocked ? fishType.emoji : '❔'}</div>
                    <h2 style="margin: 0 0 4px 0; font-size: 24px; color: #8b4513;">${isUnlocked ? fishType.name : '?????'}</h2>
                    <div style="font-size: 14px; color: ${rarityColor}; font-weight: bold; margin-bottom: 4px;">
                        ${isUnlocked ? (fishType.rarity ? fishType.rarity.toUpperCase() : 'COMMUNE') : 'VERROUILLÉE'}
                    </div>
                    ${!isUnlocked ? '<div style="background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 8px;">VERROUILLÉE</div>' : ''}
                </div>
                
                <!-- Informations de base -->
                <div style="background: rgba(139,69,19,0.08); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 12px 0; color: #8b4513; font-size: 16px;">📊 Caractéristiques Physiques</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 13px; line-height: 1.6;">
                        <div><strong>Taille:</strong> ${isUnlocked ? `${fishType.sizeRange[0]}-${fishType.sizeRange[1]} px` : '???'}</div>
                        <div><strong>Vitesse:</strong> ${isUnlocked ? `${fishType.speedRange[0]}-${fishType.speedRange[1]}` : '???'}</div>
                        <div><strong>Poids estimé:</strong> ${isUnlocked ? `${minWeight}-${maxWeight} kg` : '???'}</div>
                        <div><strong>Stamina:</strong> ${isUnlocked ? `${fishType.staminaRange[0]}-${fishType.staminaRange[1]}s` : '???'}</div>
                    </div>
                </div>
                
                <!-- Informations de jeu -->
                <div style="background: rgba(139,69,19,0.08); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 12px 0; color: #8b4513; font-size: 16px;">🎮 Informations de Jeu</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 13px; line-height: 1.6;">
                        <div><strong>Points de base:</strong> ${isUnlocked ? fishType.basePoints : '???'}</div>
                        <div><strong>Points totaux:</strong> ${isUnlocked ? `${minPoints}-${maxPoints}` : '???'}</div>
                        <div><strong>Profondeur:</strong> ${isUnlocked ? `${Math.round(fishType.depthRange[0] * 100)}-${Math.round(fishType.depthRange[1] * 100)}%` : '???'}</div>
                        <div><strong>Affinité morsure:</strong> ${isUnlocked ? `${Math.round(fishType.biteAffinityRange[0] * 100)}-${Math.round(fishType.biteAffinityRange[1] * 100)}%` : '???'}</div>
                    </div>
                </div>
                
                <!-- Comportement -->
                <div style="background: rgba(139,69,19,0.08); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 12px 0; color: #8b4513; font-size: 16px;">🐟 Comportement</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; font-size: 13px; line-height: 1.6;">
                        <div><strong>Agressivité:</strong> ${isUnlocked ? `${Math.round(fishType.aggressionRange[0] * 100)}-${Math.round(fishType.aggressionRange[1] * 100)}%` : '???'}</div>
                        <div><strong>Durée flash:</strong> ${isUnlocked ? `${fishType.flashDuration[0]}-${fishType.flashDuration[1]}s` : '???'}</div>
                        <div><strong>Pattern préféré:</strong> <span style="color: #b8860b; font-weight: bold;">${isUnlocked ? patternData.label : '???'}</span></div>
                        <div><strong>Difficulté:</strong> ${isUnlocked ? (fishType.staminaRange[1] > 150 ? 'Difficile' : fishType.staminaRange[1] > 100 ? 'Moyen' : 'Facile') : '???'}</div>
                    </div>
                </div>
                
                <!-- Description du pattern -->
                <div style="background: rgba(139,69,19,0.08); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 12px 0; color: #8b4513; font-size: 16px;">🎯 Technique de Capture</h3>
                    <div style="font-size: 14px; line-height: 1.5; color: #666;">
                        <strong>Pattern de leurre:</strong> ${isUnlocked ? `<span style="color:#b8860b; font-weight:700;">${patternData.label}</span> — ${patternData.desc} <span style="opacity:.8">(Règle: ≤20px pendant 3s; correspondance ⇒ ≥90% de morsure)</span>` : 'Informations verrouillées - Débloquez cette espèce pour voir les détails'}
                    </div>
                </div>
                
                <!-- Conseils de capture -->
                <div style="background: rgba(139,69,19,0.08); padding: 15px; border-radius: 8px;">
                    <h3 style="margin: 0 0 12px 0; color: #8b4513; font-size: 16px;">💡 Conseils de Capture</h3>
                    <div style="font-size: 13px; line-height: 1.5; color: #666;">
                        ${isUnlocked ? getCaptureTips(fishType) : 'Informations verrouillées - Débloquez cette espèce pour voir les conseils de capture'}
                    </div>
                </div>
                
                ${!isUnlocked ? `
                    <!-- Informations de déblocage -->
                    <div style="background: rgba(255,107,107,0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #ff6b6b; margin-top: 15px;">
                        <h3 style="margin: 0 0 12px 0; color: #ff6b6b; font-size: 16px;">🔓 Comment Débloquer</h3>
                        <div style="font-size: 14px; line-height: 1.5; color: #666;">
                            ${getSpeciesUnlockInfo(emoji).condition}
                        </div>
                        <div style="background: rgba(0,0,0,0.1); border-radius: 4px; height: 8px; margin: 8px 0;">
                            <div style="background: #ff6b6b; height: 100%; border-radius: 4px; width: ${Math.round(getSpeciesUnlockInfo(emoji).progress * 100)}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 12px; color: #666;">
                            ${getSpeciesUnlockInfo(emoji).current}/${getSpeciesUnlockInfo(emoji).target} (${Math.round(getSpeciesUnlockInfo(emoji).progress * 100)}%)
                        </div>
                    </div>
                ` : ''}
            `;
        }
        
        // Fonction pour générer des conseils de capture basés sur les caractéristiques
        function getCaptureTips(fishType) {
            const tips = [];
            
            // Conseils basés sur la profondeur
            if (fishType.depthRange[0] < 0.3) {
                tips.push("• Cherchez cette espèce près de la surface");
            } else if (fishType.depthRange[1] > 0.8) {
                tips.push("• Cette espèce vit en profondeur, descendez votre ligne");
            } else {
                tips.push("• Trouvez cette espèce dans les zones moyennes");
            }
            
            // Conseils basés sur l'agressivité
            if (fishType.aggressionRange[1] > 0.6) {
                tips.push("• Espèce agressive - soyez patient et ne bougez pas trop");
            } else if (fishType.aggressionRange[0] < 0.2) {
                tips.push("• Espèce timide - approchez-vous doucement");
            }
            
            // Conseils basés sur la stamina
            if (fishType.staminaRange[1] > 150) {
                tips.push("• Combat long attendu - préparez-vous à une lutte intense");
            } else if (fishType.staminaRange[1] < 50) {
                tips.push("• Capture rapide - cette espèce se fatigue vite");
            }
            
            // Conseils basés sur le nouveau pattern
            const p = fishType.baitPattern;
            if (p === 'devant') tips.push("• Placez et gardez le curseur DEVANT le poisson (≤20px) pendant 3s");
            else if (p === 'derriere') tips.push("• Restez DERRIÈRE le poisson (≤20px) pendant 3s en le suivant calmement");
            else if (p === 'au_dessus') tips.push("• Maintenez la souris AU‑DESSUS du poisson (≤20px) pendant 3s");
            else if (p === 'au_dessous') tips.push("• Maintenez la souris AU‑DESSOUS du poisson (≤20px) pendant 3s");
            else if (p === 'toucher') tips.push("• Posez le curseur SUR le poisson (≤8px) pendant 3s pour le déclencher");
            else if (p === 'complete') tips.push("• Balayez HAUT, BAS, GAUCHE, DROITE autour du poisson en 3s (≤20px)");
            else if (p === 'any') tips.push("• Aucun pattern spécial requis (léger bonus quelle que soit la position)");
            
            // Conseils basés sur la rareté
            if (fishType.rarity === 'légendaire' || fishType.rarity === 'mythique') {
                tips.push("• Espèce rare - soyez patient et attentif aux signes");
            }
            
            return tips.length > 0 ? tips.join('<br>') : "• Aucun conseil spécial pour cette espèce";
        }
        
        // Gestionnaires d'événements pour les onglets
        const speciesTab = document.getElementById('tab-species');
        const patternsTab = document.getElementById('tab-patterns');
        const hatsTab = document.getElementById('tab-hats');
        const achievementsTab = document.getElementById('tab-achievements');
        
        if (speciesTab) {
            speciesTab.addEventListener('click', () => switchGuideTab('species'));
        }
        if (patternsTab) {
            patternsTab.addEventListener('click', () => switchGuideTab('patterns'));
        }
        
        if (hatsTab) {
            hatsTab.addEventListener('click', () => switchGuideTab('hats'));
        }
        
        if (achievementsTab) {
            achievementsTab.addEventListener('click', () => switchGuideTab('achievements'));
        }

        // Bouton de fermeture
        const closeBtn = document.getElementById('guide-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                guideWindow.remove();
            });
        }
        
        // Fermer en cliquant à l'extérieur
        guideWindow.addEventListener('click', (e) => {
            if (e.target === guideWindow) {
                guideWindow.remove();
            }
        });
        
        // Générer la liste des espèces
        generateSpeciesList();
    }

    // Met à jour en continu l'angle de la canne pour une animation fluide
    function updateRodAngle(deltaSec) {
        // Angle de repos par défaut (légèrement vers le haut-gauche)
        let target = -0.45;
        const sway = Math.sin(performance.now() * 0.003) * 0.03; // petite oscillation

        if (gameState.isPreviewingCast) {
            // Plus on charge, plus la canne se plie vers l'arrière
            const powerNorm = Math.min(1, Math.max(0, gameState.castPower / gameState.maxCastPower));
            // Entre -0.35 rad (faible) et -1.15 rad (fort)
            target = -0.35 - powerNorm * 0.8;
        } else if (gameState.isCasting && gameState.isReeling) {
            // En rembobinage, angle un peu plus bas
            target = -0.55;
        }

        // Interpolation douce
        const lerpRate = 8 * deltaSec; // vitesse d'approche
        gameState.rodAngle = (1 - lerpRate) * (gameState.rodAngle || -0.45) + lerpRate * target + sway;
    }

    // Vérifier et appliquer les déblocages selon la progression actuelle
    function checkUnlocks() {
        if (!gameState.progress) return;
        const prev = new Set(gameState.progress.unlockedSpecies || []);
        const set = new Set(gameState.progress.unlockedSpecies || []);
        const st = gameState.progress.stats || {};
        // Règles:
        // 🪼 Méduse: surfaceHoldCumulative >= 350s
        if (st.surfaceHoldCumulative >= 350 && !set.has('🪼')) set.add('🪼');
        // 🐠 Tropical: totalCasts >= 70
        if (st.totalCasts >= 70 && !set.has('🐠')) set.add('🐠');
        // 🐡 Ballon: totalCatches >= 100
        if (st.totalCatches >= 100 && !set.has('🐡')) set.add('🐡');
        // 🦑 Calmar: deepVisits >= 450
        if (st.deepVisits >= 450 && !set.has('🦑')) set.add('🦑');
        // 🐋 Baleine: poids cumulé >= 1000 kg
        if ((st.cumulativeWeightKg || 0) >= 1000 && !set.has('🐋')) set.add('🐋');
        // 🧜‍♀️ Sirène: score cumulé >= 50 000
        if ((st.cumulativeScore || 0) >= 50000 && !set.has('🧜‍♀️')) set.add('🧜‍♀️');
        // Nouvelles espèces
        if ((gameState.caughtFish?.length||0) >= 50) set.add('👾');
        if ((st.midHoldCumulative || 0) >= 120) set.add('🐊');
        if ((st.totalPlayTime || 0) >= 3600) set.add('🐢');
        if (st.totalCasts >= 200) set.add('🦭');
        if ((st.lineBreaks || 0) >= 20) set.add('🦈');
        if ((st.totalBites || 0) >= 100) set.add('🐬');
        if ((st.bestNoBreakStreak || 0) >= 10) set.add('🐉');
        if ((st.bottomHoldCumulative || 0) >= 300) set.add('🦞');
        if ((st.stillDetections || 0) >= 500) set.add('🦀');
        if ((st.hoverDetections || 0) >= 100) set.add('🧜‍♂️');
        if ((st.movingDetections || 0) >= 200) set.add('🧜');
        if ((st.bootsCaught || 0) >= 50) set.add('🥾');
        // 🐙 déjà géré par bottomHold40
        if (gameState.progress.achievements?.bottomHold40 && !set.has('🐙')) set.add('🐙');
        
        // Déterminer les nouveautés et afficher une notification
        const newly = Array.from(set).filter(e => !prev.has(e));
        if (newly.length) {
            newly.forEach(emo => {
                const t = GAME_CONFIG.fish.types.find(x=>x.emoji===emo);
                showUnlockToast(emo, t?.name || 'Nouvelle espèce');
            });
        }
        
        gameState.progress.unlockedSpecies = Array.from(set);
        saveProgress();
        
        // Débloquer les chapeaux selon les stats
        const hats = gameState.progress.hats || { unlocked:[], owned:[], equipped:null };
        const unlockIf = (cond, emoji) => { 
            if (cond && !hats.unlocked.includes(emoji)) { 
                hats.unlocked.push(emoji); 
                showUnlockToast(emoji, 'Chapeau débloqué');
                // Faire spawner le chapeau à la surface
                spawnFloatingHat(emoji);
            } 
        };
        unlockIf((st.cumulativeScore||0) >= 5000, '🎩');
        unlockIf((st.totalCasts||0) >= 300, '🎓');
        unlockIf((st.surfaceHoldCumulative||0) >= 600, '👒');
        unlockIf((st.totalCatches||0) >= 200, '🐭');
        unlockIf((st.deepVisits||0) >= 1000, '🐹');
        unlockIf((st.cumulativeWeightKg||0) >= 2000, '🐼');
        // Nouveaux chapeaux
        unlockIf((st.lineBreaks||0) >= 10, '🤡');
        unlockIf((st.sirensCaught||0) >= 50, '👹');
        unlockIf((st.hoverDetections||0) >= 1000, '👺');
        unlockIf((st.perfectScores||0) >= 1, '🤖');
        unlockIf((st.fastCatches||0) >= 1, '💩');
        unlockIf((st.octopusCaught||0) >= 100, '🦊');
        unlockIf((st.whalesCaught||0) >= 20, '🐯');
        unlockIf((st.currentNoBreakStreak||0) >= 50, '🐺');
        unlockIf((st.shrimpCaught||0) >= 500, '🐱');
        unlockIf((st.cumulativeScore||0) >= 100000, '🦁');
        unlockIf((st.pufferCaught||0) >= 200, '🐷');
        unlockIf((st.bottomHoldCumulative||0) >= 1000, '🐻‍❄️');
        unlockIf((st.squidCaught||0) >= 100, '🐻');
        unlockIf((st.tropicalCaught||0) >= 1000, '🐰');
        unlockIf((st.jellyfishCaught||0) >= 50, '🐸');
        unlockIf((st.dragonsCaught||0) >= 10, '🐲');
        unlockIf((st.lineBreaks||0) >= 25, '🧨');
        unlockIf((st.perfectScores||0) >= 10, '✨');
        unlockIf((st.nightCatches||0) >= 100, '🎃');
        unlockIf((st.stillDetections||0) >= 500, '👓');
        unlockIf((st.dayPlayTime||0) >= 1000, '🕶️');
        unlockIf((st.mermenCaught||0) >= 50, '🪮');
        unlockIf((st.totalCatches||0) >= 300, '🧢');
        unlockIf((st.highTensionTime||0) >= 1000, '🪖');
        unlockIf((st.staminaAliveCatches||0) >= 250, '⛑️');
        
        // Débloquer les achievements
        const achievements = gameState.progress.achievements || {};
        const unlockAchievement = (key, condition, name) => {
            if (condition && !achievements[key]) {
                achievements[key] = true;
                showUnlockToast('🏆', `Achievement débloqué: ${name}`);
            }
        };
        
        unlockAchievement('firstCatch', (st.totalCatches || 0) >= 1, 'Première Capture');
        unlockAchievement('tenCatches', (st.totalCatches || 0) >= 10, 'Débutant');
        unlockAchievement('fiftyCatches', (st.totalCatches || 0) >= 50, 'Pêcheur Expérimenté');
        unlockAchievement('hundredCatches', (st.totalCatches || 0) >= 100, 'Maître Pêcheur');
        unlockAchievement('firstCast', (st.totalCasts || 0) >= 1, 'Premier Lancer');
        unlockAchievement('tenCasts', (st.totalCasts || 0) >= 10, 'Lanceur');
        unlockAchievement('hundredCasts', (st.totalCasts || 0) >= 100, 'Lanceur Expert');
        unlockAchievement('firstDeep', (st.deepVisits || 0) >= 1, 'Explorateur');
        unlockAchievement('firstSurface', (st.surfaceHoldCumulative || 0) >= 10, 'Surface');
        unlockAchievement('firstPerfect', (st.perfectScores || 0) >= 1, 'Parfait');
        
        // Mettre à jour les listes du guide en temps réel
        if (typeof updateGuideLists === 'function') {
            updateGuideLists();
        }

        // Déblocage du slider de poids d'hameçon à 100 kg cumulés
        const features = gameState.progress.features || (gameState.progress.features = { hookWeightUnlocked:false, hookWeightFactor:1 });
        if (!features.hookWeightUnlocked && (st.cumulativeWeightKg || 0) >= 100) {
            features.hookWeightUnlocked = true;
            showUnlockToast('🪝', "Réglage de l'hameçon débloqué");
            saveProgress();
            // Afficher immédiatement si l'UI est présente
            const wrap = document.getElementById('hook-weight-slider-wrap');
            if (wrap) wrap.style.display = 'inline-flex';
        }
    }

    function showUnlockToast(emoji, name) {
        const container = document.querySelector('.fishing-game-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'fishing-unlock-toast';
        toast.style.cssText = `
            position:absolute; left:50%; top:16%; transform:translateX(-50%);
            background: linear-gradient(135deg, #10b981, #059669);
            color:#fff; padding:10px 16px; border-radius:10px; border:1px solid rgba(255,255,255,.25);
            box-shadow:0 10px 30px rgba(0,0,0,.35); z-index:10010; display:flex; align-items:center; gap:10px;
            font-weight:800; letter-spacing:.3px; opacity:0; transition:opacity .2s, transform .2s; transform-origin:top center;
        `;
        toast.innerHTML = `<span style="font-size:22px;">${emoji}</span><span>Espèce débloquée: ${name}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(()=>{ toast.style.opacity='1'; toast.style.transform='translateX(-50%) scale(1.02)'; });
        setTimeout(()=>{ toast.style.opacity='0'; toast.style.transform='translateX(-50%) scale(0.98)'; }, 2200);
        setTimeout(()=>{ toast.remove(); }, 2600);
    }

    // Affiche une notification (toast) lors du changement de saison
    function showSeasonToast(seasonName) {
        const container = document.querySelector('.fishing-game-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'fishing-season-toast';
        toast.style.cssText = `
            position:absolute; left:50%; top:30%; transform:translateX(-50%);
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color:#fff; padding:14px 20px; border-radius:12px; border:2px solid rgba(255,255,255,.3);
            box-shadow:0 12px 35px rgba(0,0,0,.4); z-index:10020; display:flex; align-items:center; gap:12px;
            font-weight:900; font-size:18px; letter-spacing:.5px; opacity:0; transition:opacity .3s, transform .3s; transform-origin:center;
        `;
        toast.innerHTML = `<span>Nouvelle saison :</span><span style="font-size:24px;">${seasonName}</span>`;
        container.appendChild(toast);
        requestAnimationFrame(()=>{ toast.style.opacity='1'; toast.style.transform='translateX(-50%) scale(1.05)'; });
        setTimeout(()=>{ toast.style.opacity='0'; toast.style.transform='translateX(-50%) scale(0.95)'; }, 3000);
        setTimeout(()=>{ toast.remove(); }, 3500);
    }

    // Affiche une notification (toast) lors d'une transformation magique
    function showTransformationToast(originalEmoji, transformedEmoji) {
        const container = document.querySelector('.fishing-game-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'fishing-transformation-toast';
        toast.style.cssText = `
            position:absolute; left:50%; top:40%; transform:translateX(-50%);
            background: linear-gradient(135deg, #ec4899, #8b5cf6, #06b6d4);
            color:#fff; padding:12px 18px; border-radius:10px; border:2px solid rgba(255,255,255,.4);
            box-shadow:0 12px 40px rgba(236,72,153,.5); z-index:10021; display:flex; align-items:center; gap:10px;
            font-weight:900; font-size:16px; letter-spacing:.4px; opacity:0; 
            transition:opacity .4s, transform .4s; transform-origin:center;
            animation: pulse 0.6s ease-in-out;
        `;
        toast.innerHTML = `
            <span style="font-size:28px;">${originalEmoji}</span>
            <span style="font-size:20px;">✨→✨</span>
            <span style="font-size:28px;">${transformedEmoji}</span>
            <span style="font-size:14px; margin-left:4px;">Transformation !</span>
        `;
        container.appendChild(toast);
        requestAnimationFrame(()=>{ 
            toast.style.opacity='1'; 
            toast.style.transform='translateX(-50%) scale(1.1) rotate(5deg)'; 
        });
        setTimeout(()=>{ 
            toast.style.opacity='0'; 
            toast.style.transform='translateX(-50%) scale(0.9) rotate(-5deg)'; 
        }, 2500);
        setTimeout(()=>{ toast.remove(); }, 3000);
    }

})();
