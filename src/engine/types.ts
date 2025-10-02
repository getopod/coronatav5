// Core engine data structures for card games
import type { EngineController } from './engineController';
import type { EngineEvent } from './eventSystem';
import type { EffectHandler } from './effectEngine';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export interface Card {
  id: string;
  suit: Suit;
  value: number; // 1-13
  faceUp: boolean;
  design?: string; // e.g., asset key or CSS class
  tags?: string[];
  meta?: Record<string, any>;
  blessings?: string[]; // IDs of blessings attached to this specific card
  autoPlay?: boolean; // Mark card for automatic play when valid moves available
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
  ownedBlessings?: string[]; // IDs of purchased blessings (not yet applied to cards)
  fortunes?: string[]; // IDs of active fortunes
  coinMultiplier?: number; // Multiplier for coin rewards
  [key: string]: any;
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
  registry?: any; // will be typed later
  history: Move[];
  meta?: Record<string, any>;
  profile?: PlayerProfile;
  activeMultipliers?: any[]; // Store active score multipliers
  movePermissions?: any[]; // Store special move permissions
  run?: any; // Coronata run state
  
  // Extended effect state
  fortuneEnhancement?: {
    multiplier: number;
    active: boolean;
  };
  encounterEffects?: Array<{
    action: string;
    target?: string;
    value?: any;
    source: string;
  }>;
  globalMultipliers?: {
    score?: number;
    coin?: number;
  };
  unlockedItems?: Record<string, string[]>;
  immunities?: string[];
  unlimited?: string[];
  curseMitigation?: number;
  nextCardEffects?: Array<{
    count: number;
    effect: string;
    remaining: number;
  }>;
  temporaryBoosts?: Array<{
    type: string;
    value: number;
    remaining: number;
  }>;
  
  // Additional effect state for complex behaviors
  playCopyEffects?: Array<{
    target: string;
    condition?: any;
  }>;
  fillTableauEffects?: Array<{
    target: string;
    condition?: any;
  }>;
  pendingRewards?: Array<{
    type: string;
    target?: string;
  }>;
  specialScoring?: Array<{
    type: string;
    target: string;
    oneShot?: boolean;
  }>;
  additionalTableaux?: number;
  suitOverrides?: Array<{
    target: string;
    value: string;
  }>;
  valueOverrides?: Array<{
    target: string;
    value: string;
  }>;
  unlockedTableaux?: number;
  blockedActions?: string[];
  resourceLimits?: Record<string, number>;
}

export interface Move {
  from: string; // pile id
  to: string;   // pile id
  cardId: string;
  type?: string; // e.g., 'normal', 'special'
  stackSize?: number; // number of cards moved in this move
  cardIds?: string[]; // all card IDs in the moved stack
  meta?: Record<string, any>;
}

export interface EnginePlugin {
  id: string;
  name: string;
  onRegister?: (engine: EngineController) => void;
  onUnregister?: (engine: EngineController) => void;
  onEvent?: (event: EngineEvent, engine: EngineController) => void;
  effectHandlers?: Record<string, EffectHandler>;
  uiConsumers?: ((event: EngineEvent) => void)[];
}
