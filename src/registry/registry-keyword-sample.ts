// Sample registry showing keyword-based descriptions
// This demonstrates how registry.ts would be updated with keyword format

import type { RegistryEntry } from './index';

// Example of how exploits would look with keyword descriptions
export const exploits: RegistryEntry[] = [
  {
    id: "exploit-scholars-eye",
    label: "Scholar's Eye",
    description: "Triggers: value-based | Effects: scoring bonus | Modifiers: conditional",
    type: "exploit",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["scoring", "bonus"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 5, condition: { value: [5, 10] } }
    ]
  },
  {
    id: "exploit-whispering-gale",
    label: "Whispering Gale",
    description: "Effects: visibility | Modifiers: permanent",
    type: "exploit",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["visibility", "deck"],
    choices: [],
    results: {},
    effects: [
      { action: "reveal", target: "deck", value: 1 }
    ]
  },
  {
    id: "exploit-silent-choir",
    label: "Silent Choir",
    description: "Triggers: discard event | Effects: currency bonus",
    type: "exploit",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["coin", "discard"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 5, condition: { event: "on_discard_from_hand" } }
    ]
  },
  {
    id: "exploit-cartographer",
    label: "Cartographer",
    description: "Effects: visibility | Modifiers: permanent",
    type: "exploit",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["visibility", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "reveal", target: "tableau", value: 2 }
    ]
  },
  {
    id: "exploit-chronomancer",
    label: "Chronomancer",
    description: "Effects: resource increase | Modifiers: permanent",
    type: "exploit",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["shuffles"],
    choices: [],
    results: {},
    effects: [
      { action: "modify_setting", target: "shufflesLeft", value: 1 }
    ]
  },
  // Uncommon Exploits
  {
    id: "exploit-sanguine-blade",
    label: "Sanguine Blade",
    description: "Triggers: first play | Effects: scoring multiplier | Modifiers: suit-based",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["scoring", "red-cards"],
    choices: [],
    results: {},
    effects: [
      { action: "score_multiplier", target: "tableau", value: 3, condition: { suit: ["hearts", "diamonds"] } }
    ]
  },
  {
    id: "exploit-obsidian-heart",
    label: "Obsidian Heart",
    description: "Triggers: first play | Effects: scoring multiplier | Modifiers: suit-based",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["scoring", "black-cards"],
    choices: [],
    results: {},
    effects: [
      { action: "score_multiplier", target: "tableau", value: 3, condition: { suit: ["spades", "clubs"] } }
    ]
  },
  {
    id: "exploit-ever-rising-hand",
    label: "Ever-Rising Hand",
    description: "Effects: hand size increase | Modifiers: permanent",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["hand-size"],
    choices: [],
    results: {},
    effects: [
      { action: "modify_setting", target: "handSize", value: 1 }
    ]
  },
  {
    id: "exploit-golden-king",
    label: "Golden King",
    description: "Triggers: king play | Effects: scoring bonus, draw | Modifiers: value-based",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["king", "scoring", "draw"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau", value: 15, condition: { value: 13 } },
      { action: "draw_cards", target: "deck", value: 1, condition: { value: 13 } }
    ]
  },
  {
    id: "exploit-unseen-burden",
    label: "Unseen Burden",
    description: "Triggers: first play per encounter | Effects: scoring bonus",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["scoring", "first-play"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 50, condition: { event: "on_first_play_from_hand" } }
    ]
  }
];

// Example of how blessings would look with keyword descriptions
export const blessings: RegistryEntry[] = [
  {
    id: "blessing-midas-touch",
    label: "The Midas Touch",
    description: "Triggers: foundation play | Effects: scoring multiplier | Modifiers: one-time",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["scoring", "foundation"],
    choices: [],
    results: {},
    effects: [
      { action: "score_multiplier", target: "foundation", value: 4, oneShot: true }
    ]
  },
  {
    id: "blessing-golden-touch",
    label: "The Golden Touch",
    description: "Triggers: tableau play | Effects: special scoring | Modifiers: one-time",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["scoring", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "score_special", target: "tableau", value: "basePlusBeneath", oneShot: true }
    ]
  },
  {
    id: "blessing-harvest",
    label: "The Harvest",
    description: "Triggers: foundation play | Effects: currency bonus",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["coin", "foundation"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 20, condition: { event: "on_play_to_foundation" } }
    ]
  }
];

// Example of how fears would look with keyword descriptions
export const fears: RegistryEntry[] = [
  {
    id: "fear-suffocation",
    label: "Fear of Suffocation",
    description: "Effects: movement restriction | Modifiers: permanent",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["discard", "restriction"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "discard" }
    ]
  },
  {
    id: "fear-entombment",
    label: "Fear of Entombment",
    description: "Triggers: hand play | Effects: face-down flip | Modifiers: permanent",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "face-down"],
    choices: [],
    results: {},
    effects: [
      { action: "flip_facedown", target: "tableau", condition: { event: "on_play_from_hand" } }
    ]
  },
  {
    id: "fear-poisoned-chalice",
    label: "Fear of the Poisoned Chalice",
    description: "Effects: scoring penalty | Modifiers: value-based",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["scoring", "seven"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 0, condition: { value: 7 } }
    ]
  }
];

// This file demonstrates the keyword format for registry descriptions
// The full registry.ts would be updated to use this format for all entries