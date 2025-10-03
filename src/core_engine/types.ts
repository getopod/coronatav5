// Core engine data structures for card games
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string;
  suit: Suit;
  value: number; // 1-13
  faceUp: boolean;
  design?: string; // e.g., asset key or CSS class
  tags?: string[];
  meta?: Record<string, any>;
}

export interface Pile {
  id: string;
  type: string; // 'deck', 'hand', 'tableau', 'foundation', 'discard', etc.
  cards: Card[];
  rules?: Record<string, any>; // pile-specific rules
  meta?: Record<string, any>;
}

export interface PlayerState {
  coins?: number;
  shuffles?: number;
  discards?: number;
  score?: number;
  maxHandSize?: number; // Maximum cards in hand (default 5, can be increased by effects)
  exploits?: string[]; // IDs of equipped exploits
  curses?: string[]; // IDs of active curses
  blessings?: string[]; // IDs of active blessings
  fortunes?: string[]; // IDs of active fortunes
  [key: string]: any;
}

export interface EncounterState {
  id: string;
  type: 'fear' | 'danger';
  registryId: string; // ID from registry (fear/danger)
  name: string;
  description: string;
  effects: any[];
  scoreGoal?: number;
  completed?: boolean;
}

export interface RunState {
  currentTrial: number;
  currentEncounter: number;
  totalTrials: number;
  encountersPerTrial: number;
  encounter?: EncounterState;
  difficulty: number;
  seed?: string; // for reproducible runs
  awaitingPlayerChoice?: boolean; // true when encounter is complete and waiting for post-encounter choices
  availableChoices?: string[]; // ['trade', 'wander'] when encounter is complete (random order)
}

export interface PlayerProfile {
  id: string;
  name: string;
  stats: PlayerStats;
  settings?: Record<string, any>;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  highestScore: number;
  [key: string]: any;
}

export interface GameState {
  piles: Record<string, Pile>;
  player: PlayerState;
  run?: RunState;
  registry?: any; // will be typed later
  history: Move[];
  meta?: Record<string, any>;
  profile?: PlayerProfile;
  blocked?: boolean;
  blockReason?: string;
  // Ascension system properties
  ascension?: {
    currentLevel: number;
    levelInfo: any; // AscensionLevel from ascensionSystem.ts
    appliedChallenges: string[];
  };
  modifiers?: {
    costMultiplier?: number;
    scoreMultiplier?: number;
    rewardMultiplier?: number;
  };
  settings?: {
    handSize?: number;
    shufflesPerEncounter?: number;
    drawReduction?: number;
  };
}

export interface Move {
  from: string; // pile id
  to: string;   // pile id
  cardId: string;
  type?: string; // e.g., 'normal', 'special'
  stackSize?: number; // number of cards moved in stack
  cardIds?: string[]; // IDs of all cards in moved stack
  meta?: Record<string, any>;
}
