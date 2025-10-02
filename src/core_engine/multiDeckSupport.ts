// Multi-Deck and Custom Card Set Support for Card Game Engine
import { Card, Suit } from './types';

export function generateDeck(deckCount: number = 1, customCards?: Card[]): Card[] {
  if (customCards && customCards.length > 0) {
    // Use custom card set
    return customCards.map(card => ({ ...card }));
  }
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const suit of suits) {
      for (let value = 1; value <= 13; value++) {
        deck.push({
          id: `${suit}-${value}-deck${d+1}`,
          suit,
          value,
          faceUp: false,
        });
      }
    }
  }
  return deck;
}
