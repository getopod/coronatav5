import { refillHandFromDeck } from '../../src/engine/moveLogic';

// Minimal mock GameState for testing
type Card = { id: string; value: number; suit: string; faceUp?: boolean };
type Pile = { id: string; type: string; cards: Card[] };
type GameState = {
  piles: { [key: string]: Pile };
  player: { maxHandSize?: number };
};

describe('refillHandFromDeck', () => {
  it('refills the hand to maxHandSize from the deck', () => {
    const hand: Card[] = [
      { id: 'c1', value: 1, suit: 'hearts', faceUp: true },
      { id: 'c2', value: 2, suit: 'spades', faceUp: true }
    ];
    const deck: Card[] = [
      { id: 'c3', value: 3, suit: 'clubs' },
      { id: 'c4', value: 4, suit: 'diamonds' },
      { id: 'c5', value: 5, suit: 'hearts' }
    ];
    const state: GameState = {
      piles: {
        hand: { id: 'hand', type: 'hand', cards: hand },
        deck: { id: 'deck', type: 'deck', cards: deck }
      },
      player: { maxHandSize: 4 }
    };
    const newState = refillHandFromDeck(state as any);
    expect(newState.piles.hand.cards.length).toBe(4);
    expect(newState.piles.deck.cards.length).toBe(1);
    // The new cards in hand should be faceUp
    expect(newState.piles.hand.cards[2].faceUp).toBe(true);
    expect(newState.piles.hand.cards[3].faceUp).toBe(true);
  });

  it('does nothing if hand is already full', () => {
    const hand: Card[] = [
      { id: 'c1', value: 1, suit: 'hearts', faceUp: true },
      { id: 'c2', value: 2, suit: 'spades', faceUp: true },
      { id: 'c3', value: 3, suit: 'clubs', faceUp: true },
      { id: 'c4', value: 4, suit: 'diamonds', faceUp: true }
    ];
    const deck: Card[] = [
      { id: 'c5', value: 5, suit: 'hearts' }
    ];
    const state: GameState = {
      piles: {
        hand: { id: 'hand', type: 'hand', cards: hand },
        deck: { id: 'deck', type: 'deck', cards: deck }
      },
      player: { maxHandSize: 4 }
    };
    const newState = refillHandFromDeck(state as any);
    expect(newState.piles.hand.cards.length).toBe(4);
    expect(newState.piles.deck.cards.length).toBe(1);
  });

  it('refills only as many as are in the deck', () => {
    const hand: Card[] = [
      { id: 'c1', value: 1, suit: 'hearts', faceUp: true }
    ];
    const deck: Card[] = [
      { id: 'c2', value: 2, suit: 'spades' }
    ];
    const state: GameState = {
      piles: {
        hand: { id: 'hand', type: 'hand', cards: hand },
        deck: { id: 'deck', type: 'deck', cards: deck }
      },
      player: { maxHandSize: 4 }
    };
    const newState = refillHandFromDeck(state as any);
    expect(newState.piles.hand.cards.length).toBe(2);
    expect(newState.piles.deck.cards.length).toBe(0);
    expect(newState.piles.hand.cards[1].faceUp).toBe(true);
  });
});
