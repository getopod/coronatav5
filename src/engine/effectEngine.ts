// Effect Engine & Condition System for Card Game Engine
import { GameState } from './types';

export type Condition = Record<string, any> | ((state: GameState) => boolean);

export interface Effect {
  type: string; // e.g., 'award_score', 'move_card', 'custom'
  target?: string;
  value?: any;
  condition?: Condition;
  priority?: number;
  meta?: Record<string, any>;
}

export type EffectHandler = (effect: Effect, state: GameState) => GameState;

export interface EffectEngineConfig {
  handlers: Record<string, EffectHandler>;
}

export class EffectEngine {
  private handlers: Record<string, EffectHandler>;

  constructor(config: EffectEngineConfig) {
    this.handlers = config.handlers;
  }

  applyEffect(effect: Effect, state: GameState): GameState {
    // Check condition
    if (effect.condition) {
      if (typeof effect.condition === 'function') {
        if (!effect.condition(state)) return state;
      } else {
        // Simple key/value match
        for (const key in effect.condition) {
          if ((state as any)[key] !== effect.condition[key]) return state;
        }
      }
    }
    // Find handler
    const handler = this.handlers[effect.type];
    if (!handler) return state;
    return handler(effect, state);
  }

  applyEffects(effects: Effect[], state: GameState): GameState {
    // Sort by priority, then apply
    const sorted = [...effects].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    let newState = state;
    for (const effect of sorted) {
      newState = this.applyEffect(effect, newState);
    }
    return newState;
  }

  registerHandler(type: string, handler: EffectHandler) {
    this.handlers[type] = handler;
  }
}

// Example built-in effect handlers
export const builtInHandlers: Record<string, EffectHandler> = {
  award_score: (effect, state) => {
    state.player.score = (state.player.score ?? 0) + (effect.value ?? 0);
    return state;
  },
  award_coin: (effect, state) => {
    state.player.coins = (state.player.coins ?? 0) + (effect.value ?? 0);
    return state;
  },
  modify_setting: (effect, state) => {
    const target = effect.target as string;
    const value = effect.value ?? 0;
    if (target === 'shufflesLeft' || target === 'shuffles') {
      state.player.shuffles = (state.player.shuffles ?? 0) + value;
    } else if (target === 'discardsLeft' || target === 'discards') {
      state.player.discards = (state.player.discards ?? 0) + value;
    } else if (target === 'handSize' || target === 'maxHandSize') {
      // Update max hand size and trigger hand refill if needed
      state.player.maxHandSize = (state.player.maxHandSize ?? 5) + value;
      // Note: Hand refill should be handled by the game loop after effect processing
    } else if (target === 'coins') {
      state.player.coins = (state.player.coins ?? 0) + value;
    }
    return state;
  },
  draw_cards: (effect, state) => {
    const value = effect.value ?? 1;
    const handPile = state.piles?.hand;
    const deckPile = state.piles?.deck;
    
    if (handPile && deckPile && deckPile.cards.length > 0) {
      const cardsToTake = Math.min(value, deckPile.cards.length);
      const drawnCards = deckPile.cards.splice(0, cardsToTake);
      drawnCards.forEach(card => card.faceUp = true);
      handPile.cards.push(...drawnCards);
    }
    return state;
  },
  reveal: (effect, state) => {
    // Reveal cards from specified target
    const target = effect.target as string;
    const value = effect.value ?? 1;
    const pile = state.piles?.[target];
    
    if (pile && pile.cards.length > 0) {
      for (let i = 0; i < Math.min(value, pile.cards.length); i++) {
        pile.cards[i].faceUp = true;
      }
    }
    return state;
  },
  score_multiplier: (effect, state) => {
    // This should be handled during scoring, not as immediate effect
    // Store multiplier in temporary state for scoring system to use
    if (!state.activeMultipliers) {
      state.activeMultipliers = [];
    }
    state.activeMultipliers.push(effect);
    return state;
  },
  allow_move: (effect, state) => {
    // Store special move permissions for move validation to check
    if (!state.movePermissions) {
      state.movePermissions = [];
    }
    state.movePermissions.push(effect);
    return state;
  },
  move_card: (effect, state) => {
    // Custom logic to move a card (to be implemented)
    return state;
  },
  trigger_animation: (effect, state) => {
    // Animation event: UI should listen for this
    if (state && state.registry && state.registry.engineController) {
      state.registry.engineController.emitEvent('custom', { type: 'animation', effect });
    }
    return state;
  },
  play_sound: (effect, state) => {
    // Sound event: UI should listen for this
    if (state && state.registry && state.registry.engineController) {
      state.registry.engineController.emitEvent('custom', { type: 'sound', effect });
    }
    return state;
  },
  // Add more built-in handlers as needed
};
