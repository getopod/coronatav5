// Modular scoring system for each variant
// Usage: getScore(state, variant, pluginManager?)

import { GameState } from './types';
import { PluginManager } from './pluginManager';

export type ScoringFunction = (state: GameState) => number | undefined;

const scoringRegistry: Record<string, ScoringFunction> = {
  klondike: (state) => {
    // Example: 10 points per card moved to foundation
    const foundationCards = Object.values(state.piles)
      .filter(p => p.type === 'foundation')
      .reduce((sum, p) => sum + p.cards.length, 0);
    return foundationCards * 10;
  },
  spider: (state) => {
    // Example: 100 points per completed stack
    const completedStacks = Object.values(state.piles)
      .filter(p => p.type === 'completed')
      .length;
    return completedStacks * 100;
  },
  coronata: (state) => {
    // Example: 15 points per card in coronata piles
    const coronataCards = Object.values(state.piles)
      .filter(p => p.type === 'coronata')
      .reduce((sum, p) => sum + p.cards.length, 0);
    return coronataCards * 15;
  }
  // Add more variants as needed
};

export function registerScoringFunction(variant: string, fn: ScoringFunction) {
  scoringRegistry[variant] = fn;
}

export function getScore(state: GameState, variant: string, pluginManager?: PluginManager): number | undefined {
  // Plugin override
  if (pluginManager) {
    const pluginScore = pluginManager.getScore(state);
    if (pluginScore !== undefined) return pluginScore;
  }
  const fn = scoringRegistry[variant];
  return fn ? fn(state) : undefined;
}
