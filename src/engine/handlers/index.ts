import { EffectHandler, Effect } from '../effectEngine';
import { GameState } from '../types';
import { scoringHandlers } from './scoringHandlers';
import { inventoryHandlers } from './inventoryHandlers';
import { cardHandlers } from './cardHandlers';

/**
 * Combined effect handlers from all categories
 */
export const modularBuiltInHandlers = {
  ...scoringHandlers,
  ...inventoryHandlers,
  ...cardHandlers,

  // Special handlers that don't fit categories
  allow_move: (effect, state) => {
    state.movePermissions ??= [];
    state.movePermissions.push(effect);
    return state;
  },

  move_card: (_effect, state) => {
    return state;
  },

  trigger_animation: (effect, state) => {
    state.registry?.engineController?.emitEvent('custom', { type: 'animation', effect });
    return state;
  },

  play_sound: (effect, state) => {
    state.registry?.engineController?.emitEvent('custom', { type: 'sound', effect });
    return state;
  },

  // Fortune-specific handlers
  convert_discard_to_play: (effect, state) => {
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

  fortune_enhancement: (effect, state) => {
    const multiplier = effect.value ?? 2;
    state.fortuneEnhancement ??= { multiplier: 1, active: false };
    state.fortuneEnhancement.multiplier = multiplier;
    state.fortuneEnhancement.active = true;
    console.log(`Fortune enhancement active: ${multiplier}x multiplier`);
    return state;
  },

  auto_play: (effect, state) => {
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

  // Encounter-specific handlers
  encounter_scoped: (effect, state) => {
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

  // Special handlers
  immunity: (effect, state) => {
    const immunityType = effect.target as string;

    state.immunities ??= [];
    if (!state.immunities.includes(immunityType)) {
      state.immunities.push(immunityType);
      console.log(`Granted immunity to: ${immunityType}`);
    }

    return state;
  },

  unlimited: (effect, state) => {
    const resource = effect.target as string;

    state.unlimited ??= [];
    if (!state.unlimited.includes(resource)) {
      state.unlimited.push(resource);
      console.log(`Made ${resource} unlimited`);
    }
    return state;
  },

  curse_mitigation: (effect, state) => {
    const mitigationFactor = effect.value ?? 0.5;

    state.curseMitigation ??= 1;
    state.curseMitigation *= mitigationFactor;

    console.log(`Applied curse mitigation: ${mitigationFactor}x (total: ${state.curseMitigation}x)`);
    return state;
  },

  apply_to_next_cards: (effect, state) => {
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

  // Registry action handlers
  play_copy: (effect, state) => {
    state.playCopyEffects ??= [];
    state.playCopyEffects.push({
      target: effect.target,
      condition: effect.condition
    });

    console.log(`Will create copy when playing to ${effect.target}`);
    return state;
  },

  fill_tableau: (effect, state) => {
    state.fillTableauEffects ??= [];
    state.fillTableauEffects.push({
      target: effect.target,
      condition: effect.condition
    });

    console.log(`Will fill ${effect.target} when conditions are met`);
    return state;
  },

  choose_reward: (effect, state) => {
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
    const count = effect.value ?? 1;

    state.additionalTableaux ??= 0;
    state.additionalTableaux += count;

    console.log(`Added ${count} additional tableau piles`);
    return state;
  },

  override_suit: (effect, state) => {
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

  unlock_tableau: (effect, state) => {
    const count = effect.value ?? 1;

    state.unlockedTableaux ??= 0;
    state.unlockedTableaux += count;

    console.log(`Unlocked ${count} tableau piles`);
    return state;
  },

  block: (effect, state) => {
    const target = effect.target as string;

    state.blockedActions ??= [];
    if (!state.blockedActions.includes(target)) {
      state.blockedActions.push(target);
      console.log(`Blocked action: ${target}`);
    }

    return state;
  },

  set_limit: (effect, state) => {
    const resource = effect.target as string;
    const limit = effect.value ?? 0;

    state.resourceLimits ??= {};
    state.resourceLimits[resource] = limit;

    console.log(`Set ${resource} limit to ${limit}`);
    return state;
  },

  // Stub handlers for unimplemented registry actions
  restrict_play: (effect, state) => {
    const restriction = { target: effect.target, duration: effect.duration ?? 1 };
    state.player.restrictions ??= [];
    state.player.restrictions.push(restriction);
    return state;
  },

  restrict_tableau: (effect, state) => {
    const allowedTableaux = effect.value as number[];
    state.allowedTableaux ??= [];
    state.allowedTableaux.push(...allowedTableaux);
    console.log(`Restricted play to tableau piles: ${allowedTableaux.join(', ')}`);
    return state;
  },

  move_adjacent: (effect, state) => {
    const cardId = effect.target as string;
    const direction = effect.value as 'left' | 'right';

    for (const pileName in state.piles) {
      const pile = state.piles[pileName];
      const idx = pile.cards.findIndex((c: any) => c.id === cardId);
      if (idx !== -1) {
        const [card] = pile.cards.splice(idx, 1);
        const pileNames = Object.keys(state.piles);
        const currentIdx = pileNames.indexOf(pileName);
        const adjIdx = direction === 'left' ? currentIdx - 1 : currentIdx + 1;
        if (adjIdx >= 0 && adjIdx < pileNames.length) {
          state.piles[pileNames[adjIdx]].cards.push(card);
        } else {
          pile.cards.push(card);
        }
        break;
      }
    }
    return state;
  },

  return_and_shuffle: (effect, state) => {
    const cardId = effect.target as string;
    for (const pile of Object.values(state.piles)) {
      const idx = pile.cards.findIndex((c: any) => c.id === cardId);
      if (idx !== -1) {
        const [card] = pile.cards.splice(idx, 1);
        state.piles.deck.cards.push(card);
        const crypto = require('crypto');
        for (let i = state.piles.deck.cards.length - 1; i > 0; i--) {
          const randBytes = crypto.randomBytes(4);
          const randInt = randBytes.readUInt32BE(0);
          const j = randInt % (i + 1);
          [state.piles.deck.cards[i], state.piles.deck.cards[j]] = [state.piles.deck.cards[j], state.piles.deck.cards[i]];
        }
        break;
      }
    }
    return state;
  },

  force_discard: (_effect, state) => {
    const hand = state.piles.hand;
    if (hand && hand.cards.length > 0) {
      hand.cards.pop();
      state.player.discards = (state.player.discards ?? 1) - 1;
    }
    return state;
  },

  auto_discard: (_effect, state) => {
    const hand = state.piles.hand;
    const discard = state.piles.discard;
    if (hand && hand.cards.length > 0 && discard) {
      const card = hand.cards.pop();
      if (card) discard.cards.push(card);
      state.player.discards = (state.player.discards ?? 1) - 1;
    }
    return state;
  },

  prevent_discard: (effect, state) => {
    state.player.preventDiscardTurns = effect.duration ?? 1;
    return state;
  },
};