// Coronata scoring stub
export function calculateCoronataScore(state: GameState): number {
  // TODO: Implement Coronata-specific scoring logic
  // For now, return a fixed score
  return 0;
}
// Scoring System for Card Game Engine
import { GameState, Move } from './types';

export type ScoreRule = (move: Move, state: GameState) => number;

export interface ScoringConfig {
  rules: ScoreRule[];
  baseScore?: number;
}

export class ScoringSystem {
  private rules: ScoreRule[];
  private baseScore: number;

  constructor(config: ScoringConfig) {
    this.rules = config.rules;
    this.baseScore = config.baseScore ?? 0;
  }

  calculateMoveScore(move: Move, state: GameState): number {
    let score = this.baseScore;
    for (const rule of this.rules) {
      score += rule(move, state);
    }
    return score;
  }

  calculateTotalScore(state: GameState): number {
    let score = this.baseScore;
    for (const move of state.history) {
      for (const rule of this.rules) {
        score += rule(move, state);
      }
    }
    return score;
  }
}

// Example: Klondike scoring rules
export const klondikeScoreRules: ScoreRule[] = [
  (move, state) => {
    // Move to foundation: calculate score based on card history and stack size
    const toPile = state.piles[move.to];
    if (toPile && toPile.type === 'foundation') {
      const cardIds = move.cardIds || [move.cardId];
      let totalScore = 0;
      
      // Score each card in the stack
      cardIds.forEach((cardId: string) => {
        const card = toPile.cards.find(c => c.id === cardId);
        if (card) {
          // Check if card has never been on tableau (triple score)
          const hasBeenOnTableau = card.tags?.includes('been-on-tableau');
          const scoreMultiplier = hasBeenOnTableau ? 2 : 3; // 3x for untouched, 2x for previously on tableau
          const cardValue = card.value;
          totalScore += cardValue * scoreMultiplier;
        }
      });
      
      return totalScore;
    }
    return 0;
  },
  (move, state) => {
    // Move from waste to tableau: +5 per card
    const fromPile = state.piles[move.from];
    const toPile = state.piles[move.to];
    if (fromPile && fromPile.type === 'waste' && toPile && toPile.type === 'tableau') {
      const stackSize = move.stackSize || 1;
      return 5 * stackSize;
    }
    return 0;
  },
];
