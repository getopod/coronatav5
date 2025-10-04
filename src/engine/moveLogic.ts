function validateTableauMove(card: Card, toPile: Pile): boolean {
  console.log('Validating tableau move...');
  const top = toPile.cards[toPile.cards.length - 1];
  if (!top) {
    // Only Kings can be placed on empty tableau
    const isValid = card.value === 13;
    console.log('Empty tableau - King required:', isValid, `(card is ${card.value})`);
    return isValid;
  }
  // Cannot build on face-down cards
  if (!top.faceUp) {
    console.log('INVALID: Cannot build on face-down card');
    return false;
  }
  const isAltColor = (isRed(card.suit) !== isRed(top.suit));
  const isDescending = card.value === top.value - 1;
  console.log('Tableau validation:', {
    topCard: `${top.value} of ${top.suit} (faceUp: ${top.faceUp})`,
    movingCard: `${card.value} of ${card.suit} (faceUp: ${card.faceUp})`,
    isAltColor,
    isDescending
  });
  const result = isAltColor && isDescending;
  console.log('Tableau result:', result);
  return result;
}

function validateFoundationMove(card: Card, movableStack: Card[], toPile: Pile): boolean {
  console.log('Validating foundation move...');
  // Foundation piles only accept single cards, not stacks
  if (movableStack.length > 1) {
    console.log('INVALID: Foundation cannot accept stacks');
    return false;
  }
  const top = toPile.cards[toPile.cards.length - 1];
  if (!top) {
    // Only Aces can be placed on empty foundation
    const isValid = card.value === 1;
    console.log('Empty foundation - Ace required:', isValid, `(card is ${card.value})`);
    return isValid;
  }
  const sameSuit = card.suit === top.suit;
  const ascending = card.value === top.value + 1;
  console.log('Foundation validation:', { 
    topCard: `${top.value} of ${top.suit}`, 
    movingCard: `${card.value} of ${card.suit}`,
    sameSuit, 
    ascending 
  });
  const result = sameSuit && ascending;
  console.log('Foundation result:', result);
  return result;
}

function validateWasteMove(move: Move): boolean {
  console.log('Validating waste move...');
  // Cards can only go to waste from the deck (during dealing)
  const result = move.from === 'deck';
  console.log('Waste result:', result, `(from: ${move.from})`);
  return result;
}


function validateUnknownPile(): boolean {
  console.log('INVALID: Unknown pile type or invalid destination');
  return false;
}
import { Card, Pile, GameState, Move } from './types';

function validateTableauMove(card: Card, toPile: Pile): boolean {
  console.log('Validating tableau move...');
  const top = toPile.cards[toPile.cards.length - 1];
  if (!top) {
    // Only Kings can be placed on empty tableau
    const isValid = card.value === 13;
    console.log('Empty tableau - King required:', isValid, `(card is ${card.value})`);
    return isValid;
  }
  // Cannot build on face-down cards
  if (!top.faceUp) {
    console.log('INVALID: Cannot build on face-down card');
    return false;
  }
  const isAltColor = (isRed(card.suit) !== isRed(top.suit));
  const isDescending = card.value === top.value - 1;
  console.log('Tableau validation:', {
    topCard: `${top.value} of ${top.suit} (faceUp: ${top.faceUp})`,
    movingCard: `${card.value} of ${card.suit} (faceUp: ${card.faceUp})`,
    isAltColor,
    isDescending
  });
  const result = isAltColor && isDescending;
  console.log('Tableau result:', result);
  return result;
}

function validateFoundationMove(card: Card, movableStack: Card[], toPile: Pile): boolean {
  console.log('Validating foundation move...');
  // Foundation piles only accept single cards, not stacks
  if (movableStack.length > 1) {
    console.log('INVALID: Foundation cannot accept stacks');
    return false;
  }
  const top = toPile.cards[toPile.cards.length - 1];
  if (!top) {
    // Only Aces can be placed on empty foundation
    const isValid = card.value === 1;
    console.log('Empty foundation - Ace required:', isValid, `(card is ${card.value})`);
    return isValid;
  }
  const sameSuit = card.suit === top.suit;
  const ascending = card.value === top.value + 1;
  console.log('Foundation validation:', { 
    topCard: `${top.value} of ${top.suit}`, 
    movingCard: `${card.value} of ${card.suit}`,
    sameSuit, 
    ascending 
  });
  const result = sameSuit && ascending;
  console.log('Foundation result:', result);
  return result;
}

function validateWasteMove(move: Move): boolean {
  console.log('Validating waste move...');
  // Cards can only go to waste from the deck (during dealing)
  const result = move.from === 'deck';
  console.log('Waste result:', result, `(from: ${move.from})`);
  return result;
}


function validateUnknownPile(): boolean {
  console.log('INVALID: Unknown pile type or invalid destination');
  return false;
}

// Move a card or stack from one pile to another
export function moveCard(state: GameState, move: Move): GameState {
  console.log('=== MOVE CARD LOGIC ===');
  console.log('Move:', move);
  
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
  console.log('From pile:', fromPile ? `${fromPile.type} (${fromPile.cards.length} cards)` : 'NOT FOUND');
  console.log('To pile:', toPile ? `${toPile.type} (${toPile.cards.length} cards)` : 'NOT FOUND');
  
  if (!fromPile || !toPile) {
    console.log('MOVE LOGIC ERROR: Missing pile, returning original state');
    return state;
  }
  
  // Get the movable stack starting from the specified card (use original state for validation)
  const movableStack = getMovableStack(state.piles[move.from], move.cardId);
  console.log('Movable stack length:', movableStack.length);
  
  if (movableStack.length === 0) {
    console.log('MOVE LOGIC ERROR: No movable stack, returning original state');
    return state;
  }
  
  const cardIdx = fromPile.cards.findIndex(c => c.id === move.cardId);
  console.log('Card index in fromPile:', cardIdx);
  
  if (cardIdx === -1) {
    console.log('MOVE LOGIC ERROR: Card not found in fromPile, returning original state');
    return state;
  }
  
  // Track card history for scoring - mark cards that have been played to tableau
  // Only apply this tag when cards are moved TO tableau by player moves, not during setup
  // Get the corresponding cards from the new state to modify
  const newMovableStack = fromPile.cards.slice(cardIdx, cardIdx + movableStack.length);
  newMovableStack.forEach(card => {
    card.tags ??= [];
    if (toPile.type === 'tableau') {
      if (!card.tags.includes('been-on-tableau')) {
        card.tags.push('been-on-tableau');
      }
      card.faceUp = true; // Ensure cards moved to tableau are face up
    }
    // Ensure cards moved to foundation or coronata are face up
    if (toPile.type === 'foundation' || toPile.type === 'coronata') {
      card.faceUp = true;
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

  // After a successful move from the hand, refill the hand
  if (move.from === 'hand') {
    console.log('MOVE LOGIC: Refilling hand from deck after move from hand');
    // Refill the hand from deck
    const refilledState = refillHandFromDeck(newState);
    newState.piles = refilledState.piles;
    console.log('MOVE LOGIC: Hand refilled. New hand size:', newState.piles.hand?.cards?.length || 0, 'deck size:', newState.piles.stock?.cards?.length || newState.piles.deck?.cards?.length || 0);
  }

  // Record move in history with stack information
  newState.history.push({
    ...move,
    stackSize: newMovableStack.length,
    cardIds: newMovableStack.map(c => c.id)
  });

  console.log('MOVE LOGIC SUCCESS: Returning new state');
  return newState;
}

// Klondike move validation (stacking, alternation, foundation)
export function validateMove(move: Move, state: GameState): boolean {
  console.log('=== VALIDATING MOVE ===');
  console.log('Move:', move);
  const fromPile = state.piles[move.from];
  const toPile = state.piles[move.to];
  console.log('From pile:', fromPile ? `${fromPile.type} (${fromPile.cards.length} cards)` : 'NOT FOUND');
  console.log('To pile:', toPile ? `${toPile.type} (${toPile.cards.length} cards)` : 'NOT FOUND');
  if (!fromPile || !toPile) {
    console.log('INVALID: Missing pile');
    return false;
  }
  // Get the movable stack and validate based on the bottom card (the clicked card)
  const movableStack = getMovableStack(fromPile, move.cardId);
  console.log('Movable stack:', movableStack.length, 'cards');
  if (movableStack.length === 0) {
    console.log('INVALID: No movable stack found');
    return false;
  }
  const card = movableStack[0]; // The bottom card of the stack being moved
  console.log('Moving card:', `${card.value} of ${card.suit}`);
  switch (toPile.type) {
    case 'tableau':
      return validateTableauMove(card, toPile);
    case 'foundation':
      return validateFoundationMove(card, movableStack, toPile);
    case 'waste':
      return validateWasteMove(move);
    default:
      return validateUnknownPile();
  }
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
// Removed unused validateCoronataMove to resolve linter error
// Modular: allow swapping out validateMove for other games
export type MoveValidator = (move: Move, state: GameState) => boolean;

// Coronata: Auto-refill hand from deck when cards are played
export function refillHandFromDeck(state: GameState): GameState {
  const handPile = state.piles.hand;
  const deckPile = state.piles.stock || state.piles.deck;
  console.log('REFILL HAND: handPile exists:', !!handPile, 'deckPile exists:', !!deckPile);
  if (!handPile || !deckPile) return state;

  // Get max hand size from player state (default 5 if not set)
  const targetHandSize = state.player?.maxHandSize || 5;
  const cardsNeeded = targetHandSize - handPile.cards.length;
  console.log('REFILL HAND: targetHandSize:', targetHandSize, 'current hand size:', handPile.cards.length, 'cards needed:', cardsNeeded, 'deck size:', deckPile.cards.length);

  if (cardsNeeded > 0 && deckPile.cards.length > 0) {
    const cardsToTake = Math.min(cardsNeeded, deckPile.cards.length);
    const drawnCards = deckPile.cards.slice(0, cardsToTake).map(card => ({ ...card, faceUp: true }));
    const newHandCards = [...handPile.cards, ...drawnCards];
    const newDeckCards = deckPile.cards.slice(cardsToTake);

    console.log('REFILL HAND: drawing', cardsToTake, 'cards. New hand size:', newHandCards.length, 'new deck size:', newDeckCards.length);

    // Return a new state object with updated piles
    return {
      ...state,
      piles: {
        ...state.piles,
        hand: {
          ...handPile,
          cards: newHandCards
        },
        [deckPile.id]: {
          ...deckPile,
          cards: newDeckCards
        }
      }
    };
  }
  console.log('REFILL HAND: No refill needed');
  // No refill needed, return original state
  return state;
}
