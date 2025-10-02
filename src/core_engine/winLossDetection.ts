
/**
 * Modular win/loss detection for each variant.
 *
 * Extensibility:
 * - Register custom win/loss checkers for new variants.
 * - Integrates with plugin system for custom rules.
 *
 * Usage:
 *   checkWinLoss(state, variant, pluginManager?);
 *   registerWinLossChecker(variant, checkerFn);
 */
import { GameState } from './types';
import { PluginManager } from './pluginManager';

/**
 * Function signature for win/loss checkers.
 */
export type WinLossResult = 'win' | 'loss' | undefined;
export type WinLossChecker = (state: GameState) => WinLossResult;

const winLossRegistry: Record<string, WinLossChecker> = {
  klondike: (state: GameState): WinLossResult => {
    // Win: all cards in foundation piles
    const allFoundationsFull = Object.values(state.piles)
      .filter((p: any) => p.type === 'foundation')
      .every((p: any) => p.cards.length === 13);
    if (allFoundationsFull) return 'win';
    return undefined;
  },
  spider: (state: GameState): WinLossResult => {
    // Win: all cards in completed stacks
    const completedStacks = Object.values(state.piles)
      .filter((p: any) => p.type === 'completed')
      .length;
    if (completedStacks === 8) return 'win';
    return undefined;
  },
  coronata: (state: GameState): WinLossResult => {
    // Win: all coronata piles completed
    const allCoronataFull = Object.values(state.piles)
      .filter((p: any) => p.type === 'coronata')
      .every((p: any) => p.cards.length === 13);
    if (allCoronataFull) return 'win';
    return undefined;
  }
  // Add more variants as needed
};

/**
 * Register a custom win/loss checker for a variant.
 * @param variant Variant name
 * @param checker WinLossChecker function
 */
export function registerWinLossChecker(variant: string, checker: WinLossChecker): void {
  winLossRegistry[variant] = checker;
}

/**
 * Check win/loss state for a given variant.
 * Uses plugin override if available.
 * @param state Current game state
 * @param variant Variant name
 * @param pluginManager Optional plugin manager for override
 * @returns 'win', 'loss', or undefined
 */
export function checkWinLoss(state: GameState, variant: string, pluginManager?: PluginManager): WinLossResult {
  // Plugin override
  if (pluginManager) {
    const pluginResult = pluginManager.getWinLoss(state);
    if (pluginResult) return pluginResult;
  }
  const checker = winLossRegistry[variant];
  return checker ? checker(state) : undefined;
}
