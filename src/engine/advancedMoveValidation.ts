// Advanced Move Validation for Card Game Engine
import { Move, GameState, Pile, Card } from './types';

export interface AdvancedMoveOptions {
  allowMultiCard?: boolean;
  allowPairing?: boolean;
  allowShifting?: boolean;
  customValidator?: (move: Move, state: GameState) => boolean;
}

export function validateAdvancedMove(move: Move, state: GameState, options: AdvancedMoveOptions = {}): boolean {
  const fromPile = state.piles[move.from];
  const toPile = state.piles[move.to];
  if (!fromPile || !toPile) return false;
  const card = fromPile.cards.find(c => c.id === move.cardId);
  if (!card) return false;

  // Multi-card moves (e.g., Spider, Yukon)
  if (options.allowMultiCard && move.meta?.multiCardIds) {
    const cards = move.meta.multiCardIds.map((id: string) => fromPile.cards.find(c => c.id === id)).filter(Boolean);
    if (cards.length !== move.meta.multiCardIds.length) return false;
    // Example: all cards must be in sequence
    for (let i = 1; i < cards.length; i++) {
      if (cards[i - 1].value !== cards[i].value + 1) return false;
    }
    // Additional rules can be added here
  }

  // Pairing moves (e.g., Pyramid, Golf)
  if (options.allowPairing) {
    const meta = move.meta;
    if (meta && meta.pairWithId) {
      const pairCard = toPile.cards.find(c => c.id === meta.pairWithId);
      if (!pairCard) return false;
      // Example: sum to 13 (Pyramid)
      if ((card.value + pairCard.value) !== 13) return false;
    }
  }

  // Shifting moves (e.g., Montana, Accordion)
  if (options.allowShifting && move.meta?.shiftCount) {
    // Example: shifting cards by N positions
    // Validate shift is within bounds
    if (move.meta.shiftCount < 1 || move.meta.shiftCount > fromPile.cards.length) return false;
  }

  // Custom validator
  if (options.customValidator) {
    return options.customValidator(move, state);
  }

  // Default: fallback to basic validation
  return true;
}
