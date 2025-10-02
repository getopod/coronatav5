
/**
 * Plugin system for the core engine.
 * Supports registration, lifecycle, and hooks for game logic and UI.
 *
 * Extensibility:
 * - Register plugins to add custom rules, effects, and UI hooks.
 * - Plugins can override move validation, scoring, win/loss detection, etc.
 * - See EnginePlugin interface for available hooks.
 *
 * Usage:
 *   const manager = new PluginManager();
 *   manager.register(myPlugin, gameState);
 *   manager.validateMove(move, gameState);
 *   manager.getScore(gameState);
 *   manager.getWinLoss(gameState);
 */

import { GameState, Move } from './types';


/**
 * Interface for engine plugins.
 * Implement hooks to customize game logic and UI behavior.
 */
export interface EnginePlugin {
  /** Unique plugin ID */
  id: string;
  /** Called when plugin is registered */
  init?: (state: GameState) => void;
  /** Called when plugin is deregistered */
  teardown?: (state: GameState) => void;
  /** Hook for custom move validation */
  onMoveValidate?: (move: Move, state: GameState) => boolean | undefined;
  /** Hook for custom scoring */
  onScore?: (state: GameState) => number | undefined;
  /** Hook for custom win/loss detection */
  onWinLoss?: (state: GameState) => 'win' | 'loss' | undefined;
  // Add more hooks as needed
}


/**
 * Manages registration and invocation of engine plugins.
 */
export class PluginManager {
  /** Registered plugins */
  private readonly plugins: EnginePlugin[] = [];

  /**
   * Register a plugin and call its init hook.
   * @param plugin EnginePlugin instance
   * @param state Current game state
   */
  register(plugin: EnginePlugin, state: GameState) {
    this.plugins.push(plugin);
    plugin.init?.(state);
  }

  /**
   * Deregister a plugin and call its teardown hook.
   * @param pluginId Plugin ID to remove
   * @param state Current game state
   */
  deregister(pluginId: string, state: GameState) {
    const idx = this.plugins.findIndex(p => p.id === pluginId);
    if (idx !== -1) {
      this.plugins[idx].teardown?.(state);
      this.plugins.splice(idx, 1);
    }
  }

  /**
   * Validate a move using registered plugins.
   * Returns the first non-undefined result, or true if none.
   * @param move Move to validate
   * @param state Current game state
   */
  validateMove(move: Move, state: GameState): boolean {
    for (const plugin of this.plugins) {
      const result = plugin.onMoveValidate?.(move, state);
      if (result !== undefined) return result;
    }
    return true;
  }

  /**
   * Get score from registered plugins.
   * Returns the first non-undefined result, or undefined if none.
   * @param state Current game state
   */
  getScore(state: GameState): number | undefined {
    for (const plugin of this.plugins) {
      const score = plugin.onScore?.(state);
      if (score !== undefined) return score;
    }
    return undefined;
  }

  /**
   * Get win/loss result from registered plugins.
   * Returns the first non-undefined result, or undefined if none.
   * @param state Current game state
   */
  getWinLoss(state: GameState): 'win' | 'loss' | undefined {
    for (const plugin of this.plugins) {
      const result = plugin.onWinLoss?.(state);
      if (result !== undefined) return result;
    }
    return undefined;
  }
}
