// Effect Engine & Condition System for Card Game Engine
import { GameState } from './types';

export type Condition = Record<string, any> | ((state: GameState) => boolean);

export interface Effect {
  type: string; // e.g., 'award_score', 'move_card', 'custom'
  action?: string; // Effect action name (used in registry entries)
  target?: string;
  value?: any;
  condition?: Condition;
  priority?: number;
  duration?: number; // For temporary effects
  oneShot?: boolean; // For one-time only effects
  meta?: Record<string, any>;
}

export type EffectHandler = (effect: Effect, state: GameState) => GameState;

export interface EffectEngineConfig {
  handlers: Record<string, EffectHandler>;
}

export class EffectEngine {
  private handlers: Record<string, EffectHandler>;

  constructor(config: EffectEngineConfig) {
    this.handlers = config.handlers;
  }

  applyEffect(effect: Effect, state: GameState): GameState {
    // Check condition (skip 'event' conditions as they're handled at the calling level)
    if (effect.condition) {
      if (typeof effect.condition === 'function') {
        if (!effect.condition(state)) return state;
      } else {
        // Simple key/value match (skip event conditions)
        for (const key in effect.condition) {
          if (key === 'event') continue; // Event conditions are handled by applyEventBasedEffects
          if ((state as any)[key] !== effect.condition[key]) return state;
        }
      }
    }
    // Find handler
    const handler = this.handlers[effect.type];
    if (!handler) return state;
    return handler(effect, state);
  }

  applyEffects(effects: Effect[], state: GameState): GameState {
    // Sort by priority, then apply
    const sorted = [...effects].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    let newState = state;
    for (const effect of sorted) {
      newState = this.applyEffect(effect, newState);
    }
    return newState;
  }

  registerHandler(type: string, handler: EffectHandler) {
    this.handlers[type] = handler;
  }

  getAvailableHandlers(): string[] {
    return Object.keys(this.handlers);
  }
}

// Example built-in effect handlers
export const builtInHandlers: Record<string, EffectHandler> = {
  award_score: (effect, state) => {
    const oldScore = state.player.score ?? 0;
    state.player.score = oldScore + (effect.value ?? 0);
    
    // Import and trigger encounter progression if scoring system is available
    // Note: We need to be careful about circular imports here
    const newScore = state.player.score;
    console.log(`Award score effect: ${effect.value} points (${oldScore} → ${newScore})`);
    
    return state;
  },
  award_coin: (effect, state) => {
    const oldCoins = state.player.coins ?? 0;
    state.player.coins = oldCoins + (effect.value ?? 0);
    return state;
  },
  add_item: (effect, state) => {
    const itemType = effect.target as string;
    const itemId = effect.value as string;
    
    if (itemType === 'exploit') {
      state.player.exploits = [...(state.player.exploits || []), itemId];
    } else if (itemType === 'blessing') {
      // Add to owned blessings (to be applied to cards later)
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
      // Remove from owned blessings
      state.player.ownedBlessings = (state.player.ownedBlessings || []).filter(id => id !== itemId);
    } else if (itemType === 'curse') {
      state.player.curses = (state.player.curses || []).filter(id => id !== itemId);
    }
    
    return state;
  },
  score_multiplier: (effect, state) => {
    const target = effect.target as string;
    const multiplier = effect.value ?? 1;
    
    // Store multiplier for later use in scoring
    state.activeMultipliers ??= [];
    
    state.activeMultipliers.push({
      target,
      multiplier,
      source: effect.meta?.sourceEntry || 'unknown'
    });
    
    console.log(`Added score multiplier: ${multiplier}x for ${target}`);
    return state;
  },
  coin_multiplier: (effect, state) => {
    const multiplier = effect.value ?? 1;
    
    // Apply coin multiplier to player
    if (!state.player.coinMultiplier) {
      state.player.coinMultiplier = 1;
    }
    state.player.coinMultiplier *= multiplier;
    
    console.log(`Applied coin multiplier: ${multiplier}x (total: ${state.player.coinMultiplier}x)`);
    return state;
  },
  modify_setting: (effect, state) => {
    const target = effect.target as string;
    const value = effect.value ?? 0;
    if (target === 'shufflesLeft' || target === 'shuffles') {
      state.player.shuffles = (state.player.shuffles ?? 0) + value;
    } else if (target === 'discardsLeft' || target === 'discards') {
      state.player.discards = (state.player.discards ?? 0) + value;
    } else if (target === 'handSize' || target === 'maxHandSize') {
      // Update max hand size and trigger hand refill if needed
      state.player.maxHandSize = (state.player.maxHandSize ?? 5) + value;
      // Note: Hand refill should be handled by the game loop after effect processing
    } else if (target === 'coins') {
      state.player.coins = (state.player.coins ?? 0) + value;
    }
    return state;
  },
  draw_cards: (effect, state) => {
    const value = effect.value ?? 1;
    const handPile = state.piles?.hand;
    const deckPile = state.piles?.deck;
    
    if (handPile && deckPile && deckPile.cards.length > 0) {
      const cardsToTake = Math.min(value, deckPile.cards.length);
      const drawnCards = deckPile.cards.splice(0, cardsToTake);
      drawnCards.forEach(card => card.faceUp = true);
      handPile.cards.push(...drawnCards);
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
  reveal: (effect, state) => {
    // Reveal cards from specified target
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
  allow_move: (effect, state) => {
    // Store special move permissions for move validation to check
    state.movePermissions ??= [];
    state.movePermissions.push(effect);
    return state;
  },
  move_card: (effect, state) => {
    // Custom logic to move a card (to be implemented)
    return state;
  },
  trigger_animation: (effect, state) => {
    // Animation event: UI should listen for this
    if (state && state.registry && state.registry.engineController) {
      state.registry.engineController.emitEvent('custom', { type: 'animation', effect });
    }
    return state;
  },
  play_sound: (effect, state) => {
    // Sound event: UI should listen for this
    if (state && state.registry && state.registry.engineController) {
      state.registry.engineController.emitEvent('custom', { type: 'sound', effect });
    }
    return state;
  },

  // FORTUNE-SPECIFIC HANDLERS
  convert_discard_to_play: (effect, state) => {
    // Convert discard pile back to playable state (deck/hand)
    const discardPile = state.piles?.discard;
    const handPile = state.piles?.hand;
    const deckPile = state.piles?.deck;
    
    if (discardPile && discardPile.cards.length > 0) {
      const cardsToConvert = discardPile.cards.splice(0, effect.value ?? discardPile.cards.length);
      
      if (effect.target === 'hand' && handPile) {
        cardsToConvert.forEach(card => card.faceUp = true);
        handPile.cards.push(...cardsToConvert);
      } else if (effect.target === 'deck' && deckPile) {
        cardsToConvert.forEach(card => card.faceUp = false);
        deckPile.cards.unshift(...cardsToConvert);
      }
      
      console.log(`Converted ${cardsToConvert.length} cards from discard to ${effect.target}`);
    }
    return state;
  },

  add_card: (effect, state) => {
    // Add new cards to specified pile
    const target = effect.target as string;
    const cardData = effect.value;
    const pile = state.piles?.[target];
    
    if (pile && cardData) {
      // Create new card object
      const newCard = {
        id: `generated-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        suit: cardData.suit || 'hearts',
        value: cardData.value || 1, // Use value instead of rank for Card type
        faceUp: target === 'hand',
        blessings: cardData.blessings || []
      };
      
      pile.cards.push(newCard);
      console.log(`Added card ${newCard.id} to ${target}`);
    }
    return state;
  },

  fortune_enhancement: (effect, state) => {
    // Enhance fortune effects (typically multiplying their impact)
    const multiplier = effect.value ?? 2;
    
    // Store fortune enhancement for other effects to reference
    if (!state.fortuneEnhancement) {
      state.fortuneEnhancement = { multiplier: 1, active: false };
    }
    state.fortuneEnhancement.multiplier = multiplier;
    state.fortuneEnhancement.active = true;
    
    console.log(`Fortune enhancement active: ${multiplier}x multiplier`);
    return state;
  },

  auto_play: (effect, state) => {
    // Mark certain cards for automatic play when valid moves are available
    const target = effect.target as string;
    const pile = state.piles?.[target];
    
    if (pile && pile.cards.length > 0) {
      const cardCount = effect.value ?? 1;
      for (let i = 0; i < Math.min(cardCount, pile.cards.length); i++) {
        pile.cards[i].autoPlay = true;
      }
      console.log(`Marked ${cardCount} cards in ${target} for auto-play`);
    }
    return state;
  },

  // FEAR AND DANGER HANDLERS
  encounter_scoped: (effect, state) => {
    // Effects that only last for the current encounter
    state.encounterEffects ??= [];
    state.encounterEffects.push({
      action: effect.action || effect.type,
      target: effect.target,
      value: effect.value,
      source: effect.meta?.sourceEntry || 'unknown'
    });
    
    console.log(`Added encounter-scoped effect: ${effect.action || effect.type}`);
    return state;
  },

  global_multiplier: (effect, state) => {
    // Apply global multipliers that affect all scoring
    const multiplier = effect.value ?? 1;
    const target = effect.target as string;
    
    state.globalMultipliers ??= {};
    if (target === 'all' || target === 'score') {
      state.globalMultipliers.score = (state.globalMultipliers.score ?? 1) * multiplier;
    }
    if (target === 'all' || target === 'coin') {
      state.globalMultipliers.coin = (state.globalMultipliers.coin ?? 1) * multiplier;
    }
    
    console.log(`Applied global ${target} multiplier: ${multiplier}x`);
    return state;
  },

  // EXPLOIT-SPECIFIC HANDLERS
  unlock_item: (effect, state) => {
    // Unlock items in the registry for future encounters
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

  immunity: (effect, state) => {
    // Grant immunity to specific effect types or sources
    const immunityType = effect.target as string;
    
    state.immunities ??= [];
    if (!state.immunities.includes(immunityType)) {
      state.immunities.push(immunityType);
      console.log(`Granted immunity to: ${immunityType}`);
    }
    return state;
  },

  unlimited: (effect, state) => {
    // Make certain resources unlimited (shuffles, discards, etc.)
    const resource = effect.target as string;
    
    state.unlimited ??= [];
    if (!state.unlimited.includes(resource)) {
      state.unlimited.push(resource);
      console.log(`Made ${resource} unlimited`);
    }
    return state;
  },

  // BLESSING AND CURSE HANDLERS
  curse_mitigation: (effect, state) => {
    // Reduce the impact of curses
    const mitigationFactor = effect.value ?? 0.5;
    
    state.curseMitigation ??= 1;
    state.curseMitigation *= mitigationFactor;
    
    console.log(`Applied curse mitigation: ${mitigationFactor}x (total: ${state.curseMitigation}x)`);
    return state;
  },

  apply_to_next_cards: (effect, state) => {
    // Apply an effect to the next N cards drawn/played
    const cardCount = effect.value ?? 1;
    const effectType = effect.target as string;
    
    state.nextCardEffects ??= [];
    state.nextCardEffects.push({
      count: cardCount,
      effect: effectType,
      remaining: cardCount
    });
    
    console.log(`Will apply ${effectType} to next ${cardCount} cards`);
    return state;
  },

  temporary_boost: (effect, state) => {
    // Temporary boosts that expire after conditions are met
    const boostType = effect.target as string;
    const boostValue = effect.value ?? 1;
    const duration = effect.duration ?? 1;
    
    state.temporaryBoosts ??= [];
    state.temporaryBoosts.push({
      type: boostType,
      value: boostValue,
      remaining: duration
    });
    
    console.log(`Applied temporary ${boostType} boost: +${boostValue} for ${duration} uses`);
    return state;
  },

  // ADDITIONAL ACTION TYPES FROM REGISTRY
  play_copy: (effect, state) => {
    // Create a copy of a card when played
    const target = effect.target as string;
    
    state.playCopyEffects ??= [];
    state.playCopyEffects.push({
      target,
      condition: effect.condition
    });
    
    console.log(`Will create copy when playing to ${target}`);
    return state;
  },

  fill_tableau: (effect, state) => {
    // Fill empty tableaux with specific cards
    const target = effect.target as string;
    
    state.fillTableauEffects ??= [];
    state.fillTableauEffects.push({
      target,
      condition: effect.condition
    });
    
    console.log(`Will fill ${target} when conditions are met`);
    return state;
  },

  choose_reward: (effect, state) => {
    // Player gets to choose between different rewards
    const rewardType = effect.value as string;
    
    state.pendingRewards ??= [];
    state.pendingRewards.push({
      type: rewardType,
      target: effect.target
    });
    
    console.log(`Player can choose reward: ${rewardType}`);
    return state;
  },

  score_special: (effect, state) => {
    // Special scoring calculations
    const scoringType = effect.value as string;
    const target = effect.target as string;
    
    state.specialScoring ??= [];
    state.specialScoring.push({
      type: scoringType,
      target,
      oneShot: effect.oneShot
    });
    
    console.log(`Applied special scoring: ${scoringType} for ${target}`);
    return state;
  },

  add_tableau: (effect, state) => {
    // Add new tableau piles
    const count = effect.value ?? 1;
    
    state.additionalTableaux ??= 0;
    state.additionalTableaux += count;
    
    console.log(`Added ${count} additional tableau piles`);
    return state;
  },

  override_suit: (effect, state) => {
    // Override card suit restrictions
    const newSuit = effect.value as string;
    const target = effect.target as string;
    
    state.suitOverrides ??= [];
    state.suitOverrides.push({
      target,
      value: newSuit
    });
    
    console.log(`Override suit to ${newSuit} for ${target}`);
    return state;
  },

  override_value: (effect, state) => {
    // Override card value restrictions
    const newValue = effect.value as string;
    const target = effect.target as string;
    
    state.valueOverrides ??= [];
    state.valueOverrides.push({
      target,
      value: newValue
    });
    
    console.log(`Override value to ${newValue} for ${target}`);
    return state;
  },

  draw_from_tableau: (effect, state) => {
    // Draw cards from tableau to hand
    const count = effect.value ?? 1;
    const target = effect.target as string;
    
    if (target === 'hand') {
      // Find cards in tableau to move to hand
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

  reveal_bottom: (effect, state) => {
    // Reveal cards from bottom of deck
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

  discard_hand: (effect, state) => {
    // Discard entire hand
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

  shuffle_deck: (effect, state) => {
    // Shuffle the deck
    const deckPile = state.piles?.deck;
    
    if (deckPile && deckPile.cards.length > 0) {
      // Simple shuffle algorithm
      for (let i = deckPile.cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckPile.cards[i], deckPile.cards[j]] = [deckPile.cards[j], deckPile.cards[i]];
      }
      console.log(`Shuffled deck with ${deckPile.cards.length} cards`);
    }
    
    return state;
  },

  unlock_tableau: (effect, state) => {
    // Unlock tableau piles for special moves
    const count = effect.value ?? 1;
    
    state.unlockedTableaux ??= 0;
    state.unlockedTableaux += count;
    
    console.log(`Unlocked ${count} tableau piles`);
    return state;
  },

  block: (effect, state) => {
    // Block certain moves or actions
    const target = effect.target as string;
    
    state.blockedActions ??= [];
    if (!state.blockedActions.includes(target)) {
      state.blockedActions.push(target);
      console.log(`Blocked action: ${target}`);
    }
    
    return state;
  },

  flip_facedown: (effect, state) => {
    // Flip cards face down
    const target = effect.target as string;
    const pile = state.piles?.[target];
    
    if (pile && pile.cards.length > 0) {
      pile.cards.forEach(card => card.faceUp = false);
      console.log(`Flipped ${pile.cards.length} cards face down in ${target}`);
    }
    
    return state;
  },

  set_limit: (effect, state) => {
    // Set limits on resources
    const resource = effect.target as string;
    const limit = effect.value ?? 0;
    
    state.resourceLimits ??= {};
    state.resourceLimits[resource] = limit;
    
    console.log(`Set ${resource} limit to ${limit}`);
    return state;
  },

  // Add more built-in handlers as needed
};
