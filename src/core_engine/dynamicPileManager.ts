// Dynamic Pile Management for Card Game Engine
import { GameState, Pile, Card } from './types';

export class DynamicPileManager {
  addPile(state: GameState, pile: Pile): GameState {
    state.piles[pile.id] = pile;
    return state;
  }

  removePile(state: GameState, pileId: string): GameState {
    delete state.piles[pileId];
    return state;
  }

  moveCardsToNewPile(state: GameState, cardIds: string[], newPile: Pile): GameState {
    // Remove cards from their current piles and collect actual Card objects
    const movedCards: Card[] = [];
    for (const cardId of cardIds) {
      for (const pile of Object.values(state.piles)) {
        const idx = pile.cards.findIndex(c => c.id === cardId);
        if (idx !== -1) {
          const [card] = pile.cards.splice(idx, 1);
          if (card) movedCards.push(card);
          break;
        }
      }
    }
    // Add actual cards to new pile
    newPile.cards.push(...movedCards);
    state.piles[newPile.id] = newPile;
    return state;
  }

  getPile(state: GameState, pileId: string): Pile | undefined {
    return state.piles[pileId];
  }
}
