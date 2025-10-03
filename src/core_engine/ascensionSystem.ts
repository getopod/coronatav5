/**
 * Ascension System for Coronata
 * Implements 9-level progressive difficulty system with scaling costs and challenges
 */

import { GameState } from './types';

export interface AscensionLevel {
  level: number;
  name: string;
  description: string;
  costMultiplier: number; // Item costs multiplied by this
  scoreMultiplier: number; // Score goals multiplied by this
  challenges: AscensionChallenge[];
  unlocked: boolean;
}

export interface AscensionChallenge {
  id: string;
  name: string;
  description: string;
  effectType: 'restriction' | 'penalty' | 'modifier';
  effectValue: any;
}

export interface AscensionState {
  currentLevel: number;
  unlockedLevels: number[];
  totalAscensions: number;
  highestScore: number;
  levelProgress: Record<number, AscensionProgress>;
}

export interface AscensionProgress {
  level: number;
  attempts: number;
  victories: number;
  bestScore: number;
  timeToComplete?: number;
}

// 9-Level Ascension System with balanced progression
export const ascensionLevels: AscensionLevel[] = [
  {
    level: 0,
    name: "Mortal Realm",
    description: "The base difficulty. No modifiers applied.",
    costMultiplier: 1.0,
    scoreMultiplier: 1.0,
    challenges: [],
    unlocked: true
  },
  {
    level: 1,
    name: "First Ascension",
    description: "Items cost 25% more. A modest challenge for experienced players.",
    costMultiplier: 1.25,
    scoreMultiplier: 1.0,
    challenges: [
      {
        id: "increased_costs_1",
        name: "Inflation",
        description: "All shop items cost 25% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 1.25 }
      }
    ],
    unlocked: false
  },
  {
    level: 2,
    name: "Second Ascension", 
    description: "Items cost 50% more. Score goals increased by 10%.",
    costMultiplier: 1.5,
    scoreMultiplier: 1.1,
    challenges: [
      {
        id: "increased_costs_2",
        name: "Market Inflation",
        description: "All shop items cost 50% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 1.5 }
      },
      {
        id: "higher_goals_1",
        name: "Rising Expectations",
        description: "Score goals increased by 10%",
        effectType: "modifier",
        effectValue: { type: "score_multiplier", value: 1.1 }
      }
    ],
    unlocked: false
  },
  {
    level: 3,
    name: "Third Ascension",
    description: "Items cost 75% more. Score goals increased by 20%. Start with -1 hand size.",
    costMultiplier: 1.75,
    scoreMultiplier: 1.2,
    challenges: [
      {
        id: "increased_costs_3",
        name: "Economic Crisis",
        description: "All shop items cost 75% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 1.75 }
      },
      {
        id: "higher_goals_2",
        name: "Demanding Standards",
        description: "Score goals increased by 20%",
        effectType: "modifier",
        effectValue: { type: "score_multiplier", value: 1.2 }
      },
      {
        id: "reduced_hand",
        name: "Weakened Grasp",
        description: "Start with -1 hand size",
        effectType: "restriction",
        effectValue: { type: "hand_size", value: -1 }
      }
    ],
    unlocked: false
  },
  {
    level: 4,
    name: "Fourth Ascension",
    description: "Items cost 100% more. Score goals increased by 30%. Start with -1 hand size and -1 shuffle.",
    costMultiplier: 2.0,
    scoreMultiplier: 1.3,
    challenges: [
      {
        id: "increased_costs_4",
        name: "Hyperinflation",
        description: "All shop items cost 100% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 2.0 }
      },
      {
        id: "higher_goals_3",
        name: "Perfectionist Standards",
        description: "Score goals increased by 30%",
        effectType: "modifier",
        effectValue: { type: "score_multiplier", value: 1.3 }
      },
      {
        id: "reduced_hand_4",
        name: "Diminished Capacity",
        description: "Start with -1 hand size",
        effectType: "restriction",
        effectValue: { type: "hand_size", value: -1 }
      },
      {
        id: "reduced_shuffles",
        name: "Limited Preparation",
        description: "Start with -1 shuffle per encounter",
        effectType: "restriction",
        effectValue: { type: "shuffles", value: -1 }
      }
    ],
    unlocked: false
  },
  {
    level: 5,
    name: "Fifth Ascension",
    description: "Items cost 125% more. Score goals increased by 40%. Reduced hand size and shuffles. Start with a random Curse.",
    costMultiplier: 2.25,
    scoreMultiplier: 1.4,
    challenges: [
      {
        id: "increased_costs_5",
        name: "Monetary Collapse",
        description: "All shop items cost 125% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 2.25 }
      },
      {
        id: "higher_goals_4",
        name: "Inhuman Expectations",
        description: "Score goals increased by 40%",
        effectType: "modifier",
        effectValue: { type: "score_multiplier", value: 1.4 }
      },
      {
        id: "reduced_hand_5",
        name: "Crippled Grasp",
        description: "Start with -1 hand size",
        effectType: "restriction",
        effectValue: { type: "hand_size", value: -1 }
      },
      {
        id: "reduced_shuffles_5",
        name: "Chaotic Preparation",
        description: "Start with -1 shuffle per encounter",
        effectType: "restriction",
        effectValue: { type: "shuffles", value: -1 }
      },
      {
        id: "starting_curse",
        name: "Cursed Beginning",
        description: "Start each run with a random Curse active",
        effectType: "penalty",
        effectValue: { type: "starting_curse", value: "random" }
      }
    ],
    unlocked: false
  },
  {
    level: 6,
    name: "Sixth Ascension",
    description: "Items cost 150% more. Score goals increased by 50%. All previous penalties plus reduced starting coins.",
    costMultiplier: 2.5,
    scoreMultiplier: 1.5,
    challenges: [
      {
        id: "increased_costs_6",
        name: "Resource Scarcity",
        description: "All shop items cost 150% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 2.5 }
      },
      {
        id: "higher_goals_5",
        name: "Impossible Standards",
        description: "Score goals increased by 50%",
        effectType: "modifier",
        effectValue: { type: "score_multiplier", value: 1.5 }
      },
      {
        id: "reduced_hand_6",
        name: "Broken Grasp",
        description: "Start with -1 hand size",
        effectType: "restriction",
        effectValue: { type: "hand_size", value: -1 }
      },
      {
        id: "reduced_shuffles_6",
        name: "Disrupted Preparation",
        description: "Start with -1 shuffle per encounter",
        effectType: "restriction",
        effectValue: { type: "shuffles", value: -1 }
      },
      {
        id: "starting_curse_6",
        name: "Persistent Curse",
        description: "Start each run with a random Curse active",
        effectType: "penalty",
        effectValue: { type: "starting_curse", value: "random" }
      },
      {
        id: "reduced_coins",
        name: "Poverty",
        description: "Start with -10 coins",
        effectType: "restriction",
        effectValue: { type: "starting_coins", value: -10 }
      }
    ],
    unlocked: false
  },
  {
    level: 7,
    name: "Seventh Ascension",
    description: "Items cost 175% more. Score goals increased by 60%. All previous penalties plus double Curse.",
    costMultiplier: 2.75,
    scoreMultiplier: 1.6,
    challenges: [
      {
        id: "increased_costs_7",
        name: "Economic Ruin",
        description: "All shop items cost 175% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 2.75 }
      },
      {
        id: "higher_goals_6",
        name: "Divine Standards",
        description: "Score goals increased by 60%",
        effectType: "modifier",
        effectValue: { type: "score_multiplier", value: 1.6 }
      },
      {
        id: "reduced_hand_7",
        name: "Shattered Grasp",
        description: "Start with -1 hand size",
        effectType: "restriction",
        effectValue: { type: "hand_size", value: -1 }
      },
      {
        id: "reduced_shuffles_7",
        name: "Chaotic Realm",
        description: "Start with -1 shuffle per encounter",
        effectType: "restriction",
        effectValue: { type: "shuffles", value: -1 }
      },
      {
        id: "double_curse",
        name: "Twin Curses",
        description: "Start each run with 2 random Curses active",
        effectType: "penalty",
        effectValue: { type: "starting_curse", value: "double" }
      },
      {
        id: "reduced_coins_7",
        name: "Destitution",
        description: "Start with -10 coins",
        effectType: "restriction",
        effectValue: { type: "starting_coins", value: -10 }
      }
    ],
    unlocked: false
  },
  {
    level: 8,
    name: "Eighth Ascension",
    description: "Items cost 200% more. Score goals increased by 75%. All previous penalties plus reduced encounter rewards.",
    costMultiplier: 3.0,
    scoreMultiplier: 1.75,
    challenges: [
      {
        id: "increased_costs_8",
        name: "Total Collapse",
        description: "All shop items cost 200% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 3.0 }
      },
      {
        id: "higher_goals_7",
        name: "Transcendent Standards",
        description: "Score goals increased by 75%",
        effectType: "modifier",
        effectValue: { type: "score_multiplier", value: 1.75 }
      },
      {
        id: "reduced_hand_8",
        name: "Phantom Grasp",
        description: "Start with -1 hand size",
        effectType: "restriction",
        effectValue: { type: "hand_size", value: -1 }
      },
      {
        id: "reduced_shuffles_8",
        name: "Entropy",
        description: "Start with -1 shuffle per encounter",
        effectType: "restriction",
        effectValue: { type: "shuffles", value: -1 }
      },
      {
        id: "double_curse_8",
        name: "Cursed Existence",
        description: "Start each run with 2 random Curses active",
        effectType: "penalty",
        effectValue: { type: "starting_curse", value: "double" }
      },
      {
        id: "reduced_coins_8",
        name: "Absolute Poverty",
        description: "Start with -10 coins",
        effectType: "restriction",
        effectValue: { type: "starting_coins", value: -10 }
      },
      {
        id: "reduced_rewards",
        name: "Diminished Returns",
        description: "Encounter completion rewards reduced by 25%",
        effectType: "modifier",
        effectValue: { type: "reward_multiplier", value: 0.75 }
      }
    ],
    unlocked: false
  },
  {
    level: 9,
    name: "Ninth Ascension",
    description: "Items cost 250% more. Score goals increased by 90%. All previous penalties. The ultimate challenge.",
    costMultiplier: 3.5,
    scoreMultiplier: 1.9,
    challenges: [
      {
        id: "increased_costs_9",
        name: "Impossible Economics",
        description: "All shop items cost 250% more coins",
        effectType: "modifier",
        effectValue: { type: "cost_multiplier", value: 3.5 }
      },
      {
        id: "higher_goals_8",
        name: "Beyond Perfection",
        description: "Score goals increased by 90%",
        effectType: "modifier",
        effectValue: { type: "score_multiplier", value: 1.9 }
      },
      {
        id: "reduced_hand_9",
        name: "Void Grasp",
        description: "Start with -1 hand size",
        effectType: "restriction",
        effectValue: { type: "hand_size", value: -1 }
      },
      {
        id: "reduced_shuffles_9",
        name: "Cosmic Chaos",
        description: "Start with -1 shuffle per encounter",
        effectType: "restriction",
        effectValue: { type: "shuffles", value: -1 }
      },
      {
        id: "triple_curse",
        name: "Trinity of Curses",
        description: "Start each run with 3 random Curses active",
        effectType: "penalty",
        effectValue: { type: "starting_curse", value: "triple" }
      },
      {
        id: "reduced_coins_9",
        name: "Cosmic Destitution",
        description: "Start with -15 coins",
        effectType: "restriction",
        effectValue: { type: "starting_coins", value: -15 }
      },
      {
        id: "reduced_rewards_9",
        name: "Vanishing Returns",
        description: "Encounter completion rewards reduced by 50%",
        effectType: "modifier",
        effectValue: { type: "reward_multiplier", value: 0.5 }
      },
      {
        id: "reduced_deck_draw",
        name: "Ethereal Cards",
        description: "Draw -1 card per turn from deck",
        effectType: "restriction",
        effectValue: { type: "draw_reduction", value: 1 }
      }
    ],
    unlocked: false
  }
];

/**
 * Initialize ascension state for a new player
 */
export function initializeAscensionState(): AscensionState {
  return {
    currentLevel: 0,
    unlockedLevels: [0], // Only Mortal Realm unlocked initially
    totalAscensions: 0,
    highestScore: 0,
    levelProgress: {
      0: {
        level: 0,
        attempts: 0,
        victories: 0,
        bestScore: 0
      }
    }
  };
}

/**
 * Apply ascension level modifiers to game state
 */
export function applyAscensionModifiers(state: GameState, ascensionLevel: number): GameState {
  if (ascensionLevel < 0 || ascensionLevel >= ascensionLevels.length) {
    console.warn('Invalid ascension level:', ascensionLevel);
    return state;
  }

  const level = ascensionLevels[ascensionLevel];
  if (!level) return state;

  console.log(`Applying Ascension Level ${ascensionLevel}: ${level.name}`);

  // Apply all challenges for this level
  for (const challenge of level.challenges) {
    state = applyChallengeEffect(state, challenge);
  }

  // Store level info in state for reference
  if (!state.ascension) {
    state.ascension = {
      currentLevel: ascensionLevel,
      levelInfo: level,
      appliedChallenges: level.challenges.map(c => c.id)
    };
  }

  return state;
}

/**
 * Apply individual challenge effect to game state
 */
export function applyChallengeEffect(state: GameState, challenge: AscensionChallenge): GameState {
  console.log(`Applying challenge: ${challenge.name}`);
  
  switch (challenge.effectValue?.type) {
    case 'cost_multiplier':
      // Store for use in shop systems
      if (!state.modifiers) state.modifiers = {};
      state.modifiers.costMultiplier = challenge.effectValue.value;
      break;
      
    case 'score_multiplier':
      // Store for use in scoring systems
      if (!state.modifiers) state.modifiers = {};
      state.modifiers.scoreMultiplier = challenge.effectValue.value;
      break;
      
    case 'hand_size':
      // Reduce starting hand size
      if (!state.settings) state.settings = {};
      state.settings.handSize = (state.settings.handSize || 5) + challenge.effectValue.value;
      console.log(`Hand size modified to: ${state.settings.handSize}`);
      break;
      
    case 'shuffles':
      // Reduce available shuffles
      if (!state.settings) state.settings = {};
      state.settings.shufflesPerEncounter = Math.max(0, (state.settings.shufflesPerEncounter || 3) + challenge.effectValue.value);
      console.log(`Shuffles per encounter: ${state.settings.shufflesPerEncounter}`);
      break;
      
    case 'starting_coins':
      // Modify starting coins
      const coinReduction = Math.abs(challenge.effectValue.value);
      state.player.coins = Math.max(0, (state.player.coins || 50) - coinReduction);
      console.log(`Starting coins reduced to: ${state.player.coins}`);
      break;
      
    case 'starting_curse':
      // Add starting curses (implement when curse system is ready)
      if (!state.player.curses) state.player.curses = [];
      // TODO: Implement curse selection when curse system is implemented
      console.log(`Starting curses: ${challenge.effectValue.value}`);
      break;
      
    case 'reward_multiplier':
      // Store for use in reward systems
      if (!state.modifiers) state.modifiers = {};
      state.modifiers.rewardMultiplier = challenge.effectValue.value;
      break;
      
    case 'draw_reduction':
      // Reduce cards drawn per turn
      if (!state.settings) state.settings = {};
      state.settings.drawReduction = challenge.effectValue.value;
      break;
      
    default:
      console.warn('Unknown challenge effect type:', challenge.effectValue?.type);
  }
  
  return state;
}

/**
 * Calculate modified score goal based on ascension level
 */
export function calculateAscensionScoreGoal(baseGoal: number, ascensionLevel: number): number {
  if (ascensionLevel < 0 || ascensionLevel >= ascensionLevels.length) {
    return baseGoal;
  }
  
  const level = ascensionLevels[ascensionLevel];
  return Math.floor(baseGoal * level.scoreMultiplier);
}

/**
 * Calculate modified item cost based on ascension level
 */
export function calculateAscensionCost(baseCost: number, ascensionLevel: number): number {
  if (ascensionLevel < 0 || ascensionLevel >= ascensionLevels.length) {
    return baseCost;
  }
  
  const level = ascensionLevels[ascensionLevel];
  return Math.floor(baseCost * level.costMultiplier);
}

/**
 * Check if player can unlock next ascension level
 */
export function canUnlockNextLevel(ascensionState: AscensionState): boolean {
  const nextLevel = ascensionState.currentLevel + 1;
  
  if (nextLevel >= ascensionLevels.length) return false;
  if (ascensionState.unlockedLevels.includes(nextLevel)) return false;
  
  // Must complete current level to unlock next
  const currentProgress = ascensionState.levelProgress[ascensionState.currentLevel];
  return currentProgress && currentProgress.victories > 0;
}

/**
 * Unlock next ascension level
 */
export function unlockNextLevel(ascensionState: AscensionState): AscensionState {
  const nextLevel = ascensionState.currentLevel + 1;
  
  if (canUnlockNextLevel(ascensionState)) {
    ascensionState.unlockedLevels.push(nextLevel);
    ascensionState.levelProgress[nextLevel] = {
      level: nextLevel,
      attempts: 0,
      victories: 0,
      bestScore: 0
    };
    console.log(`Unlocked Ascension Level ${nextLevel}: ${ascensionLevels[nextLevel]?.name}`);
  }
  
  return ascensionState;
}

/**
 * Record completion of ascension level
 */
export function recordAscensionCompletion(
  ascensionState: AscensionState, 
  level: number, 
  score: number,
  victory: boolean
): AscensionState {
  if (!ascensionState.levelProgress[level]) {
    ascensionState.levelProgress[level] = {
      level,
      attempts: 0,
      victories: 0,
      bestScore: 0
    };
  }
  
  const progress = ascensionState.levelProgress[level];
  progress.attempts++;
  
  if (victory) {
    progress.victories++;
    ascensionState.totalAscensions++;
  }
  
  if (score > progress.bestScore) {
    progress.bestScore = score;
  }
  
  if (score > ascensionState.highestScore) {
    ascensionState.highestScore = score;
  }
  
  // Try to unlock next level if this was a victory
  if (victory) {
    ascensionState = unlockNextLevel(ascensionState);
  }
  
  return ascensionState;
}

/**
 * Get ascension level by number
 */
export function getAscensionLevel(level: number): AscensionLevel | null {
  return ascensionLevels[level] || null;
}

/**
 * Get all unlocked ascension levels
 */
export function getUnlockedLevels(ascensionState: AscensionState): AscensionLevel[] {
  return ascensionState.unlockedLevels
    .map(level => ascensionLevels[level])
    .filter(level => level != null);
}

/**
 * Format ascension level for display
 */
export function formatAscensionLevel(level: AscensionLevel): string {
  const challenges = level.challenges.length;
  const costIncrease = Math.round((level.costMultiplier - 1) * 100);
  const scoreIncrease = Math.round((level.scoreMultiplier - 1) * 100);
  
  let description = level.description;
  if (costIncrease > 0) {
    description += ` (+${costIncrease}% costs)`;
  }
  if (scoreIncrease > 0) {
    description += ` (+${scoreIncrease}% goals)`;
  }
  if (challenges > 0) {
    description += ` (${challenges} challenges)`;
  }
  
  return description;
}
