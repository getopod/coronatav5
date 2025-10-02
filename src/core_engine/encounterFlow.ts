/**
 * Encounter Flow System - Manages the new 5-trial structure with event randomization
 */

import { AscensionManager, getEncounterCoinReward } from './ascensionSystem';

export type EventType = 'TRADE' | 'WANDER';
export type EncounterType = 'FEAR' | 'DANGER';

export interface RunFlow {
  currentTrial: number;
  currentEncounter: number;
  totalTrials: number;
  encountersPerTrial: number;
  ascensionLevel: number;
  coins: number;
  completedEncounters: string[];
  pendingEvents: EventType[];
  fortuneSwapDue: boolean;
  bonusTradeAvailable: boolean;
}

export interface EncounterResult {
  type: EncounterType;
  coinsAwarded: number;
  scoreGoal: number;
  success: boolean;
}

/**
 * Initialize a new run with the updated flow structure
 */
export function initializeRunFlow(ascensionLevel: number = 0): RunFlow {
  return {
    currentTrial: 1,
    currentEncounter: 1,
    totalTrials: 5,
    encountersPerTrial: 3, // Fear, Fear, Danger
    ascensionLevel,
    coins: 50, // Starting coins
    completedEncounters: [],
    pendingEvents: [],
    fortuneSwapDue: false,
    bonusTradeAvailable: false,
  };
}

/**
 * Get the current encounter type based on position in trial
 */
export function getCurrentEncounterType(flow: RunFlow): EncounterType {
  // Encounters 1 and 2 in each trial are Fear, encounter 3 is Danger
  return flow.currentEncounter === 3 ? 'DANGER' : 'FEAR';
}

/**
 * Complete an encounter and update the flow state
 */
export function completeEncounter(flow: RunFlow, success: boolean): {
  updatedFlow: RunFlow;
  result: EncounterResult;
  nextEvents: EventType[];
} {
  const encounterType = getCurrentEncounterType(flow);
  const coinsAwarded = success ? getEncounterCoinReward(encounterType, flow.ascensionLevel) : 0;
  
  const result: EncounterResult = {
    type: encounterType,
    coinsAwarded,
    scoreGoal: getScaledScoreGoal(flow.currentTrial, flow.currentEncounter, flow.ascensionLevel),
    success,
  };

  const updatedFlow = { ...flow };
  updatedFlow.coins += coinsAwarded;
  updatedFlow.completedEncounters.push(`${flow.currentTrial}-${flow.currentEncounter}`);

  // Determine next events based on encounter type and position
  let nextEvents: EventType[] = [];

  if (encounterType === 'FEAR') {
    // After Fear: 1 Trade + 2 Wander in random order
    nextEvents = shuffleArray(['TRADE', 'WANDER', 'WANDER']);
  } else if (encounterType === 'DANGER') {
    // After Danger: Mandatory Fortune swap + 50% chance bonus Trade
    updatedFlow.fortuneSwapDue = true;
    if (Math.random() < 0.5) {
      updatedFlow.bonusTradeAvailable = true;
      nextEvents = ['TRADE'];
    }
  }

  // Advance to next encounter
  if (updatedFlow.currentEncounter < updatedFlow.encountersPerTrial) {
    updatedFlow.currentEncounter++;
  } else if (updatedFlow.currentTrial < updatedFlow.totalTrials) {
    // Move to next trial
    updatedFlow.currentTrial++;
    updatedFlow.currentEncounter = 1;
  } else {
    // Run complete - final Trade before Usurper
    nextEvents = ['TRADE'];
  }

  return { updatedFlow, result, nextEvents };
}

/**
 * Process a Fortune swap after a Danger encounter
 */
export function processFortuneSwap(flow: RunFlow): RunFlow {
  const updatedFlow = { ...flow };
  updatedFlow.fortuneSwapDue = false;
  return updatedFlow;
}

/**
 * Process a Trade event
 */
export function processTrade(flow: RunFlow, coinsSpent: number): RunFlow {
  const updatedFlow = { ...flow };
  updatedFlow.coins = Math.max(0, updatedFlow.coins - coinsSpent);
  updatedFlow.bonusTradeAvailable = false;
  return updatedFlow;
}

/**
 * Process a Wander event
 */
export function processWander(flow: RunFlow, coinReward: number): RunFlow {
  const updatedFlow = { ...flow };
  updatedFlow.coins += AscensionManager.getScaledCoinReward(coinReward, flow.ascensionLevel);
  return updatedFlow;
}

/**
 * Check if the run is complete
 */
export function isRunComplete(flow: RunFlow): boolean {
  return flow.currentTrial > flow.totalTrials;
}

/**
 * Check if a final Usurper encounter is due
 */
export function isUsurperDue(flow: RunFlow): boolean {
  return flow.currentTrial > flow.totalTrials;
}

/**
 * Get the total number of encounters in the run
 */
export function getTotalEncounters(flow: RunFlow): number {
  return flow.totalTrials * flow.encountersPerTrial;
}

/**
 * Get the current encounter number (1-indexed across the entire run)
 */
export function getCurrentEncounterNumber(flow: RunFlow): number {
  return (flow.currentTrial - 1) * flow.encountersPerTrial + flow.currentEncounter;
}

/**
 * Get scaled score goal based on ascension level
 */
export function getScaledScoreGoal(trial: number, encounter: number, ascensionLevel: number): number {
  const encounterNumber = (trial - 1) * 3 + encounter;
  
  // Base score goals for 15 encounters (5 trials × 3 encounters)
  const baseScoreGoals = [
    112, 149, 224, // Trial 1
    336, 392, 448, // Trial 2  
    672, 784, 896, // Trial 3
    1344, 1568, 1792, // Trial 4
    2688, 3136, 3584  // Trial 5
  ];

  const baseGoal = baseScoreGoals[encounterNumber - 1] || 500;
  return AscensionManager.getScaledScoreTarget(baseGoal, ascensionLevel);
}

/**
 * Utility function to shuffle an array
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}