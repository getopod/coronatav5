// Registry Loader & Config System for Card Game Engine

import { Pile, Card, GameState } from './types';

export interface RegistryConfig {
  piles: PileConfig[];
  cards?: CardConfig[];
  rules?: Record<string, any>;
  effects?: Record<string, any>;
  winCondition?: string | ((state: GameState) => boolean);
  lossCondition?: string | ((state: GameState) => boolean);
  scoring?: Record<string, any>;
  resources?: Record<string, any>;
  meta?: Record<string, any>;
  variant?: string;
  customMoves?: Record<string, any>; // custom move definitions
}

export interface PileConfig {
  id: string;
  type: string;
  initialCards?: string[]; // card ids or config
  rules?: Record<string, any>;
  meta?: Record<string, any>;
}

export interface CardConfig {
  id: string;
  suit: string;
  value: number;
  faceUp?: boolean;
  design?: string;
  tags?: string[];
  meta?: Record<string, any>;
}

export function loadRegistry(config: RegistryConfig): GameState {
  // Create piles
  const piles: Record<string, Pile> = {};
  for (const pileCfg of config.piles) {
    piles[pileCfg.id] = {
      id: pileCfg.id,
      type: pileCfg.type,
      cards: [],
      rules: pileCfg.rules,
      meta: pileCfg.meta,
    };
  }
  // Create cards
  const cardMap: Record<string, Card> = {};
  if (config.cards) {
    for (const cardCfg of config.cards) {
      cardMap[cardCfg.id] = {
        id: cardCfg.id,
        suit: cardCfg.suit as any,
        value: cardCfg.value,
        faceUp: cardCfg.faceUp ?? false,
        design: cardCfg.design,
        tags: cardCfg.tags,
        meta: cardCfg.meta,
      };
    }
  }
  // Distribute initial cards to piles
  for (const pileCfg of config.piles) {
    if (pileCfg.initialCards) {
      piles[pileCfg.id].cards = pileCfg.initialCards.map(cid => cardMap[cid]).filter(Boolean);
    }
  }
  // Build initial game state
  const state: GameState = {
    piles,
    player: {
      maxHandSize: 5,
      coins: 50, // Updated to new balance: 50 starting coins
      score: 0, // Initialize score to 0
      exploits: [], // Initialize empty arrays for registry items
      ownedBlessings: [], // Purchased blessings awaiting application to cards
      curses: [],
      activeFortune: undefined,
      ...config.resources || {}
    },
    registry: config,
    history: [],
    meta: config.meta,
  };
  return state;
}
