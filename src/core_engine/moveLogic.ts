import { GameState, Move } from './types';

// Helper function to check if a suit is red
function isRed(suit: string): boolean {
  return suit === 'hearts' || suit === 'diamonds';
}

// Get all cards that can move together with the selected card
export function getMovableStack(cardId: string, pileId: string, state: GameState): string[] {
  const pile = state.piles[pileId];
  if (!pile || pile.type !== 'tableau') return [cardId];
  
  const cardIndex = pile.cards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return [cardId];
  
  // Get all cards from the selected card to the top
  const movableCards = pile.cards.slice(cardIndex);
  
  // Verify it's a valid stack (alternating colors, descending values)
  for (let i = 0; i < movableCards.length - 1; i++) {
    const current = movableCards[i];
    const next = movableCards[i + 1];
    
    if (!current.faceUp || !next.faceUp) return [cardId];
    if (current.value !== next.value + 1) return [cardId];
    if (isRed(current.suit) === isRed(next.suit)) return [cardId];
  }
  
  return movableCards.map(c => c.id);
}

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
