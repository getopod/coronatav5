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
    // Check condition (skip 'event' conditions as they're handled at the calling level)
    if (effect.condition) {
      if (typeof effect.condition === 'function') {
        if (!effect.condition(state)) return state;
      } else {
        // Simple key/value match (skip event conditions)
        for (const key in effect.condition) {
          if (key === 'event') continue; // Event conditions are handled by applyEventBasedEffects
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

  getAvailableHandlers(): string[] {
    return Object.keys(this.handlers);
  }
}

// Example built-in effect handlers
export const builtInHandlers: Record<string, EffectHandler> = {
  award_score: (effect, state) => {
    const oldScore = state.player.score ?? 0;
    state.player.score = oldScore + (effect.value ?? 0);
    
    // Import and trigger encounter progression if scoring system is available
    // Note: We need to be careful about circular imports here
    const newScore = state.player.score;
    console.log(`Award score effect: ${effect.value} points (${oldScore} → ${newScore})`);
    
    return state;
  },
  award_coin: (effect, state) => {
    const oldCoins = state.player.coins ?? 0;
    state.player.coins = oldCoins + (effect.value ?? 0);
    return state;
  },
  add_item: (effect, state) => {
    const itemType = effect.target as string;
    const itemId = effect.value as string;
    
    if (itemType === 'exploit') {
      state.player.exploits = [...(state.player.exploits || []), itemId];
    } else if (itemType === 'blessing') {
      state.player.blessings = [...(state.player.blessings || []), itemId];
    } else if (itemType === 'curse') {
      state.player.curses = [...(state.player.curses || []), itemId];
    }
    
    return state;
  },
  remove_item: (effect, state) => {
    const itemType = effect.target as string;
    const itemId = effect.value as string;
    
    if (itemType === 'exploit') {
      state.player.exploits = (state.player.exploits || []).filter(id => id !== itemId);
    } else if (itemType === 'blessing') {
      state.player.blessings = (state.player.blessings || []).filter(id => id !== itemId);
    } else if (itemType === 'curse') {
      state.player.curses = (state.player.curses || []).filter(id => id !== itemId);
    }
    
    return state;
  },
  score_multiplier: (effect, state) => {
    const target = effect.target as string;
    const multiplier = effect.value ?? 1;
    
    // Store multiplier for later use in scoring
    state.activeMultipliers ??= [];
    
    state.activeMultipliers.push({
      target,
      multiplier,
      source: effect.meta?.sourceEntry || 'unknown'
    });
    
    console.log(`Added score multiplier: ${multiplier}x for ${target}`);
    return state;
  },
  coin_multiplier: (effect, state) => {
    const multiplier = effect.value ?? 1;
    
    // Apply coin multiplier to player
    if (!state.player.coinMultiplier) {
      state.player.coinMultiplier = 1;
    }
    state.player.coinMultiplier *= multiplier;
    
    console.log(`Applied coin multiplier: ${multiplier}x (total: ${state.player.coinMultiplier}x)`);
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
  allow_move: (effect, state) => {
    // Store special move permissions for move validation to check
    state.movePermissions ??= [];
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
