// BLESSINGS
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

// FEARS
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
import type { RegistryEntry } from './index';

// EXPLOITS
export const exploits: RegistryEntry[] = [
  {
    id: "exploit-quickdraw",
    label: "Quickdraw",
    description: "Draw an extra card when you draw.",
    type: "exploit",
    rarity: "common",
    category: "",
    completed: false,
    tags: [],
    choices: [],
    results: {},
    effects: [ { action: "draw", target: "player", value: 1 } ],
  },
  {
    id: "exploit-double-down",
    label: "Double Down",
    description: "Play two cards instead of one.",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: [],
    choices: [],
    results: {},
    effects: [ { action: "play", target: "player", value: 2 } ],
  },
  {
    id: "exploit-fortunes-favor",
    label: "Fortune's Favor",
    description: "Gain a fortune at the start of the game.",
    type: "exploit",
    rarity: "rare",
    category: "",
    completed: false,
    tags: [],
    choices: [],
    results: {},
    effects: [ { action: "gain", target: "fortune" } ],
  },
  {
    id: "exploit-phoenix-feather",
    label: "Phoenix Feather",
    description: "Revive once upon losing.",
    type: "exploit",
    rarity: "legendary",
    category: "",
    completed: false,
    tags: [],
    choices: [],
    results: {},
    effects: [ { action: "revive", target: "player", value: 1 } ],
  },
  {
    id: "exploit-swift-step",
    label: "Swift Step",
    description: "Move two spaces instead of one.",
    type: "exploit",
    rarity: "common",
    category: "",
    completed: false,
    tags: [],
    choices: [],
    results: {},
    effects: [ { action: "move", target: "player", value: 2 } ],
  },
  {
    id: "exploit-sanguine-blade",
    label: "Sanguine Blade",
    description: "All red cards (Hearts and Diamonds) score triple their base value when moved to a tableau for the first time.",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["scoring", "red-cards"],
    choices: [],
    results: {},
    effects: [ { action: "score_multiplier", target: "tableau", value: 3, condition: { suit: ["hearts", "diamonds"] } } ],
  },
  {
    id: "exploit-obsidian-heart",
    label: "Obsidian Heart",
    description: "All black cards (Spades and Clubs) score triple their base value when moved to a tableau for the first time.",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["scoring", "black-cards"],
    choices: [],
    results: {},
    effects: [ { action: "score_multiplier", target: "tableau", value: 3, condition: { suit: ["spades", "clubs"] } } ],
  },
  {
    id: "exploit-ever-rising-hand",
    label: "Ever-Rising Hand",
    description: "Your hand size is permanently increased by one.",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["hand-size"],
    choices: [],
    results: {},
    effects: [ { action: "modify_setting", target: "handSize", value: 1 } ],
  },
  {
    id: "exploit-golden-king",
    label: "Golden King",
    description: "When a King is moved to a tableau, you gain 15 bonus points and draw one card from the deck.",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["king", "bonus"],
    choices: [],
    results: {},
    effects: [
      { action: "score_bonus", target: "player", value: 15, condition: { rank: "king" } },
      { action: "draw", target: "player", value: 1, condition: { rank: "king" } }
    ],
  },
  {
    id: "exploit-iron-queen",
    label: "Iron Queen",
    description: "When a Queen is moved to a tableau, you gain 10 bonus points and draw one card from the deck.",
    type: "exploit",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["queen", "bonus"],
    choices: [],
    results: {},
    effects: [
      { action: "score_bonus", target: "player", value: 10, condition: { rank: "queen" } },
      { action: "draw", target: "player", value: 1, condition: { rank: "queen" } }
    ],
  }
];