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
