// Klondike setup utility for testing
export function makeKlondikeRegistryConfig(): RegistryConfig {
  // Generate 52 cards
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const cards: CardConfig[] = [];
  let cardId = 1;
  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      cards.push({
        id: `c${cardId}`,
        suit,
        value,
        faceUp: false,
      });
      cardId++;
    }
  }
  // Shuffle cards
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Deal to 7 tableau piles
  const piles: PileConfig[] = [];
  let dealt = 0;
  for (let pileNum = 1; pileNum <= 7; pileNum++) {
    const pileCards: string[] = [];
    for (let i = 0; i < pileNum; i++) {
      pileCards.push(shuffled[dealt].id);
      // Set faceUp true for last card in pile
      if (i === pileNum - 1) {
        shuffled[dealt].faceUp = true;
      }
      dealt++;
    }
    piles.push({
      id: `tableau${pileNum}`,
      type: 'tableau',
      initialCards: pileCards,
    });
  }
  // Remaining cards go to deck
  const deckCards = shuffled.slice(dealt).map(card => card.id);
  piles.push({ id: 'deck', type: 'deck', initialCards: deckCards });
  // Add 4 empty foundation piles
  for (let i = 1; i <= 4; i++) {
    piles.push({ id: `foundation${i}`, type: 'foundation', initialCards: [] });
  }
  return {
    piles,
    cards: shuffled,
    rules: {},
    effects: {},
    scoring: {},
  };
}
import { RegistryEntry } from '../../src/registry/index';
import { RegistryConfig, PileConfig, CardConfig } from '../../src/engine/registryLoader';

export function makeTestRegistryConfig(): RegistryConfig {
  return {
    piles: [
      { id: 'testPile', type: 'tableau', initialCards: ['c1'] }
    ],
    cards: [
      { id: 'c1', suit: 'hearts', value: 1, faceUp: true }
    ],
    rules: {},
    effects: {},
    scoring: {},
  };
}

export function makeTestRegistryEntries(): RegistryEntry[] {
  return [
    {
      id: 'entry1',
      label: 'Test Entry',
      description: 'A test registry entry',
      type: 'feat',
      rarity: 'common',
      category: 'test',
      completed: false,
      tags: [],
      choices: [],
      results: {},
      effects: [
        { action: 'customEffect', target: 'testPile', value: 'foo' },
        { action: 'win', target: 'testPile' }
      ],
      visibility: 'visible'
    }
  ];
}
