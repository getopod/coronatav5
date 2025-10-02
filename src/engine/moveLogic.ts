import { Card, Pile, GameState, Move } from './types';

// Move a card or stack from one pile to another
export function moveCard(state: GameState, move: Move): GameState {
  const fromPile = state.piles[move.from];
  const toPile = state.piles[move.to];
  if (!fromPile || !toPile) return state;
  
  // Get the movable stack starting from the specified card
  const movableStack = getMovableStack(fromPile, move.cardId);
  if (movableStack.length === 0) return state;
  
  const cardIdx = fromPile.cards.findIndex(c => c.id === move.cardId);
  if (cardIdx === -1) return state;
  
  // Track card history for scoring - mark cards that have been played to tableau
  // Only apply this tag when cards are moved TO tableau by player moves, not during setup
  movableStack.forEach(card => {
    card.tags ??= [];
    if (toPile.type === 'tableau' && !card.tags.includes('been-on-tableau')) {
      card.tags.push('been-on-tableau');
    }
  });
  
  // Remove the entire stack from fromPile
  fromPile.cards.splice(cardIdx, movableStack.length);
  
  // Klondike: If fromPile is tableau and new bottom card is face down, flip it
  if (fromPile.type === 'tableau' && fromPile.cards.length > 0) {
    const lastCard = fromPile.cards[fromPile.cards.length - 1];
    if (!lastCard.faceUp) lastCard.faceUp = true;
  }
  
  // Add the entire stack to toPile
  toPile.cards.push(...movableStack);
  
  // Record move in history with stack information
  state.history.push({
    ...move,
    stackSize: movableStack.length,
    cardIds: movableStack.map(c => c.id)
  });
  return state;
}

// Klondike move validation (stacking, alternation, foundation)
export function validateMove(move: Move, state: GameState): boolean {
  const fromPile = state.piles[move.from];
  const toPile = state.piles[move.to];
  if (!fromPile || !toPile) return false;
  
  // Get the movable stack and validate based on the bottom card (the clicked card)
  const movableStack = getMovableStack(fromPile, move.cardId);
  if (movableStack.length === 0) return false;
  
  const card = movableStack[0]; // The bottom card of the stack being moved

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
    // Foundation piles only accept single cards, not stacks
    if (movableStack.length > 1) return false;
    
    const top = toPile.cards[toPile.cards.length - 1];
    if (!top) {
      // Only Aces can be placed on empty foundation
      return card.value === 1;
    }
    return card.suit === top.suit && card.value === top.value + 1;
  }

  // Waste pile restrictions: Only deck cards can go to waste pile
  if (toPile.type === 'waste') {
    // Cards can only go to waste from the deck (during dealing)
    return move.from === 'deck';
  }

  // Prevent invalid moves to other pile types
  return false;
}

function isRed(suit: string) {
  return suit === 'hearts' || suit === 'diamonds';
}

// Get the movable stack starting from a specific card
// In tableau, a valid stack is a sequence of alternating colors and descending values
export function getMovableStack(pile: Pile, cardId: string): Card[] {
  if (pile.type !== 'tableau') {
    // For non-tableau piles, only move single cards
    const card = pile.cards.find(c => c.id === cardId);
    return card ? [card] : [];
  }

  const cardIndex = pile.cards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return [];

  // Get all cards from the clicked card to the top
  const candidateStack = pile.cards.slice(cardIndex);
  
  // Check if this forms a valid sequence (alternating colors, descending values)
  const validStack: Card[] = [candidateStack[0]];
  
  for (let i = 1; i < candidateStack.length; i++) {
    const prevCard = candidateStack[i - 1];
    const currentCard = candidateStack[i];
    
    // Check if cards are in proper sequence (alternating color, descending value)
    const isAlternatingColor = isRed(prevCard.suit) !== isRed(currentCard.suit);
    const isDescending = currentCard.value === prevCard.value - 1;
    
    if (isAlternatingColor && isDescending && currentCard.faceUp) {
      validStack.push(currentCard);
    } else {
      // Break the sequence if not valid
      break;
    }
  }
  
  return validStack;
}

// Coronata move validation stub
export function validateCoronataMove(move: Move, state: GameState): boolean {
  // TODO: Implement Coronata-specific move validation logic
  // For now, accept all moves as valid
  return true;
}
// Modular: allow swapping out validateMove for other games
export type MoveValidator = (move: Move, state: GameState) => boolean;
