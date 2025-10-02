/**
 * Engine Controller - Core game engine for Coronata
 */

import { GameState, Pile } from './types';
import { moveCard, validateMove } from './moveLogic';

export class EngineController {
  private gameState: GameState;

  constructor(initialState?: GameState) {
    this.gameState = initialState || this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      piles: {},
      player: {
        coins: 50,
        shuffles: 3,
        discards: 3,
        score: 0,
        maxHandSize: 5,
        ascensionLevel: 0,
        exploits: [],
        curses: [],
        blessings: [],
        fortunes: []
      },
      history: [],
      meta: {}
    };
  }

  getState(): GameState {
    return { ...this.gameState };
  }

  setState(newState: GameState): void {
    this.gameState = newState;
  }

  moveCard(move: { from: string; to: string; cardId: string }): boolean {
    const moveObj = {
      from: move.from,
      to: move.to,
      cardId: move.cardId,
      timestamp: Date.now()
    };

    if (validateMove(moveObj, this.gameState)) {
      this.gameState = moveCard(this.gameState, moveObj);
      return true;
    }
    return false;
  }

  drawCard(): void {
    // Implementation for drawing cards
    console.log('Drawing card...');
  }

  shuffle(): void {
    // Implementation for shuffling deck
    console.log('Shuffling deck...');
  }

  discardHand(): void {
    // Implementation for discarding hand
    console.log('Discarding hand...');
  }

  // Additional methods as needed
  addPile(pile: Pile): void {
    this.gameState.piles[pile.id] = pile;
  }

  removePile(pileId: string): void {
    delete this.gameState.piles[pileId];
  }

  updatePlayerState(updates: Partial<typeof this.gameState.player>): void {
    this.gameState.player = { ...this.gameState.player, ...updates };
  }
}
