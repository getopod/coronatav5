// Coronata win/loss detection stub
export const coronataWinCondition: WinCondition = (state) => {
  // TODO: Implement Coronata win condition
  // For now, always return false
  return false;
};

export const coronataLossCondition: LossCondition = (state) => {
  // TODO: Implement Coronata loss condition
  // For now, always return false
  return false;
};
// Win/Loss Detection Module for Card Game Engine
import { GameState } from './types';

export type WinCondition = (state: GameState) => boolean;
export type LossCondition = (state: GameState) => boolean;

export interface WinLossConfig {
  winCondition: WinCondition;
  lossCondition?: LossCondition;
}

export class WinLossDetector {
  private winCondition: WinCondition;
  private lossCondition?: LossCondition;

  constructor(config: WinLossConfig) {
    this.winCondition = config.winCondition;
    this.lossCondition = config.lossCondition;
  }

  checkWin(state: GameState): boolean {
    return this.winCondition(state);
  }

  checkLoss(state: GameState): boolean {
    return this.lossCondition ? this.lossCondition(state) : false;
  }
}

// Example: Standard Klondike win condition
export const klondikeWinCondition: WinCondition = (state) => {
  // All cards in foundation piles
  const foundationPiles = Object.values(state.piles).filter(p => p.type === 'foundation');
  const totalCards = foundationPiles.reduce((sum, pile) => sum + pile.cards.length, 0);
  // 52 for single deck, 104 for double deck, etc. (could be parameterized)
  return totalCards === 52;
};

// Example: Standard Klondike loss condition (no moves left)
export const klondikeLossCondition: LossCondition = (state) => {
  // Could check for no valid moves, empty stock, etc.
  // For now, always false (to be implemented per game)
  return false;
};
