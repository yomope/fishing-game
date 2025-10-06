// Catalogue des chapeaux: perks, conditions de déblocage, bio
// Format extensible pour ajout simplifié de nouveaux chapeaux.

window.HAT_CATALOG = {
    // Liste complète des chapeaux (copiée de la version précédente)
    hats: [
        { emoji:'🎩', name:'Haut-de-forme', rarity:'rare', unlockText:"Atteindre 5 000 pts cumulés", unlock:{ type:'cumulative_score_at_least', value:5000 }, key:'score5000', perks:{ pointsMultiplier:1.2 } },
        { emoji:'🎓', name:'Diplôme', rarity:'rare', unlockText:"Effectuer 300 lancers", unlock:{ type:'casts_at_least', value:300 }, key:'casts300', perks:{ castAccuracyBonus:0.15 } },
        { emoji:'👒', name:'Capeline', rarity:'commun', unlockText:"Rester 600s en surface (cumulé)", unlock:{ type:'surface_seconds_at_least', value:600 }, key:'surface600', perks:{ surfaceReelSpeedMultiplier:1.3 } },
        { emoji:'🐭', name:'Oreilles Souris', rarity:'épique', unlockText:"Capturer 200 poissons", unlock:{ type:'catches_at_least', value:200 }, key:'catches200', perks:{ biteChanceMultiplier:1.25 } },
        { emoji:'🐹', name:'Oreilles Hamster', rarity:'épique', unlockText:"Visiter le fond 1000 fois", unlock:{ type:'deep_visits_at_least', value:1000 }, key:'deep1000', perks:{ deepTensionResistance:1.4 } },
        { emoji:'🐼', name:'Oreilles Panda', rarity:'légendaire', unlockText:"Poids cumulé 2 000 kg", unlock:{ type:'cumulative_weight_kg_at_least', value:2000 }, key:'kg2000', perks:{ weightMultiplier:1.5 } },
        { emoji:'🤡', name:'Masque de Clown', rarity:'commun', unlockText:"Casser 10 lignes", unlock:{ type:'line_breaks_at_least', value:10 }, key:'breaks10', perks:{ fishAggressionMultiplier:2.0 } },
        { emoji:'👹', name:'Masque Oni', rarity:'rare', unlockText:"Capturer 50 sirènes", unlock:{ type:'catches_species_at_least', emoji:'🧜‍♀️', value:50 }, key:'sirens50', perks:{ forceSirenSpawn:true } },
        { emoji:'👺', name:'Masque Kitsune', rarity:'rare', unlockText:"1000 détections de pattern hover", unlock:{ type:'pattern_detect_at_least', pattern:'hover', value:1000 }, key:'hover1000', perks:{ hoverPatternEffectiveness:1.6 } },
        { emoji:'🤖', name:'Casque Robot', rarity:'épique', unlockText:"Score parfait (300+ sans casser)", unlock:{ type:'perfect_game_score_at_least', value:300 }, key:'perfect300', perks:{ unbreakableLine:true } },
        { emoji:'💩', name:'Chapeau Caca', rarity:'commun', unlockText:"Capturer 5 poissons en 10s", unlock:{ type:'fast_catches_in_time', count:5, seconds:10 }, key:'fast5', perks:{ jellyfishSpawnRate:3.0 } },
        { emoji:'🦊', name:'Masque Renard', rarity:'rare', unlockText:"Capturer 100 poulpes", unlock:{ type:'catches_species_at_least', emoji:'🐙', value:100 }, key:'octopus100', perks:{ stillPatternEffectiveness:1.8 } },
        { emoji:'🐯', name:'Masque Tigre', rarity:'épique', unlockText:"Capturer 20 baleines", unlock:{ type:'catches_species_at_least', emoji:'🐋', value:20 }, key:'whales20', perks:{ whaleWeightBonus:2.5 } },
        { emoji:'🦅', name:'Casque Aigle', rarity:'rare', unlockText:"Capturer 100 poissons à midi", unlock:{ type:'catches_at_time_of_day', period:'noon', value:100 }, key:'noon100', perks:{ surfaceReelSpeedMultiplier:1.25 } },
        { emoji:'🌙', name:'Voile Nocturne', rarity:'rare', unlockText:"Capturer 200 poissons la nuit", unlock:{ type:'catches_at_time_of_day', period:'night', value:200 }, key:'night200', perks:{ nightEffectiveness:1.4 } },
        { emoji:'🌻', name:'Chapeau Tournesol', rarity:'commun', unlockText:"Capturer 200 poissons au lever du soleil", unlock:{ type:'catches_at_time_of_day', period:'dawn', value:200 }, key:'dawn200', perks:{ dawnEffectiveness:1.4 } },
        { emoji:'🥀', name:'Chapeau Rose Fanée', rarity:'rare', unlockText:"Capturer 50 poissons en automne", unlock:{ type:'catches_in_season_at_least', season:'autumn', value:50 }, key:'autumn50', perks:{ autumnEffectiveness:1.7 } },
        { emoji:'🌴', name:'Chapeau Palmier', rarity:'rare', unlockText:"Capturer 100 poissons en été", unlock:{ type:'catches_in_season_at_least', season:'summer', value:100 }, key:'summer100', perks:{ summerEffectiveness:1.6 } },
        { emoji:'🪹', name:'Chapeau Nid', rarity:'commun', unlockText:"Capturer 300 poissons", unlock:{ type:'catches_at_least', value:300 }, key:'catches300', perks:{ reelSpeedMultiplier:1.2 } },
        { emoji:'🏳️‍🌈', name:'Chapeau Arc-en-ciel', rarity:'légendaire', unlockText:"Capturer 1 de chaque espèce", unlock:{ type:'all_species_caught' }, key:'allSpecies', perks:{ pointsMultiplier:2.0, rainbowColors:true } },
        { emoji:'🏳️‍⚧️', name:'Chapeau Trans', rarity:'rare', unlockText:"Capturer 100 poissons", unlock:{ type:'catches_at_least', value:100 }, key:'catches100', perks:{ transformChanceMultiplier:1.3 } },
        { emoji:'🏴‍☠️', name:'Chapeau Pirate', rarity:'épique', unlockText:"Capturer 50 trésors", unlock:{ type:'treasures_at_least', value:50 }, key:'treasure50', perks:{ treasureChance:3.0 } },
        { emoji:'🚩', name:'Chapeau Drapeau', rarity:'commun', unlockText:"Capturer 100 poissons", unlock:{ type:'catches_at_least', value:100 }, key:'catches100', perks:{ pointsMultiplier:1.2 } },
        { emoji:'🗻', name:'Chapeau Montagne', rarity:'légendaire', unlockText:"Capturer 1000 poissons", unlock:{ type:'catches_at_least', value:1000 }, key:'catches1000', perks:{ weightMultiplier:2.5 } },
        { emoji:'🔥', name:'Chapeau Feu', rarity:'rare', unlockText:"Capturer 200 poissons en été", unlock:{ type:'catches_in_season_at_least', season:'summer', value:200 }, key:'summer200', perks:{ summerEffectiveness:1.8 } },
        { emoji:'❤️‍🔥', name:'Chapeau Cœur en Feu', rarity:'légendaire', unlockText:"Capturer 500 poissons", unlock:{ type:'catches_at_least', value:500 }, key:'catches500', perks:{ biteChanceMultiplier:2.0 } },
        { emoji:'💢', name:'Chapeau Colère', rarity:'rare', unlockText:"Casser 50 lignes", unlock:{ type:'line_breaks_at_least', value:50 }, key:'breaks50', perks:{ fishAggressionMultiplier:2.5 } },
        { emoji:'💤', name:'Chapeau Sommeil', rarity:'commun', unlockText:"Jouer 2000s", unlock:{ type:'play_seconds_at_least', value:2000 }, key:'play2000', perks:{ fishSlowMultiplier:1.5 } },
        { emoji:'💫', name:'Chapeau Étoile Filante', rarity:'légendaire', unlockText:"Score parfait 25 fois", unlock:{ type:'perfect_games_at_least', value:25 }, key:'perfect25', perks:{ mythicSpawnRate:5.0 } },
        { emoji:'💬', name:'Chapeau Bulle', rarity:'rare', unlockText:"Capturer 200 poissons transformés", unlock:{ type:'transformed_catches_at_least', value:200 }, key:'transform200', perks:{ socialEffectiveness:1.6 } }
    ]
};


