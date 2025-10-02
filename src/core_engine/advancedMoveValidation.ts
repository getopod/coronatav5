// Advanced Move Validation for Card Game Engine
import { Move, GameState } from './types';

export interface AdvancedMoveOptions {
  allowMultiCard?: boolean;
  allowPairing?: boolean;
  allowShifting?: boolean;
  customValidator?: (move: Move, state: GameState) => boolean;
}

function validateMultiCardMove(move: Move, fromPile: any): boolean {
  if (!move.meta?.multiCardIds) return true;
  const cards = move.meta.multiCardIds.map((id: string) => fromPile.cards.find((c: any) => c.id === id)).filter(Boolean);
  if (cards.length !== move.meta.multiCardIds.length) return false;
  for (let i = 1; i < cards.length; i++) {
    if (cards[i - 1].value !== cards[i].value + 1) return false;
  }
  return true;
}

function validatePairingMove(move: Move, toPile: any, card: any): boolean {
  const meta = move.meta;
  if (meta && meta.pairWithId) {
    const pairCard = toPile.cards.find((c: any) => c.id === meta.pairWithId);
    if (!pairCard) return false;
    if ((card.value + pairCard.value) !== 13) return false;
  }
  return true;
}

function validateShiftingMove(move: Move, fromPile: any): boolean {
  if (!move.meta?.shiftCount) return true;
  if (move.meta.shiftCount < 1 || move.meta.shiftCount > fromPile.cards.length) return false;
  return true;
}

export function validateAdvancedMove(move: Move, state: GameState, options: AdvancedMoveOptions = {}): boolean {
  const fromPile = state.piles[move.from];
  const toPile = state.piles[move.to];
  if (!fromPile || !toPile) return false;
  const card = fromPile.cards.find((c: any) => c.id === move.cardId);
  if (!card) return false;

  const validators: Array<() => boolean> = [];
  if (options.allowMultiCard && move.meta?.multiCardIds) {
    validators.push(() => validateMultiCardMove(move, fromPile));
  }
  if (options.allowPairing) {
    validators.push(() => validatePairingMove(move, toPile, card));
  }
  if (options.allowShifting && move.meta?.shiftCount) {
    validators.push(() => validateShiftingMove(move, fromPile));
  }
  if (typeof options.customValidator === 'function') {
    validators.push(() => options.customValidator!(move, state));
  }

  for (const validator of validators) {
    if (!validator()) return false;
  }
  return true;
}
