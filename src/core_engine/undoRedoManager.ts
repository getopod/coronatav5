
/**
 * Undo/Redo manager for game state.
 *
 * Extensibility:
 * - Supports history stack for undo/redo operations.
 * - Can be integrated with any game state mutation logic.
 *
 * Usage:
 *   const manager = new UndoRedoManager();
 *   manager.performAction(newState);
 *   manager.undo();
 *   manager.redo();
 *   manager.canUndo();
 *   manager.canRedo();
 *   manager.clear();
 */

import { GameState } from './types';


/**
 * Manages undo/redo history for game state.
 */
export class UndoRedoManager {
  /** Undo history stack */
  private readonly undoStack: GameState[] = [];
  /** Redo history stack */
  private readonly redoStack: GameState[] = [];
  /** Current game state */
  private currentState: GameState | null = null;

  /**
   * Record a new game state and clear redo history.
   * @param newState New game state after an action
   */
  performAction(newState: GameState) {
    if (this.currentState) {
      this.undoStack.push(this.cloneState(this.currentState));
    }
    this.currentState = this.cloneState(newState);
    this.redoStack.length = 0;
  }

  /**
   * Undo the last action and restore previous state.
   * @returns Previous game state or null if not available
   */
  undo(): GameState | null {
    if (!this.canUndo()) return null;
    this.redoStack.push(this.cloneState(this.currentState!));
    this.currentState = this.undoStack.pop()!;
    return this.cloneState(this.currentState);
  }

  /**
   * Redo the last undone action and restore state.
   * @returns Next game state or null if not available
   */
  redo(): GameState | null {
    if (!this.canRedo()) return null;
    this.undoStack.push(this.cloneState(this.currentState!));
    this.currentState = this.redoStack.pop()!;
    return this.cloneState(this.currentState);
  }

  /**
   * Check if undo is possible.
   * @returns true if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is possible.
   * @returns true if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get the current game state.
   * @returns Current game state or null
   */
  getCurrentState(): GameState | null {
    return this.currentState ? this.cloneState(this.currentState) : null;
  }

  /**
   * Clear undo/redo history and current state.
   */
  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.currentState = null;
  }

  /**
   * Deep clone a game state for history tracking.
   * @param state GameState to clone
   * @returns Cloned GameState
   */
  private cloneState(state: GameState): GameState {
    return JSON.parse(JSON.stringify(state));
  }
}
