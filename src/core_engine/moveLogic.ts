import { GameState, Move } from './types';

// Move a card from one pile to another
export function moveCard(state: GameState, move: Move): GameState {
  const fromPile = state.piles[move.from];
  const toPile = state.piles[move.to];
  if (!fromPile || !toPile) return state;
  const cardIdx = fromPile.cards.findIndex(c => c.id === move.cardId);
  if (cardIdx === -1) return state;
  const card = fromPile.cards[cardIdx];
  // Remove card from fromPile
  fromPile.cards.splice(cardIdx, 1);
  // Klondike: If fromPile is tableau and new bottom card is face down, flip it
  if (fromPile.type === 'tableau' && fromPile.cards.length > 0) {
    const lastCard = fromPile.cards[fromPile.cards.length - 1];
    if (!lastCard.faceUp) lastCard.faceUp = true;
  }
  // Add card to toPile
  toPile.cards.push(card);
  // Record move in history
  state.history.push(move);
  return state;
}

// Klondike move validation (stacking, alternation, foundation)
export function validateMove(move: Move, state: GameState): boolean {
  const fromPile = state.piles[move.from];
  const toPile = state.piles[move.to];
  if (!fromPile || !toPile) return false;
  const card = fromPile.cards.find(c => c.id === move.cardId);
  if (!card) return false;

  // Example: tableau stacking (alternating color, descending value)
  if (toPile.type === 'tableau') {
    const top = toPile.cards[toPile.cards.length - 1];
    if (!top) {
      // Only Kings can be placed on empty tableau
      return card.value === 13;
    }
    const isAltColor = (isRed(card.suit) !== isRed(top.suit));
    return isAltColor && card.value === top.value - 1;
  }

  // Example: foundation building (same suit, ascending value)
  if (toPile.type === 'foundation') {
    const top = toPile.cards[toPile.cards.length - 1];
    if (!top) {
      // Only Aces can be placed on empty foundation
      return card.value === 1;
    }
    return card.suit === top.suit && card.value === top.value + 1;
  }

  // Default: allow move
  return true;
}

function isRed(suit: string) {
  return suit === 'hearts' || suit === 'diamonds';
}
