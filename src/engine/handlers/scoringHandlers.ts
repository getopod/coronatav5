import { EffectHandler, Effect } from '../effectEngine';
import { GameState } from '../types';

/**
 * Scoring and resource effect handlers
 */
export const scoringHandlers: Record<string, EffectHandler> = {
  award_score: (effect, state) => {
    const oldScore = state.player.score ?? 0;
    state.player.score = oldScore + (effect.value ?? 0);

    const newScore = state.player.score;
    console.log(`Award score effect: ${effect.value} points (${oldScore} → ${newScore})`);

    return state;
  },

  award_coin: (effect, state) => {
    const oldCoins = state.player.coins ?? 0;
    state.player.coins = oldCoins + (effect.value ?? 0);
    return state;
  },

  score_multiplier: (effect, state) => {
    const target = effect.target as string;
    const multiplier = effect.value ?? 1;

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
      state.player.maxHandSize = (state.player.maxHandSize ?? 5) + value;
    } else if (target === 'coins') {
      state.player.coins = (state.player.coins ?? 0) + value;
    }
    return state;
  },
};