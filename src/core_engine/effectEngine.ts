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

export interface RegistryEntry {
  id: string;
  effects: Effect[];
  encounterLimited?: boolean;
  runLimited?: boolean;
  unlockCondition?: (state: GameState) => boolean;
  completed?: boolean;
  active?: boolean;
  // ...other fields
}

export interface EffectSummary {
  id: string;
  type: string;
  description?: string;
  source?: string;
  value?: any;
  priority?: number;
  meta?: Record<string, any>;
  completed?: boolean;
  active?: boolean;
  // ...other fields
}

// Effect Handlers for all registry effect types
const awardScoreHandler: EffectHandler = (effect, state) => {
  const score = Number(effect.value) || 0;
  // Use player.coins or add player.score if needed
  const player = { ...state.player };
  if ('score' in player) {
    player.score = (player.score || 0) + score;
  } else {
    player.coins = (player.coins || 0) + score;
  }
  return {
    ...state,
    player,
  };
};

const blockHandler: EffectHandler = (effect, state) => {
  // Block a move or action by setting a flag
  return {
    ...state,
    blocked: true,
    blockReason: effect.meta?.reason || effect.value || 'Blocked by effect',
  };
};

const allowMoveHandler: EffectHandler = (effect, state) => {
  // Allow a move by clearing block
  return {
    ...state,
    blocked: false,
    blockReason: undefined,
  };
};

const modifySettingHandler: EffectHandler = (effect, state) => {
  // Modify a game setting (e.g., maxMoves, timer)
  if (!effect.target) return state;
  return {
    ...state,
    [effect.target]: effect.value,
  };
};

const drawCardsHandler: EffectHandler = (effect, state) => {
  // Draw cards from deck pile to hand pile
  const count = Number(effect.value) || 1;
  const piles = { ...state.piles };
  const deckPile = { ...piles['deck'], cards: [...(piles['deck']?.cards || [])] };
  const handPile = { ...piles['hand'], cards: [...(piles['hand']?.cards || [])] };
  const drawn = deckPile.cards.splice(0, count);
  handPile.cards.push(...drawn);
  piles['deck'] = deckPile;
  piles['hand'] = handPile;
  return {
    ...state,
    piles,
  };
};

// Add more handlers as needed for other effect types

const defaultHandlers: Record<string, EffectHandler> = {
  award_score: awardScoreHandler,
  block: blockHandler,
  allow_move: allowMoveHandler,
  modify_setting: modifySettingHandler,
  draw_cards: drawCardsHandler,
  // Add more mappings here
};

export class EffectEngine {
  private handlers: Record<string, EffectHandler>;

  constructor(config?: EffectEngineConfig) {
    this.handlers = { ...defaultHandlers, ...(config?.handlers || {}) };
  }

  // Returns only currently active registry entries
  /**
   * Optimized: Memoize condition checks for registry activation
   */
  filterActiveEntries(entries: RegistryEntry[], state: GameState): RegistryEntry[] {
    const conditionCache = new Map<string, boolean>();
    return entries.filter(entry => {
      // Run-limited: deactivate if already completed
      if (entry.runLimited && entry.completed) return false;
      // Encounter-limited: check encounter context (assume state.meta.encounterId)
      if (entry.encounterLimited && entry.active !== true) return false;
      // Conditional unlocks (memoized)
      if (entry.unlockCondition) {
        const cacheKey = entry.id + ':' + JSON.stringify(state.meta || {});
        if (!conditionCache.has(cacheKey)) {
          conditionCache.set(cacheKey, entry.unlockCondition(state));
        }
        if (!conditionCache.get(cacheKey)) return false;
      }
      // Explicit active flag
      if (entry.active === false) return false;
      return true;
    });
  }

  applyEffect(effect: Effect, state: GameState): GameState {
    // ...existing code...
    if (effect.condition) {
      if (typeof effect.condition === 'function') {
        if (!effect.condition(state)) return state;
      } else {
        for (const key in effect.condition) {
          if ((state as any)[key] !== effect.condition[key]) return state;
        }
      }
    }
    const handler = this.handlers[effect.type];
    if (!handler) return state;
    return handler(effect, state);
  }

  /**
   * Applies effects with stacking, precedence, and conflict resolution.
   * - Effects are grouped by type.
   * - Conflicting effects (e.g., block vs allow_move) are resolved by priority.
   * - Stacking is supported for additive types (e.g., award_score).
   */
  /**
   * Optimized: Minimize allocations, cache effect grouping
   */
  applyEffects(effects: Effect[], state: GameState): GameState {
    // Sort by priority (higher first)
    const sorted = effects.length > 1 ? effects.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)) : effects;
    // Group effects by type (cache)
    const effectGroups: Record<string, Effect[]> = Object.create(null);
    for (let i = 0, len = sorted.length; i < len; ++i) {
      const effect = sorted[i];
      if (!effectGroups[effect.type]) effectGroups[effect.type] = [];
      effectGroups[effect.type].push(effect);
    }

    let newState = state;

    // Stacking for award_score
    if (effectGroups['award_score']) {
      let totalScore = 0;
      for (let i = 0, arr = effectGroups['award_score'], len = arr.length; i < len; ++i) {
        totalScore += Number(arr[i].value) || 0;
      }
      newState = awardScoreHandler({ type: 'award_score', value: totalScore }, newState);
    }

    // Conflict resolution for block/allow_move
    let blockEffects = effectGroups['block'] || [];
    let allowEffects = effectGroups['allow_move'] || [];
    // Sort by priority descending
    blockEffects = blockEffects.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    allowEffects = allowEffects.slice().sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    if (blockEffects.length && allowEffects.length) {
      // Highest priority wins, only apply the winner
      const topBlock = blockEffects[0];
      const topAllow = allowEffects[0];
      if ((topBlock.priority ?? 0) >= (topAllow.priority ?? 0)) {
        newState = blockHandler(topBlock, newState);
      } else {
        newState = allowMoveHandler(topAllow, newState);
      }
    } else if (blockEffects.length) {
      newState = blockHandler(blockEffects[0], newState);
    } else if (allowEffects.length) {
      newState = allowMoveHandler(allowEffects[0], newState);
    }
    // Remove block/allow_move from further processing
  delete effectGroups['block'];
  delete effectGroups['allow_move'];

    // Stacking for modify_setting (last effect wins)
    if (effectGroups['modify_setting']) {
      const arr = effectGroups['modify_setting'];
      for (let i = 0, len = arr.length; i < len; ++i) {
        newState = modifySettingHandler(arr[i], newState);
      }
    }

    // Stacking for draw_cards (sum all draws)
    if (effectGroups['draw_cards']) {
      let totalDraw = 0;
      const arr = effectGroups['draw_cards'];
      for (let i = 0, len = arr.length; i < len; ++i) {
        totalDraw += Number(arr[i].value) || 0;
      }
      newState = drawCardsHandler({ type: 'draw_cards', value: totalDraw }, newState);
    }

    // Apply other effect types (custom stacking/conflict rules can be added here)
    for (const type in effectGroups) {
      if (!['award_score', 'block', 'allow_move', 'modify_setting', 'draw_cards'].includes(type)) {
        const arr = effectGroups[type];
        for (let i = 0, len = arr.length; i < len; ++i) {
          const handler = this.handlers[type];
          if (handler) newState = handler(arr[i], newState);
        }
      }
    }

    return newState;
  }

  /**
   * Main entry point: process all active registry entries for current state
   */
  processRegistryEntries(entries: RegistryEntry[], state: GameState): GameState {
    const activeEntries = this.filterActiveEntries(entries, state);
    // Aggregate all effects from active entries
    const allEffects: Effect[] = [];
    for (const entry of activeEntries) {
      allEffects.push(...entry.effects);
    }
    return this.applyEffects(allEffects, state);
  }

  /**
   * Returns a summary of all currently active effects for UI feedback
   */
  getActiveEffectsSummary(entries: RegistryEntry[], state: GameState): EffectSummary[] {
    const activeEntries = this.filterActiveEntries(entries, state);
    const summary: EffectSummary[] = [];
    for (const entry of activeEntries) {
      for (const effect of entry.effects) {
        summary.push({
          id: entry.id,
          type: effect.type,
          description: effect.meta?.description || effect.type,
          source: effect.meta?.source || entry.id,
          value: effect.value,
          priority: effect.priority,
          meta: effect.meta,
        });
      }
    }
    return summary;
  }
}


