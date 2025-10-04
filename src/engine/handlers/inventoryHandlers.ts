import { EffectHandler } from '../effectEngine';
import { GameState } from '../types';

/**
 * Inventory management effect handlers (blessings, curses, exploits, etc.)
 */
export const inventoryHandlers: Record<string, EffectHandler> = {
  add_item: (effect, state) => {
    const itemType = effect.target as string;
    const itemId = effect.value as string;

    if (itemType === 'exploit') {
      state.player.exploits = [...(state.player.exploits || []), itemId];
    } else if (itemType === 'blessing') {
      state.player.ownedBlessings = [...(state.player.ownedBlessings || []), itemId];
    } else if (itemType === 'curse') {
      state.player.curses = [...(state.player.curses || []), itemId];
    }

    return state;
  },

  remove_item: (effect, state) => {
    const itemType = effect.target as string;
    const itemId = effect.value as string;

    if (itemType === 'exploit') {
      state.player.exploits = (state.player.exploits || []).filter(id => id !== itemId);
    } else if (itemType === 'blessing') {
      state.player.ownedBlessings = (state.player.ownedBlessings || []).filter(id => id !== itemId);
    } else if (itemType === 'curse') {
      state.player.curses = (state.player.curses || []).filter(id => id !== itemId);
    }

    return state;
  },

  apply_blessing_to_card: (effect, state) => {
    const cardId = effect.target as string;
    const blessingId = effect.value as string;

    // Find the card in all piles
    let targetCard: any = null;
    Object.values(state.piles || {}).forEach(pile => {
      const card = pile.cards.find(c => c.id === cardId);
      if (card) targetCard = card;
    });

    if (!targetCard) {
      console.warn(`Cannot apply blessing: card ${cardId} not found`);
      return state;
    }

    // Initialize blessings array if needed
    if (!targetCard.blessings) {
      targetCard.blessings = [];
    }

    // Add blessing to card (avoid duplicates)
    if (!targetCard.blessings.includes(blessingId)) {
      targetCard.blessings.push(blessingId);
      console.log(`Applied blessing ${blessingId} to card ${cardId}`);
    }

    // Remove blessing from owned blessings
    if (state.player.ownedBlessings) {
      state.player.ownedBlessings = state.player.ownedBlessings.filter(id => id !== blessingId);
    }

    return state;
  },

  unlock_item: (effect, state) => {
    const itemType = effect.target as string;
    const itemId = effect.value as string;

    state.unlockedItems ??= {};
    state.unlockedItems[itemType] ??= [];

    if (!state.unlockedItems[itemType].includes(itemId)) {
      state.unlockedItems[itemType].push(itemId);
      console.log(`Unlocked ${itemType}: ${itemId}`);
    }
    return state;
  },

  unlock_cosmetic: (effect, state) => {
    const cosmeticId = effect.value as string;
    state.player.unlockedCosmetics ??= [];
    if (!state.player.unlockedCosmetics.includes(cosmeticId)) {
      state.player.unlockedCosmetics.push(cosmeticId);
    }
    return state;
  },

  unlock_cardback: (effect, state) => {
    const cardbackId = effect.value as string;
    state.player.unlockedCardbacks ??= [];
    if (!state.player.unlockedCardbacks.includes(cardbackId)) {
      state.player.unlockedCardbacks.push(cardbackId);
    }
    return state;
  },

  unlock_master_card: (effect, state) => {
    const masterCardId = effect.value as string;
    state.player.unlockedMasterCards ??= [];
    if (!state.player.unlockedMasterCards.includes(masterCardId)) {
      state.player.unlockedMasterCards.push(masterCardId);
    }
    return state;
  },
};