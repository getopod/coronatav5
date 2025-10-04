// Coronata win/loss detection
export const coronataWinCondition: WinCondition = (state) => {
  // Coronata wins when the current encounter is completed
  return checkEncounterCompletion(state);
};

export const coronataLossCondition: LossCondition = (_state) => {
  // Coronata loss occurs when no more moves are possible
  // This is a simplified implementation - in a real game you'd check for valid moves
  // For now, never declare a loss to keep the game playable
  return false;
};
// Win/Loss Detection Module for Card Game Engine
import { GameState } from './types';
import { checkEncounterCompletion } from './encounterSystem';

export type WinCondition = (state: GameState) => boolean;
export type LossCondition = (state: GameState) => boolean;

export interface WinLossConfig {
  winCondition: WinCondition;
  lossCondition?: LossCondition;
}

export class WinLossDetector {
  private readonly winCondition: WinCondition;
  private readonly lossCondition?: LossCondition;

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
export const klondikeLossCondition: LossCondition = (_state) => {
  // Could check for no valid moves, empty stock, etc.
  // For now, always false (to be implemented per game)
  return false;
};
