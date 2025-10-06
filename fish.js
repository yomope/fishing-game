// Catalogue des poissons: stats, pattern, bio, conditions de déblocage
// Format extensible pour ajout simplifié de nouvelles espèces.

window.FISH_CATALOG = {
    // Liste complète des espèces (copiée de la version précédente)
    types: [
        { 
            emoji: '🦐', name: 'Crevette',
            sizeRange: [8, 12], speedRange: [1.5, 2.2], 
            pointsPerSize: 0.8, basePoints: 5,
            staminaRange: [30, 50], depthRange: [0.05, 0.25],
            biteAffinityRange: [0.5, 0.7], aggressionRange: [0.3, 0.5],
            flashDuration: [1.5, 2.0],
            baitPattern: 'devant',
            spawnWeight: 1.0,
            unlockText: 'Toujours disponible',
            unlock: { type: 'always' }
        },
        { 
            emoji: '🐠', name: 'Poisson Tropical',
            sizeRange: [14, 18], speedRange: [1.2, 1.8], 
            pointsPerSize: 1.2, basePoints: 10,
            staminaRange: [50, 70], depthRange: [0.15, 0.35],
            biteAffinityRange: [0.4, 0.6], aggressionRange: [0.4, 0.6],
            flashDuration: [1.8, 2.2],
            baitPattern: 'au_dessus',
            spawnWeight: 0.9,
            unlockText: 'Toujours disponible',
            unlock: { type: 'always' }
        },
        { 
            emoji: '🐡', name: 'Poisson Ballon',
            sizeRange: [16, 22], speedRange: [0.8, 1.3], 
            pointsPerSize: 1.5, basePoints: 15,
            staminaRange: [60, 90], depthRange: [0.2, 0.45],
            biteAffinityRange: [0.3, 0.5], aggressionRange: [0.2, 0.4],
            flashDuration: [2.0, 2.5],
            baitPattern: 'au_dessus',
            spawnWeight: 0.8,
            unlockText: 'Toujours disponible',
            unlock: { type: 'always' }
        },
        { 
            emoji: '🐟', name: 'Poisson Commun',
            sizeRange: [12, 16], speedRange: [1.0, 1.6], 
            pointsPerSize: 1.0, basePoints: 8,
            staminaRange: [40, 60], depthRange: [0.0, 0.5],
            biteAffinityRange: [0.45, 0.65], aggressionRange: [0.5, 0.7],
            flashDuration: [1.5, 2.0],
            baitPattern: 'any',
            spawnWeight: 1.0,
            unlockText: 'Toujours disponible',
            unlock: { type: 'always' }
        },
        { 
            emoji: '🦑', name: 'Calmar',
            sizeRange: [18, 26], speedRange: [1.8, 2.5], 
            pointsPerSize: 1.8, basePoints: 20,
            staminaRange: [70, 100], depthRange: [0.25, 0.5],
            biteAffinityRange: [0.25, 0.45], aggressionRange: [0.6, 0.8],
            flashDuration: [1.2, 1.8],
            baitPattern: 'au_dessous',
            spawnWeight: 0.7,
            unlockText: 'Toujours disponible',
            unlock: { type: 'always' }
        },
        { 
            emoji: '🐙', name: 'Pieuvre',
            sizeRange: [20, 30], speedRange: [0.9, 1.5], 
            pointsPerSize: 2.0, basePoints: 25,
            staminaRange: [90, 130], depthRange: [0.3, 0.55],
            biteAffinityRange: [0.2, 0.4], aggressionRange: [0.3, 0.5],
            flashDuration: [2.2, 2.8],
            baitPattern: 'derriere',
            spawnWeight: 0.6,
            unlockText: 'Toujours disponible',
            unlock: { type: 'always' }
        },
        { 
            emoji: '🐋', name: 'Baleine',
            sizeRange: [35, 50], speedRange: [0.4, 0.8], 
            pointsPerSize: 3.5, basePoints: 50,
            staminaRange: [150, 220], depthRange: [0.6, 0.85],
            biteAffinityRange: [0.15, 0.3], aggressionRange: [0.1, 0.3],
            flashDuration: [2.5, 3.5],
            baitPattern: 'complete',
            spawnWeight: 0.15,
            unlockText: 'Toujours disponible',
            unlock: { type: 'always' }
        },
        { 
            emoji: '🪼', name: 'Méduse',
            sizeRange: [10, 16], speedRange: [0.5, 0.9], 
            pointsPerSize: 0.5, basePoints: 3,
            staminaRange: [20, 40], depthRange: [0.05, 0.2],
            biteAffinityRange: [0.6, 0.8], aggressionRange: [0.2, 0.3],
            flashDuration: [1.0, 1.5],
            baitPattern: 'moving',
            spawnWeight: 1.1,
            unlockText: 'Toujours disponible',
            unlock: { type: 'always' }
        },
        { 
            emoji: '🧜‍♀️', name: 'Sirène',
            sizeRange: [22, 30], speedRange: [1.0, 1.6], 
            pointsPerSize: 4.0, basePoints: 80,
            staminaRange: [120, 180], depthRange: [0.35, 0.65],
            biteAffinityRange: [0.1, 0.25], aggressionRange: [0.4, 0.7],
            flashDuration: [2.8, 3.5],
            baitPattern: 'complete',
            spawnWeight: 0.25,
            unlockText: 'Débloqué par captures totales',
            unlock: { type: 'total_catches_at_least', value: 240 }
        },
        { emoji:'👾', name:'Créature Mystérieuse',
             sizeRange:[18,28], speedRange:[1.6,2.4],
             pointsPerSize:2.8, basePoints:60,
             staminaRange:[80,140], depthRange:[0.2,0.8],
             biteAffinityRange:[0.2,0.4], aggressionRange:[0.5,0.8], 
            flashDuration:[1.5,2.2], baitPattern:'active', spawnWeight: 0.35, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 180 } },
             
        { 
            emoji: '🐊', name: 'Crocodile Marin',
            sizeRange: [26,38], speedRange: [1.2,2.0],
            pointsPerSize: 3.0, basePoints: 70,
            staminaRange: [110,170], depthRange: [0.1,0.4],
            biteAffinityRange: [0.2,0.35], aggressionRange: [0.6,0.9],
            flashDuration: [1.2,1.8], baitPattern: 'devant', spawnWeight: 0.3, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 360 }
        },
        { 
            emoji: '🐢', name: 'Tortue de Mer',
            sizeRange: [20,34], speedRange: [0.6,1.0],
            pointsPerSize: 2.2, basePoints: 40,
            staminaRange: [130,180], depthRange: [0.45,0.75],
            biteAffinityRange: [0.25,0.45], aggressionRange: [0.1,0.3],
            flashDuration: [2.2,3.0], baitPattern: 'still', spawnWeight: 0.5, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 210 }
        },
        { 
            emoji: '🦭', name: 'Phoque Curieux',
            sizeRange: [18,26], speedRange: [1.4,2.0],
            pointsPerSize: 2.4, basePoints: 45,
            staminaRange: [80,120], depthRange: [0.25,0.55],
            biteAffinityRange: [0.35,0.6], aggressionRange: [0.2,0.5],
            flashDuration: [1.6,2.4], baitPattern: 'hover', spawnWeight: 0.7, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 150 }
        },
        { 
            emoji: '🦈', name: 'Requin',
            sizeRange: [28,44], speedRange: [2.0,3.0],
            pointsPerSize: 3.6, basePoints: 90,
            staminaRange: [160,220], depthRange: [0.55,0.8],
            biteAffinityRange: [0.15,0.35], aggressionRange: [0.7,0.95],
            flashDuration: [1.0,1.6], baitPattern: 'moving', spawnWeight: 0.2, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 420 }
        },
        { 
            emoji: '🐬', name: 'Dauphin',
            sizeRange: [22,32], speedRange: [1.8,2.6],
            pointsPerSize: 3.2, basePoints: 65,
            staminaRange: [100,150], depthRange: [0.35,0.6],
            biteAffinityRange: [0.4,0.7], aggressionRange: [0.2,0.5],
            flashDuration: [1.4,2.0], baitPattern: 'active', spawnWeight: 0.5, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 240 }
        },
        { 
            emoji: '🐉', name: 'Dragon Marin',
            sizeRange: [40,60], speedRange: [1.2,2.0],
            pointsPerSize: 4.5, basePoints: 120,
            staminaRange: [200,280], depthRange: [0.85,0.98],
            biteAffinityRange: [0.1,0.25], aggressionRange: [0.5,0.8],
            flashDuration: [2.5,3.5], baitPattern: 'deep', spawnWeight: 0.05, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 1500 }
        },
        { 
            emoji: '🦞', name: 'Homard Géant',
            sizeRange: [18,28], speedRange: [0.8,1.2],
            pointsPerSize: 2.6, basePoints: 55,
            staminaRange: [120,170], depthRange: [0.5,0.8],
            biteAffinityRange: [0.2,0.4], aggressionRange: [0.3,0.6],
            flashDuration: [1.8,2.6], baitPattern: 'bottom', spawnWeight: 0.45, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 200 }
        },
        { 
            emoji: '🦀', name: 'Crabe Colossal',
            sizeRange: [16,26], speedRange: [0.9,1.3],
            pointsPerSize: 2.4, basePoints: 48,
            staminaRange: [110,160], depthRange: [0.45,1.0],
            biteAffinityRange: [0.25,0.45], aggressionRange: [0.2,0.5],
            flashDuration: [1.8,2.8], baitPattern: 'still', spawnWeight: 0.5, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 170 }
        },
        { 
            emoji: '🧜‍♂️', name: 'Triton',
            sizeRange: [24,34], speedRange: [1.4,2.2],
            pointsPerSize: 3.8, basePoints: 95,
            staminaRange: [140,200], depthRange: [0.5,0.8],
            biteAffinityRange: [0.15,0.35], aggressionRange: [0.4,0.7],
            flashDuration: [2.0,3.0], baitPattern: 'hover', spawnWeight: 0.25, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 300 }
        },
        { 
            emoji: '🧜', name: 'Néréide',
            sizeRange: [20,30], speedRange: [1.2,1.8],
            pointsPerSize: 3.5, basePoints: 85,
            staminaRange: [120,180], depthRange: [0.35,0.7],
            biteAffinityRange: [0.2,0.4], aggressionRange: [0.3,0.6],
            flashDuration: [2.0,3.0], baitPattern: 'hover', spawnWeight: 0.35, unlockText: 'Débloqué par captures totales', unlock: { type: 'total_catches_at_least', value: 220 }
        },
        { 
            emoji: '🥾', name: 'Botte Perdue',
            sizeRange: [14,20], speedRange: [0.2,0.6],
            pointsPerSize: 0.2, basePoints: 0,
            staminaRange: [10,20], depthRange: [0.6,1.0],
            biteAffinityRange: [0.0,0.1], aggressionRange: [0,0.1],
            flashDuration: [0.5,1.0], baitPattern: 'bottom', spawnWeight: 0.8, unlockText: 'Toujours disponible', unlock: { type: 'always' }
        }
    ]
};


