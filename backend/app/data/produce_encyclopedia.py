"""
Comprehensive Produce Encyclopedia & Spoilage Progression Knowledge Base
Project: J26-IT-333 (AI + IoT-Based Smart Restaurant Management System)
Component 3: AI-Based Multi-Modal Food Spoilage Prediction & Quality Assessment

Authoritative physical, optical, surface-texture, and bio-pathological profiles
for all 47 produce items (20 Fruits and 27 Vegetables) in Sri Lankan and global food service.
"""

from typing import Dict, Any, List, Optional

PRODUCE_ENCYCLOPEDIA: Dict[str, Dict[str, Any]] = {
    # =========================================================================
    # 20 FRUITS
    # =========================================================================
    "Embul Banana (Ambul Kesel)": {
        "produce_name": "Embul Banana (Ambul Kesel)",
        "short_name": "Banana",
        "scientific_name": "Musa acuminata (Embul)",
        "variety": "Embul / Seeni Kesel",
        "icon": "🍌",
        "category": "Fruits",
        "origin": "Embilipitiya / Gampaha, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Smooth Epidermal Peel",
            "tactile_feel": "Waxy cuticle, slightly ribbed longitudinal angles, firm peel transitioning to pliable.",
            "roughness_score": 2.1,
            "gloss_level": "Moderate Waxy Sheen",
            "edge_density_pct": [3.0, 7.5],
            "laplacian_var_range": [8.0, 24.0]
        },
        "color": {
            "primary_hue": "Carotenoid Bright Yellow",
            "secondary_hue": "Chlorophyll Green tips / Crown pedicel",
            "hsv_range": "H: 18-35 (Yellow), H: 36-70 (Green tip)",
            "baseline_ratios": {"green_pct": [5.0, 25.0], "yellow_pct": [55.0, 85.0], "red_pct": [0.0, 4.0]},
            "saturation_range": [65, 95],
            "description": "Emerald green unripe maturing to vivid bright yellow with subtle brownish senescent freckling."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Harvest Fresh / Firm (Grade A)",
                "visual_cues": "Crisp green shoulders, solid yellow peel, intact angular ridges, zero skin lesions.",
                "firmness": "Firm (11-14 N)",
                "color_cue": "Bright yellow with lime-green tips",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Peak Ripe / Prime Service (Grade B)",
                "visual_cues": "Uniform golden yellow peel, minor fine brown sugar spots (senescence freckles), high aromatics.",
                "firmness": "Yielding / Tender (6-9 N)",
                "color_cue": "Pure golden yellow with fine pin-point speckles",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Overripe / Urgent Use (~75% Spoilage)",
                "visual_cues": "Extensive brown melanized blotches (>35% peel area), pulp softening, crown pedicel mold onset.",
                "firmness": "Soft / Spongy (3-5 N)",
                "color_cue": "Mottled brown-yellow peel",
                "chef_action": "Urgent culinary action: process immediately into banana bread, smoothie purees, or desserts within 12-24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Quarantine Mandate",
                "visual_cues": "Black necrotic skin collapse, white mycelial crown rot, liquefied interior, fermenting alcoholic odor.",
                "common_pathogens": "Colletotrichum musae (Anthracnose), Fusarium crown rot",
                "firmness": "Collapsed (< 2 N)",
                "chef_action": "Immediate bio-quarantine and bin disposal. Sanitize storage rack.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 12.5, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 168.0, "ambient_shelf_hours": 72.0}
    },

    "Karthakolomban Mango": {
        "produce_name": "Karthakolomban Mango",
        "short_name": "Mango",
        "scientific_name": "Mangifera indica (Karthakolomban)",
        "variety": "Karthakolomban / Willard",
        "icon": "🥭",
        "category": "Fruits",
        "origin": "Jaffna / Vavuniya, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Smooth Waxy Exocarp",
            "tactile_feel": "Smooth taut skin with delicate natural bloom, lenticels visible as pale micro-specks.",
            "roughness_score": 2.4,
            "gloss_level": "Waxy Sheen",
            "edge_density_pct": [3.2, 8.0],
            "laplacian_var_range": [10.0, 30.0]
        },
        "color": {
            "primary_hue": "Golden Yellow Carotenoid",
            "secondary_hue": "Coral Red Anthocyanin Blush & Olive Green Shoulder",
            "hsv_range": "H: 18-35 (Yellow), H: 0-14 (Red blush), H: 38-75 (Green shoulder)",
            "baseline_ratios": {"green_pct": [2.0, 20.0], "yellow_pct": [40.0, 75.0], "red_pct": [10.0, 35.0]},
            "saturation_range": [50, 92],
            "description": "Multi-tone sunset chromatic profile: golden yellow body with characteristic reddish-apricot blush."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Harvest Fresh / Firm (Grade A)",
                "visual_cues": "Taut exocarp, olive-green shoulder merging with rich yellow, resilient flesh under pressure.",
                "firmness": "Crisp / Turgid (12-16 N)",
                "color_cue": "Dual-tone olive green and golden amber",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Peak Ripe / Prime Service (Grade B)",
                "visual_cues": "Deep sunset gold with prominent crimson blush, fragrant tropical aroma, gentle giving at stem end.",
                "firmness": "Supple / Juicy (6-10 N)",
                "color_cue": "Vibrant golden yellow with ruby blush",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Overripe / Anthracnose Warning (~75% Spoilage)",
                "visual_cues": "Localized dark teardrop spots (early anthracnose), skin wrinkling near pedicel, soft water-soaked zones.",
                "firmness": "Very Soft (2-5 N)",
                "color_cue": "Dull gold with spreading brownish-black lesions",
                "chef_action": "Trim affected peel immediately, flash-freeze flesh for purees, coulis, or mango chutneys within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Quarantine Mandate",
                "visual_cues": "Deep sunken circular lesions with salmon-pink spore masses, internal tissue liquefaction, vinegary odor.",
                "common_pathogens": "Colletotrichum gloeosporioides (Anthracnose), Lasiodiplodia theobromae (Stem-end rot)",
                "firmness": "Liquefied / Collapsed (< 2 N)",
                "chef_action": "Quarantine fruit; spores spread rapidly in ambient air.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 11.5, "optimal_humidity_pct": 88.0, "cold_shelf_hours": 192.0, "ambient_shelf_hours": 84.0}
    },

    "Red Lady Papaya (Rathu Papol)": {
        "produce_name": "Red Lady Papaya (Rathu Papol)",
        "short_name": "Papaya",
        "scientific_name": "Carica papaya (Red Lady)",
        "variety": "Red Lady Hybrid",
        "icon": "🍈",
        "category": "Fruits",
        "origin": "Anuradhapura / Polonnaruwa, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Smooth Thin Exocarp",
            "tactile_feel": "Delicate elastic skin, easily indented when ripe, slight waxy glaze.",
            "roughness_score": 1.9,
            "gloss_level": "Soft Satin Sheen",
            "edge_density_pct": [2.5, 6.0],
            "laplacian_var_range": [7.0, 20.0]
        },
        "color": {
            "primary_hue": "Deep Amber Orange",
            "secondary_hue": "Green Longitudinal Rib Grooves",
            "hsv_range": "H: 15-32 (Orange-Yellow), H: 35-70 (Green grooves)",
            "baseline_ratios": {"green_pct": [5.0, 30.0], "yellow_pct": [50.0, 80.0], "red_pct": [5.0, 15.0]},
            "saturation_range": [60, 95],
            "description": "Gradual progression from emerald green striations to radiant reddish-orange flesh visible through thin peel."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Harvest Fresh / Turning (Grade A)",
                "visual_cues": "Firm skin, 3-4 yellow stripes along longitudinal ribs, firm to hand touch.",
                "firmness": "Firm (10-14 N)",
                "color_cue": "Yellowing rib stripes on green backdrop",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Peak Table Ripe (Grade B)",
                "visual_cues": "80-100% luminous orange-yellow surface, sweet musky aroma, slight indentation under gentle pressure.",
                "firmness": "Tender / Velvety (5-8 N)",
                "color_cue": "Deep reddish-orange exocarp",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Overripe / Softening (~75% Spoilage)",
                "visual_cues": "Circular water-soaked depressions, surface wrinkling, soft spots near blossom end.",
                "firmness": "Very Soft (2-4 N)",
                "color_cue": "Dull orange with brown circular halos",
                "chef_action": "Dice immediately for breakfast juice bar or culinary marmalade. Complete use within 18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Quarantine Mandate",
                "visual_cues": "Extensive sunken black lesions with white/pink fungal mycelium, internal cavity decay, foul odor.",
                "common_pathogens": "Colletotrichum dematium, Phomopsis rot, Rhizopus stolonifer",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately into compost bin. Sanitize storage shelf.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 11.0, "optimal_humidity_pct": 87.0, "cold_shelf_hours": 168.0, "ambient_shelf_hours": 60.0}
    },

    "Mauritius Pineapple (Gampaha Annasi)": {
        "produce_name": "Mauritius Pineapple (Gampaha Annasi)",
        "short_name": "Pineapple",
        "scientific_name": "Ananas comosus (Mauritius)",
        "variety": "Mauritius Gampaha",
        "icon": "🍍",
        "category": "Fruits",
        "origin": "Gampaha / Mirigama, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Rough Hexagonal Eyes (Multiple Fruit)",
            "tactile_feel": "Hard fibrous rind formed by fused spiral fruitlets, stiff pointed bracts and crown spines.",
            "roughness_score": 8.7,
            "gloss_level": "Matte / Micro-textured",
            "edge_density_pct": [14.0, 28.0],
            "laplacian_var_range": [85.0, 220.0]
        },
        "color": {
            "primary_hue": "Golden Carotenoid Yellow",
            "secondary_hue": "Olive Green Crown & Inter-eye Grooves",
            "hsv_range": "H: 20-36 (Golden eye center), H: 40-75 (Bract margins)",
            "baseline_ratios": {"green_pct": [15.0, 45.0], "yellow_pct": [35.0, 70.0], "red_pct": [0.0, 5.0]},
            "saturation_range": [50, 88],
            "description": "Base-to-apex ripening gradient: golden yellow fruitlet centers with greenish-brown eye borders."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Harvest / Table Grade (Grade A)",
                "visual_cues": "Turgid green crown leaves, lower 30-50% eyes vibrant yellow, firm dry basal stem.",
                "firmness": "Rigid / Fibrous (18-24 N)",
                "color_cue": "Golden-yellow base graduating to green apex",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Prime Sweetness (Grade B)",
                "visual_cues": "Golden yellow extending to top 75% eyes, intensely fragrant aromatic bouquet, crown leaf detaches with light pull.",
                "firmness": "Resilient (12-16 N)",
                "color_cue": "Vibrant golden yellow exocarp",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Overripe / Fermentation Onset (~75% Spoilage)",
                "visual_cues": "Eyes turning dark reddish-brown, weeping juice at base, yeasty alcoholic aroma, crown leaves drying.",
                "firmness": "Softening Eyes (6-10 N)",
                "color_cue": "Dull brownish-bronze skin",
                "chef_action": "Core and slice for immediate grilling, cocktail syrups, or chutneys. Use within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Black Rot Mandate",
                "visual_cues": "Black soft rot (Thielaviopsis), liquid exudate dripping, sour fermented odor, white mold mycelium in crevices.",
                "common_pathogens": "Ceratocystis paradoxa (Thielaviopsis black rot), Penicillium funiculosum",
                "firmness": "Collapsed Base (< 4 N)",
                "chef_action": "Discard completely. Acidic fermented exudate contaminates nearby crates.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 10.0, "optimal_humidity_pct": 88.0, "cold_shelf_hours": 216.0, "ambient_shelf_hours": 96.0}
    },

    "Sri Lankan Avocado (Butter Fruit)": {
        "produce_name": "Sri Lankan Avocado (Butter Fruit)",
        "short_name": "Avocado",
        "scientific_name": "Persea americana (Local Butter)",
        "variety": "Kandy Butter Fruit / Pollock",
        "icon": "🥑",
        "category": "Fruits",
        "origin": "Kandy / Matale, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Pebbled / Leathery Periderm",
            "tactile_feel": "Subtly pebbled, pliable leathery skin yielding uniformly to gentle palm pressure.",
            "roughness_score": 5.4,
            "gloss_level": "Semi-Gloss Waxy",
            "edge_density_pct": [6.5, 14.0],
            "laplacian_var_range": [30.0, 75.0]
        },
        "color": {
            "primary_hue": "Forest Green to Dark Purple-Black",
            "secondary_hue": "Olive Undertones",
            "hsv_range": "H: 38-80 (Green stage), H: 140-175 (Matured dark purple-black)",
            "baseline_ratios": {"green_pct": [20.0, 75.0], "yellow_pct": [5.0, 20.0], "red_pct": [5.0, 25.0]},
            "saturation_range": [35, 75],
            "description": "Lustrous emerald green in unripened state shifting to deep olive-purple or darkened aubergine when ripe."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Firm Unripe (Grade A)",
                "visual_cues": "Lustrous forest green skin, smooth/fine pebbled texture, completely firm, button stem firmly attached.",
                "firmness": "Hard / Unyielding (16-22 N)",
                "color_cue": "Deep olive or forest green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Peak Eating Quality (Grade B)",
                "visual_cues": "Dark green to brownish-purple skin, yields gently to thumb pressure without denting, button stem green underneath.",
                "firmness": "Creamy / Supple (5-8 N)",
                "color_cue": "Dark purple-green exocarp",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Overripe / Vascular Browning (~75% Spoilage)",
                "visual_cues": "Deep wrinkles, hollow feel between skin and pulp, dark indentations, stem button dry and black.",
                "firmness": "Spongy / Collapsing (2-4 N)",
                "color_cue": "Dull brownish-black exocarp",
                "chef_action": "Inspect pulp: blend usable green portions into guacamole or dressings immediately. Use within 6h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Rancid Decomposition",
                "visual_cues": "Extensive grey/black rot, rancid oily odor, white fungal patches at stem end, stringy brown pulp.",
                "common_pathogens": "Colletotrichum gloeosporioides (Anthracnose), Lasiodiplodia theobromae",
                "firmness": "Mushy (< 2 N)",
                "chef_action": "Discard immediately; lipid oxidation causes off-flavors.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 8.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 180.0, "ambient_shelf_hours": 60.0}
    },

    "Fresh Apple": {
        "produce_name": "Fresh Apple",
        "short_name": "Apple",
        "scientific_name": "Malus domestica",
        "variety": "Fuji / Royal Gala",
        "icon": "🍎",
        "category": "Fruits",
        "origin": "Commercial Cold Chain Import",
        "climacteric": True,
        "surface": {
            "texture_type": "Smooth Glossy Cuticle Wax",
            "tactile_feel": "Firm, slick natural or food-grade wax layer, prominent lenticels, rigid resistance to compression.",
            "roughness_score": 1.4,
            "gloss_level": "High Specular Sheen",
            "edge_density_pct": [1.5, 4.5],
            "laplacian_var_range": [4.0, 15.0]
        },
        "color": {
            "primary_hue": "Anthocyanin Ruby Red",
            "secondary_hue": "Creamy Yellow Streaks / Green Basin",
            "hsv_range": "H: 0-12 and 165-180 (Red), H: 20-35 (Yellow stripes)",
            "baseline_ratios": {"green_pct": [0.0, 8.0], "yellow_pct": [10.0, 30.0], "red_pct": [50.0, 88.0]},
            "saturation_range": [60, 96],
            "description": "Vivid crimson red wash or striping over a light yellow-green ground cover."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Harvest / Premium (Grade A)",
                "visual_cues": "Lustrous reflective cuticle, crisp taut skin, green intact stem, high sonic resonance when tapped.",
                "firmness": "Very Crisp (14-18 N)",
                "color_cue": "Luminous crimson with bright yellow lenticels",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Prime Culinary Service (Grade B)",
                "visual_cues": "Rich red coloration, aromatic sweet smell, crisp bite, firm unyielding structure.",
                "firmness": "Crisp / Firm (10-14 N)",
                "color_cue": "Uniform deep red blush",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Senescent Mealy / Surface Scald (~75% Spoilage)",
                "visual_cues": "Skin wrinkling (loss of turgor), dull brownish scald patches, mealy spongy texture when squeezed.",
                "firmness": "Mealy / Soft (4-7 N)",
                "color_cue": "Dull brownish-red with wrinkled epidermis",
                "chef_action": "Bake into tarts, process into spiced apple compote or cider sauce within 24-48h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Blue Mold Mandate",
                "visual_cues": "Circular soft brown lesions with blue-green spore tufts (Penicillium), musty earthy odor.",
                "common_pathogens": "Penicillium expansum (Blue mold), Botrytis cinerea (Grey mold)",
                "firmness": "Soft Rot (< 3 N)",
                "chef_action": "Discard immediately; patulin mycotoxin risk from Penicillium expansum.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 3.0, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 720.0, "ambient_shelf_hours": 168.0}
    },

    "Fresh Strawberry": {
        "produce_name": "Fresh Strawberry",
        "short_name": "Strawberry",
        "scientific_name": "Fragaria × ananassa",
        "variety": "Nuwara Eliya Ambepussa",
        "icon": "🍓",
        "category": "Fruits",
        "origin": "Nuwara Eliya, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Achene-Studded Epidermis",
            "tactile_feel": "Soft fleshy aggregate receptacle studded with yellow-brown dry achenes (true seeds).",
            "roughness_score": 6.8,
            "gloss_level": "Glossy Lacquered Sheen",
            "edge_density_pct": [8.5, 18.0],
            "laplacian_var_range": [45.0, 110.0]
        },
        "color": {
            "primary_hue": "Pelargonidin Scarlet Red",
            "secondary_hue": "Emerald Calyx & Golden Achenes",
            "hsv_range": "H: 0-10 & 168-180 (Red), H: 38-80 (Calyx green)",
            "baseline_ratios": {"green_pct": [2.0, 12.0], "yellow_pct": [0.0, 8.0], "red_pct": [75.0, 95.0]},
            "saturation_range": [70, 98],
            "description": "Lustrous scarlet-to-crimson red flesh complemented by vibrant green fresh calyx leaves."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Harvest / Prime (Grade A)",
                "visual_cues": "Brilliant glossy red gloss, taut skin, fresh upright green calyx, zero juice leakage.",
                "firmness": "Turgid / Plump (6-9 N)",
                "color_cue": "Brilliant lacquered scarlet red",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Sweet Dessert Ripe (Grade B)",
                "visual_cues": "Deep crimson red throughout, fragrant sweet strawberry scent, calyx intact.",
                "firmness": "Tender / Juicy (4-6 N)",
                "color_cue": "Deep rich ruby red",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Softening / Leaking (~75% Spoilage)",
                "visual_cues": "Loss of gloss, skin dulling, slight watery exudate in container bottom, dry brownish calyx.",
                "firmness": "Soft / Bruised (2-3 N)",
                "color_cue": "Dark dull burgundy red",
                "chef_action": "Cook down immediately for coulis, glaze, or strawberry compote within 6-12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Grey Mold Quarantine",
                "visual_cues": "Fluffy grayish-white mycelium covering receptacle (Botrytis), water-soaked collapse.",
                "common_pathogens": "Botrytis cinerea (Grey mold), Rhizopus stolonifer (Leak rot)",
                "firmness": "Liquefied (< 1 N)",
                "chef_action": "Quarantine whole punnet; Botrytis spores spread via air to adjacent berries.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 120.0, "ambient_shelf_hours": 24.0}
    },

    "Orange / Citrus": {
        "produce_name": "Orange / Citrus",
        "short_name": "Orange",
        "scientific_name": "Citrus sinensis",
        "variety": "Bibile Sweet Orange",
        "icon": "🍊",
        "category": "Fruits",
        "origin": "Bibile / Monaragala, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Pebbled Glandular Flavedo",
            "tactile_feel": "Oil gland-pitted pebbled rind (flavedo) lined with spongy white albedo underneath.",
            "roughness_score": 4.8,
            "gloss_level": "Waxy Pebbled Sheen",
            "edge_density_pct": [5.5, 12.0],
            "laplacian_var_range": [25.0, 65.0]
        },
        "color": {
            "primary_hue": "Carotenoid Monochromatic Orange",
            "secondary_hue": "Subtle Green Flavedo Tinges (Tropical degreening)",
            "hsv_range": "H: 10-24 (Vibrant orange)",
            "baseline_ratios": {"green_pct": [0.0, 6.0], "yellow_pct": [5.0, 20.0], "red_pct": [65.0, 90.0]},
            "saturation_range": [70, 96],
            "description": "Monochromatic warm citrus orange with microscopic oil gland pores across the entire surface."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Harvest / Turgid (Grade A)",
                "visual_cues": "Firm, taut glandular rind, bright orange color, oily zest release when scored, heavy fruit weight.",
                "firmness": "Resilient / Firm (12-16 N)",
                "color_cue": "Vibrant uniform citrus orange",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Juicy (Grade B)",
                "visual_cues": "Supple rind yielding slightly to compression, sweet citrus aroma, full juice vesicle development.",
                "firmness": "Supple (8-11 N)",
                "color_cue": "Deep rich orange",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Dehydrated / Peel Softening (~75% Spoilage)",
                "visual_cues": "Spongy soft spots near stem or navel, rind leathery and pitted, dull color, weight loss from drying.",
                "firmness": "Spongy / Soft (4-6 N)",
                "color_cue": "Dull brownish-orange with sunken pores",
                "chef_action": "Squeeze immediately for fresh juice service or zest for citrus marmalade within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Green-Blue Mold Mandate",
                "visual_cues": "White fungal ring expanding into olive-green or blue powdery spore mass (Penicillium digitatum).",
                "common_pathogens": "Penicillium digitatum (Green mold), Penicillium italicum (Blue mold)",
                "firmness": "Soft / Collapsed (< 3 N)",
                "chef_action": "Quarantine citrus crate; penicillium spores disperse rapidly throughout the chamber.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 5.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 360.0, "ambient_shelf_hours": 120.0}
    },

    "Lime / Lemon": {
        "produce_name": "Lime / Lemon",
        "short_name": "Lime",
        "scientific_name": "Citrus aurantifolia",
        "variety": "Monaragala Dehi",
        "icon": "🍋",
        "category": "Fruits",
        "origin": "Monaragala / Polonnaruwa, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Fine Glandular Pebbled Flavedo",
            "tactile_feel": "Tight, thin oily rind with dense aromatic oil glands, very firm spherical shape.",
            "roughness_score": 3.8,
            "gloss_level": "Satin Waxy Sheen",
            "edge_density_pct": [4.0, 9.0],
            "laplacian_var_range": [18.0, 48.0]
        },
        "color": {
            "primary_hue": "Chlorophyll Green to Lemon Yellow",
            "secondary_hue": "Pale Citrine Undertones",
            "hsv_range": "H: 35-75 (Green lime), H: 22-34 (Yellow matured)",
            "baseline_ratios": {"green_pct": [40.0, 90.0], "yellow_pct": [10.0, 45.0], "red_pct": [0.0, 3.0]},
            "saturation_range": [60, 95],
            "description": "Deep glossy lime green in early stages curing to pale yellowish-green with optimal juice content."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Picked / Turgid (Grade A)",
                "visual_cues": "Vibrant emerald green, firm taut skin, high turgor, fragrant zest aroma when scratched.",
                "firmness": "Firm / Rigid (14-18 N)",
                "color_cue": "Lustrous emerald green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Peak Juicing Condition (Grade B)",
                "visual_cues": "Light yellowish-green skin, slightly smoother texture indicating thin rind and high juice volume.",
                "firmness": "Pliable / Elastic (9-13 N)",
                "color_cue": "Light lime-green with golden sheen",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Desiccated / Brown Pitting (~75% Spoilage)",
                "visual_cues": "Rind hardening into dry yellow-brown shell, localized browning spots, loss of internal juice.",
                "firmness": "Hard / Leathery (5-8 N)",
                "color_cue": "Dull yellow-ochre with brown blotches",
                "chef_action": "Express remaining juice for culinary marinades or cordials immediately. Use within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Sour Rot Mandate",
                "visual_cues": "Watery soft rot with fermented vinegar odor or fuzzy blue-green Penicillium spore crust.",
                "common_pathogens": "Geotrichum candidum (Sour rot), Penicillium digitatum",
                "firmness": "Liquefied (< 3 N)",
                "chef_action": "Discard contaminated fruit and wash holding bin with food-grade sanitizing wash.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 9.0, "optimal_humidity_pct": 88.0, "cold_shelf_hours": 420.0, "ambient_shelf_hours": 144.0}
    },

    "Grapes": {
        "produce_name": "Grapes",
        "short_name": "Grapes",
        "scientific_name": "Vitis vinifera",
        "variety": "Jaffna Red Globe / Thomson",
        "icon": "🍇",
        "category": "Fruits",
        "origin": "Jaffna / Import, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Smooth Epidermis with Epicuticular Wax Bloom",
            "tactile_feel": "Spherical berries with delicate powdery white natural bloom, taut elastic skin.",
            "roughness_score": 2.2,
            "gloss_level": "Matte Wax Bloom to Glossy",
            "edge_density_pct": [3.0, 7.5],
            "laplacian_var_range": [12.0, 32.0]
        },
        "color": {
            "primary_hue": "Anthocyanin Deep Ruby / Royal Purple",
            "secondary_hue": "Whitish Epicarp Bloom",
            "hsv_range": "H: 140-175 (Deep purple-red), H: 35-70 (Green varieties)",
            "baseline_ratios": {"green_pct": [2.0, 15.0], "yellow_pct": [2.0, 10.0], "red_pct": [65.0, 92.0]},
            "saturation_range": [50, 90],
            "description": "Luminous burgundy to violet purple coated with velvety silvery-white epicuticular bloom."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Crisp Cluster (Grade A)",
                "visual_cues": "Turgid berries firmly attached to pliable green rachis stems, intact powdery white bloom.",
                "firmness": "Crisp / Taut (8-12 N)",
                "color_cue": "Deep ruby-purple with frosty wax bloom",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Dessert Sweetness (Grade B)",
                "visual_cues": "Plump juicy berries, sweet grape bouquet, berries detach cleanly without wet tears.",
                "firmness": "Juicy / Crisp (6-9 N)",
                "color_cue": "Deep purple exocarp",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Berry Shatter / Stem Browning (~75% Spoilage)",
                "visual_cues": "Rachis stem completely brown and brittle, berries dropping spontaneously (shatter), skin shriveling.",
                "firmness": "Soft / Flaccid (3-5 N)",
                "color_cue": "Dull brownish-purple without bloom",
                "chef_action": "Destem and cook into fruit glaze, grape jelly, or dehydrate for bakery raisins within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Botrytis Nesting Mandate",
                "visual_cues": "Dense grey fungal webbing spreading between berries in cluster ('nesting'), split skins, sour juice.",
                "common_pathogens": "Botrytis cinerea (Grey mold), Aspergillus niger",
                "firmness": "Leaking Mush (< 2 N)",
                "chef_action": "Discard infected bunch immediately; Botrytis spreads by contact across the lug.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.0, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 240.0, "ambient_shelf_hours": 72.0}
    },

    "Watermelon": {
        "produce_name": "Watermelon",
        "short_name": "Watermelon",
        "scientific_name": "Citrullus lanatus",
        "variety": "Thanamalwila Komadu",
        "icon": "🍉",
        "category": "Fruits",
        "origin": "Thanamalwila / Hambantota, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Smooth Thick Exocarp Rind",
            "tactile_feel": "Hard, waxy rigid rind resisting fingernail denting, distinct yellow field ground patch.",
            "roughness_score": 1.6,
            "gloss_level": "Glossy to Semi-Gloss",
            "edge_density_pct": [1.8, 5.0],
            "laplacian_var_range": [6.0, 18.0]
        },
        "color": {
            "primary_hue": "Deep Chlorophyll Green with Light Striations",
            "secondary_hue": "Creamy Yellow Ground Patch",
            "hsv_range": "H: 35-78 (Green rind), H: 20-34 (Yellow field spot)",
            "baseline_ratios": {"green_pct": [65.0, 95.0], "yellow_pct": [5.0, 25.0], "red_pct": [0.0, 4.0]},
            "saturation_range": [45, 88],
            "description": "Alternating forest green and light sage stripes with warm butter-yellow ground contact patch."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Harvest / Turgid (Grade A)",
                "visual_cues": "Firm rigid rind, dull waxy sheen, deep hollow resonant thud when slapped, dry curly tendril.",
                "firmness": "Rigid Rind (25-35 N)",
                "color_cue": "Deep green stripes with golden ground patch",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Crisp Sweetness (Grade B)",
                "visual_cues": "Heavy for size, creamy yellow ground spot, crisp crystalline red interior flesh upon cutting.",
                "firmness": "Crisp Flesh (9-13 N)",
                "color_cue": "Glossy striped rind",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Rind Softening / Hollow Heart (~75% Spoilage)",
                "visual_cues": "Spongy rind yielding to thumb pressure, surface pitting, water-soaked bruised patches.",
                "firmness": "Spongy Rind (8-14 N)",
                "color_cue": "Faded green with yellowing blotches",
                "chef_action": "Cut and inspect flesh: puree healthy sections for bar juice or sorbet immediately within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Rind Rot Mandate",
                "visual_cues": "Sunken lesions weeping gummy fermented fluid, internal flesh liquefaction and sour gas pockets.",
                "common_pathogens": "Colletotrichum orbiculare (Anthracnose), Didymella bryoniae (Gummy stem blight)",
                "firmness": "Collapsed Softness (< 4 N)",
                "chef_action": "Dispose of watermelon; internal fermentation creates pressure buildup.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 11.0, "optimal_humidity_pct": 85.0, "cold_shelf_hours": 336.0, "ambient_shelf_hours": 144.0}
    },

    "Guava (Pera)": {
        "produce_name": "Guava (Pera)",
        "short_name": "Guava",
        "scientific_name": "Psidium guajava",
        "variety": "Bangkok Apple Pera",
        "icon": "🍐",
        "category": "Fruits",
        "origin": "Gampaha / Kalutara, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Slightly Rugose / Bumpy Epidermis",
            "tactile_feel": "Thin edible peel with subtle surface undulations, prominent crown calyx at blossom end.",
            "roughness_score": 3.6,
            "gloss_level": "Soft Satin Sheen",
            "edge_density_pct": [4.0, 9.5],
            "laplacian_var_range": [16.0, 42.0]
        },
        "color": {
            "primary_hue": "Light Yellow-Green to Pale Chartreuse",
            "secondary_hue": "Pinkish Blush or White undertones",
            "hsv_range": "H: 32-68 (Light green to yellow-green)",
            "baseline_ratios": {"green_pct": [40.0, 80.0], "yellow_pct": [15.0, 45.0], "red_pct": [0.0, 8.0]},
            "saturation_range": [40, 80],
            "description": "Chartreuse apple green maturing to luminous yellowish-green with intense tropical aroma."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Green Harvest (Grade A)",
                "visual_cues": "Crisp taut skin, bright pale green color, crunchy apple-like texture under hand pressure.",
                "firmness": "Very Crisp (14-20 N)",
                "color_cue": "Bright chartreuse green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Table Ripe (Grade B)",
                "visual_cues": "Skin lightens to yellowish-green, powerful sweet guava fragrance, flesh yields gently to bite.",
                "firmness": "Supple / Tender (7-11 N)",
                "color_cue": "Pale yellow-green with waxy sheen",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Overripe / Brown Speckling (~75% Spoilage)",
                "visual_cues": "Dark brown necrotic freckles merging into blotches, flesh becoming overly soft and grainy.",
                "firmness": "Soft / Spongy (3-6 N)",
                "color_cue": "Yellow-ochre with dark brown lesions",
                "chef_action": "Strain seeds and simmer into guava paste, jelly, or fruit punch within 12-18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Anthracnose Breakdown",
                "visual_cues": "Sunken circular dark brown spots weeping sticky exudate, white/salmon fungal spore layers.",
                "common_pathogens": "Colletotrichum gloeosporioides, Pestalotiopsis psidii",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately; fungal decay ruins surrounding aroma.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 9.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 192.0, "ambient_shelf_hours": 72.0}
    },

    "Pomegranate (Delum)": {
        "produce_name": "Pomegranate (Delum)",
        "short_name": "Pomegranate",
        "scientific_name": "Punica granatum",
        "variety": "Kalpitiya Red Delum",
        "icon": "🫐",
        "category": "Fruits",
        "origin": "Kalpitiya / Mannar, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Hard Leathery Periderm",
            "tactile_feel": "Tough, rigid leathery husk resisting pressure, crown calyx intact, angular flat facets.",
            "roughness_score": 3.2,
            "gloss_level": "Semi-Gloss Leathery",
            "edge_density_pct": [3.5, 8.0],
            "laplacian_var_range": [14.0, 36.0]
        },
        "color": {
            "primary_hue": "Deep Crimson to Russet Red",
            "secondary_hue": "Tawny Yellow & Bronze Speckles",
            "hsv_range": "H: 0-14 & 165-180 (Crimson), H: 18-32 (Bronze-yellow)",
            "baseline_ratios": {"green_pct": [0.0, 6.0], "yellow_pct": [15.0, 40.0], "red_pct": [50.0, 80.0]},
            "saturation_range": [50, 90],
            "description": "Warm crimson to brownish-ruby red leathery husk with natural bronze russet marbling."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Harvest / Heavy (Grade A)",
                "visual_cues": "Taut leathery husk, heavy in hand (high juice content), rigid crown calyx, clear metallic tap sound.",
                "firmness": "Rigid Husk (20-30 N)",
                "color_cue": "Deep crimson-bronze rind",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Prime Aril Sweetness (Grade B)",
                "visual_cues": "Slight flattening of sides (plump internal arils pressing outward), rich red rind coloration.",
                "firmness": "Firm / Solid (16-24 N)",
                "color_cue": "Lustrous ruby-bronze",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Husk Hardening / Crown Mold (~75% Spoilage)",
                "visual_cues": "Husk drying into hard brittle shell, surface discoloration, dry brown powdery mold in calyx cup.",
                "firmness": "Dry Brittle Shell (10-15 N)",
                "color_cue": "Dull brownish-russet with darkened crown",
                "chef_action": "Crack open immediately: extract sound ruby arils for salad garnish or freeze arils. Use within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Heart Rot Mandate",
                "visual_cues": "Husk soft and discolored, internal black rot (Aspergillus niger) turning arils into black dust.",
                "common_pathogens": "Aspergillus niger (Black heart rot), Botrytis cinerea",
                "firmness": "Softening Husk (< 5 N)",
                "chef_action": "Discard immediately; internal heart rot cannot be saved.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 6.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 480.0, "ambient_shelf_hours": 168.0}
    },

    "Passion Fruit": {
        "produce_name": "Passion Fruit",
        "short_name": "Passion Fruit",
        "scientific_name": "Passiflora edulis",
        "variety": "Bandarawela Purple",
        "icon": "🍈",
        "category": "Fruits",
        "origin": "Bandarawela / Nuwara Eliya, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Smooth to Deeply Wrinkled Pericarp",
            "tactile_feel": "Smooth hard spherical shell when harvested, becoming progressively dimpled and wrinkled with optimal sugar accumulation.",
            "roughness_score": 4.5,
            "gloss_level": "Semi-Gloss maturing to Matte Wrinkled",
            "edge_density_pct": [5.0, 15.0],
            "laplacian_var_range": [22.0, 68.0]
        },
        "color": {
            "primary_hue": "Deep Plum Purple / Aubergine",
            "secondary_hue": "Fine White Stipples",
            "hsv_range": "H: 140-175 (Deep purple-magenta)",
            "baseline_ratios": {"green_pct": [0.0, 10.0], "yellow_pct": [2.0, 10.0], "red_pct": [60.0, 90.0]},
            "saturation_range": [40, 85],
            "description": "Rich dark violet-purple shell flecked with minute natural pale lenticel speckles."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Smooth Unripe / High Acid (Grade A)",
                "visual_cues": "Completely smooth plum-purple shell, heavy in hand, high acidity, firm rigid shell.",
                "firmness": "Hard Shell (18-25 N)",
                "color_cue": "Smooth taut deep purple",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Dimpled / Peak Flavor (Grade B)",
                "visual_cues": "Lightly to moderately wrinkled surface, concentrated aromatic nectar, peak balance of sweetness and acidity.",
                "firmness": "Pliable Wrinkled Shell (10-15 N)",
                "color_cue": "Dimpled rich purple",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Severe Shriveling / Desiccation (~75% Spoilage)",
                "visual_cues": "Extremely light in weight, hollow feeling, shell brittle and paper-thin, dark mold dots forming.",
                "firmness": "Brittle / Collapsible (4-8 N)",
                "color_cue": "Dull brownish-purple with excessive shriveling",
                "chef_action": "Scoop pulp immediately: freeze into passion fruit coulis cubes or cocktail bases within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Shell Rot Mandate",
                "visual_cues": "Fungal rot penetrating shell, fermented alcoholic pulp leaking, grey mold covering indentations.",
                "common_pathogens": "Alternaria passiflorae (Brown spot), Fusarium oxysporum",
                "firmness": "Collapsed Husk (< 3 N)",
                "chef_action": "Discard completely. Fermented pulp unusable.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 10.0, "optimal_humidity_pct": 88.0, "cold_shelf_hours": 240.0, "ambient_shelf_hours": 96.0}
    },

    "Dragon Fruit": {
        "produce_name": "Dragon Fruit",
        "short_name": "Dragon Fruit",
        "scientific_name": "Selenicereus undatus",
        "variety": "Red Flesh Pitaya",
        "icon": "🐉",
        "category": "Fruits",
        "origin": "Kurunegala / Puttalam, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Fleshy Foliar Bract Scales",
            "tactile_feel": "Smooth waxy peel adorned with prominent tapering green leafy scales (bracts).",
            "roughness_score": 6.2,
            "gloss_level": "Waxy Satin Sheen",
            "edge_density_pct": [7.0, 16.0],
            "laplacian_var_range": [35.0, 85.0]
        },
        "color": {
            "primary_hue": "Betalain Neon Magenta / Hot Pink",
            "secondary_hue": "Lime Green Bract Scale Tips",
            "hsv_range": "H: 155-178 (Hot pink/magenta), H: 38-75 (Green bract tips)",
            "baseline_ratios": {"green_pct": [10.0, 30.0], "yellow_pct": [0.0, 8.0], "red_pct": [60.0, 85.0]},
            "saturation_range": [65, 98],
            "description": "Luminous electric magenta-pink skin with contrasting lime-green leafy scale projections."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Harvest / Turgid Bracts (Grade A)",
                "visual_cues": "Vivid glowing magenta skin, crisp turgid green bract tips, firm body resisting thumb pressure.",
                "firmness": "Firm / Turgid (12-16 N)",
                "color_cue": "Neon pink with crisp green scales",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Prime Table Quality (Grade B)",
                "visual_cues": "Full pink color development, bract tips slight yellowing, sweet fragrant juicy flesh interior.",
                "firmness": "Supple (8-11 N)",
                "color_cue": "Deep hot pink with softening bracts",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Bract Browning / Softening (~75% Spoilage)",
                "visual_cues": "Bract tips completely brown and dry, stem end showing water-soaked soft rot, skin dulling.",
                "firmness": "Soft / Spongy (4-6 N)",
                "color_cue": "Dull dark magenta with brown dried scales",
                "chef_action": "Cube flesh immediately for smoothie bowls, sorbets, or culinary fruit platters within 18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Anthracnose Rot Mandate",
                "visual_cues": "Black sunken necrotic spots on skin, yellow/orange fungal sporulation, watery internal collapse.",
                "common_pathogens": "Colletotrichum truncatum, Bipolaris cactivora",
                "firmness": "Mushy (< 3 N)",
                "chef_action": "Discard immediately; fungal rot spreads into central pulp.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 7.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 288.0, "ambient_shelf_hours": 96.0}
    },

    "Jackfruit / Kos / Varaka": {
        "produce_name": "Jackfruit / Kos / Varaka",
        "short_name": "Jackfruit",
        "scientific_name": "Artocarpus heterophyllus",
        "variety": "Honey Varaka",
        "icon": "🍈",
        "category": "Fruits",
        "origin": "Kurunegala / Gampaha, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Dense Pyramidal Spines (Syncarp)",
            "tactile_feel": "Heavily studded with short, conical, hexagonal sharp spines covering an extremely tough syncarp rind.",
            "roughness_score": 9.4,
            "gloss_level": "Matte / Micro-spiked",
            "edge_density_pct": [18.0, 32.0],
            "laplacian_var_range": [120.0, 280.0]
        },
        "color": {
            "primary_hue": "Dull Olive Green to Golden Brown",
            "secondary_hue": "Yellowish Inter-spine Valleys",
            "hsv_range": "H: 35-72 (Green spines), H: 20-34 (Golden ripe valleys)",
            "baseline_ratios": {"green_pct": [30.0, 70.0], "yellow_pct": [25.0, 60.0], "red_pct": [0.0, 10.0]},
            "saturation_range": [40, 80],
            "description": "Emerald to olive-green spiked rind shifting to warm golden-brown with flattening spine tips upon ripening."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Green Crisp (Kos Stage) (Grade A)",
                "visual_cues": "Tightly packed sharp green spines, white sticky latex when scratched, rigid unyielding rind.",
                "firmness": "Rigid / Hard (28-40 N)",
                "color_cue": "Deep olive green with sharp spine tips",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Honey Varaka Ripe (Grade B)",
                "visual_cues": "Spines flatten and widen apart, rind yields to palm pressure, penetrating honey-sweet aroma, dull hollow sound.",
                "firmness": "Yielding (12-18 N)",
                "color_cue": "Golden-yellowish brown exocarp",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Overripe / Latex Fermentation (~75% Spoilage)",
                "visual_cues": "Dark brown rind blotches, spines soft and wet, pungent overly-sweet fermented aroma, juice leaking.",
                "firmness": "Soft / Collapsing Spines (6-10 N)",
                "color_cue": "Dark brownish-black with weeping seams",
                "chef_action": "Cut immediately: salvage sweet yellow aril bulbs for puddings, curry, or drying within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Rhizopus Soft Rot",
                "visual_cues": "Black soft rot covering whole quadrants, whisker-like black sporangia mold, foul rotting smell.",
                "common_pathogens": "Rhizopus artocarpi (Soft rot), Aspergillus niger",
                "firmness": "Collapsed Pulp (< 4 N)",
                "chef_action": "Quarantine outside prep area; massive spore emission and foul odor.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 12.0, "optimal_humidity_pct": 88.0, "cold_shelf_hours": 168.0, "ambient_shelf_hours": 60.0}
    },

    "Fresh Pear": {
        "produce_name": "Fresh Pear",
        "short_name": "Pear",
        "scientific_name": "Pyrus communis",
        "variety": "Packham / D'Anjou",
        "icon": "🍐",
        "category": "Fruits",
        "origin": "Commercial Cold Chain Import",
        "climacteric": True,
        "surface": {
            "texture_type": "Smooth Epidermis with Subtle Russeting",
            "tactile_feel": "Pyriform shape, smooth skin with fine corky lenticels, slight waxy sheen.",
            "roughness_score": 1.8,
            "gloss_level": "Soft Satin Waxy",
            "edge_density_pct": [2.0, 5.5],
            "laplacian_var_range": [6.0, 18.0]
        },
        "color": {
            "primary_hue": "Chartreuse Green to Pale Lemon Yellow",
            "secondary_hue": "Light Russet Stippling / Warm Blush",
            "hsv_range": "H: 30-65 (Green to yellow-green)",
            "baseline_ratios": {"green_pct": [35.0, 75.0], "yellow_pct": [25.0, 60.0], "red_pct": [0.0, 8.0]},
            "saturation_range": [45, 85],
            "description": "Cool jade green changing to creamy butter-yellow as starches convert to sugars."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Firm Crisp (Grade A)",
                "visual_cues": "Taut jade-green skin, completely firm neck, clean intact stem, high resistance to indentation.",
                "firmness": "Firm (14-18 N)",
                "color_cue": "Uniform jade-green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Melting Sweetness (Grade B)",
                "visual_cues": "Light golden-yellow cast, stem end yields gently to thumb pressure ('check the neck'), fragrant floral aroma.",
                "firmness": "Melting / Supple (5-8 N)",
                "color_cue": "Pale butter yellow with light russeting",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Core Breakdown / Browning (~75% Spoilage)",
                "visual_cues": "Soft mushy neck, dark translucent water-soaked surface spots, internal browning around core.",
                "firmness": "Soft / Mealy (2-4 N)",
                "color_cue": "Dull yellow-brown with dark bruises",
                "chef_action": "Peel and poach in spiced wine or puree for pear tarts/sauces within 18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Blue Mold & Brown Rot",
                "visual_cues": "Rapid circular brown soft rot with blue-green spore cushions, sour fermented collapse.",
                "common_pathogens": "Penicillium expansum, Monilinia fructigena (Brown rot)",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately; patulin risk and rapid contamination of fruit tray.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 360.0, "ambient_shelf_hours": 96.0}
    },

    "Plum": {
        "produce_name": "Plum",
        "short_name": "Plum",
        "scientific_name": "Prunus domestica",
        "variety": "Black Amber / Victoria",
        "icon": "🫐",
        "category": "Fruits",
        "origin": "Import / Upcountry, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Smooth Glabrous Skin with Waxy Bloom",
            "tactile_feel": "Delicate thin skin covered in silvery-white epicuticular bloom, shallow longitudinal suture line.",
            "roughness_score": 1.9,
            "gloss_level": "Matte Powdery Bloom to High Gloss",
            "edge_density_pct": [2.2, 5.8],
            "laplacian_var_range": [8.0, 22.0]
        },
        "color": {
            "primary_hue": "Deep Midnight Purple / Magenta",
            "secondary_hue": "Whitish Wax Bloom & Amber Undertones",
            "hsv_range": "H: 145-175 (Dark violet-red), H: 0-12 (Burgundy blush)",
            "baseline_ratios": {"green_pct": [0.0, 5.0], "yellow_pct": [2.0, 15.0], "red_pct": [70.0, 92.0]},
            "saturation_range": [50, 92],
            "description": "Deep midnight violet to dark burgundy purple enveloped in a frosted powdery-white wax veil."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Firm Crisp (Grade A)",
                "visual_cues": "Taut plum skin completely covered with intact frosted wax bloom, firm along the suture line.",
                "firmness": "Firm / Taut (11-15 N)",
                "color_cue": "Frosted midnight purple",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Succulent Ripe (Grade B)",
                "visual_cues": "Deep velvety purple, bloom partially polished, flesh gives smoothly to slight pressure, sweet aroma.",
                "firmness": "Juicy / Tender (5-8 N)",
                "color_cue": "Lustrous deep violet-red",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Skin Wrinkling / Leaking (~75% Spoilage)",
                "visual_cues": "Skin wrinkling near stem indentation, very soft squishy feel, juice weeping from micro-cracks.",
                "firmness": "Very Soft (2-4 N)",
                "color_cue": "Dull dark brownish-purple",
                "chef_action": "Stew into plum coulis, fruit compote, or dessert reduction immediately within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Brown Rot Monilinia",
                "visual_cues": "Rapidly spreading circular brown rot covered by concentric tan/buff spore tufts (Monilinia).",
                "common_pathogens": "Monilinia fructicola (Brown rot), Rhizopus stolonifer",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately; fungal conidia spread aggressively to all stone fruits.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.0, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 240.0, "ambient_shelf_hours": 60.0}
    },

    "Kiwi Fruit": {
        "produce_name": "Kiwi Fruit",
        "short_name": "Kiwi",
        "scientific_name": "Actinidia deliciosa",
        "variety": "Hayward Green",
        "icon": "🥝",
        "category": "Fruits",
        "origin": "Commercial Cold Chain Import",
        "climacteric": True,
        "surface": {
            "texture_type": "Densely Hirsute / Hairy Pubescent Pericarp",
            "tactile_feel": "Fibrous, fuzzy brown skin densely covered with stiff short trichomes (hairs).",
            "roughness_score": 7.4,
            "gloss_level": "Completely Matte Fibrous",
            "edge_density_pct": [12.0, 24.0],
            "laplacian_var_range": [70.0, 160.0]
        },
        "color": {
            "primary_hue": "Tawny Fibrous Brown",
            "secondary_hue": "Olive Green Skin Undertones",
            "hsv_range": "H: 15-30 (Warm brown), S: 30-65, V: 30-60",
            "baseline_ratios": {"green_pct": [5.0, 20.0], "yellow_pct": [25.0, 55.0], "red_pct": [10.0, 30.0]},
            "saturation_range": [30, 65],
            "description": "Uniform earthy russet-brown hairy skin masking vibrant emerald-green internal flesh."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Firm Harvest (Grade A)",
                "visual_cues": "Taut cylindrical body, dry uniform fuzzy hairs, firm and unyielding to pressure.",
                "firmness": "Hard (14-20 N)",
                "color_cue": "Uniform tawny brown fuzz",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Eating Texture (Grade B)",
                "visual_cues": "Yields gently to thumb pressure at the longitudinal center, pleasant tropical tart-sweet aroma.",
                "firmness": "Supple (6-9 N)",
                "color_cue": "Rich brown with soft pliable skin",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Soft Mushy / Stem Shrivelling (~75% Spoilage)",
                "visual_cues": "Deep indentation upon lightest touch, stem end collapsed and wrinkled, translucent skin patches.",
                "firmness": "Soft / Spongy (2-4 N)",
                "color_cue": "Dark water-soaked brown",
                "chef_action": "Peel and puree for meat marinades (actinidin tenderizer) or smoothies within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Botrytis Stem-End Rot",
                "visual_cues": "Water-soaked glassy pulp breakdown, grey felt-like mycelium at stem scar, alcoholic sour smell.",
                "common_pathogens": "Botrytis cinerea (Stem-end rot), Phomopsis",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately. Ethylene emission accelerates decay of adjacent produce.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.0, "optimal_humidity_pct": 94.0, "cold_shelf_hours": 480.0, "ambient_shelf_hours": 120.0}
    },

    "Peach": {
        "produce_name": "Peach",
        "short_name": "Peach",
        "scientific_name": "Prunus persica",
        "variety": "Golden Queen / Nectarine",
        "icon": "🍑",
        "category": "Fruits",
        "origin": "Upcountry Nuwara Eliya / Import, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Velvety Pubescent Epidermis",
            "tactile_feel": "Soft downy peach fuzz covering delicate elastic skin, prominent longitudinal suture groove.",
            "roughness_score": 4.6,
            "gloss_level": "Soft Matte Velvet",
            "edge_density_pct": [5.5, 12.0],
            "laplacian_var_range": [24.0, 60.0]
        },
        "color": {
            "primary_hue": "Golden Amber Carotenoid",
            "secondary_hue": "Ruby Crimson Anthocyanin Blush",
            "hsv_range": "H: 0-16 (Red blush), H: 20-36 (Golden ground cover)",
            "baseline_ratios": {"green_pct": [0.0, 8.0], "yellow_pct": [40.0, 75.0], "red_pct": [25.0, 55.0]},
            "saturation_range": [55, 95],
            "description": "Luminous golden-yellow backdrop kissed by an intense sunset crimson-apricot blush."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Firm Crisp (Grade A)",
                "visual_cues": "Intact velvet fuzz, firm along suture line, no green undercolor remaining, taut skin.",
                "firmness": "Firm (12-16 N)",
                "color_cue": "Golden amber with rich crimson blush",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Melting Sweetness (Grade B)",
                "visual_cues": "Flesh yields gently around the stem cavity, intense floral peach fragrance, sweet juicy flesh.",
                "firmness": "Melting / Tender (5-8 N)",
                "color_cue": "Vibrant sunset orange-red",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Bruising / Internal Mealy Breakdown (~75% Spoilage)",
                "visual_cues": "Dark indented bruises, skin slipping easily from flesh, mealiness under thumb pressure.",
                "firmness": "Soft / Bruised (2-4 N)",
                "color_cue": "Dull brownish-crimson with flat spots",
                "chef_action": "Blanch, peel, and simmer into peach compote, tarts, or bellini puree within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Brown Rot Monilinia",
                "visual_cues": "Rapidly expanding brown circular lesions with concentric tan tufts of Monilinia spores.",
                "common_pathogens": "Monilinia fructicola (Brown rot), Rhizopus stolonifer",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately; fungal mycelium rapidly consumes adjacent stone fruits.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 240.0, "ambient_shelf_hours": 60.0}
    },

    # =========================================================================
    # 27 VEGETABLES
    # =========================================================================
    "Local Tomatoes (Thakkali)": {
        "produce_name": "Local Tomatoes (Thakkali)",
        "short_name": "Tomato",
        "scientific_name": "Solanum lycopersicum",
        "variety": "Maheshi / Padma",
        "icon": "🍅",
        "category": "Vegetables",
        "origin": "Dambulla / Matale, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Smooth Glossy Cuticle Wax",
            "tactile_feel": "Thin, taut, shiny cuticular skin over firm fleshy locules, smooth globular morphology.",
            "roughness_score": 1.5,
            "gloss_level": "High Specular Gloss",
            "edge_density_pct": [1.8, 5.0],
            "laplacian_var_range": [5.0, 16.0]
        },
        "color": {
            "primary_hue": "Lycopene Radiant Scarlet Red",
            "secondary_hue": "Chlorophyll Green Shoulder / Sepals",
            "hsv_range": "H: 0-12 & 168-180 (Red), H: 38-75 (Green calyx)",
            "baseline_ratios": {"green_pct": [0.0, 8.0], "yellow_pct": [5.0, 20.0], "red_pct": [70.0, 95.0]},
            "saturation_range": [65, 98],
            "description": "Brilliant glossy crimson-scarlet red with glossy specular light reflection points."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Harvest Fresh / Firm (Grade A)",
                "visual_cues": "Lustrous reflective cuticle, deep uniform red, turgid green calyx star, firm to gentle squeeze.",
                "firmness": "Firm / Turgid (10-14 N)",
                "color_cue": "Brilliant glossy scarlet red",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Culinary Ripe (Grade B)",
                "visual_cues": "Vibrant deep red throughout, tender locular yielding, rich umami aroma, green calyx attached.",
                "firmness": "Supple (6-9 N)",
                "color_cue": "Deep rich crimson",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Skin Wrinkling / Micro-cracking (~75% Spoilage)",
                "visual_cues": "Fine circular epidermal wrinkles radiating from stem scar, loss of turgor, soft water-soaked zones.",
                "firmness": "Soft / Spongy (2-5 N)",
                "color_cue": "Dull brownish-red with wrinkled cuticle",
                "chef_action": "Simmer immediately into marinara sauce, tomato paste, or soup stocks within 12-24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Alternaria Black Rot Mandate",
                "visual_cues": "Sunken black circular lesions (Alternaria), white mold mycelium, split skin oozing sour juice.",
                "common_pathogens": "Alternaria alternata (Black rot), Botrytis cinerea, Erwinia carotovora",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately; fungal mycelium penetrates internal seed locules.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 10.5, "optimal_humidity_pct": 89.0, "cold_shelf_hours": 168.0, "ambient_shelf_hours": 60.0}
    },

    "Nuwara Eliya Carrots": {
        "produce_name": "Nuwara Eliya Carrots",
        "short_name": "Carrot",
        "scientific_name": "Daucus carota",
        "variety": "Upcountry Kuroda",
        "icon": "🥕",
        "category": "Vegetables",
        "origin": "Nuwara Eliya / Kandapola, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Suberized Root Periderm with Fine Annular Rings",
            "tactile_feel": "Firm, crisp taproot with fine horizontal lenticels and rootlet scars, rigid snap when broken.",
            "roughness_score": 3.4,
            "gloss_level": "Semi-Matte Earthy",
            "edge_density_pct": [4.0, 9.0],
            "laplacian_var_range": [16.0, 42.0]
        },
        "color": {
            "primary_hue": "Beta-Carotene Deep Orange",
            "secondary_hue": "Green Crown Foliar Ring",
            "hsv_range": "H: 12-28 (Vibrant orange)",
            "baseline_ratios": {"green_pct": [0.0, 6.0], "yellow_pct": [15.0, 35.0], "red_pct": [60.0, 85.0]},
            "saturation_range": [70, 96],
            "description": "Intense vivid beta-carotene orange from crown collar to tapering root tip."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Harvest / Turgid (Grade A)",
                "visual_cues": "Bright luminous orange, crisp rigid core with loud audible snap, clean dry crown, no white rootlets.",
                "firmness": "Very Rigid (18-26 N)",
                "color_cue": "Luminous deep carrot orange",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Salad Grade (Grade B)",
                "visual_cues": "Vibrant orange skin, crunchy sweet texture, minimal surface moisture, firm unbending root.",
                "firmness": "Crisp (14-19 N)",
                "color_cue": "Rich golden orange",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Rubbery / White Blush Dehydration (~75% Spoilage)",
                "visual_cues": "Bending rubbery texture (loss of turgor), surface 'white blush' (desiccated cells), darkening crown.",
                "firmness": "Rubbery / Flexible (6-10 N)",
                "color_cue": "Pale chalky white haze over dull orange",
                "chef_action": "Rehydrate in ice water for 30 min, then dice for braised stews, soups, or mirepoix within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Bacterial Soft Rot Mandate",
                "visual_cues": "Water-soaked mushy rot (Erwinia) oozing slimy brown fluid, black root rot lesions (Thielaviopsis).",
                "common_pathogens": "Erwinia carotovora (Bacterial soft rot), Thielaviopsis basicola",
                "firmness": "Liquefied Slime (< 3 N)",
                "chef_action": "Discard completely. Bacterial soft rot causes immediate foul amine odors.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 2.0, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 360.0, "ambient_shelf_hours": 96.0}
    },

    "Spinach / Leafy Greens": {
        "produce_name": "Spinach / Leafy Greens",
        "short_name": "Spinach",
        "scientific_name": "Spinacia oleracea",
        "variety": "English Spinach / Palak",
        "icon": "🥬",
        "category": "Vegetables",
        "origin": "Welimada / Nuwara Eliya, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Savoyed / Crinkled Leaf Blade",
            "tactile_feel": "Tender crinkled (savoyed) leaf lamina with prominent venation network, crisp succulent petioles.",
            "roughness_score": 7.8,
            "gloss_level": "Semi-Gloss Waxy Leaf",
            "edge_density_pct": [12.0, 26.0],
            "laplacian_var_range": [65.0, 180.0]
        },
        "color": {
            "primary_hue": "Chlorophyll Rich Emerald Green",
            "secondary_hue": "Pale Celery Green Stems",
            "hsv_range": "H: 38-82 (Vibrant leafy green)",
            "baseline_ratios": {"green_pct": [75.0, 98.0], "yellow_pct": [0.0, 10.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [65, 96],
            "description": "Deep lustrous emerald green foliage with pale green succulent central midribs."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Turgid Greens (Grade A)",
                "visual_cues": "Upright turgid leaves, crisp snappy petioles, deep uniform emerald green, completely dry leaf surfaces.",
                "firmness": "Crisp Turgor (10-14 N)",
                "color_cue": "Deep lustrous emerald green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Cooking Green (Grade B)",
                "visual_cues": "Rich green leaves, high moisture content, pliable leaf lamina without drooping.",
                "firmness": "Pliable (7-10 N)",
                "color_cue": "Vibrant forest green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Wilting / Chlorosis Yellowing (~75% Spoilage)",
                "visual_cues": "Leaf edges curling and limp, chlorophyll degradation into pale yellowing chlorosis, moisture buildup.",
                "firmness": "Limp / Drooping (2-5 N)",
                "color_cue": "Mottled yellowish-green with dark bruised veins",
                "chef_action": "Sauté immediately into cooked spinach curry, palak paneer, or vegetable quiche within 8-12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Slime Rot Mandate",
                "visual_cues": "Bacterial liquefaction turning leaves into slimy black/brown mush with putrid rotting odor.",
                "common_pathogens": "Pseudomonas marginalis, Erwinia carotovora (Bacterial soft rot)",
                "firmness": "Liquefied Slime (< 1 N)",
                "chef_action": "Discard immediately; bacterial slime cross-contaminates entire crisper drawer.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 120.0, "ambient_shelf_hours": 24.0}
    },

    "Gotukola (Centella Asiatica)": {
        "produce_name": "Gotukola (Centella Asiatica)",
        "short_name": "Gotukola",
        "scientific_name": "Centella asiatica",
        "variety": "Local Dwarf Leafy",
        "icon": "🌱",
        "category": "Vegetables",
        "origin": "Gampaha / Kalutara, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Reniform Leaf Blade with Crenate Margins",
            "tactile_feel": "Fan-shaped/kidney-shaped thin leaf lamina with scalloped edges and slender crisp petioles.",
            "roughness_score": 6.9,
            "gloss_level": "Soft Satin Sheen",
            "edge_density_pct": [10.0, 22.0],
            "laplacian_var_range": [50.0, 140.0]
        },
        "color": {
            "primary_hue": "Bright Chlorophyll Grass Green",
            "secondary_hue": "Pale Translucent Petiole Green",
            "hsv_range": "H: 40-84 (Lush herbal green)",
            "baseline_ratios": {"green_pct": [80.0, 98.0], "yellow_pct": [0.0, 8.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [60, 95],
            "description": "Lush vibrant herbal green fan blades supported by pale crisp green stolons."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Fresh Picked (Grade A)",
                "visual_cues": "Fan leaves upright and turgid, scalloped crenate margins crisp, fresh herbal aroma, no yellow leaves.",
                "firmness": "Crisp Turgid (8-12 N)",
                "color_cue": "Vibrant grass green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Sambol Grade (Grade B)",
                "visual_cues": "Lush green foliage, tender petioles, clean herbal scent ready for immediate raw chopping.",
                "firmness": "Pliable (6-8 N)",
                "color_cue": "Deep herbal green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Wilting / Yellow Chlorosis (~75% Spoilage)",
                "visual_cues": "Leaf edges curling inwards, yellowing patches on older leaves, limp drooping stems.",
                "firmness": "Limp / Flaccid (2-4 N)",
                "color_cue": "Mottled yellow-green with wilting margins",
                "chef_action": "Pick sound green leaves for Gotukola Kenda (herbal porridge) immediately within 6-12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Black Slime Decay",
                "visual_cues": "Water-soaked blackened leaves decomposing into mushy brown sludge, foul sour odor.",
                "common_pathogens": "Erwinia carotovora, Rhizoctonia solani",
                "firmness": "Liquefied (< 1 N)",
                "chef_action": "Discard bundle; anaerobic decay in plastic wraps ruins greens.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 3.0, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 96.0, "ambient_shelf_hours": 20.0}
    },

    "Kankun (Water Spinach)": {
        "produce_name": "Kankun (Water Spinach)",
        "short_name": "Kankun",
        "scientific_name": "Ipomoea aquatica",
        "variety": "Sri Lankan Water Kankun",
        "icon": "🌿",
        "category": "Vegetables",
        "origin": "Western Province Wetlands, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Hollow Tubular Stem with Sagittate Leaves",
            "tactile_feel": "Crisp, hollow succulent cylindrical stems snapping crisply, smooth arrowhead-shaped leaves.",
            "roughness_score": 5.2,
            "gloss_level": "Glossy Stem to Satin Leaf",
            "edge_density_pct": [7.0, 18.0],
            "laplacian_var_range": [35.0, 95.0]
        },
        "color": {
            "primary_hue": "Bright Jade Green",
            "secondary_hue": "Pale Translucent Jade Stem",
            "hsv_range": "H: 38-82 (Bright green)",
            "baseline_ratios": {"green_pct": [78.0, 98.0], "yellow_pct": [0.0, 10.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [60, 94],
            "description": "Luminous jade-green hollow stems adorned with darker arrow-shaped foliage."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Turgid Stems (Grade A)",
                "visual_cues": "Hollow stems snap cleanly with audible crack, leaves upright and glossy, zero slime at cut bases.",
                "firmness": "Very Crisp (12-16 N)",
                "color_cue": "Lustrous jade green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Prime Stir-Fry Condition (Grade B)",
                "visual_cues": "Tender crunchy stems, leaves dark green and intact, perfect for high-heat wok frying.",
                "firmness": "Crisp (9-12 N)",
                "color_cue": "Vibrant forest green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Stem Softening / Leaf Yellowing (~75% Spoilage)",
                "visual_cues": "Cut stem ends turning brown and spongy, leaves yellowing at tips and becoming limp, moisture sweating.",
                "firmness": "Bending / Soft (3-6 N)",
                "color_cue": "Dull olive-green with yellow leaf tips",
                "chef_action": "Trim brown stem ends; flash stir-fry with garlic and chili immediately within 8h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Hollow Stem Slime Rot",
                "visual_cues": "Hollow stems collapsing into watery black slime, offensive anaerobic rotting smell.",
                "common_pathogens": "Erwinia chrysanthemi, Pythium soft rot",
                "firmness": "Collapsed Slime (< 2 N)",
                "chef_action": "Discard immediately; hollow stems channel bacterial soft rot through entire bunch.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 4.0, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 90.0, "ambient_shelf_hours": 18.0}
    },

    "Mukunuwenna (Alternanthera)": {
        "produce_name": "Mukunuwenna (Alternanthera)",
        "short_name": "Mukunuwenna",
        "scientific_name": "Alternanthera sessilis",
        "variety": "Local Sessilis",
        "icon": "🌱",
        "category": "Vegetables",
        "origin": "Kalutara / Gampaha, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Lanceolate Leaf Blade on Slender Petioles",
            "tactile_feel": "Small narrow elliptical lanceolate leaves arranged along slender angular succulent stems.",
            "roughness_score": 6.5,
            "gloss_level": "Semi-Gloss Waxy",
            "edge_density_pct": [9.0, 20.0],
            "laplacian_var_range": [45.0, 120.0]
        },
        "color": {
            "primary_hue": "Deep Bottle Green",
            "secondary_hue": "Purplish Nodal Highlights",
            "hsv_range": "H: 40-85 (Dark rich green)",
            "baseline_ratios": {"green_pct": [80.0, 98.0], "yellow_pct": [0.0, 8.0], "red_pct": [0.0, 3.0]},
            "saturation_range": [65, 96],
            "description": "Deep glossy bottle-green lance leaves with subtle reddish-purple nodal joint tinges."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Garden Harvest (Grade A)",
                "visual_cues": "Plump crisp leaves, stems firm, deep bottle-green color, tiny white floral clusters dry and fresh.",
                "firmness": "Crisp Turgid (9-13 N)",
                "color_cue": "Deep bottle green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Prime Sambol Quality (Grade B)",
                "visual_cues": "Tender succulent leaves, easily chopped raw with fresh scraped coconut.",
                "firmness": "Pliable (6-9 N)",
                "color_cue": "Rich dark green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Leaf Blackening / Condensation (~75% Spoilage)",
                "visual_cues": "Lower bundle leaves turning black from trapped condensation, upper leaves wilting into dull olive.",
                "firmness": "Limp (2-5 N)",
                "color_cue": "Mottled olive-brown with blackened bases",
                "chef_action": "Sort and discard blackened stems; cook remaining green leaves into Mallum immediately within 8h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Anaerobic Slime Rot",
                "visual_cues": "Complete leaf liquefaction inside bunch core, putrid sour odor, black slimy residue.",
                "common_pathogens": "Pseudomonas cichorii, Erwinia carotovora",
                "firmness": "Slime (< 1 N)",
                "chef_action": "Discard bundle immediately.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 3.5, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 84.0, "ambient_shelf_hours": 18.0}
    },

    "Romaine Lettuce": {
        "produce_name": "Romaine Lettuce",
        "short_name": "Lettuce",
        "scientific_name": "Lactuca sativa",
        "variety": "Romaine / Butterhead",
        "icon": "🥬",
        "category": "Vegetables",
        "origin": "Nuwara Eliya / Ambewela, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Elongated Ribbed Leaves with Stiff Midribs",
            "tactile_feel": "Crisp, upright spatulate leaves supported by thick, rigid, juicy white-green central midribs.",
            "roughness_score": 5.8,
            "gloss_level": "Semi-Gloss Waxy Midrib",
            "edge_density_pct": [8.0, 19.0],
            "laplacian_var_range": [40.0, 110.0]
        },
        "color": {
            "primary_hue": "Deep Leaf Green to Creamy White Heart",
            "secondary_hue": "Translucent White Midrib",
            "hsv_range": "H: 38-80 (Leaf green), H: 25-36 (Heart yellow-white)",
            "baseline_ratios": {"green_pct": [65.0, 92.0], "yellow_pct": [5.0, 25.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [45, 90],
            "description": "Graduating from crisp deep forest green outer blades to tender pale lemon-green inner core."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Compact Head (Grade A)",
                "visual_cues": "Tightly packed upright leaves, crisp thick midrib snapping cleanly, clean white butt end with zero pinking.",
                "firmness": "Crisp Snap (12-16 N)",
                "color_cue": "Deep green outer foliage, white midrib",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Prime Caesar Salad Quality (Grade B)",
                "visual_cues": "Lush crunchy leaves, succulent juicy midribs, high turgor pressure, clean fresh scent.",
                "firmness": "Crisp (9-13 N)",
                "color_cue": "Vibrant leaf green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Russet Spotting / Stem Pinking (~75% Spoilage)",
                "visual_cues": "Reddish-brown 'russet spotting' along midribs (ethylene damage), leaf margins softening and translucent.",
                "firmness": "Flexible / Spongy (4-7 N)",
                "color_cue": "Dull olive with reddish-brown rib spots",
                "chef_action": "Trim brown outer leaves; grill romaine hearts or use in braised lettuce dishes within 12-18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Bacterial Head Rot Mandate",
                "visual_cues": "Heart leaves liquefied into brown slimy decay, foul putrid smell, black water-soaked lesions.",
                "common_pathogens": "Erwinia carotovora, Botrytis cinerea",
                "firmness": "Slimy Collapse (< 2 N)",
                "chef_action": "Discard head completely; bacterial liquefaction destroys internal leaves.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 144.0, "ambient_shelf_hours": 36.0}
    },

    "Green Chillies (Amu Miris)": {
        "produce_name": "Green Chillies (Amu Miris)",
        "short_name": "Green Chillies",
        "scientific_name": "Capsicum frutescens",
        "variety": "MI-2 Local Hot",
        "icon": "🌶️",
        "category": "Vegetables",
        "origin": "Anuradhapura / Vavuniya, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Smooth Glossy Cuticular Pod",
            "tactile_feel": "Firm, slender tapering pod with a sleek reflective wax coating, attached to a stiff green calyx.",
            "roughness_score": 1.8,
            "gloss_level": "High Specular Gloss",
            "edge_density_pct": [2.5, 6.5],
            "laplacian_var_range": [8.0, 24.0]
        },
        "color": {
            "primary_hue": "Deep Chlorophyll Emerald Green",
            "secondary_hue": "Light Green Calyx",
            "hsv_range": "H: 36-80 (Vivid dark green)",
            "baseline_ratios": {"green_pct": [75.0, 96.0], "yellow_pct": [0.0, 8.0], "red_pct": [0.0, 4.0]},
            "saturation_range": [70, 98],
            "description": "Intense gleaming emerald green pod with high specular sheen."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Taut Pod (Grade A)",
                "visual_cues": "Lustrous reflective green pod, completely rigid with sharp snap, fresh upright green stem.",
                "firmness": "Very Rigid (14-18 N)",
                "color_cue": "Gleaming emerald green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Pungency (Grade B)",
                "visual_cues": "Firm pod, sharp pungent capsicoid aroma when sliced, deep green skin, intact pedicel.",
                "firmness": "Crisp (10-14 N)",
                "color_cue": "Deep rich green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Skin Shriveling / Calyx Browning (~75% Spoilage)",
                "visual_cues": "Longitudinal wrinkles along pod, flexible rubbery feel, calyx turning dry brown, red ripening onset.",
                "firmness": "Rubbery / Limp (4-7 N)",
                "color_cue": "Dull wrinkled green with red/brown patches",
                "chef_action": "Finely chop for chili paste, freeze, or dry for chili flakes immediately within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Anthracnose & Soft Rot",
                "visual_cues": "Sunken circular black lesions with concentric orange spore rings (Colletotrichum), watery collapse.",
                "common_pathogens": "Colletotrichum capsici (Chili anthracnose), Erwinia carotovora",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately; fungal spores spread rapidly in chilli crates.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 8.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 192.0, "ambient_shelf_hours": 72.0}
    },

    "Capsicum / Bell Pepper": {
        "produce_name": "Capsicum / Bell Pepper",
        "short_name": "Capsicum",
        "scientific_name": "Capsicum annuum grossum",
        "variety": "Badulla Bell Pepper",
        "icon": "🫑",
        "category": "Vegetables",
        "origin": "Badulla / Bandarawela, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Thick Glossy Waxy Exocarp",
            "tactile_feel": "Thick-walled, blocky 3-4 lobed hollow pod, extremely glossy cuticular surface, rigid resistance to pressure.",
            "roughness_score": 1.6,
            "gloss_level": "High Specular Gloss",
            "edge_density_pct": [2.0, 5.5],
            "laplacian_var_range": [6.0, 20.0]
        },
        "color": {
            "primary_hue": "Vibrant Jade to Forest Green",
            "secondary_hue": "Deep Green Calyx",
            "hsv_range": "H: 36-78 (Glossy deep green)",
            "baseline_ratios": {"green_pct": [70.0, 95.0], "yellow_pct": [2.0, 15.0], "red_pct": [0.0, 3.0]},
            "saturation_range": [65, 96],
            "description": "Deep glossy jade-green exocarp with bright highlights and thick fleshy walls."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Firm Heavy Bell (Grade A)",
                "visual_cues": "Sleek reflective sheen, thick crisp walls, completely rigid, fresh turgid green calyx.",
                "firmness": "Rigid Wall (16-22 N)",
                "color_cue": "Lustrous jade green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Crisp Sweetness (Grade B)",
                "visual_cues": "Thick juicy flesh, crisp audible snap when sliced, glossy unblemished skin.",
                "firmness": "Crisp (12-16 N)",
                "color_cue": "Deep rich green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Skin Wrinkling / Calyx Mold (~75% Spoilage)",
                "visual_cues": "Surface dimpling and wrinkling (loss of turgor), softening wall, calyx turning dark and moldy.",
                "firmness": "Spongy / Pliable (5-8 N)",
                "color_cue": "Dull olive-green with extensive wrinkling",
                "chef_action": "Roast, char-peel, and pack in olive oil or dice for cooked stir-fries within 18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Grey Mold & Bacterial Soft Rot",
                "visual_cues": "Water-soaked soft rotting spots, grey fungal fuzz (Botrytis) around stem calyx, internal collapse.",
                "common_pathogens": "Botrytis cinerea, Erwinia carotovora, Alternaria tenuis",
                "firmness": "Liquefied Slime (< 3 N)",
                "chef_action": "Discard immediately; internal mold contaminates seeds and cavity.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 7.5, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 240.0, "ambient_shelf_hours": 84.0}
    },

    "Cucumber (Pipinna)": {
        "produce_name": "Cucumber (Pipinna)",
        "short_name": "Cucumber",
        "scientific_name": "Cucumis sativus",
        "variety": "Local Green Pipinna",
        "icon": "🥒",
        "category": "Vegetables",
        "origin": "Monaragala / Matale, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Glabrous Epidermis with Subtle Longitudinal Ridges",
            "tactile_feel": "Firm, cylindrical fruit with subtle longitudinal ribbing and scattered white micro-spines/prickles.",
            "roughness_score": 2.8,
            "gloss_level": "Waxy Sheen",
            "edge_density_pct": [3.5, 8.0],
            "laplacian_var_range": [14.0, 36.0]
        },
        "color": {
            "primary_hue": "Deep Forest Green with Pale Green Striations",
            "secondary_hue": "Pale Creamy Green Blossom End",
            "hsv_range": "H: 36-76 (Forest green)",
            "baseline_ratios": {"green_pct": [65.0, 92.0], "yellow_pct": [5.0, 20.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [50, 90],
            "description": "Lustrous dark green cylinder graduating into pale cream-green near the blossom apex."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Turgid (Grade A)",
                "visual_cues": "Rigid unyielding cylindrical body, taut dark green rind, completely crisp with loud snap, no yellowing.",
                "firmness": "Very Rigid (16-22 N)",
                "color_cue": "Deep forest green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Hydration Salad (Grade B)",
                "visual_cues": "Juicy crunchy seed core, firm unbending rind, refreshing cucumber aroma.",
                "firmness": "Crisp (12-16 N)",
                "color_cue": "Uniform rich green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Rubbering / Yellowing (~75% Spoilage)",
                "visual_cues": "Blossom tip soft and rubbery (bends without snapping), rind yellowing, surface pitting from chilling.",
                "firmness": "Rubbery / Flexible (5-8 N)",
                "color_cue": "Mottled yellow-green with wrinkled tip",
                "chef_action": "Peel thickly, discard soft seeds, and slice into quick pickles or raita immediately within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Cottony Leak Rot Mandate",
                "visual_cues": "Water-soaked sunken areas weeping clear liquid, white cottony mycelium (Pythium), slimy collapse.",
                "common_pathogens": "Pythium aphanidermatum (Cottony leak), Erwinia carotovora",
                "firmness": "Liquefied Mush (< 2 N)",
                "chef_action": "Discard immediately; cottony leak spreads rapidly through box moisture.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 10.0, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 216.0, "ambient_shelf_hours": 72.0}
    },

    "Green Beans (Bonchi)": {
        "produce_name": "Green Beans (Bonchi)",
        "short_name": "Green Beans",
        "scientific_name": "Phaseolus vulgaris",
        "variety": "Welimada Bush Bean",
        "icon": "🫘",
        "category": "Vegetables",
        "origin": "Welimada / Bandarawela, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Velvety Micro-papillate Pod Epidermis",
            "tactile_feel": "Slender, cylindrical, fleshy pod with subtle micro-velvet texture, snapping crisply when bent.",
            "roughness_score": 3.8,
            "gloss_level": "Semi-Matte Satin",
            "edge_density_pct": [5.0, 11.0],
            "laplacian_var_range": [20.0, 52.0]
        },
        "color": {
            "primary_hue": "Vivid Chlorophyll Grass Green",
            "secondary_hue": "Pale Pod Stem Cap",
            "hsv_range": "H: 38-80 (Vibrant green)",
            "baseline_ratios": {"green_pct": [80.0, 98.0], "yellow_pct": [0.0, 8.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [60, 95],
            "description": "Luminous bright emerald-green pods without bulges, indicative of tender immature seeds."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Snapping (Grade A)",
                "visual_cues": "Slender taut pods that snap cleanly in half with an audible snap, no seed bulges, bright green.",
                "firmness": "Crisp Snap (14-18 N)",
                "color_cue": "Bright grass green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Tender Steaming (Grade B)",
                "visual_cues": "Tender succulent flesh, low fiber stringiness, vibrant color, clean dry ends.",
                "firmness": "Crisp (10-13 N)",
                "color_cue": "Deep rich green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Rubbery Bending / Russet Browning (~75% Spoilage)",
                "visual_cues": "Pods bend like rubber without breaking, russet-brown rusty discoloration patches, drying ends.",
                "firmness": "Rubbery / Limp (4-7 N)",
                "color_cue": "Dull olive with rusty brown streaks",
                "chef_action": "Blanch immediately in boiling water and shock in ice bath for curries/stir-fries within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Nesting Watery Soft Rot",
                "visual_cues": "White cottony mold with black sclerotia (Sclerotinia) gluing pods together in a rotten mat.",
                "common_pathogens": "Sclerotinia sclerotiorum (White mold), Botrytis cinerea",
                "firmness": "Slimy (< 2 N)",
                "chef_action": "Discard affected cluster immediately.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 5.0, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 144.0, "ambient_shelf_hours": 48.0}
    },

    "Potato (Ala)": {
        "produce_name": "Potato (Ala)",
        "short_name": "Potato",
        "scientific_name": "Solanum tuberosum",
        "variety": "Granola / Welimada Ala",
        "icon": "🥔",
        "category": "Vegetables",
        "origin": "Welimada / Nuwara Eliya, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Suberized Corky Periderm",
            "tactile_feel": "Tough, earthy suberized skin protecting starchy tuber, dormant shallow eyes with zero sprouts.",
            "roughness_score": 4.2,
            "gloss_level": "Completely Matte Earthy",
            "edge_density_pct": [4.5, 10.0],
            "laplacian_var_range": [18.0, 48.0]
        },
        "color": {
            "primary_hue": "Earthy Ochre Tan to Buff Yellow",
            "secondary_hue": "Creamy Flesh Undertones",
            "hsv_range": "H: 18-32 (Buff ochre), S: 25-60, V: 40-70",
            "baseline_ratios": {"green_pct": [0.0, 2.0], "yellow_pct": [40.0, 75.0], "red_pct": [5.0, 20.0]},
            "saturation_range": [25, 60],
            "description": "Warm buff-tan corky skin with completely absent chlorophyll greening."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Dormant Firm Tuber (Grade A)",
                "visual_cues": "Rigid unyielding tuber, completely dry skin, dormant eyes with zero sprouts, zero green solanine tinge.",
                "firmness": "Rigid / Solid (24-34 N)",
                "color_cue": "Uniform buff ochre tan",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Prime Cooking Grade (Grade B)",
                "visual_cues": "Firm unblemished potato, dense starchy interior, completely free of sprouts and greening.",
                "firmness": "Hard (20-28 N)",
                "color_cue": "Buff earthy tan",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Sprouting Eyes / Shriveling (~75% Spoilage)",
                "visual_cues": "Eyes sprouting white/purple shoots (>5mm), skin softening and wrinkling, slight greening near surface.",
                "firmness": "Spongy (8-14 N)",
                "color_cue": "Dull wrinkled tan with greenish cast",
                "chef_action": "Break off sprouts, pare away green solanine skin deeply, boil and mash within 24-48h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Bacterial Soft Rot Mandate",
                "visual_cues": "Internal tuber liquefaction (Erwinia soft rot) into foul, putrid, slimy gray mush.",
                "common_pathogens": "Erwinia carotovora (Bacterial soft rot), Fusarium dry rot",
                "firmness": "Liquefied Slime (< 3 N)",
                "chef_action": "Discard immediately; foul odor contaminates entire root storage room.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 9.0, "optimal_humidity_pct": 88.0, "cold_shelf_hours": 720.0, "ambient_shelf_hours": 240.0}
    },

    "Eggplant (Brinjal / Wambatu)": {
        "produce_name": "Eggplant (Brinjal / Wambatu)",
        "short_name": "Eggplant",
        "scientific_name": "Solanum melongena",
        "variety": "Thinnavely Purple",
        "icon": "🍆",
        "category": "Vegetables",
        "origin": "Jaffna / Dambulla, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "High Gloss Smooth Cuticle",
            "tactile_feel": "Sleek, mirror-like glossy exocarp, spongy elastic internal flesh, spiny green calyx cap.",
            "roughness_score": 1.4,
            "gloss_level": "Mirror Specular Gloss",
            "edge_density_pct": [1.5, 4.5],
            "laplacian_var_range": [4.0, 14.0]
        },
        "color": {
            "primary_hue": "Deep Nasunin Midnight Violet-Black",
            "secondary_hue": "Emerald Green Spiny Calyx",
            "hsv_range": "H: 145-175 (Near-black violet), H: 38-75 (Green calyx)",
            "baseline_ratios": {"green_pct": [0.0, 5.0], "yellow_pct": [0.0, 5.0], "red_pct": [75.0, 95.0]},
            "saturation_range": [60, 98],
            "description": "Mirror-like glossy midnight black-purple surface with vibrant green protective calyx cap."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Lustrous Firm (Grade A)",
                "visual_cues": "Mirror-like glossy purple-black sheen, completely taut, firm to light squeeze, fresh green calyx.",
                "firmness": "Firm Elastic (12-16 N)",
                "color_cue": "Lustrous midnight violet-black",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Cooking Texture (Grade B)",
                "visual_cues": "Deep glossy skin, white tender seedless flesh interior, springy elastic return when pressed.",
                "firmness": "Springy (9-13 N)",
                "color_cue": "Deep glossy purple",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Loss of Sheen / Wrinkling (~75% Spoilage)",
                "visual_cues": "Gloss dulls to matte brownish-purple, skin wrinkles deeply, flesh feels soft and spongy, seeds turning brown.",
                "firmness": "Spongy / Soft (4-7 N)",
                "color_cue": "Dull brownish-purple with wrinkled skin",
                "chef_action": "Roast and smoke over flame for Wambatu Moju or roasted eggplant dip within 18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Phomopsis Soft Rot Mandate",
                "visual_cues": "Sunken circular brown water-soaked lesions covered in black pycnidia, watery tissue collapse.",
                "common_pathogens": "Phomopsis vexans (Fruit rot), Botrytis cinerea",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately; fungal mycelium ruins surrounding vegetables.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 10.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 192.0, "ambient_shelf_hours": 72.0}
    },

    "Red Onion (Rathu Lunu)": {
        "produce_name": "Red Onion (Rathu Lunu)",
        "short_name": "Red Onion",
        "scientific_name": "Allium cepa",
        "variety": "Jaffna Vethalan Shallot",
        "icon": "🧅",
        "category": "Vegetables",
        "origin": "Jaffna / Puttalam, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Papery Dry Suberized Tunic Scales",
            "tactile_feel": "Crisp, dry, rustling papery outer tunic protecting firm compact fleshy internal bulb scales.",
            "roughness_score": 3.6,
            "gloss_level": "Dry Papery Sheen",
            "edge_density_pct": [4.0, 9.5],
            "laplacian_var_range": [16.0, 44.0]
        },
        "color": {
            "primary_hue": "Anthocyanin Ruby Purple-Red",
            "secondary_hue": "Dry Coppery Red Tunic",
            "hsv_range": "H: 150-178 (Ruby purple), H: 0-14 (Coppery red)",
            "baseline_ratios": {"green_pct": [0.0, 3.0], "yellow_pct": [10.0, 30.0], "red_pct": [65.0, 88.0]},
            "saturation_range": [50, 92],
            "description": "Vibrant coppery-ruby purple dried outer tunic protecting dense ruby concentric rings."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Dry Cured Firm (Grade A)",
                "visual_cues": "Completely dry rustling outer skin, firm tight neck, no green shoots, rock-hard firmness.",
                "firmness": "Very Hard (22-30 N)",
                "color_cue": "Vibrant coppery-ruby red",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Culinary Pungency (Grade B)",
                "visual_cues": "Crisp juicy scales, sharp lachrymatory aromatic vapor when cut, tight dormant basal plate.",
                "firmness": "Hard (18-24 N)",
                "color_cue": "Deep ruby red",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Soft Neck / Green Sprouting (~75% Spoilage)",
                "visual_cues": "Neck softening under thumb pressure, green shoots emerging from center, papery skin peeling easily.",
                "firmness": "Soft Neck (8-13 N)",
                "color_cue": "Dull purplish-tan with emerging green shoot",
                "chef_action": "Chop and caramelize into onion relish, curry bases, or Sambol within 24-48h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Black Mold & Bacterial Soft Rot",
                "visual_cues": "Black powdery spore dust between scales (Aspergillus niger), watery foul-smelling soft rot (Erwinia).",
                "common_pathogens": "Aspergillus niger (Black mold), Botrytis allii (Neck rot), Erwinia carotovora",
                "firmness": "Liquefied Slime (< 3 N)",
                "chef_action": "Discard immediately; fungal spores contaminate onion bins.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 14.0, "optimal_humidity_pct": 68.0, "cold_shelf_hours": 960.0, "ambient_shelf_hours": 336.0}
    },

    "Garlic (Sudu Lunu)": {
        "produce_name": "Garlic (Sudu Lunu)",
        "short_name": "Garlic",
        "scientific_name": "Allium sativum",
        "variety": "Welimada Sudu Lunu",
        "icon": "🧄",
        "category": "Vegetables",
        "origin": "Welimada / Import, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Multi-Layered Dry Papery Tunic",
            "tactile_feel": "Multiple layers of dry, brittle, papery sheath enclosing tightly clustered firm individual cloves.",
            "roughness_score": 3.2,
            "gloss_level": "Matte Papery",
            "edge_density_pct": [3.8, 8.5],
            "laplacian_var_range": [14.0, 38.0]
        },
        "color": {
            "primary_hue": "Parchment Paper White",
            "secondary_hue": "Subtle Violet-Rose Vein Striations",
            "hsv_range": "H: 20-35 (Parchment), S: 5-25, V: 75-98",
            "baseline_ratios": {"green_pct": [0.0, 2.0], "yellow_pct": [15.0, 35.0], "red_pct": [0.0, 8.0]},
            "saturation_range": [5, 25],
            "description": "Crisp chalky-white to pale ivory papery wrapper with occasional faint violet streaks."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Tight Dry Cured Bulb (Grade A)",
                "visual_cues": "Tightly wrapped cloves, completely dry rustling skin, rock-hard firmness, dormant basal plate.",
                "firmness": "Very Rigid (25-35 N)",
                "color_cue": "Clean parchment white",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Peak Allicin Pungency (Grade B)",
                "visual_cues": "Firm juicy cloves with intense pungent allicin aroma upon crushing, zero green center sprouts.",
                "firmness": "Hard (20-28 N)",
                "color_cue": "Ivory white",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Cloves Softening / Sprouting (~75% Spoilage)",
                "visual_cues": "Bulb feels hollow and spongy, green germ shoots emerging, individual cloves turning yellow/translucent.",
                "firmness": "Spongy (8-14 N)",
                "color_cue": "Dull yellowed paper with green sprout tips",
                "chef_action": "Remove green bitter germ; mince remaining cloves into ginger-garlic paste for immediate freezing.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Blue-Green Mold & White Rot",
                "visual_cues": "Cloves covered in powdery blue-green mold (Penicillium), cloves shriveled into empty dry mummies.",
                "common_pathogens": "Penicillium allii (Blue mold), Sclerotium cepivorum (White rot)",
                "firmness": "Empty Shell / Mush (< 3 N)",
                "chef_action": "Discard bulb completely.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 15.0, "optimal_humidity_pct": 65.0, "cold_shelf_hours": 1440.0, "ambient_shelf_hours": 480.0}
    },

    "Cabbage (Gova)": {
        "produce_name": "Cabbage (Gova)",
        "short_name": "Cabbage",
        "scientific_name": "Brassica oleracea capitata",
        "variety": "Green Ball Gova",
        "icon": "🥬",
        "category": "Vegetables",
        "origin": "Nuwara Eliya / Welimada, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Concentric Waxy Leaves with Glaucous Bloom",
            "tactile_feel": "Densely compacted spherical head of thick, waxy, curved leaves with thick fibrous basal midribs.",
            "roughness_score": 2.8,
            "gloss_level": "Waxy Glaucous Sheen",
            "edge_density_pct": [3.5, 8.5],
            "laplacian_var_range": [12.0, 34.0]
        },
        "color": {
            "primary_hue": "Pale Jade to Celadon Green",
            "secondary_hue": "Silvery Waxy Glaze",
            "hsv_range": "H: 38-78 (Celadon green)",
            "baseline_ratios": {"green_pct": [65.0, 92.0], "yellow_pct": [5.0, 25.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [40, 85],
            "description": "Crisp pale jade to celadon green outer leaves wrapping an ultra-compact ivory heart."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Dense Solid Head (Grade A)",
                "visual_cues": "Heavy for size, rock-hard compact head, crisp waxy leaves, clean white stem cut with zero discoloration.",
                "firmness": "Solid / Dense (25-35 N)",
                "color_cue": "Lustrous celadon green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Crisp Slaw Condition (Grade B)",
                "visual_cues": "Crunchy sweet leaves, high moisture content, clean fresh cruciferous scent.",
                "firmness": "Compact (20-28 N)",
                "color_cue": "Pale jade green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Outer Leaf Yellowing / Stem Blackening (~75% Spoilage)",
                "visual_cues": "Outer leaves turning yellow and papery, butt stem turning black with dry rot, head losing tightness.",
                "firmness": "Yielding / Spongy (8-14 N)",
                "color_cue": "Mottled yellow-green with black stem cut",
                "chef_action": "Strip outer 3-4 yellow leaves; shred interior for cabbage mallum, coleslaw, or soup within 24-48h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Black Rot & Bacterial Soft Rot",
                "visual_cues": "V-shaped yellow-to-black necrotic lesions (Xanthomonas), internal head liquefaction with putrid odor.",
                "common_pathogens": "Xanthomonas campestris (Black rot), Erwinia carotovora",
                "firmness": "Liquefied Slime (< 4 N)",
                "chef_action": "Discard completely; bacterial black rot spreads throughout vascular rings.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 480.0, "ambient_shelf_hours": 168.0}
    },

    "Cauliflower": {
        "produce_name": "Cauliflower",
        "short_name": "Cauliflower",
        "scientific_name": "Brassica oleracea botrytis",
        "variety": "Snowball White",
        "icon": "🥦",
        "category": "Vegetables",
        "origin": "Nuwara Eliya / Welimada, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Granular Inflorescence Curd (Meristem Clusters)",
            "tactile_feel": "Densely compacted, bumpy granular flower buds forming a solid dome curd surrounded by jacket leaves.",
            "roughness_score": 6.8,
            "gloss_level": "Matte Granular",
            "edge_density_pct": [10.0, 22.0],
            "laplacian_var_range": [55.0, 140.0]
        },
        "color": {
            "primary_hue": "Pure Creamy Snow White",
            "secondary_hue": "Surrounding Crisp Green Jacket Leaves",
            "hsv_range": "H: 22-35 (Cream white), S: 5-25, V: 80-98",
            "baseline_ratios": {"green_pct": [0.0, 5.0], "yellow_pct": [15.0, 35.0], "red_pct": [0.0, 3.0]},
            "saturation_range": [5, 25],
            "description": "Luminous snow-white to ivory granular curd with zero brown freckles or yellow sunlight ricing."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Compact Snow White Curd (Grade A)",
                "visual_cues": "Dense, tight snowy white curd with zero blemishes, crisp turgid green jacket leaves, rock-solid dome.",
                "firmness": "Very Rigid Curd (18-26 N)",
                "color_cue": "Pristine snowy white",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Steaming Grade (Grade B)",
                "visual_cues": "Tight granular florets, fresh cruciferous scent, clean creamy-white appearance.",
                "firmness": "Firm Curd (14-20 N)",
                "color_cue": "Creamy ivory white",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Brown Speckling / Curd Ricing (~75% Spoilage)",
                "visual_cues": "Pinpoint brown/black speckled mold spots on curd tips, florets separating and opening ('ricing').",
                "firmness": "Loose / Spongy (6-10 N)",
                "color_cue": "Dull ivory with scattered brown necrotic freckles",
                "chef_action": "Pucker and shave off surface brown freckles; roast florets or puree into cauliflower soup within 18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Alternaria Black Spot & Soft Rot",
                "visual_cues": "Large sunken black velvety fungal blotches (Alternaria), watery curd liquefaction with foul sulfurous odor.",
                "common_pathogens": "Alternaria brassicicola (Black spot), Erwinia carotovora",
                "firmness": "Mushy Slime (< 3 N)",
                "chef_action": "Discard head immediately; fungal spores ruin curd flavor.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 240.0, "ambient_shelf_hours": 60.0}
    },

    "Broccoli": {
        "produce_name": "Broccoli",
        "short_name": "Broccoli",
        "scientific_name": "Brassica oleracea italica",
        "variety": "Calabrese Green",
        "icon": "🥦",
        "category": "Vegetables",
        "origin": "Nuwara Eliya / Ambewela, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Dense Granular Floret Canopy on Fleshy Stalk",
            "tactile_feel": "Intricate umbrella canopy of tightly packed microscopic flower buds atop a firm fibrous stalk.",
            "roughness_score": 7.6,
            "gloss_level": "Matte Bud Cluster",
            "edge_density_pct": [12.0, 25.0],
            "laplacian_var_range": [65.0, 160.0]
        },
        "color": {
            "primary_hue": "Deep Emerald to Blue-Green",
            "secondary_hue": "Pale Jade Branching Stalks",
            "hsv_range": "H: 42-85 (Deep bluish-green)",
            "baseline_ratios": {"green_pct": [80.0, 98.0], "yellow_pct": [0.0, 5.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [65, 96],
            "description": "Deep bluish-green to forest green unopened floral buds with completely absent yellow petals."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Tight Blue-Green Crown (Grade A)",
                "visual_cues": "Tightly packed unopened flower buds, deep blue-green color, rock-solid crisp stalk, zero yellowing.",
                "firmness": "Very Rigid Crown (16-24 N)",
                "color_cue": "Deep rich blue-green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Crisp Florets (Grade B)",
                "visual_cues": "Dense floret clusters, crisp juicy stem, fresh vegetal aroma, perfect for blanching.",
                "firmness": "Firm (12-18 N)",
                "color_cue": "Forest green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Floret Yellowing / Stem Rubbering (~75% Spoilage)",
                "visual_cues": "Flower buds opening into tiny yellow petals (senescence), stalk becoming limp and rubbery, dull color.",
                "firmness": "Flexible / Rubbery (5-8 N)",
                "color_cue": "Mottled yellow-green with opening bud petals",
                "chef_action": "Steam or stir-fry immediately; cook stems into vegetable stock or broccoli soup within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Bacterial Head Rot Mandate",
                "visual_cues": "Black water-soaked floret decay, slimy brown liquefaction, offensive rotting cabbage odor.",
                "common_pathogens": "Pseudomonas fluorescens, Erwinia carotovora, Alternaria brassicae",
                "firmness": "Liquefied Slime (< 2 N)",
                "chef_action": "Discard immediately; foul sulfurous rotting odor cross-contaminates crisper.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.0, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 216.0, "ambient_shelf_hours": 48.0}
    },

    "Beetroot": {
        "produce_name": "Beetroot",
        "short_name": "Beetroot",
        "scientific_name": "Beta vulgaris",
        "variety": "Crimson Globe",
        "icon": "🍠",
        "category": "Vegetables",
        "origin": "Kandapola / Nuwara Eliya, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Rough Suberized Taproot Periderm",
            "tactile_feel": "Firm globular root with rough, corky, ridged skin and fibrous taproot tail.",
            "roughness_score": 4.5,
            "gloss_level": "Matte Earthy",
            "edge_density_pct": [5.0, 11.0],
            "laplacian_var_range": [22.0, 58.0]
        },
        "color": {
            "primary_hue": "Betalain Deep Burgundy-Red / Purple",
            "secondary_hue": "Earthy Brownish Highlights",
            "hsv_range": "H: 155-178 (Deep magenta-red), H: 0-12 (Burgundy)",
            "baseline_ratios": {"green_pct": [0.0, 3.0], "yellow_pct": [5.0, 15.0], "red_pct": [75.0, 95.0]},
            "saturation_range": [60, 95],
            "description": "Rich deep beet-purple to crimson-maroon with dense pigmentation throughout internal rings."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Firm Solid Taproot (Grade A)",
                "visual_cues": "Completely firm unyielding globe, smooth taproot tail, clean dry crown collar, deep crimson skin.",
                "firmness": "Very Rigid (22-30 N)",
                "color_cue": "Deep rich burgundy-maroon",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Sweet Roasting (Grade B)",
                "visual_cues": "Dense heavy root, high betalain concentration, sweet earthy aroma upon cutting.",
                "firmness": "Hard (18-26 N)",
                "color_cue": "Lustrous beet-red",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Rubbery / Shriveling (~75% Spoilage)",
                "visual_cues": "Root losing moisture and becoming rubbery to squeeze, wrinkled skin, pale fibrous core.",
                "firmness": "Rubbery / Soft (7-12 N)",
                "color_cue": "Dull brownish-crimson with wrinkled rind",
                "chef_action": "Boil, roast, or pickle in spiced vinegar immediately within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Black Rot Phoma Mandate",
                "visual_cues": "Sunken black necrotic lesions (Phoma), internal spongy heart rot, white/grey mold mycelium.",
                "common_pathogens": "Phoma betae (Heart rot), Rhizoctonia solani",
                "firmness": "Spongy Soft (< 4 N)",
                "chef_action": "Discard root completely.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 2.0, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 480.0, "ambient_shelf_hours": 144.0}
    },

    "Pumpkin (Wattakka)": {
        "produce_name": "Pumpkin (Wattakka)",
        "short_name": "Pumpkin",
        "scientific_name": "Cucurbita moschata",
        "variety": "Ruhunu Wattakka",
        "icon": "🎃",
        "category": "Vegetables",
        "origin": "Hambantota / Monaragala, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Thick Ribbed Fluted Rind",
            "tactile_feel": "Hard, thick, protective rind with deep longitudinal ribs and a dry, woody, corky stem pedicel.",
            "roughness_score": 3.8,
            "gloss_level": "Matte Waxy",
            "edge_density_pct": [4.0, 9.0],
            "laplacian_var_range": [16.0, 42.0]
        },
        "color": {
            "primary_hue": "Mottled Golden Ochre to Forest Green",
            "secondary_hue": "Deep Orange Internal Flesh",
            "hsv_range": "H: 20-35 (Golden ochre), H: 38-70 (Green ribs)",
            "baseline_ratios": {"green_pct": [15.0, 55.0], "yellow_pct": [35.0, 75.0], "red_pct": [2.0, 15.0]},
            "saturation_range": [45, 88],
            "description": "Rich golden-buff ochre surface with deep olive-green longitudinal grooves and mottling."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Hard Cured Rind (Grade A)",
                "visual_cues": "Rock-hard rind resisting thumbnail puncture, completely dry woody stem, heavy for size, clear hollow sound.",
                "firmness": "Rigid Rind (30-45 N)",
                "color_cue": "Warm golden ochre with green mottle",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Culinary Sweetness (Grade B)",
                "visual_cues": "Dense golden-orange flesh upon slicing, high beta-carotene content, sweet nutty aroma.",
                "firmness": "Solid Rind (25-38 N)",
                "color_cue": "Rich golden buff",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Stem End Softening / Sunken Pores (~75% Spoilage)",
                "visual_cues": "Spongy depression around stem pedicel, localized dark water-soaked spots on rind, softening skin.",
                "firmness": "Softening Spots (10-18 N)",
                "color_cue": "Dull brownish-ochre with sunken areas",
                "chef_action": "Cut immediately: remove seeds, cube flesh for Wattakka Kalu Pol curry or soup within 24h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Black Rot Fusarium Mandate",
                "visual_cues": "Sunken circular decay weeping clear fluid, pinkish-white mold tufts (Fusarium), internal hollow collapse.",
                "common_pathogens": "Fusarium solani, Didymella bryoniae (Black rot)",
                "firmness": "Collapsed Softness (< 5 N)",
                "chef_action": "Discard pumpkin; fungal rot liquefies internal seed cavity.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 12.0, "optimal_humidity_pct": 75.0, "cold_shelf_hours": 960.0, "ambient_shelf_hours": 480.0}
    },

    "Bitter Gourd (Karawila)": {
        "produce_name": "Bitter Gourd (Karawila)",
        "short_name": "Bitter Gourd",
        "scientific_name": "Momordica charantia",
        "variety": "Thinnavely Karawila",
        "icon": "🥒",
        "category": "Vegetables",
        "origin": "Jaffna / Kalpitiya, Sri Lanka",
        "climacteric": True,
        "surface": {
            "texture_type": "Prominently Warty / Tuberculate Ridged Exocarp",
            "tactile_feel": "Covered in prominent, pointed, elongated warts and longitudinal ridges, firm crisp flesh.",
            "roughness_score": 8.9,
            "gloss_level": "Semi-Gloss Warty",
            "edge_density_pct": [16.0, 30.0],
            "laplacian_var_range": [95.0, 240.0]
        },
        "color": {
            "primary_hue": "Deep Emerald to Forest Green",
            "secondary_hue": "Lighter Ridge Crests",
            "hsv_range": "H: 36-80 (Dark green)",
            "baseline_ratios": {"green_pct": [75.0, 96.0], "yellow_pct": [0.0, 10.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [65, 96],
            "description": "Deep glossy forest green with sharply defined tubercles and zero orange tip discoloration."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Dark Green (Grade A)",
                "visual_cues": "Crisp rigid tubercles, deep forest green throughout, firm snap, seeds white and immature.",
                "firmness": "Very Rigid (16-22 N)",
                "color_cue": "Deep glossy forest green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Bitter Culinary Grade (Grade B)",
                "visual_cues": "Crisp crunchy flesh, sharp clean bitter tonic flavor, zero yellowing along ridges.",
                "firmness": "Crisp (12-16 N)",
                "color_cue": "Rich dark green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Blossom Splitting / Orange Ripening (~75% Spoilage)",
                "visual_cues": "Fruit tip turning bright orange-yellow, blossom end splitting open to reveal bright red aril seeds.",
                "firmness": "Soft / Spongy (4-8 N)",
                "color_cue": "Vibrant orange-yellow tip on green body",
                "chef_action": "Scoop out sweet red seeds; cook green portions into Karawila Sambol immediately within 8-12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Watery Soft Rot Mandate",
                "visual_cues": "Complete collapse into mushy orange slime, cottony white mold (Fusarium), sour rotting smell.",
                "common_pathogens": "Fusarium oxysporum, Erwinia carotovora",
                "firmness": "Liquefied (< 2 N)",
                "chef_action": "Discard immediately.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 11.0, "optimal_humidity_pct": 88.0, "cold_shelf_hours": 168.0, "ambient_shelf_hours": 48.0}
    },

    "Snake Gourd (Pathola)": {
        "produce_name": "Snake Gourd (Pathola)",
        "short_name": "Snake Gourd",
        "scientific_name": "Trichosanthes cucumerina",
        "variety": "TA-2 Pathola",
        "icon": "🥒",
        "category": "Vegetables",
        "origin": "Matale / Anuradhapura, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Smooth Elongated Cylindrical Exocarp",
            "tactile_feel": "Extremely elongated, slender, twisting cylindrical fruit with chalky-white longitudinal stripes, smooth waxy feel.",
            "roughness_score": 2.2,
            "gloss_level": "Waxy Satin",
            "edge_density_pct": [3.0, 7.0],
            "laplacian_var_range": [10.0, 28.0]
        },
        "color": {
            "primary_hue": "Pale Mint Green with Chalky White Stripes",
            "secondary_hue": "Darker Green Longitudinal Ribs",
            "hsv_range": "H: 38-75 (Mint green), S: 30-70, V: 60-90",
            "baseline_ratios": {"green_pct": [55.0, 85.0], "yellow_pct": [10.0, 30.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [30, 70],
            "description": "Pale mint-green elongated body patterned with distinctive chalky-white parallel pinstripes."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Rigid Pod (Grade A)",
                "visual_cues": "Firm straight or twisting pod, crisp audible snap, clean pale green and white striping, dry blossom tip.",
                "firmness": "Rigid / Turgid (14-18 N)",
                "color_cue": "Vibrant mint green with chalky white stripes",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Tender Stewing (Grade B)",
                "visual_cues": "Tender white spongy central pith, immature soft seeds, delicate mild gourd aroma.",
                "firmness": "Crisp (10-14 N)",
                "color_cue": "Pale green with clear stripes",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Limp Rubbering / Yellow Discoloration (~75% Spoilage)",
                "visual_cues": "Pod bending limply without snapping, blossom tip turning soft and yellow-brown, skin wrinkling.",
                "firmness": "Limp / Flexible (4-7 N)",
                "color_cue": "Dull yellow-green with brown tip",
                "chef_action": "Scrape outer chalky skin, remove seeds, and cook in Pathola Kiri Hodi immediately within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Anthracnose & Watery Breakdown",
                "visual_cues": "Sunken circular brown water-soaked lesions, slimy internal collapse, sour fermenting odor.",
                "common_pathogens": "Colletotrichum lagenarium, Pythium soft rot",
                "firmness": "Liquefied Slime (< 2 N)",
                "chef_action": "Discard immediately.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 11.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 144.0, "ambient_shelf_hours": 48.0}
    },

    "Ridge Gourd (Wetawalu)": {
        "produce_name": "Ridge Gourd (Wetawalu)",
        "short_name": "Ridge Gourd",
        "scientific_name": "Luffa acutangula",
        "variety": "Local Wetawalu",
        "icon": "🥒",
        "category": "Vegetables",
        "origin": "Kurunegala / Matale, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Sharply Angled Longitudinal Ridges (10 Ribs)",
            "tactile_feel": "Characterized by 10 prominent, sharp, fibrous, longitudinal razor-like ribs running down a tapering pod.",
            "roughness_score": 7.2,
            "gloss_level": "Matte Fibrous Ribs",
            "edge_density_pct": [11.0, 24.0],
            "laplacian_var_range": [60.0, 150.0]
        },
        "color": {
            "primary_hue": "Deep Olive to Forest Green",
            "secondary_hue": "Pale Green Inter-ridge Valleys",
            "hsv_range": "H: 36-78 (Forest green)",
            "baseline_ratios": {"green_pct": [70.0, 95.0], "yellow_pct": [0.0, 10.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [55, 92],
            "description": "Deep forest green prominent angled ribs with lighter olive-green concave valley walls."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Rigid Ribs (Grade A)",
                "visual_cues": "Sharp crisp ridges, rigid pod resisting bending, tender immature white seeds, completely green.",
                "firmness": "Rigid Pod (15-20 N)",
                "color_cue": "Deep forest green with crisp ridges",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Tender Curry Condition (Grade B)",
                "visual_cues": "Tender white spongy core, fresh sweet gourd aroma, easily pared ridges.",
                "firmness": "Crisp (11-15 N)",
                "color_cue": "Rich olive-green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Fibrous Hardening / Tip Yellowing (~75% Spoilage)",
                "visual_cues": "Pith turning fibrous and tough (spongy luffa fiber development), tip turning yellow and dry, rubbery bend.",
                "firmness": "Rubbery / Fibrous (5-8 N)",
                "color_cue": "Dull yellow-green with dry brown ridge crests",
                "chef_action": "Peel hard ridges deeply; cook tender inner pulp into coconut curry immediately within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Soft Rot Liquefaction",
                "visual_cues": "Water-soaked brown sunken patches along valleys, slimy tissue breakdown, foul rotting odor.",
                "common_pathogens": "Erwinia carotovora, Choanephora cucurbitarum",
                "firmness": "Liquefied Slime (< 2 N)",
                "chef_action": "Discard immediately.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 11.0, "optimal_humidity_pct": 90.0, "cold_shelf_hours": 144.0, "ambient_shelf_hours": 48.0}
    },

    "Radish (Rabu)": {
        "produce_name": "Radish (Rabu)",
        "short_name": "Radish",
        "scientific_name": "Raphanus sativus",
        "variety": "Beeralu White Rabu",
        "icon": "🥕",
        "category": "Vegetables",
        "origin": "Nuwara Eliya / Welimada, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Smooth Suberized Cylindrical Taproot",
            "tactile_feel": "Solid, crisp, cylindrical or fusiform taproot with fine horizontal lenticels and clean root hairs.",
            "roughness_score": 2.4,
            "gloss_level": "Waxy Satin Sheen",
            "edge_density_pct": [3.0, 7.0],
            "laplacian_var_range": [10.0, 26.0]
        },
        "color": {
            "primary_hue": "Porcelain White to Pale Cream",
            "secondary_hue": "Pale Green Shoulder near Foliage",
            "hsv_range": "H: 25-45 (Ivory white), S: 5-25, V: 80-98",
            "baseline_ratios": {"green_pct": [2.0, 10.0], "yellow_pct": [15.0, 35.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [5, 25],
            "description": "Luminous clean porcelain-white root with a subtle lime-green foliar collar at the crown."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Turgid Taproot (Grade A)",
                "visual_cues": "Porcelain white, loud audible snap when broken, sharp peppery aroma, solid dense core with zero pithiness.",
                "firmness": "Very Rigid (18-26 N)",
                "color_cue": "Porcelain clean white",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Salad / Sambol (Grade B)",
                "visual_cues": "Juicy crunchy texture, clean pungent mustard-oil bite, completely solid white flesh throughout.",
                "firmness": "Crisp (14-19 N)",
                "color_cue": "Bright white",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Pithiness / Spongy Core (~75% Spoilage)",
                "visual_cues": "Center turning spongy and hollow ('pithy' cellular cavitation), rubbery flexibility, surface wrinkling.",
                "firmness": "Rubbery / Spongy (6-10 N)",
                "color_cue": "Dull yellowed white with wrinkled skin",
                "chef_action": "Slice and braise in Rabu Theldala (tempered radish curry) or pickle immediately within 18h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Bacterial Soft Rot Mandate",
                "visual_cues": "Internal liquefaction into grayish foul-smelling slime, black rot vascular rings.",
                "common_pathogens": "Erwinia carotovora (Bacterial soft rot), Xanthomonas campestris",
                "firmness": "Liquefied Slime (< 3 N)",
                "chef_action": "Discard completely; powerful sulfurous decay odor.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 95.0, "cold_shelf_hours": 288.0, "ambient_shelf_hours": 72.0}
    },

    "Okra (Bandakka / Ladies Finger)": {
        "produce_name": "Okra (Bandakka / Ladies Finger)",
        "short_name": "Okra",
        "scientific_name": "Abelmoschus esculentus",
        "variety": "Haritha Bandakka",
        "icon": "🫛",
        "category": "Vegetables",
        "origin": "Matale / Anuradhapura, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "5-Angled Pyramidal Pod with Micro-prickly Hairs",
            "tactile_feel": "Pentagonal tapering pod with fine velvety pubescence (micro-trichomes), snapping crisp tip.",
            "roughness_score": 5.4,
            "gloss_level": "Matte Velvety",
            "edge_density_pct": [7.0, 16.0],
            "laplacian_var_range": [32.0, 80.0]
        },
        "color": {
            "primary_hue": "Deep Chlorophyll Grass Green",
            "secondary_hue": "Pale Green Rib Angles",
            "hsv_range": "H: 38-80 (Vibrant green)",
            "baseline_ratios": {"green_pct": [75.0, 96.0], "yellow_pct": [0.0, 10.0], "red_pct": [0.0, 2.0]},
            "saturation_range": [65, 96],
            "description": "Vivid grass green 5-angled pod with immaculate sharp green tapering tip."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Crisp Snapping Tip (Grade A)",
                "visual_cues": "Vibrant emerald green, extreme tip snaps cleanly off with lightest thumb flick, tender immature seeds.",
                "firmness": "Crisp Snap (12-16 N)",
                "color_cue": "Vibrant emerald green",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Tender Sauté (Grade B)",
                "visual_cues": "Tender succulent pod, low fiber stringiness, snaps with gentle bend, rich green color.",
                "firmness": "Tender (9-13 N)",
                "color_cue": "Deep rich green",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Fibrous Hardening / Ridge Blackening (~75% Spoilage)",
                "visual_cues": "Tip bends like leather without snapping (woody fiber development), blackening along pentagonal ridges.",
                "firmness": "Tough / Fibrous (5-8 N)",
                "color_cue": "Dull olive with blackened ridge crests",
                "chef_action": "Slice thinly and fry crisp with onions and mustard seeds (Bandakka Theldala) within 12h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Watery Pod Rot Mandate",
                "visual_cues": "Sunken water-soaked lesions leaking sticky mucilaginous slime, white/grey mold mycelium.",
                "common_pathogens": "Choanephora cucurbitarum (Pod rot), Botrytis cinerea",
                "firmness": "Slimy Collapse (< 2 N)",
                "chef_action": "Discard immediately.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 9.0, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 144.0, "ambient_shelf_hours": 48.0}
    },

    "Mushroom (Bimmal)": {
        "produce_name": "Mushroom (Bimmal)",
        "short_name": "Mushroom",
        "scientific_name": "Pleurotus ostreatus",
        "variety": "American Oyster Bimmal",
        "icon": "🍄",
        "category": "Vegetables",
        "origin": "Kurunegala / Kandy, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Soft Velvety Pileus with Under-Gills",
            "tactile_feel": "Smooth, delicate, fan-shaped cap (pileus) with tender decurrent white gills on the underside.",
            "roughness_score": 4.2,
            "gloss_level": "Soft Satin Matte",
            "edge_density_pct": [6.0, 14.0],
            "laplacian_var_range": [25.0, 65.0]
        },
        "color": {
            "primary_hue": "Pearl Grey to Soft Cream White",
            "secondary_hue": "Ivory White Under-Gills",
            "hsv_range": "H: 22-38 (Pearl cream), S: 8-30, V: 70-95",
            "baseline_ratios": {"green_pct": [0.0, 2.0], "yellow_pct": [15.0, 35.0], "red_pct": [0.0, 5.0]},
            "saturation_range": [8, 30],
            "description": "Luminous pearl-grey to delicate ivory oyster cap with completely dry unbruised edges."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Fresh Velvety Cluster (Grade A)",
                "visual_cues": "Firm unbruised fan caps, completely dry silky surface, intact white gills, fresh forest mushroom fragrance.",
                "firmness": "Plump / Turgid (8-12 N)",
                "color_cue": "Pristine pearl grey to ivory",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Sauté Quality (Grade B)",
                "visual_cues": "Tender succulent flesh, high umami aromatics, completely dry gills without brown weeping.",
                "firmness": "Tender (6-9 N)",
                "color_cue": "Pearl ivory",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Cap Curling / Surface Sliming (~75% Spoilage)",
                "visual_cues": "Cap margins curling upward and drying into brown brittle edges, slight tacky sticky surface sheen.",
                "firmness": "Soft / Limp (2-4 N)",
                "color_cue": "Dull yellow-brown with darkening gills",
                "chef_action": "Sauté immediately in butter with garlic or cook into mushroom soup stock within 6-8h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Bacterial Blotch & Slime Rot",
                "visual_cues": "Dark brown slimy bacterial liquefaction (Pseudomonas tolaasii), foul fishy ammonia odor.",
                "common_pathogens": "Pseudomonas tolaasii (Bacterial blotch), Trichoderma green mold",
                "firmness": "Liquefied Slime (< 1 N)",
                "chef_action": "Discard immediately; spoiled mushrooms harbor harmful bacterial toxins.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 1.5, "optimal_humidity_pct": 92.0, "cold_shelf_hours": 120.0, "ambient_shelf_hours": 24.0}
    },

    "Ginger (Inguru)": {
        "produce_name": "Ginger (Inguru)",
        "short_name": "Ginger",
        "scientific_name": "Zingiber officinale",
        "variety": "Local Rangoon Inguru",
        "icon": "🫚",
        "category": "Vegetables",
        "origin": "Kandy / Kurunegala, Sri Lanka",
        "climacteric": False,
        "surface": {
            "texture_type": "Suberized Knobby Rhizome with Annular Rings",
            "tactile_feel": "Firm, multi-branched hand of knobby rhizomes covered in a taut, pale buff suberized skin with ring scars.",
            "roughness_score": 5.8,
            "gloss_level": "Matte Earthy",
            "edge_density_pct": [7.0, 15.0],
            "laplacian_var_range": [30.0, 75.0]
        },
        "color": {
            "primary_hue": "Warm Buff Ochre Tan",
            "secondary_hue": "Pale Yellow-Gold Internal Flesh",
            "hsv_range": "H: 20-35 (Buff ochre), S: 30-65, V: 50-85",
            "baseline_ratios": {"green_pct": [0.0, 3.0], "yellow_pct": [35.0, 65.0], "red_pct": [5.0, 20.0]},
            "saturation_range": [30, 65],
            "description": "Warm pale buff-tan skin with smooth taut lobes and bright golden-yellow fibrous interior."
        },
        "spoilage_progression": {
            "fresh": {
                "stage": "Firm Solid Rhizome (Grade A)",
                "visual_cues": "Taut unwrinkled skin, snaps cleanly with sharp gingerol pungency, rock-hard firmness, clean dry eye buds.",
                "firmness": "Very Rigid (26-36 N)",
                "color_cue": "Warm buff-tan",
                "spoilage_range": "0 - 25%"
            },
            "optimal": {
                "stage": "Optimal Spice Pungency (Grade B)",
                "visual_cues": "Fibrous juicy golden-yellow flesh, sharp biting aroma, completely free of mold and soft spots.",
                "firmness": "Hard (22-30 N)",
                "color_cue": "Buff ochre",
                "spoilage_range": "25 - 50%"
            },
            "near_spoilage": {
                "stage": "Skin Shriveling / Blue-Green Sprouting (~75% Spoilage)",
                "visual_cues": "Skin deeply wrinkled and desiccated, rhizome lobes slightly yielding to pressure, shoot sprouts appearing.",
                "firmness": "Spongy (10-16 N)",
                "color_cue": "Dull wrinkled brown with green sprout tips",
                "chef_action": "Peel and puree into ginger paste with a little oil and salt for freezer storage within 48h.",
                "spoilage_range": "50 - 75%"
            },
            "spoiled": {
                "stage": "Spoiled / Blue-Green Mold & Soft Rot",
                "visual_cues": "Sunken soft rot spots weeping fermented fluid, white/blue-green fungal fuzz (Penicillium, Fusarium).",
                "common_pathogens": "Fusarium oxysporum, Pythium soft rot, Penicillium",
                "firmness": "Mushy (< 4 N)",
                "chef_action": "Discard moldy rhizome completely.",
                "spoilage_range": "75 - 100%"
            }
        },
        "storage": {"optimal_temp_c": 12.5, "optimal_humidity_pct": 75.0, "cold_shelf_hours": 1200.0, "ambient_shelf_hours": 360.0}
    }
}

def get_produce_profile(produce_key_or_name: str) -> Optional[Dict[str, Any]]:
    """Retrieves full encyclopedia profile by exact name, short name, or fuzzy key."""
    if not produce_key_or_name:
        return None
    # 1. Exact dictionary key match
    if produce_key_or_name in PRODUCE_ENCYCLOPEDIA:
        return PRODUCE_ENCYCLOPEDIA[produce_key_or_name]
    
    name_clean = produce_key_or_name.lower().strip()
    
    # 2. Exact full_name match
    for full_name, profile in PRODUCE_ENCYCLOPEDIA.items():
        if name_clean == full_name.lower():
            return profile

    # 3. Exact short_name match (e.g. "Apple", "Mango", "Watermelon")
    for full_name, profile in PRODUCE_ENCYCLOPEDIA.items():
        if profile.get("short_name", "").lower() == name_clean:
            return profile

    # 4. Word boundary match (e.g. "Apple" matches "Fresh Apple", NOT "Pineapple")
    import re
    pattern = r'\b' + re.escape(name_clean) + r'\b'
    for full_name, profile in PRODUCE_ENCYCLOPEDIA.items():
        if re.search(pattern, full_name.lower()) or re.search(pattern, profile.get("short_name", "").lower()):
            return profile

    # 5. Prefix match
    for full_name, profile in PRODUCE_ENCYCLOPEDIA.items():
        if profile.get("short_name", "").lower().startswith(name_clean) or full_name.lower().startswith(name_clean):
            return profile

    # 6. Fallback substring match
    for full_name, profile in PRODUCE_ENCYCLOPEDIA.items():
        if name_clean in full_name.lower() or full_name.lower() in name_clean:
            return profile
            
    return None

def search_produce(query: Optional[str] = None, category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Filters encyclopedia produce items by category and/or text search query."""
    results = []
    q_clean = query.lower().strip() if query else ""
    cat_clean = category.lower().strip() if category else ""

    for full_name, profile in PRODUCE_ENCYCLOPEDIA.items():
        # Category filter
        if cat_clean and cat_clean not in ["all", "any"]:
            prof_cat = profile.get("category", "").lower()
            if cat_clean != prof_cat and not (cat_clean == "fruits" and prof_cat.startswith("fruit")) and not (cat_clean == "vegetables" and prof_cat.startswith("veg")):
                continue

        # Query filter
        if q_clean:
            searchable_text = f"{full_name} {profile.get('short_name','')} {profile.get('scientific_name','')} {profile.get('variety','')} {profile.get('origin','')}".lower()
            if q_clean not in searchable_text:
                continue

        results.append(profile)

    return results
