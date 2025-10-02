/**
 * Coin Economy System - Manages pricing, rewards, and economic balance
 */

import { AscensionManager } from './ascensionSystem';

// Base item costs (before ascension scaling)
export const BASE_ITEM_COSTS = {
  // Exploits - permanent items (most expensive)
  EXPLOIT_WEAK: 15,
  EXPLOIT_DECENT: 25, 
  EXPLOIT_AMAZING: 40,

  // Blessings - tactical items (moderate cost)
  BLESSING_WEAK: 8,
  BLESSING_DECENT: 15,
  BLESSING_AMAZING: 25,

  // Utility purchases
  HAND_SIZE_UPGRADE: 20,
  SHUFFLE_UPGRADE: 15,
  DISCARD_UPGRADE: 15,

  // Curse removal
  CURSE_REMOVAL: 10,

  // Reroll costs (escalating)
  REROLL_BASE: 5,
  REROLL_MULTIPLIER: 2, // 5, 10, 20, 40...
} as const;

export type ItemTier = 'WEAK' | 'DECENT' | 'AMAZING';
export type ItemType = 'EXPLOIT' | 'BLESSING';

/**
 * Get the cost of an item based on type, tier, and ascension level
 */
export function getItemCost(
  itemType: ItemType, 
  tier: ItemTier, 
  ascensionLevel: number
): number {
  const key = `${itemType}_${tier}` as keyof typeof BASE_ITEM_COSTS;
  const baseCost = BASE_ITEM_COSTS[key];
  return AscensionManager.getScaledCost(baseCost, ascensionLevel);
}

/**
 * Get utility upgrade costs
 */
export function getUtilityCost(
  upgradeType: 'HAND_SIZE' | 'SHUFFLE' | 'DISCARD', 
  ascensionLevel: number
): number {
  const key = `${upgradeType}_UPGRADE` as keyof typeof BASE_ITEM_COSTS;
  const baseCost = BASE_ITEM_COSTS[key];
  return AscensionManager.getScaledCost(baseCost, ascensionLevel);
}

/**
 * Get curse removal cost
 */
export function getCurseRemovalCost(ascensionLevel: number): number {
  return AscensionManager.getScaledCost(BASE_ITEM_COSTS.CURSE_REMOVAL, ascensionLevel);
}

/**
 * Get reroll cost (escalates with each use)
 */
export function getRerollCost(rerollCount: number, ascensionLevel: number): number {
  const baseCost = BASE_ITEM_COSTS.REROLL_BASE * Math.pow(BASE_ITEM_COSTS.REROLL_MULTIPLIER, rerollCount);
  return AscensionManager.getScaledCost(baseCost, ascensionLevel);
}

/**
 * Trade shop configuration for different stages of the run
 */
export interface TradeShopConfig {
  exploitSlots: number;
  blessingSlots: number;
  curseSlots: number;
  maxCurseRemovals: number;
  availableTiers: ItemTier[];
}

/**
 * Get trade shop configuration based on which trade in the run (1-5)
 */
export function getTradeShopConfig(tradeNumber: number): TradeShopConfig {
  switch (tradeNumber) {
    case 1:
    case 2:
      // Early trades: focus on weak/decent items
      return {
        exploitSlots: 3,
        blessingSlots: 4,
        curseSlots: 2,
        maxCurseRemovals: 1,
        availableTiers: ['WEAK', 'DECENT'],
      };
    
    case 3:
    case 4:
      // Mid trades: mix of decent/amazing items
      return {
        exploitSlots: 4,
        blessingSlots: 5,
        curseSlots: 3,
        maxCurseRemovals: 2,
        availableTiers: ['WEAK', 'DECENT', 'AMAZING'],
      };
    
    case 5:
    default:
      // Final trade: focus on fine-tuning, more amazing items
      return {
        exploitSlots: 5,
        blessingSlots: 6,
        curseSlots: 3,
        maxCurseRemovals: 3,
        availableTiers: ['DECENT', 'AMAZING'],
      };
  }
}

/**
 * Calculate expected coin income for a full run
 */
export function calculateExpectedIncome(ascensionLevel: number): {
  startingCoins: number;
  fearRewards: number;
  dangerRewards: number;
  wanderRewards: number;
  totalIncome: number;
} {
  const startingCoins = 50;
  
  // 5 trials × 2 Fear encounters = 10 Fear encounters
  const fearEncounters = 10;
  const avgFearReward = AscensionManager.getScaledCoinReward(4, ascensionLevel); // Average of 3-5
  const fearRewards = fearEncounters * avgFearReward;
  
  // 5 trials × 1 Danger encounter = 5 Danger encounters  
  const dangerEncounters = 5;
  const avgDangerReward = AscensionManager.getScaledCoinReward(6.5, ascensionLevel); // Average of 5-8
  const dangerRewards = dangerEncounters * avgDangerReward;
  
  // 10 Wander events (2 per trial × 5 trials)
  const wanderEvents = 10;
  const avgWanderReward = AscensionManager.getScaledCoinReward(6, ascensionLevel); // Estimated average
  const wanderRewards = wanderEvents * avgWanderReward;
  
  const totalIncome = startingCoins + fearRewards + dangerRewards + wanderRewards;
  
  return {
    startingCoins,
    fearRewards,
    dangerRewards,
    wanderRewards,
    totalIncome,
  };
}

/**
 * Validate coin economy balance for a given ascension level
 */
export function validateEconomyBalance(ascensionLevel: number): {
  totalIncome: number;
  minimalBuildCost: number;
  decentBuildCost: number;
  amazingBuildCost: number;
  isBalanced: boolean;
  recommendations: string[];
} {
  const income = calculateExpectedIncome(ascensionLevel);
  
  // Cost scenarios
  const minimalBuildCost = 
    getItemCost('EXPLOIT', 'WEAK', ascensionLevel) * 2 + 
    getItemCost('BLESSING', 'WEAK', ascensionLevel) * 3;
    
  const decentBuildCost = 
    getItemCost('EXPLOIT', 'DECENT', ascensionLevel) * 2 + 
    getItemCost('BLESSING', 'DECENT', ascensionLevel) * 3 +
    getUtilityCost('HAND_SIZE', ascensionLevel);
    
  const amazingBuildCost = 
    getItemCost('EXPLOIT', 'AMAZING', ascensionLevel) * 1 + 
    getItemCost('EXPLOIT', 'DECENT', ascensionLevel) * 1 +
    getItemCost('BLESSING', 'AMAZING', ascensionLevel) * 2 +
    getUtilityCost('HAND_SIZE', ascensionLevel) +
    getCurseRemovalCost(ascensionLevel) * 2;

  const recommendations: string[] = [];
  
  // Balance checks
  const minimalAffordable = income.totalIncome >= minimalBuildCost;
  const decentAffordable = income.totalIncome >= decentBuildCost;
  const amazingPossible = income.totalIncome * 0.8 >= amazingBuildCost; // 80% efficiency

  if (!minimalAffordable) {
    recommendations.push('Increase coin rewards - minimal builds not affordable');
  }
  if (!decentAffordable) {
    recommendations.push('Increase mid-game coin rewards or reduce item costs');
  }
  if (!amazingPossible) {
    recommendations.push('Amazing builds too expensive relative to income');
  }

  const isBalanced = minimalAffordable && decentAffordable && amazingPossible;

  return {
    totalIncome: income.totalIncome,
    minimalBuildCost,
    decentBuildCost,
    amazingBuildCost,
    isBalanced,
    recommendations,
  };
}