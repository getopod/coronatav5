// Test for stack moving functionality
import { getMovableStack } from '../src/engine/moveLogic';
import { Card, Pile, Suit } from '../src/engine/types';

describe('Stack Moving', () => {
  // Helper to create a card
  const createCard = (id: string, suit: Suit, value: number, faceUp: boolean = true): Card => ({
    id,
    suit,
    value,
    faceUp,
    design: 'default'
  });

  // Helper to create a tableau pile
  const createTableauPile = (cards: Card[]): Pile => ({
    id: 'tableau1',
    type: 'tableau',
    cards
  });

  test('should return single card for non-tableau piles', () => {
    const foundationPile: Pile = {
      id: 'foundation1',
      type: 'foundation',
      cards: [
        createCard('card1', 'hearts', 1),
        createCard('card2', 'hearts', 2)
      ]
    };

    const result = getMovableStack(foundationPile, 'card2');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('card2');
  });

  test('should return valid descending stack from tableau', () => {
    // Red Queen (12), Black Jack (11), Red 10 - valid stack
    const pile = createTableauPile([
      createCard('card1', 'hearts', 7),
      createCard('card2', 'hearts', 12), // Red Queen
      createCard('card3', 'spades', 11),  // Black Jack  
      createCard('card4', 'hearts', 10)   // Red 10
    ]);

    // Click on Queen should move Queen + Jack + 10
    const result = getMovableStack(pile, 'card2');
    expect(result).toHaveLength(3);
    expect(result.map(c => c.id)).toEqual(['card2', 'card3', 'card4']);
  });

  test('should return partial stack when sequence breaks', () => {
    // Red Queen (12), Black Jack (11), Black 10 (invalid - same color)
    const pile = createTableauPile([
      createCard('card1', 'hearts', 7),
      createCard('card2', 'hearts', 12), // Red Queen
      createCard('card3', 'spades', 11), // Black Jack
      createCard('card4', 'spades', 10)  // Black 10 (breaks alternating color rule)
    ]);

    // Should only move Queen + Jack (sequence breaks at the Black 10)
    const result = getMovableStack(pile, 'card2');
    expect(result).toHaveLength(2);
    expect(result.map(c => c.id)).toEqual(['card2', 'card3']);
  });

  test('should not include face-down cards in stack', () => {
    const pile = createTableauPile([
      createCard('card1', 'hearts', 12), // Red Queen
      createCard('card2', 'spades', 11), // Black Jack
      createCard('card3', 'hearts', 10, false) // Red 10 (face down)
    ]);

    // Should only move Queen + Jack (can't move face-down card)
    const result = getMovableStack(pile, 'card1');
    expect(result).toHaveLength(2);
    expect(result.map(c => c.id)).toEqual(['card1', 'card2']);
  });

  test('should handle clicking on card in middle of stack', () => {
    // Red King (13), Black Queen (12), Red Jack (11), Black 10
    const pile = createTableauPile([
      createCard('card1', 'hearts', 13), // Red King
      createCard('card2', 'spades', 12), // Black Queen
      createCard('card3', 'hearts', 11), // Red Jack
      createCard('card4', 'spades', 10)  // Black 10
    ]);

    // Click on Queen should move Queen + Jack + 10
    const result = getMovableStack(pile, 'card2');
    expect(result).toHaveLength(3);
    expect(result.map(c => c.id)).toEqual(['card2', 'card3', 'card4']);
  });

  test('should return empty array for invalid card', () => {
    const pile = createTableauPile([
      createCard('card1', 'hearts', 12)
    ]);

    const result = getMovableStack(pile, 'nonexistent');
    expect(result).toHaveLength(0);
  });
});