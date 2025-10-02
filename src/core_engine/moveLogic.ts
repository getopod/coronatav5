import { GameState, Move } from './types';

// Move a card or stack from one pile to another
export function moveCard(state: GameState, move: Move): GameState {
  // Create a shallow copy of state with deep copied piles to avoid mutations
  const newState: GameState = {
    ...state,
    piles: {},
    history: [...state.history]
  };
  
  // Deep copy the piles object
  for (const [id, pile] of Object.entries(state.piles)) {
    newState.piles[id] = {
      ...pile,
      cards: [...pile.cards.map(card => ({ ...card }))]
    };
  }
  
  const fromPile = newState.piles[move.from];
  const toPile = newState.piles[move.to];
  if (!fromPile || !toPile) return state;
  
  // Get the movable stack starting from the specified card (use original state for validation)
  const movableStack = getMovableStack(state.piles[move.from], move.cardId);
  if (movableStack.length === 0) return state;
  
  const cardIdx = fromPile.cards.findIndex(c => c.id === move.cardId);
  if (cardIdx === -1) return state;
  
  // Track card history for scoring - mark cards that have been played to tableau
  // Only apply this tag when cards are moved TO tableau by player moves, not during setup
  // Get the corresponding cards from the new state to modify
  const newMovableStack = fromPile.cards.slice(cardIdx, cardIdx + movableStack.length);
  newMovableStack.forEach(card => {
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
  toPile.cards.push(...newMovableStack);
  
  // Coronata: Auto-refill hand when cards are played from hand to tableau or foundation
  console.log('Move details:', { from: move.from, to: move.to, toPileType: toPile.type });
  console.log('Hand pile before refill:', newState.piles.hand?.cards?.length || 0, 'cards');
  console.log('Deck pile before refill:', newState.piles.deck?.cards?.length || 0, 'cards');
  
  if (move.from === 'hand' && (toPile.type === 'tableau' || toPile.type === 'foundation')) {
    console.log('Triggering hand refill from moveCard');
    refillHandFromDeck(newState);
    console.log('Hand pile after refill:', newState.piles.hand?.cards?.length || 0, 'cards');
    console.log('Deck pile after refill:', newState.piles.deck?.cards?.length || 0, 'cards');
  }
  
  // Record move in history with stack information
  newState.history.push({
    ...move,
    stackSize: newMovableStack.length,
    cardIds: newMovableStack.map(c => c.id)
  });
  return newState;
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

// Get the movable stack starting from a specific card
// In tableau, a valid stack is a sequence of alternating colors and descending values
export function getMovableStack(pile: any, cardId: string): any[] {
  if (pile.type !== 'tableau') {
    // For non-tableau piles, only move single cards
    const card = pile.cards.find((c: any) => c.id === cardId);
    return card ? [card] : [];
  }

  const cardIndex = pile.cards.findIndex((c: any) => c.id === cardId);
  if (cardIndex === -1) return [];

  // Get all cards from the clicked card to the top
  const candidateStack = pile.cards.slice(cardIndex);
  
  // Validate that this forms a proper descending alternating sequence
  const validStack = [];
  
  for (let i = 0; i < candidateStack.length; i++) {
    const currentCard = candidateStack[i];
    
    if (i === 0) {
      // First card is always valid (it's the one clicked)
      validStack.push(currentCard);
      continue;
    }
    
    const previousCard = candidateStack[i - 1];
    const isAlternatingColor = isRed(currentCard.suit) !== isRed(previousCard.suit);
    const isDescending = currentCard.value === previousCard.value - 1;
    
    if (isAlternatingColor && isDescending && currentCard.faceUp) {
      validStack.push(currentCard);
    } else {
      // Break the sequence if not valid
      break;
    }
  }
  
  return validStack;
}

// Coronata: Auto-refill hand from deck when cards are played
export function refillHandFromDeck(state: GameState): void {
  const handPile = state.piles.hand;
  const deckPile = state.piles.deck;
  
  if (!handPile || !deckPile) return;
  
  // Get max hand size from player state (default 5 if not set)
  const targetHandSize = state.player?.maxHandSize || 5;
  const cardsNeeded = targetHandSize - handPile.cards.length;
  
  if (cardsNeeded > 0 && deckPile.cards.length > 0) {
    const cardsToTake = Math.min(cardsNeeded, deckPile.cards.length);
    const drawnCards = deckPile.cards.splice(0, cardsToTake);
    
    // Make sure drawn cards are face up in hand
    drawnCards.forEach(card => card.faceUp = true);
    
    // Create new arrays to trigger React re-render
    handPile.cards = [...handPile.cards, ...drawnCards];
    deckPile.cards = [...deckPile.cards]; // Trigger update for deck too
    
    console.log(`Hand refilled: drew ${cardsToTake} cards to reach max hand size ${targetHandSize}, hand now has ${handPile.cards.length} cards`);
  }
}
