import { EffectHandler } from '../effectEngine';
import { GameState } from '../types';

/**
 * Card manipulation effect handlers
 */
export const cardHandlers: Record<string, EffectHandler> = {
  draw_cards: (effect, state) => {
    const value = effect.value ?? 1;
    const handPile = state.piles?.hand;
    const deckPile = state.piles?.deck || state.piles?.stock;

    if (handPile && deckPile && deckPile.cards.length > 0) {
      const cardsToTake = Math.min(value, deckPile.cards.length);
      const drawnCards = deckPile.cards.splice(0, cardsToTake);
      drawnCards.forEach(card => card.faceUp = true);
      handPile.cards.push(...drawnCards);
      // Ensure the new top card in the deck is always face down
      if (deckPile.cards.length > 0) {
        deckPile.cards[deckPile.cards.length - 1].faceUp = false;
      }
    }
    return state;
  },

  draw_card: (effect, state) => {
    // Alias to draw_cards for single card
    const drawCardsHandler = cardHandlers.draw_cards;
    if (drawCardsHandler) {
      return drawCardsHandler({ ...effect, value: effect.value ?? 1 }, state);
    }
    console.warn('[EffectEngine] draw_card effect not implemented:', effect);
    return state;
  },

  reveal: (effect, state) => {
    const target = effect.target as string;
    const value = effect.value ?? 1;
    const pile = state.piles?.[target];

    if (pile && pile.cards.length > 0) {
      for (let i = 0; i < Math.min(value, pile.cards.length); i++) {
        pile.cards[i].faceUp = true;
      }
    }
    return state;
  },

  reveal_bottom: (effect, state) => {
    const count = effect.value ?? 1;
    const target = effect.target as string;
    const pile = state.piles?.[target];

    if (pile && pile.cards.length > 0) {
      const startIndex = Math.max(0, pile.cards.length - count);
      for (let i = startIndex; i < pile.cards.length; i++) {
        pile.cards[i].faceUp = true;
      }
      console.log(`Revealed bottom ${count} cards of ${target}`);
    }

    return state;
  },

  flip_facedown: (effect, state) => {
    const target = effect.target as string;
    const pile = state.piles?.[target];

    if (pile && pile.cards.length > 0) {
      pile.cards.forEach(card => card.faceUp = false);
      console.log(`Flipped ${pile.cards.length} cards face down in ${target}`);
    }
    return state;
  },

  add_card: (effect, state) => {
    const target = effect.target as string;
    const cardData = effect.value;
    const pile = state.piles?.[target];

    if (pile && cardData) {
      // Create new card object with a browser-compatible random ID
      let secureId = '';
      if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const array = new Uint32Array(2);
        window.crypto.getRandomValues(array);
        secureId = Array.from(array).map(n => n.toString(16)).join('');
      } else {
        secureId = Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
      }
      const newCard = {
        id: `generated-${Date.now()}-${secureId}`,
        suit: cardData.suit || 'hearts',
        value: cardData.value || 1,
        faceUp: target === 'hand',
        blessings: cardData.blessings || []
      };
      pile.cards.push(newCard);
      console.log(`Added card ${newCard.id} to ${target}`);
    }
    return state;
  },

  discard_hand: (_effect, state) => {
    const handPile = state.piles?.hand;
    const discardPile = state.piles?.discard;
    if (handPile && discardPile) {
      const cardsToDiscard = handPile.cards.splice(0);
      cardsToDiscard.forEach(card => card.faceUp = true);
      discardPile.cards.push(...cardsToDiscard);
      console.log(`Discarded ${cardsToDiscard.length} cards from hand`);
    }
    return state;
  },

  shuffle_deck: (_effect, state) => {
    const deckPile = state.piles?.deck;
    if (deckPile && deckPile.cards.length > 0) {
      const crypto = require('crypto');
      for (let i = deckPile.cards.length - 1; i > 0; i--) {
        const randBytes = crypto.randomBytes(4);
        const randInt = randBytes.readUInt32BE(0);
        const j = randInt % (i + 1);
        [deckPile.cards[i], deckPile.cards[j]] = [deckPile.cards[j], deckPile.cards[i]];
      }
      console.log(`Shuffled deck with ${deckPile.cards.length} cards`);
    }
    return state;
  },

  draw_from_tableau: (effect, state) => {
    const count = effect.value ?? 1;
    const target = effect.target as string;

    if (target === 'hand') {
      const tableauPiles = Object.values(state.piles || {}).filter(pile => pile.type === 'tableau');
      let cardsDrawn = 0;

      for (const pile of tableauPiles) {
        if (pile.cards.length > 0 && cardsDrawn < count) {
          const card = pile.cards.pop();
          if (card && state.piles?.hand) {
            card.faceUp = true;
            state.piles.hand.cards.push(card);
            cardsDrawn++;
          }
        }
      }

      console.log(`Drew ${cardsDrawn} cards from tableau to hand`);
    }

    return state;
  },

  return_to_hand: (effect, state) => {
    const cardId = effect.target as string;
    for (const pile of Object.values(state.piles)) {
      const idx = pile.cards.findIndex((c: any) => c.id === cardId);
      if (idx !== -1) {
        const [card] = pile.cards.splice(idx, 1);
        state.piles.hand.cards.push(card);
        break;
      }
    }
    return state;
  },
};