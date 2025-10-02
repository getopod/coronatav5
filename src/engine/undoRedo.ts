// Undo/Redo and Move History Tracking for Card Game Engine
import { GameState, Move } from './types';
import { EventEmitter, EngineEvent } from './eventSystem';

export class UndoRedoManager {
  private history: Move[] = [];
  private future: Move[] = [];
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emitter = emitter;
  }

  recordMove(move: Move) {
    this.history.push(move);
    this.future = [];
    this.emitter.emit({ type: 'move', payload: move });
  }

  canUndo(): boolean {
    return this.history.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  undo(state: GameState): GameState {
    if (!this.canUndo()) return state;
    const move = this.history.pop();
    if (!move) return state;
    this.future.push(move);
    // Reverse the move
    const reversed = this.reverseMove(move);
    const newState = this.applyMove(state, reversed);
    this.emitter.emit({ type: 'stateChange', payload: newState });
    return newState;
  }

  redo(state: GameState): GameState {
    if (!this.canRedo()) return state;
    const move = this.future.pop();
    if (!move) return state;
    this.history.push(move);
    const newState = this.applyMove(state, move);
    this.emitter.emit({ type: 'stateChange', payload: newState });
    return newState;
  }

  reverseMove(move: Move): Move {
    return {
      from: move.to,
      to: move.from,
      cardId: move.cardId,
      type: move.type,
      meta: move.meta,
    };
  }

  applyMove(state: GameState, move: Move): GameState {
    // This should use the same logic as moveCard in moveLogic.ts
    const fromPile = state.piles[move.from];
    const toPile = state.piles[move.to];
    if (!fromPile || !toPile) return state;
    const cardIdx = fromPile.cards.findIndex(c => c.id === move.cardId);
    if (cardIdx === -1) return state;
    const card = fromPile.cards[cardIdx];
    fromPile.cards.splice(cardIdx, 1);
    toPile.cards.push(card);
    return state;
  }

  getHistory(): Move[] {
    return [...this.history];
  }

  getFuture(): Move[] {
    return [...this.future];
  }
}
