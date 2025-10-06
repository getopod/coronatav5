
import type { RegistryEntry } from './index';
// EXPLOITS 
export const exploits: RegistryEntry[] = [
  {
    id: "exploit-scholars-eye",
    label: "Scholar's Eye",
    description: "All cards with a face value of 5 or 10 permanently gain a bonus of 5 points when moved to a tableau or a foundation.",
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
    description: "You can see the top card of the Deck at all times.",
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
    description: "When a card is discarded from your hand, you gain 5 Coin.",
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
    description: "You can see the top two face-down cards in each tableau at all times.",
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
    description: "You gain one additional shuffle per encounter.",
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
    effects: [
      { action: "score_multiplier", target: "tableau", value: 3, condition: { suit: ["hearts", "diamonds"] } }
    ]
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
    effects: [
      { action: "score_multiplier", target: "tableau", value: 3, condition: { suit: ["spades", "clubs"] } }
    ]
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
    effects: [
      { action: "modify_setting", target: "handSize", value: 1 }
    ]
  },
  {
    id: "exploit-golden-king",
    label: "Golden King",
    description: "When a King is moved to a tableau, you gain 15 bonus points and draw one card from the deck.",
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
    description: "The first card you play each encounter from your hand gains a bonus of 50 points.",
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
  },
  // Rare Exploits
  {
    id: "exploit-midas-engine",
    label: "Midas Engine",
    description: "All cards moved to a foundation gain an additional 10 points.",
    type: "exploit",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["scoring", "foundation"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "foundation", value: 10 }
    ]
  },
  {
    id: "exploit-merchants-guild",
    label: "Merchant's Guild",
    description: "Whenever a card is played from your Hand, you gain 2 Coin.",
    type: "exploit",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["coin", "hand"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 2, condition: { event: "on_play_from_hand" } }
    ]
  },
  {
    id: "exploit-gamblers-luck",
    label: "Gambler's Luck",
    description: "When you move a card from the deck to a tableau, it gains a bonus of 10 points.",
    type: "exploit",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["scoring", "deck"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau", value: 10, condition: { event: "on_play_from_deck" } }
    ]
  },
  {
    id: "exploit-final-act",
    label: "Final Act",
    description: "When a tableau is cleared, you gain a bonus of 50 points and 10 Coin.",
    type: "exploit",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["scoring", "coin", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "player", value: 50, condition: { event: "on_tableau_cleared" } },
      { action: "award_coin", target: "player", value: 10, condition: { event: "on_tableau_cleared" } }
    ]
  },
  {
    id: "exploit-stitched-thread",
    label: "Stitched Thread",
    description: "You can move any card from a tableau to another tableau, ignoring its position in the stack.",
    type: "exploit",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["movement", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "allow_move", target: "tableau_to_tableau", condition: { position: "ignore_stack_position" } }
    ]
  },
  // Epic Exploits
  {
    id: "exploit-fools-rule",
    label: "Fool's Rule",
    description: "You can move a card from a tableau to another tableau regardless of alternating color.",
    type: "exploit",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["movement", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "allow_move", target: "tableau_to_tableau", condition: { phase: "ignore_color" } }
    ]
  },
  {
    id: "exploit-golems-purpose",
    label: "Golem's Purpose",
    description: "Kings can now be moved to a foundation after Aces, 2s, 3s, and 4s have been placed there.",
    type: "exploit",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["movement", "foundation", "king"],
    choices: [],
    results: {},
    effects: [
      { action: "allow_move", target: "foundation", condition: { phase: "kings_after_1_2_3_4" } }
    ]
  },
  {
    id: "exploit-unending-thread",
    label: "Unending Thread",
    description: "You may move any card to a tableau from a foundation.",
    type: "exploit",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["movement", "foundation", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "allow_move", target: "foundation_to_tableau" }
    ]
  },
  {
    id: "exploit-unstable-hand",
    label: "Unstable Hand",
    description: "You can move any card to a tableau, regardless of its value, as long as its suit matches the card beneath it.",
    type: "exploit",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["movement", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "allow_move", target: "any_to_tableau", condition: { phase: "suit_matches_beneath" } }
    ]
  },
  {
    id: "exploit-sunken-ship",
    label: "Sunken Ship",
    description: "You may now move cards to the discard pile from foundations and tableaus.",
    type: "exploit",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["movement", "discard"],
    choices: [],
    results: {},
    effects: [
      { action: "allow_move", target: "foundation_to_discard" },
      { action: "allow_move", target: "tableau_to_discard" }
    ]
  },
  // Legendary Exploits
  {
    id: "exploit-sovereigns-edict",
    label: "Sovereign's Edict",
    description: "You are immune to all negative effects from Fear and Danger encounters.",
    type: "exploit",
    rarity: "legendary",
    category: "",
    completed: false,
    tags: ["immunity", "fear", "danger"],
    choices: [],
    results: {},
    effects: [
      { action: "immunity", target: "fear|danger" }
    ]
  },
  {
    id: "exploit-everlasting-gambit",
    label: "Everlasting Gambit",
    description: "You no longer have a limit on shuffles per encounter.",
    type: "exploit",
    rarity: "legendary",
    category: "",
    completed: false,
    tags: ["shuffles"],
    choices: [],
    results: {},
    effects: [
      { action: "unlimited", target: "shuffles" }
    ]
  },
  {
    id: "exploit-ouroboros",
    label: "Ouroboros",
    description: "Whenever a card is moved to a foundation, you may immediately play a copy of that card from your deck or discard pile.",
    type: "exploit",
    rarity: "legendary",
    category: "",
    completed: false,
    tags: ["foundation", "copy"],
    choices: [],
    results: {},
    effects: [
      { action: "play_copy", target: "foundation", condition: { event: "on_play" } }
    ]
  },
  {
    id: "exploit-royal-flush",
    label: "Royal Flush",
    description: "When a King is played, you may immediately fill any empty tableau with cards from the deck, regardless of value or color.",
    type: "exploit",
    rarity: "legendary",
    category: "",
    completed: false,
    tags: ["king", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "fill_tableau", target: "empty_tableau", condition: { event: "on_king_played" } }
    ]
  },
  {
    id: "exploit-alchemists-stone",
    label: "Alchemist's Stone",
    description: "When you play a card, you may choose to gain its base value in Coin instead of points.",
    type: "exploit",
    rarity: "legendary",
    category: "",
    completed: false,
    tags: ["coin", "choice"],
    choices: [],
    results: {},
    effects: [
      { action: "choose_reward", target: "play", value: "base_value_coin" }
    ]
  }
];
// BLESSINGS
export const blessings: RegistryEntry[] = [
  {
    id: "blessing-midas-touch",
    label: "The Midas Touch",
    description: "The next time this card is moved to a foundation, it scores four times its base value instead of double.",
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
    description: "The next time this card is moved to a tableau, it scores its base value plus the value of the card it was placed on.",
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
    description: "When this card is played to a foundation, gain 20 Coin.",
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
  },
  {
    id: "blessing-architects-blueprint",
    label: "The Architect's Blueprint",
    description: "When this card is played to a foundation, gain one empty tableau for the rest of the encounter.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "foundation"],
    choices: [],
    results: {},
    effects: [
      { action: "add_tableau", target: "player", value: 1, condition: { event: "on_play_to_foundation" } }
    ]
  },
  {
    id: "blessing-jokers-disguise",
    label: "Joker's Disguise",
    description: "This card can be played as any suit.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["suit", "wild"],
    choices: [],
    results: {},
    effects: [
      { action: "override_suit", target: "card", value: "any" }
    ]
  },
  {
    id: "blessing-wayfarers-freedom",
    label: "Wayfarer's Freedom",
    description: "This card can be moved to any tableau, regardless of its value or the color of the card beneath it.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["movement", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "allow_move", target: "any_to_tableau", condition: { phase: "ignore_value_and_color" } }
    ]
  },
  {
    id: "blessing-alchemists-transmutation",
    label: "Alchemist's Transmutation",
    description: "This card's value can be treated as either plus one (+1) or minus one (-1) for the purpose of moving to a tableau.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["value", "movement"],
    choices: [],
    results: {},
    effects: [
      { action: "override_value", target: "card", value: "+1|-1" }
    ]
  },
  {
    id: "blessing-apparition",
    label: "Apparition",
    description: "When this card is played to a tableau, take one face-down card from that tableau and add it to your hand.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["draw", "tableau"],
    choices: [],
    results: {},
    effects: [
      { action: "draw_from_tableau", target: "hand", value: 1, condition: { event: "on_play_to_tableau" } }
    ]
  },
  {
    id: "blessing-seers-eye",
    label: "Seer's Eye",
    description: "The next time this card is played, you may look at the bottom 5 cards of your deck and add one to your hand.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["reveal", "draw"],
    choices: [],
    results: {},
    effects: [
      { action: "reveal_bottom", target: "deck", value: 5, oneShot: true },
      { action: "draw_cards", target: "deck", value: 1, oneShot: true }
    ]
  },
  {
    id: "blessing-shepherds-call",
    label: "The Shepherd's Call",
    description: "When this card is played from your hand, draw two new cards instead of one.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["draw", "hand"],
    choices: [],
    results: {},
    effects: [
      { action: "draw_cards", target: "deck", value: 2, condition: { event: "on_play_from_hand" } }
    ]
  },
  {
    id: "blessing-fools-gambit",
    label: "Fool's Gambit",
    description: "The next time this card is played, it automatically discards your hand and reshuffles your deck, at no cost to your discard count.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["discard", "shuffle"],
    choices: [],
    results: {},
    effects: [
      { action: "discard_hand", target: "player", oneShot: true },
      { action: "shuffle_deck", target: "deck", oneShot: true }
    ]
  },
  {
    id: "blessing-locksmith",
    label: "The Locksmith",
    description: "When this card is played, you may unlock one locked tableau.",
    type: "blessing",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "unlock"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_tableau", target: "tableau", value: 1, condition: { event: "on_play" } }
    ]
  }
];
// FEARS
export const fears: RegistryEntry[] = [
  {
    id: "fear-suffocation",
    label: "Fear of Suffocation",
    description: "You may not play cards from your discard pile.",
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
    description: "All cards played to a tableau from your hand are immediately flipped face-down. You must play another card on top of it to reveal it.",
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
    description: "All 7-value cards gain 0 points when played.",
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
  },
  {
    id: "fear-locked-coffer",
    label: "Fear of the Locked Coffer",
    description: "You may not play cards from a tableau to a foundation.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "restriction"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "tableau_to_foundation" }
    ]
  },
  {
    id: "fear-empty-vessel",
    label: "Fear of the Empty Vessel",
    description: "The deck can only be shuffled twice per encounter.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["shuffles", "limit"],
    choices: [],
    results: {},
    effects: [
      { action: "set_limit", target: "shuffles", value: 2 }
    ]
  },
  {
    id: "fear-drowning",
    label: "Fear of Drowning",
    description: "All cards played to foundations gain 0 points.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "foundation", value: 0 }
    ]
  },
  {
    id: "fear-broken-path",
    label: "Fear of the Broken Path",
    description: "Your shuffles are reduced by 1.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["shuffles"],
    choices: [],
    results: {},
    effects: [
      { action: "modify_setting", target: "shufflesLeft", value: -1 }
    ]
  },
  {
    id: "fear-starving-crowd",
    label: "Fear of the Starving Crowd",
    description: "Your hand size is reduced by 1.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["hand-size"],
    choices: [],
    results: {},
    effects: [
      { action: "modify_setting", target: "handSize", value: -1 }
    ]
  },
  {
    id: "fear-unseen-blade",
    label: "Fear of the Unseen Blade",
    description: "When a card is played to a tableau, the card at the top of an adjacent tableau is moved to your discard pile.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "adjacent"],
    choices: [],
    results: {},
    effects: [
      { action: "move_adjacent", target: "tableau_to_discard", condition: { event: "on_play_to_tableau" } }
    ]
  },
  {
    id: "fear-frozen-path",
    label: "Fear of the Frozen Path",
    description: "You may only play cards to tableaus 1, 3, and 5.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "restriction"],
    choices: [],
    results: {},
    effects: [
      { action: "restrict_tableau", target: "tableau", value: [1,3,5] }
    ]
  },
  {
    id: "fear-fall",
    label: "Fear of the Fall",
    description: "The discard button is disabled.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["discard", "button"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "discard_button" }
    ]
  },
  {
    id: "fear-decapitation",
    label: "Fear of Decapitation",
    description: "All point values gained from foundations are halved.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "score_multiplier", target: "foundation", value: 0.5 }
    ]
  },
  {
    id: "fear-scapegoat",
    label: "Fear of the Scapegoat",
    description: "You may not play a card from a tableau to a tableau.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "restriction"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "tableau_to_tableau" }
    ]
  },
  {
    id: "fear-false-prophecy",
    label: "Fear of the False Prophecy",
    description: "All point values gained from foundations are ignored.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "foundation", value: 0 }
    ]
  },
  {
    id: "fear-serpents-venom",
    label: "Fear of the Serpent's Venom",
    description: "The first card you play from your hand each turn loses its point value.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["hand", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 0, condition: { event: "on_first_play_from_hand_each_turn" } }
    ]
  },
  {
    id: "fear-crushing-weight",
    label: "Fear of the Crushing Weight",
    description: "The first card you draw into your hand is immediately discarded.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["draw", "discard"],
    choices: [],
    results: {},
    effects: [
      { action: "discard", target: "hand", condition: { event: "on_first_draw" } }
    ]
  },
  {
    id: "fear-broken-mirror",
    label: "Fear of the Broken Mirror",
    description: "All cards with a face value of 1, 5, or 10 cannot be played to foundations.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "restriction"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "foundation", condition: { value: [1, 5, 10] } }
    ]
  },
  {
    id: "fear-shivering-child",
    label: "Fear of the Shivering Child",
    description: "Cards may only be played from your hand to a tableau.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["hand", "restriction"],
    choices: [],
    results: {},
    effects: [
      { action: "restrict_play", target: "hand_to_tableau_only" }
    ]
  },
  {
    id: "fear-traitorous-king",
    label: "Fear of the Traitorous King",
    description: "When a card is played to a foundation, it is returned to your deck which is immediately shuffled.",
    type: "fear",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "return"],
    choices: [],
    results: {},
    effects: [
      { action: "return_and_shuffle", target: "foundation_to_deck", condition: { event: "on_play" } }
    ]
  },
];
// FEATS
export const feats: RegistryEntry[] = [
  // VISIBLE FEATS - Known to the player as available to earn
  {
    id: "feat-wayfarer",
    label: "The Wayfarer",
    description: "Encounter 3 Wander events in a single run.",
    type: "feat",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["wander", "exploration", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "wander", value: "wander-forsaken-well" }
    ]
  },
  {
    id: "feat-unflinching",
    label: "The Unflinching",
    description: "Survive 5 encounters.",
    type: "feat",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["survival", "encounters", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "fear-suffocation" }
    ]
  },
  {
    id: "feat-harbinger",
    label: "The Harbinger",
    description: "Acquire your first Fortune.",
    type: "feat",
    rarity: "common",
    category: "",
    completed: false,
      tags: ["fortune", "first", "achievement"],
      choices: [],
      results: {},
      effects: [
        { action: "unlock_item", target: "exploit", value: "random_rare" }
      ]
    },
  {
    id: "feat-moneylender",
    label: "The Moneylender",
    description: "Earn 300 Coin in a single run.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["coin", "earning", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-artisan",
    label: "The Artisan",
    description: "Use 5 Blessings in a single run.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["blessing", "usage", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "random_new" }
    ]
  },
  {
    id: "feat-prophet",
    label: "The Prophet",
    description: "Win a run after using \"The Seer's Eye\" to add a card to your hand.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["seers-eye", "victory", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-unbroken",
    label: "The Unbroken",
    description: "Win a run after surviving the 'Fear of the Traitorous King'.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["fear", "survival", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-votary",
    label: "The Votary",
    description: "Acquire 3 Fortunes in a single run.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["fortune", "multiple", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-heretic",
    label: "The Heretic",
    description: "Survive a run with 5 or more Curses.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["curse", "survival", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "danger", value: "danger-kings-love-tyranny" }
    ]
  },
  {
    id: "feat-usurper-slayer",
    label: "The Usurper Slayer",
    description: "Defeat a Final Usurper.",
    type: "feat",
    rarity: "legendary",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["usurper", "boss", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-scholar",
    label: "The Scholar",
    description: "Unlock 10 Feats.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["feat", "unlocking", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-spender",
    label: "The Spender",
    description: "Spend 500 Coin in a single run.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["coin", "spending", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "wander", value: "random_new" }
    ]
  },
  {
    id: "feat-negotiator",
    label: "The Negotiator",
    description: "Choose a beneficial outcome from 10 Wander events.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["wander", "choices", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "wander", value: "random_new" }
    ]
  },
  {
    id: "feat-commander",
    label: "The Commander",
    description: "Defeat 10 Dangers.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["danger", "defeat", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-master-builder",
    label: "The Master Builder",
    description: "Move 20 cards to a tableau in a single run.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["tableau", "building", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_common" }
    ]
  },
  {
    id: "feat-collector",
    label: "The Collector",
    description: "Acquire 20 Exploits in a single run.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["exploit", "collection", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "random_new" }
    ]
  },
  {
    id: "feat-steadfast",
    label: "The Steadfast",
    description: "Win a run with the same Fortune from the start.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["fortune", "persistence", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-champion",
    label: "The Champion",
    description: "Win a run on difficulty level 7.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["difficulty", "victory", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-demigod",
    label: "The Demigod",
    description: "Get a high score of 10,000 or more.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["score", "high", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "danger", value: "random_new" }
    ]
  },
  {
    id: "feat-perfectionist",
    label: "The Perfectionist",
    description: "Clear 5 encounters with a perfect score (100% of score target).",
    type: "feat",
    rarity: "legendary",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["perfect", "score", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-enduring",
    label: "The Enduring",
    description: "Win a run with 3 or more Curses.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["curse", "endurance", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "wander", value: "random_new" }
    ]
  },
  {
    id: "feat-fortune-hunter",
    label: "The Fortune Hunter",
    description: "Acquire all Fortunes in a single run.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["fortune", "complete", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "random_new" }
    ]
  },
  {
    id: "feat-immortal",
    label: "The Immortal",
    description: "Win a run on difficulty level 10.",
    type: "feat",
    rarity: "legendary",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["difficulty", "victory", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  // COSMETIC CARD BACK UNLOCKING FEATS
  {
    id: "feat-endure-veil",
    label: "Endure the Veil",
    description: "Survive Trial 2 without visiting the Trader.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["trial", "trader", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cosmetic", target: "card_back", value: "veil_shrouded_leather" }
    ]
  },
  {
    id: "feat-shattered-resolve",
    label: "Shattered Resolve",
    description: "Win a run after surviving \"The Burden of the Plague (Pestilence)\".",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["plague", "survival", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cosmetic", target: "card_back", value: "cracked_crown" }
    ]
  },
  {
    id: "feat-fractured-path",
    label: "Fractured Path",
    description: "Complete Trial 1 with 2 or more Curses.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["trial", "curse", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cosmetic", target: "card_back", value: "plague_worn_path" }
    ]
  },
  {
    id: "feat-withering-endurance",
    label: "Withering Endurance",
    description: "Survive Trial 2 with 3 or more Curses active.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["trial", "curse", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cosmetic", target: "card_back", value: "withered_veil" }
    ]
  },
  {
    id: "feat-crowns-last-stand",
    label: "Crown's Last Stand",
    description: "Win the Final Usurper with only 1 Fortune.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    visibility: 'visible',
    tags: ["usurper", "fortune", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cosmetic", target: "card_back", value: "shattered_crown" }
    ]
  },
  // HIDDEN FEATS - Not known to player until completed
  {
    id: "feat-shadow-lord",
    label: "The Shadow Lord",
    description: "Clear a run under the \"Fear of Entombment\".",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
  // visibility: 'hidden',
    tags: ["fear", "entombment", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_common" }
    ]
  },
  {
    id: "feat-plague-bearer",
    label: "The Plague Bearer",
    description: "Defeat \"The Burden of the Plague (Pestilence)\".",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
  // visibility: 'hidden',
    tags: ["plague", "defeat", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "random_new" }
    ]
  },
  {
    id: "feat-crown-whisper",
    label: "The Crown Whisper",
    description: "Hoard 200 Coin while under the effects of \"The Burden of the Usurper\".",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    visibility: 'hidden',
    tags: ["usurper", "coin", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-alchemist",
    label: "The Alchemist",
    description: "Take 50 or more points from a single card play.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    visibility: 'hidden',
    tags: ["score", "single", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  // ALMOST IMPOSSIBLE FEAT
  {
    id: "feat-fallen",
    label: "The Fallen",
    description: "Get a high score of 10,000 or more with 3 or more Curses active.",
    type: "feat",
    rarity: "legendary",
    category: "",
    completed: false,
    visibility: 'hidden',
    tags: ["score", "curse", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "fear-poisoned-chalice" }
    ]
  },
  {
    id: "feat-card-shark",
    label: "Card Shark",
    description: "Play 100 cards from your hand. All hand plays gain +2 points.",
    type: "feat",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["hand", "scoring", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 2, condition: { event: "on_play_from_hand" } }
    ]
  },
  {
    id: "feat-deck-master",
    label: "Deck Master",
    description: "Play 100 cards from the deck. All deck plays gain +2 points.",
    type: "feat",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["deck", "scoring", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 2, condition: { event: "on_play_from_deck" } }
    ]
  },
  {
    id: "feat-efficient-play",
    label: "Efficient Play",
    description: "Complete an encounter in under 20 moves. Your hand size is permanently increased by 1.",
    type: "feat",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["hand-size", "efficiency", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "modify_setting", target: "handSize", value: 1 }
    ]
  },
  {
    id: "feat-conservative-play",
    label: "Conservative Play",
    description: "Complete an encounter without discarding any cards. Gain +10 coin at start of each encounter.",
    type: "feat",
    rarity: "common",
    category: "",
    completed: false,
    tags: ["coin", "discard", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 10, condition: { event: "on_encounter_start" } }
    ]
  },

  // UNCOMMON FEATS
  {
    id: "feat-ace-runner",
    label: "Ace Runner",
    description: "Play 50 Aces. All Ace cards gain +10 points when played.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["ace", "scoring", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 10, condition: { value: [1] } }
    ]
  },
  {
    id: "feat-royal-treatment",
    label: "Royal Treatment",
    description: "Play 30 face cards (J, Q, K). All face cards gain +8 points when played.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["face-cards", "scoring", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 8, condition: { value: [11, 12, 13] } }
    ]
  },
  {
    id: "feat-suit-specialist",
    label: "Suit Specialist",
    description: "Play 100 cards of the same suit. Cards of hearts suit gain +3 points.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["suit", "scoring", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 3, condition: { suit: "hearts" } }
    ]
  },
  {
    id: "feat-combo-master",
    label: "Combo Master",
    description: "Complete 5 perfect sequences. Gain +2 points for every card in a sequence.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["sequence", "scoring", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 2, condition: { event: "on_sequence_play" } }
    ]
  },
  {
    id: "feat-speed-demon",
    label: "Speed Demon",
    description: "Complete 10 encounters in under 30 moves each. Gain +5 coin for every move under 30.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["speed", "coin", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 5, condition: { event: "on_efficient_completion" } }
    ]
  },
  {
    id: "feat-perfectionist",
    label: "Perfectionist",
    description: "Complete 5 encounters without making any invalid moves. Gain +10 points for all plays.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["scoring", "precision", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 10 }
    ]
  },
  {
    id: "feat-coin-collector",
    label: "Coin Collector",
    description: "Accumulate 1000 coin. Gain +1 coin for every card played.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["coin", "accumulation", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 1, condition: { event: "on_any_play" } }
    ]
  },

  // RARE FEATS
  {
    id: "feat-legend-builder",
    label: "Legend Builder",
    description: "Complete 100 encounters. Your hand size is permanently increased by 2.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["hand-size", "endurance", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "modify_setting", target: "handSize", value: 2 }
    ]
  },
  {
    id: "feat-master-strategist",
    label: "Master Strategist",
    description: "Complete 50 encounters without using any exploits. All cards gain +5 points permanently.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["scoring", "strategy", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 5 }
    ]
  },
  {
    id: "feat-wealth-accumulator",
    label: "Wealth Accumulator",
    description: "Accumulate 10000 coin. Double all coin rewards.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["coin", "multiplier", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "coin_multiplier", target: "player", value: 2 }
    ]
  },
  {
    id: "feat-suit-harmony",
    label: "Suit Harmony",
    description: "Complete foundations in all 4 suits in a single encounter 10 times. Gain +20 points for mixed-suit plays.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["suit", "foundation", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 20, condition: { event: "on_mixed_suit_play" } }
    ]
  },
  {
    id: "feat-curse-breaker",
    label: "Curse Breaker",
    description: "Complete 20 encounters while having active curses. Reduce all curse penalties by 50%.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["curse", "mitigation", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "curse_mitigation", target: "all", value: 0.5 }
    ]
  },
  {
    id: "feat-fortune-hunter",
    label: "Fortune Hunter",
    description: "Collect 50 fortune effects. Increase all fortune benefits by 25%.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["fortune", "enhancement", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "fortune_enhancement", target: "all", value: 1.25 }
    ]
  },

  // EPIC FEATS
  {
    id: "feat-grand-master",
    label: "Grand Master",
    description: "Complete 500 encounters. All effects are 50% more powerful.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["mastery", "enhancement", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "global_multiplier", target: "all_effects", value: 1.5 }
    ]
  },
  {
    id: "feat-the-perfect-game",
    label: "The Perfect Game",
    description: "Complete an encounter with a perfect score (no wasted moves, optimal play). Gain +50 points for all plays.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["perfection", "scoring", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 50 }
    ]
  },
  {
    id: "feat-ultimate-collection",
    label: "Ultimate Collection",
    description: "Unlock all other achievements. Unlock unique 'Master' card that can be played as any value/suit and gives +100 points.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["ultimate", "master", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_master_card", target: "hand" },
      { action: "award_score", target: "tableau|foundation", value: 100, condition: { cardId: "master_card" } }
    ]
  },

  {
    id: "feat-moneylender",
    label: "The Moneylender",
    description: "Earn 300 Coin in a single run. Unlocks a new Rare Exploit for the pool.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["coin", "earning", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-artisan",
    label: "The Artisan",
    description: "Use 5 Blessings in a single run. Unlocks a new Fear for the pool.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["blessing", "usage", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "random_new" }
    ]
  },
  {
    id: "feat-prophet",
    label: "The Prophet",
    description: "Win a run after using \"The Seer's Eye\" to add a card to your hand. Unlocks a new Rare Exploit for the pool.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["seers-eye", "victory", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-unbroken",
    label: "The Unbroken",
    description: "Win a run after surviving the 'Fear of the Traitorous King'. Unlocks a new Legendary Exploit for the pool.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["fear", "survival", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-votary",
    label: "The Votary",
    description: "Acquire 3 Fortunes in a single run. Unlocks a new Rare Exploit for the pool.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["fortune", "multiple", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-heretic",
    label: "The Heretic",
    description: "Survive a run with 5 or more Curses. Unlocks a new Danger for the pool.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["curse", "survival", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "danger", value: "danger-time-of-judgement" }
    ]
  },
  {
    id: "feat-usurper-slayer",
    label: "The Usurper Slayer",
    description: "Defeat a Final Usurper. Unlocks a new Legendary Exploit for the pool.",
    type: "feat",
    rarity: "legendary",
    category: "",
    completed: false,
    tags: ["usurper", "boss", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-scholar",
    label: "The Scholar",
    description: "Unlock 10 Feats. Unlocks a new Rare Exploit for the pool.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["feat", "unlocking", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-spender",
    label: "The Spender",
    description: "Spend 500 Coin in a single run. Unlocks a new Wander for the pool.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["coin", "spending", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "wander", value: "random_new" }
    ]
  },
  {
    id: "feat-negotiator",
    label: "The Negotiator",
    description: "Choose a beneficial outcome from 10 Wander events. Unlocks a new Wander for the pool.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["wander", "choice", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "wander", value: "random_new" }
    ]
  },
  {
    id: "feat-commander",
    label: "The Commander",
    description: "Defeat 10 Dangers. Unlocks a new Legendary Exploit for the pool.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["danger", "defeat", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-master-builder",
    label: "The Master Builder",
    description: "Move 20 cards to a tableau in a single run. Unlocks a new Common Exploit for the pool.",
    type: "feat",
    rarity: "uncommon",
    category: "",
    completed: false,
    tags: ["tableau", "building", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_common" }
    ]
  },
  {
    id: "feat-collector",
    label: "The Collector",
    description: "Acquire 20 Exploits in a single run. Unlocks a new Fear for the pool.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["exploit", "collection", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "random_new" }
    ]
  },
  {
    id: "feat-steadfast",
    label: "The Steadfast",
    description: "Win a run with the same Fortune from the start. Unlocks a new Rare Exploit for the pool.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["fortune", "persistence", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-champion",
    label: "The Champion",
    description: "Win a run on difficulty level 7. Unlocks a new Legendary Exploit for the pool.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["difficulty", "victory", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-demigod",
    label: "The Demigod",
    description: "Get a high score of 10,000 or more. Unlocks a new Danger for the pool.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["score", "high", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "danger", value: "danger-wrath-of-the-kingdom" }
    ]
  },
  {
    id: "feat-perfectionist",
    label: "The Perfectionist",
    description: "Clear 5 encounters with a perfect score (100% of score target). Unlocks a new Legendary Exploit for the pool.",
    type: "feat",
    rarity: "legendary",
    category: "",
    completed: false,
    tags: ["perfect", "score", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_legendary" }
    ]
  },
  {
    id: "feat-enduring",
    label: "The Enduring",
    description: "Win a run with 3 or more Curses. Unlocks a new Wander for the pool.",
    type: "feat",
    rarity: "rare",
    category: "",
    completed: false,
    tags: ["curse", "endurance", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "wander", value: "random_new" }
    ]
  },
  {
    id: "feat-fortune-hunter-complete",
    label: "The Fortune Hunter",
    description: "Acquire all Fortunes in a single run. Unlocks a new Fear for the pool.",
    type: "feat",
    rarity: "epic",
    category: "",
    completed: false,
    tags: ["fortune", "complete", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "random_new" }
    ]
  },
  {
    id: "feat-endure-veil",
    label: "Endure the Veil",
    description: "Survive Trial 2 without visiting the Trader. Unlocks the \"Veil-Shrouded Leather\" card back.",
    type: "feat",
    rarity: "rare",
    category: "trial",
    completed: false,
    tags: ["trial", "trader", "card-back"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cardback", target: "player", value: "veil_shrouded_leather" }
    ]
  },
  {
    id: "feat-shattered-resolve",
    label: "Shattered Resolve",
    description: "Win a run after surviving \"The Burden of the Plague (Pestilence)\". Unlocks the \"Cracked Crown\" card back.",
    type: "feat",
    rarity: "epic",
    category: "plague",
    completed: false,
    tags: ["plague", "survival", "card-back"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cardback", target: "player", value: "cracked_crown" }
    ]
  },
  {
    id: "feat-fractured-path",
    label: "Fractured Path",
    description: "Complete Trial 1 with 2 or more Curses. Unlocks the \"Plague-Worn Path\" card back.",
    type: "feat",
    rarity: "uncommon",
    category: "trial",
    completed: false,
    tags: ["trial", "curse", "card-back"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cardback", target: "player", value: "plague_worn_path" }
    ]
  },
  {
    id: "feat-withering-endurance",
    label: "Withering Endurance",
    description: "Survive Trial 2 with 3 or more Curses active. Unlocks the \"Withered Veil\" card back.",
    type: "feat",
    rarity: "rare",
    category: "trial",
    completed: false,
    tags: ["trial", "curse", "card-back"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cardback", target: "player", value: "withered_veil" }
    ]
  },
  {
    id: "feat-crowns-last-stand",
    label: "Crown's Last Stand",
    description: "Win the Final Usurper with only 1 Fortune. Unlocks the \"Shattered Crown\" card back.",
    type: "feat",
    rarity: "legendary",
    category: "usurper",
    completed: false,
    tags: ["usurper", "fortune", "card-back"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_cardback", target: "player", value: "shattered_crown" }
    ]
  },
  {
    id: "feat-shadow-lord",
    label: "The Shadow Lord",
    description: "Clear a run under the \"Fear of Entombment\". Unlocks a new Common Exploit for the pool.",
    type: "feat",
    rarity: "rare",
    category: "hidden",
    completed: false,
    tags: ["fear", "entombment", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_common" }
    ]
  },
  {
    id: "feat-plague-bearer",
    label: "The Plague Bearer",
    description: "Defeat \"The Burden of the Plague (Pestilence)\". Unlocks a new Fear for the pool.",
    type: "feat",
    rarity: "epic",
    category: "hidden",
    completed: false,
    tags: ["plague", "defeat", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "random_new" }
    ]
  },
  {
    id: "feat-crown-whisper",
    label: "The Crown Whisper",
    description: "Hoard 200 Coin while under the effects of \"The Burden of the Usurper\". Unlocks a new Rare Exploit for the pool.",
    type: "feat",
    rarity: "rare",
    category: "hidden",
    completed: false,
    tags: ["usurper", "coin", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  },
  {
    id: "feat-fallen",
    label: "The Fallen",
    description: "Get a high score of 10,000 or more with 3 or more Curses active. Unlocks a new Impossible Fear for the pool.",
    type: "feat",
    rarity: "legendary",
    category: "almost_impossible",
    completed: false,
    tags: ["score", "curse", "impossible"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "fear", value: "fear-locked-coffer" }
    ]
  },
  {
    id: "feat-alchemist",
    label: "The Alchemist",
    description: "Take 50 or more points from a single card play. Unlocks a new Rare Exploit for the pool.",
    type: "feat",
    rarity: "rare",
    category: "hidden",
    completed: false,
    tags: ["points", "single-play", "achievement"],
    choices: [],
    results: {},
    effects: [
      { action: "unlock_item", target: "exploit", value: "random_rare" }
    ]
  }
];
// WANDERS
export const wanders: RegistryEntry[] = [
  {
    id: "wander-forsaken-well",
    label: "The Forsaken Well",
    description: "You discover an old, forgotten well, its stone rim covered in moss. A faint, otherworldly glow emanates from its depths.",
    type: "wander",
    rarity: "",
    category: "mystical",
    completed: false,
    tags: ["well", "risk", "power"],
    choices: ["Descend into the well", "Leave it be"],
    results: {
      "Descend into the well": "Gain a random Rare Exploit, but you are marked by the well's curse. Gain a random Curse.",
      "Leave it be": "No change."
    },
    effects: []
  },
  {
    id: "wander-peddler-of-cures", 
    label: "The Peddler of Cures",
    description: "A cloaked figure sits by the side of the road, offering a vial of bubbling liquid. 'A cure for what ails you,' he whispers, holding it out to you.",
    type: "wander",
    rarity: "",
    category: "healing",
    completed: false,
    tags: ["cure", "curse", "risk"],
    choices: ["Drink the concoction", "Refuse the offer"],
    results: {
      "Drink the concoction": "Choose one of your existing Curses to remove. There is a 50% chance you lose all of your Coin in the process.",
      "Refuse the offer": "No change."
    },
    effects: []
  },
  {
    id: "wander-lost-coin",
    label: "The Lost Coin",
    description: "You notice a small, tarnished coin lying in the dirt, half-buried near the roots of a tree.",
    type: "wander",
    rarity: "",
    category: "luck",
    completed: false,
    tags: ["coin", "luck", "risk"],
    choices: ["Pick up the coin", "Leave it be"],
    results: {
      "Pick up the coin": "Gain 10 Coin. There is a 10% chance you also receive a random Curse.",
      "Leave it be": "No change."
    },
    effects: []
  },
  {
    id: "wander-whispering-tree",
    label: "The Whispering Tree",
    description: "A gnarled, ancient tree with bark that twists into a hundred solemn faces stands before you. A soft, eerie whisper seems to be coming from its leaves.",
    type: "wander",
    rarity: "",
    category: "mystical",
    completed: false,
    tags: ["tree", "wisdom", "blessing"],
    choices: ["Listen to its secrets", "Turn away"],
    results: {
      "Listen to its secrets": "Gain one Blessing. You must pay a price for this knowledge; lose 20 Coin.",
      "Turn away": "No change."
    },
    effects: []
  },
  {
    id: "wander-broken-altar",
    label: "The Broken Altar", 
    description: "You come across a small, stone altar cracked down the middle. A small crevice allows for a card to be placed inside.",
    type: "wander",
    rarity: "",
    category: "sacrifice",
    completed: false,
    tags: ["altar", "sacrifice", "reward"],
    choices: ["Sacrifice a card from your hand", "Leave it be"],
    results: {
      "Sacrifice a card from your hand": "You lose the card. If the card was a King, Queen, or Jack, you gain 50 Coin. If the card was any other card, you gain 10 Coin.",
      "Leave it be": "No change."
    },
    effects: []
  },
  {
    id: "wander-lost-pilgrim",
    label: "The Lost Pilgrim",
    description: "You find a weary pilgrim on the side of the road, their face gaunt and their clothes tattered. They are in desperate need of aid, but you are not sure if you have enough to spare.",
    type: "wander",
    rarity: "",
    category: "compassion",
    completed: false,
    tags: ["pilgrim", "charity", "discard"],
    choices: ["Offer your hand", "Walk away"],
    results: {
      "Offer your hand": "Lose 5 Coin. Gain one additional discard for the rest of the run.",
      "Walk away": "No change."
    },
    effects: []
  },
  {
    id: "wander-shrouded-figure",
    label: "The Shrouded Figure",
    description: "A robed figure stands motionless on a bridge, holding out three face-down cards. Their face is hidden in shadow. 'Choose,' they whisper, without moving.",
    type: "wander",
    rarity: "",
    category: "mystery",
    completed: false,
    tags: ["figure", "cards", "exploit"],
    choices: ["Take a card", "Refuse the offer"],
    results: {
      "Take a card": "Gain a random Uncommon Exploit.",
      "Refuse the offer": "No change."
    },
    effects: []
  },
  {
    id: "wander-crumbling-shrine",
    label: "The Crumbling Shrine", 
    description: "You find a small, forgotten shrine in the woods, its roof collapsed and its statue covered in vines. A faint light seems to emanate from within.",
    type: "wander",
    rarity: "",
    category: "religious",
    completed: false,
    tags: ["shrine", "blessing", "risk"],
    choices: ["Light a candle", "Take the statue's eyes"],
    results: {
      "Light a candle": "Gain a random Blessing.",
      "Take the statue's eyes": "Gain a random Rare Exploit, but you also gain a random Curse."
    },
    effects: []
  },
  {
    id: "wander-ruined-chest",
    label: "The Ruined Chest",
    description: "You find a small, wooden chest, half-buried in the dirt. It is locked, but the wood is rotting and a little bit of force might be all that is needed to break it open.",
    type: "wander",
    rarity: "",
    category: "treasure",
    completed: false,
    tags: ["chest", "treasure", "risk"],
    choices: ["Break the chest open", "Leave it be"],
    results: {
      "Break the chest open": "Gain a random Blessing but lose all of your Coin.",
      "Leave it be": "No change."
    },
    effects: []
  },
  {
    id: "wander-serpents-offer",
    label: "The Serpent's Offer", 
    description: "A strange serpent, adorned with glistening scales, slithers out from beneath a rock and drops a single card in front of you.",
    type: "wander",
    rarity: "",
    category: "mystical",
    completed: false,
    tags: ["serpent", "blessing", "gift"],
    choices: ["Take the card", "Leave it be"],
    results: {
      "Take the card": "Add a random Blessing to your hand.",
      "Leave it be": "No change."
    },
    effects: []
  },
  {
    id: "wander-abandoned-caravan",
    label: "The Abandoned Caravan",
    description: "You stumble upon a ransacked caravan, its wooden wheels splintered and its cargo scattered across the path. Amidst the wreckage, a single, battered lockbox remains, half-buried in the dirt.",
    type: "wander",
    rarity: "",
    category: "treasure", 
    completed: false,
    tags: ["caravan", "lockbox", "risk"],
    choices: ["Pry open the lockbox", "Leave it be"],
    results: {
      "Pry open the lockbox": "Gain 50 Coin and a random Blessing. There is a 25% chance a card with a value of 1, 5, or 10 is permanently removed from your deck.",
      "Leave it be": "No change."
    },
    effects: []
  },
  {
    id: "wander-cursed-relic",
    label: "The Cursed Relic",
    description: "A small, dark altar stands in a shadowy grove. Upon it rests a twisted metal relic that hums with a palpable, dark energy. Taking it feels like a heavy burden, but also a source of great power.",
    type: "wander",
    rarity: "",
    category: "cursed",
    completed: false,
    tags: ["relic", "power", "curse"],
    choices: ["Take the relic", "Desecrate the altar"],
    results: {
      "Take the relic": "Gain a random Epic Exploit, but you also gain a random Curse.",
      "Desecrate the altar": "You lose one of your existing Curses. There is a 50% chance you lose all of your Coin."
    },
    effects: []
  },
  {
    id: "wander-grimoire-of-lies",
    label: "The Grimoire of Lies",
    description: "You find a leather-bound book lying open in the middle of a clearing. It's filled with twisting script and confusing diagrams. The pages seem to shift and change as you look at them.",
    type: "wander",
    rarity: "",
    category: "knowledge",
    completed: false,
    tags: ["grimoire", "knowledge", "deception"],
    choices: ["Read the book", "Burn the book"],
    results: {
      "Read the book": "Gain a random Rare Exploit, but your discard and shuffle counts are reduced by 1 for the rest of the run.",
      "Burn the book": "Gain 25 Coin."
    },
    effects: []
  },
  {
    id: "wander-beggars-blessing",
    label: "The Beggar's Blessing",
    description: "A lonely beggar sits on a stone, holding out a weathered hand. He looks up at you with weary eyes, but a glimmer of something more powerful seems to reside within them.",
    type: "wander",
    rarity: "",
    category: "compassion",
    completed: false,
    tags: ["beggar", "blessing", "karma"],
    choices: ["Give Coin to the beggar", "Steal from the beggar"],
    results: {
      "Give Coin to the beggar": "Lose 10 Coin. Gain a random Blessing and 50 points.",
      "Steal from the beggar": "Gain 10 Coin. You also gain a random Curse."
    },
    effects: []
  },
  {
    id: "wander-whispering-fountain",
    label: "The Whispering Fountain",
    description: "You come across a small, mossy fountain in a hidden glade. Its water flows in a strange, shimmering stream and seems to hum with a quiet energy.",
    type: "wander",
    rarity: "",
    category: "mystical",
    completed: false,
    tags: ["fountain", "water", "blessing"],
    choices: ["Drink the water", "Drop a Coin in the water"],
    results: {
      "Drink the water": "Gain a random Uncommon Exploit. There is a 25% chance you also receive a random Curse.",
      "Drop a Coin in the water": "Lose 1 Coin. Gain a random Blessing."
    },
    effects: []
  },
  {
    id: "wander-grave-robber",
    label: "The Grave Robber",
    description: "You find a freshly dug grave, its soil still loose. A small wooden sign nearby reads, 'Here lies the foolish traveler who sought to escape fate.'",
    type: "wander",
    rarity: "",
    category: "dark",
    completed: false,
    tags: ["grave", "robbing", "death"],
    choices: ["Disturb the grave", "Leave it be"],
    results: {
      "Disturb the grave": "Gain 50 Coin and 100 points. There is a 50% chance a card with a value of 1, 5, or 10 is permanently removed from your deck.",
      "Leave it be": "No change."
    },
    effects: []
  },
  {
    id: "wander-old-hermit",
    label: "The Old Hermit",
    description: "You find a small hut nestled deep in the woods. An old hermit with a long beard sits outside, staring into a fire. 'Only a few brave enough come this way,' he says, without looking at you.",
    type: "wander",
    rarity: "",
    category: "wisdom",
    completed: false,
    tags: ["hermit", "wisdom", "guidance"],
    choices: ["Ask for guidance", "Walk away"],
    results: {
      "Ask for guidance": "Gain a random Rare Exploit. There is a 25% chance you are burdened with a random Curse.",
      "Walk away": "No change."
    },
    effects: []
  },
  {
    id: "wander-cursed-flowers",
    label: "The Field of Cursed Flowers",
    description: "You come across a field of beautiful flowers, their petals shimmering with an ethereal glow. A strange, sickly sweet scent hangs in the air.",
    type: "wander",
    rarity: "",
    category: "nature",
    completed: false,
    tags: ["flowers", "curse", "beauty"],
    choices: ["Touch the flowers", "Burn the flowers"],
    results: {
      "Touch the flowers": "Gain a random Blessing. There is a 50% chance you gain a random Curse.",
      "Burn the flowers": "Gain 200 points to your score."
    },
    effects: []
  },
  {
    id: "wander-ancient-gate",
    label: "The Ancient Gate",
    description: "You find a massive, stone gate, half-buried in the ground. Its surface is covered in strange symbols and an almost unnoticeable seam.",
    type: "wander",
    rarity: "",
    category: "ancient",
    completed: false,
    tags: ["gate", "ancient", "power"],
    choices: ["Push the gate open", "Leave it be"],
    results: {
      "Push the gate open": "Gain a random Epic Exploit. There is a 25% chance you are burdened with a random Curse.",
      "Leave it be": "No change."
    },
    effects: []
  },
  {
    id: "wander-lost-locket",
    label: "The Lost Locket",
    description: "You find a small, tarnished locket lying on the ground. When you open it, a faint image of a familiar face looks back at you.",
    type: "wander",
    rarity: "",
    category: "memory",
    completed: false,
    tags: ["locket", "memory", "connection"],
    choices: ["Keep the locket", "Leave it be"],
    results: {
      "Keep the locket": "Gain 50 Coin. There is a 50% chance your shuffle count is permanently reduced by 1 for the rest of the run.",
      "Leave it be": "No change."
    },
    effects: []
  }
];
// DANGERS 
export const dangers: RegistryEntry[] = [
  {
    id: "danger-kings-love-tyranny",
    label: "Kings love Tyranny",
    description: "Cards with a face value of 11, 12, or 13 cannot be played to a tableau. However, all point values gained from foundations are doubled.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["face-cards", "tableau", "foundation"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "tableau", condition: { value: [11, 12, 13] } },
      { action: "score_multiplier", target: "foundation", value: 2 }
    ]
  },
  {
    id: "danger-devils-gambit",
    label: "Devil's Gambit",
    description: "When you play a card from the deck, flip a coin. If heads, you gain 50 coin. If tails, you lose 50 coin.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["deck", "coin", "chance"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 50, condition: { event: "on_coin_flip_heads" } },
      { action: "award_coin", target: "player", value: -50, condition: { event: "on_coin_flip_tails" } }
    ]
  },
  {
    id: "danger-poisoned-chalice",
    label: "Poisoned Chalice",
    description: "Every Red card played from your hand gives a score bonus of 100 points. However, every Black card played from your hand gives you a score penalty of 50 points.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["hand", "color", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 100, condition: { suit: ["hearts", "diamonds"], event: "on_play_from_hand" } },
      { action: "award_score", target: "tableau|foundation", value: -50, condition: { suit: ["clubs", "spades"], event: "on_play_from_hand" } }
    ]
  },
  {
    id: "danger-time-of-judgement",
    label: "Time of Judgement",
    description: "Whenever you play a card to a foundation, you must also discard a card from your hand. However, all cards played to foundations gain a bonus of 25 points.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "discard", "hand"],
    choices: [],
    results: {},
    effects: [
      { action: "force_discard", target: "hand", condition: { event: "on_foundation_play" } },
      { action: "award_score", target: "foundation", value: 25 }
    ]
  },
  {
    id: "danger-wrath-of-the-kingdom",
    label: "Wrath of the Kingdom",
    description: "Every time you play a card to a tableau, you lose 10 coin. However, every time you play a card to a foundation, you gain 20 coin.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "foundation", "coin"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: -10, condition: { event: "on_tableau_play" } },
      { action: "award_coin", target: "player", value: 20, condition: { event: "on_foundation_play" } }
    ]
  },
  {
    id: "danger-corruption-of-the-realm",
    label: "Corruption of the Realm",
    description: "At the start of the encounter, half your coin is lost. However, every card played to a tableau gives you 5 bonus coin.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["coin", "tableau", "encounter"],
    choices: [],
    results: {},
    effects: [
      { action: "coin_multiplier", target: "player", value: 0.5, condition: { event: "on_encounter_start" } },
      { action: "award_coin", target: "player", value: 5, condition: { event: "on_tableau_play" } }
    ]
  },
  {
    id: "danger-fall-of-an-empire",
    label: "Fall of an Empire",
    description: "The first card played each turn is automatically discarded. However, all subsequent cards played that turn gain a bonus of 20 points.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["discard", "turn", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "auto_discard", target: "first_card_per_turn" },
      { action: "award_score", target: "tableau|foundation", value: 20, condition: { event: "on_subsequent_plays" } }
    ]
  },
  {
    id: "danger-desperate-measures",
    label: "Desperate Measures",
    description: "Your hand size is reduced by two. However, every card played from your hand gains a bonus of 30 points.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["hand-size", "hand", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "modify_setting", target: "handSize", value: -2 },
      { action: "award_score", target: "tableau|foundation", value: 30, condition: { event: "on_play_from_hand" } }
    ]
  },
  {
    id: "danger-betrayal",
    label: "Betrayal",
    description: "You cannot move cards between tableaus. However, every card played to a tableau gives you 10 coin and 10 score bonus.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "movement", "coin"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "tableau_to_tableau" },
      { action: "award_coin", target: "player", value: 10, condition: { event: "on_tableau_play" } },
      { action: "award_score", target: "tableau", value: 10 }
    ]
  },
  {
    id: "danger-blood-pact",
    label: "Blood Pact",
    description: "Every card played to a foundation causes you to lose 20 coin. However, all foundation plays are worth triple points.",
    type: "danger",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "coin", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: -20, condition: { event: "on_foundation_play" } },
      { action: "score_multiplier", target: "foundation", value: 3 }
    ]
  }
];

// FORTUNES
export const fortunes: RegistryEntry[] = [
  {
    id: "fortune-blessed-draw",
    label: "Blessed Draw",
    description: "The next 5 cards you draw from the deck are permanently blessed with 15 bonus points when played.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["deck", "blessing", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 15, condition: { event: "on_next_5_draws" } }
    ]
  },
  {
    id: "fortune-divine-intervention",
    label: "Divine Intervention",
    description: "The next card that would be discarded instead returns to your hand and gains 25 bonus points.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["discard", "hand", "blessing"],
    choices: [],
    results: {},
    effects: [
      { action: "prevent_discard", target: "next_card" },
      { action: "return_to_hand", target: "next_discard" },
      { action: "award_score", target: "tableau|foundation", value: 25, condition: { cardId: "prevented_discard" } }
    ]
  },
  {
    id: "fortune-golden-touch",
    label: "Golden Touch",
    description: "For the rest of the encounter, every card you play to a foundation gives you 5 bonus coin.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["foundation", "coin", "persistent"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 5, condition: { event: "on_foundation_play", duration: "encounter" } }
    ]
  },
  {
    id: "fortune-stroke-of-luck",
    label: "Stroke of Luck",
    description: "Your hand size is permanently increased by one, and you draw one additional card.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["hand-size", "draw", "permanent"],
    choices: [],
    results: {},
    effects: [
  { action: "modify_setting", target: "handSize", value: 1, condition: { event: "immediate" } },
  { action: "draw_card", target: "hand", value: 1, condition: { event: "immediate" } }
    ]
  },
  {
    id: "fortune-lucky-streak",
    label: "Lucky Streak",
    description: "The next 3 cards you play gain 20 bonus points each.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["scoring", "temporary", "blessing"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 20, condition: { event: "on_next_3_plays" } }
    ]
  },
  {
    id: "fortune-royal-favor",
    label: "Royal Favor",
    description: "All face cards (Jack, Queen, King) played for the rest of the encounter gain 30 bonus points.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["face-cards", "scoring", "encounter"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 30, condition: { value: [11, 12, 13], duration: "encounter" } }
    ]
  },
  {
    id: "fortune-windfall",
    label: "Windfall",
    description: "You gain 100 coin immediately.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["coin", "immediate"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 100, condition: { event: "immediate" } }
    ]
  },
  {
    id: "fortune-serendipity",
    label: "Serendipity",
    description: "The next time you would be forced to discard a card, you may instead choose to play it to any valid location with 10 bonus points.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["discard", "play", "choice"],
    choices: [],
    results: {},
    effects: [
      { action: "convert_discard_to_play", target: "next_discard" },
      { action: "award_score", target: "tableau|foundation", value: 10, condition: { cardId: "converted_discard" } }
    ]
  },
  {
    id: "fortune-gift-of-the-gods",
    label: "Gift of the Gods",
    description: "A special 'Wild' card is added to your hand that can be played as any suit or value, and gives 50 bonus points.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["wild", "special", "hand"],
    choices: [],
    results: {},
    effects: [
      { action: "add_card", target: "hand", value: "wild_card", condition: { event: "immediate" } },
      { action: "award_score", target: "tableau|foundation", value: 50, condition: { event: "on_wild_card_play" } }
    ]
  },
  {
    id: "fortune-merchants-delight",
    label: "Merchant's Delight",
    description: "For the rest of the encounter, every card played to a tableau gives you 3 bonus coin.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "coin", "encounter"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 3, condition: { event: "on_tableau_play", duration: "encounter" } }
    ]
  },
  {
    id: "fortune-abundance",
    label: "Abundance",
    description: "You draw 3 additional cards and all of them gain 10 bonus points when played.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["draw", "blessing", "scoring"],
    choices: [],
    results: {},
    effects: [
  { action: "draw_card", target: "hand", value: 3 },
  { action: "award_score", target: "tableau|foundation", value: 10, condition: { cardId: "drawn_cards" } }
    ]
  },
  {
    id: "fortune-midas-touch",
    label: "Midas Touch",
    description: "For the next turn, every card you play to a tableau gives you 3 coin.",
    type: "fortune",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "coin", "turn"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: 3, condition: { event: "on_tableau_play", duration: "next_turn" } }
    ]
  }
];

// CURSES
export const curses: RegistryEntry[] = [
  {
    id: "curse-debt-to-pay",
    label: "Debt to Pay",
    description: "You lose 20 coin at the start of each encounter. However, all cards gain a bonus of 20 points when they are played to a foundation.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["coin", "foundation", "encounter"],
    choices: [],
    results: {},
    effects: [
      { action: "award_coin", target: "player", value: -20, condition: { event: "on_encounter_start" } },
      { action: "award_score", target: "foundation", value: 20, condition: { event: "on_play" } }
    ]
  },
  {
    id: "curse-guilt-of-lies",
    label: "Guilt of Lies",
    description: "You cannot discard cards. However, you gain 5 bonus coin every time a card is played to a foundation.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["discard", "foundation", "coin"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "discard" },
      { action: "award_coin", target: "player", value: 5, condition: { event: "on_play_to_foundation" } }
    ]
  },
  {
    id: "curse-weight-of-grief",
    label: "Weight of Grief",
    description: "Your hand size is permanently reduced by one. However, all cards played from the deck gain a bonus of 10 points.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["hand-size", "deck", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "modify_setting", target: "handSize", value: -1 },
      { action: "award_score", target: "tableau|foundation", value: 10, condition: { event: "on_play_from_deck" } }
    ]
  },
  {
    id: "curse-family-feud",
    label: "Family Feud",
    description: "You cannot play cards with a value of Ace or King. However, all other cards gain a bonus of 5 points when played.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["ace", "king", "restriction"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "play", condition: { value: [1, 13] } },
      { action: "award_score", target: "tableau|foundation", value: 5, condition: { not_value: [1, 13] } }
    ]
  },
  {
    id: "curse-social-outcast",
    label: "Social Outcast",
    description: "You cannot move cards between tableaus. However, all cards played from a tableau gain a bonus of 15 points.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "movement"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "tableau_to_tableau" },
      { action: "award_score", target: "tableau|foundation", value: 15, condition: { event: "on_play_from_tableau" } }
    ]
  },
  {
    id: "curse-chronic-illness",
    label: "Chronic Illness",
    description: "All cards played from your hand give half their point value. However, all cards played from the deck give double their point value.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["hand", "deck", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "score_multiplier", target: "hand", value: 0.5 },
      { action: "score_multiplier", target: "deck", value: 2 }
    ]
  },
  {
    id: "curse-burden-of-the-oath",
    label: "Burden of the Oath",
    description: "You cannot play cards to a tableau unless you play a card to a foundation first. However, all cards played to a foundation gain a bonus of 10 points.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["tableau", "foundation", "restriction"],
    choices: [],
    results: {},
    effects: [
      { action: "restrict_play", target: "tableau", condition: { event: "must_play_foundation_first" } },
      { action: "award_score", target: "foundation", value: 10 }
    ]
  },
  {
    id: "curse-lost-livelihood",
    label: "Lost Livelihood",
    description: "All cards played from the deck lose their point value. However, every card played from your hand gives you a bonus of 10 points.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["deck", "hand", "scoring"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: 0, condition: { event: "on_play_from_deck" } },
      { action: "award_score", target: "tableau|foundation", value: 10, condition: { event: "on_play_from_hand" } }
    ]
  },
  {
    id: "curse-ever-rising-tide",
    label: "Ever-Rising Tide",
    description: "The deck is exhausted. You cannot draw new cards from the deck. However, your hand size is permanently increased by two and all cards played from your hand gain a bonus of 20 points.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["deck", "draw", "hand"],
    choices: [],
    results: {},
    effects: [
      { action: "block", target: "draw_from_deck" },
      { action: "modify_setting", target: "handSize", value: 2 },
      { action: "award_score", target: "tableau|foundation", value: 20, condition: { event: "on_play_from_hand" } }
    ]
  },
  {
    id: "curse-a-mouth-to-feed",
    label: "A Mouth to Feed",
    description: "A permanent card called 'The Burden' is added to your hand. It cannot be discarded, but when played to a tableau, it acts as a Wild card and gives a bonus of 50 points.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["burden", "wild", "special"],
    choices: [],
    results: {},
    effects: [
      { action: "add_card", target: "hand", value: "burden" },
      { action: "block", target: "discard", condition: { cardId: "burden" } },
      { action: "award_score", target: "tableau", value: 50, condition: { cardId: "burden" } }
    ]
  },
  {
    id: "curse-festering-sickness",
    label: "Festering Sickness",
    description: "Every third card you play to a stack is permanently hindered by 25 score. However, all other cards gain a bonus of 10 points.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["scoring", "hindrance"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: -25, condition: { event: "on_every_third_play" } },
      { action: "award_score", target: "tableau|foundation", value: 10, condition: { event: "on_other_plays" } }
    ]
  },
  {
    id: "curse-broken-trust",
    label: "Broken Trust",
    description: "When you play a card to a Stack, there is a 50% chance it is permanently hindered by 15 score. However, you gain 10 bonus coin for every hindered card you play.",
    type: "curse",
    rarity: "",
    category: "",
    completed: false,
    tags: ["scoring", "coin", "chance"],
    choices: [],
    results: {},
    effects: [
      { action: "award_score", target: "tableau|foundation", value: -15, condition: { event: "on_50_percent" } },
      { action: "award_coin", target: "player", value: 10, condition: { event: "on_hindered_play" } }
    ]
  }
];