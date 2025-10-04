// Effect Engine & Condition System for Card Game Engine
import { GameState } from './types';
import { modularBuiltInHandlers } from './handlers';

export type Condition = Record<string, any> | ((state: GameState) => boolean);

export interface Effect {
  type: string; // e.g., 'award_score', 'move_card', 'custom'
  action?: string; // Effect action name (used in registry entries)
  target?: string;
  value?: any;
  condition?: Condition;
  priority?: number;
  duration?: number; // For temporary effects
  oneShot?: boolean; // For one-time only effects
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
    if (!this._passesCondition(effect, state)) return state;
    // Do not apply effects with only an event-based condition (handled by event system)
    if (effect.condition && typeof effect.condition === 'object' && Object.keys(effect.condition).length === 1 && effect.condition.event) {
      // Only apply via event system
      return state;
    }
    const handler = this._getHandler(effect.type);
    if (!handler) return state;
    return handler(effect, state);
  }

  private _passesCondition(effect: Effect, state: GameState): boolean {
    if (!effect.condition) return true;
    if (typeof effect.condition === 'function') {
      return effect.condition(state);
    }
    for (const key in effect.condition) {
      if (key === 'event') continue;
      if ((state as any)[key] !== effect.condition[key]) return false;
    }
    return true;
  }

  private _getHandler(type: string): EffectHandler | undefined {
    // Only allow handlers for known, static keys (compat: use hasOwnProperty for older targets)
    // eslint-disable-next-line @typescript-eslint/prefer-object-has-own
    if (Object.prototype.hasOwnProperty.call(this.handlers, type)) {
      return this.handlers[type];
    }
    return undefined;
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

// Use the modular handlers instead of the monolithic builtInHandlers
export const builtInHandlers = modularBuiltInHandlers;
