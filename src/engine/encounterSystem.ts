/**
 * Encounter System for Coronata
 * Handles run structure, encounter selection (Fear/Danger), and progression
 */

import { GameState, RunState, EncounterState } from './types';
import { RegistryEntry } from '../registry/index';

export interface EncounterConfig {
  totalTrials: number;
  encountersPerTrial: number;
  baseScoreGoal: number;
  scoreGoalIncrease: number;
  fearWeight: number; // 0-1, how often fears vs dangers appear
}

export const defaultCoronataConfig: EncounterConfig = {
  totalTrials: 5,
  encountersPerTrial: 3,
  baseScoreGoal: 112, // Fixed to working value
  scoreGoalIncrease: 0, // Will use calculateEncounterGoal function instead
  fearWeight: 0.67, // 2/3 fear, 1/3 danger per trial (F, F, D pattern)
};

/**
 * Initialize a new run for Coronata mode
 */
export function initializeRun(difficulty: number = 1, config: EncounterConfig = defaultCoronataConfig): RunState {
  return {
    currentTrial: 1,
    currentEncounter: 1,
    totalTrials: config.totalTrials,
    encountersPerTrial: config.encountersPerTrial,
    difficulty,
    seed: Date.now().toString(), // Simple seed for reproducibility
  };
}

/**
 * Create a fallback encounter when no registry entries are available
 */
function createFallbackEncounter(encounterType: 'fear' | 'danger', runState: RunState, config: EncounterConfig): EncounterState {
  const fallbackEntry = {
    id: `fallback-${encounterType}`,
    label: `Test ${encounterType.charAt(0).toUpperCase() + encounterType.slice(1)}`,
    description: `A temporary ${encounterType} encounter for testing`,
    type: encounterType,
    effects: []
  };

  const encounterNumber = (runState.currentTrial - 1) * config.encountersPerTrial + runState.currentEncounter;
  const scoreGoal = config.baseScoreGoal + (encounterNumber - 1) * config.scoreGoalIncrease;

  return {
    id: `${encounterType}-${runState.currentTrial}-${runState.currentEncounter}`,
    type: encounterType,
    registryId: fallbackEntry.id,
    name: fallbackEntry.label,
    description: fallbackEntry.description,
    effects: fallbackEntry.effects,
    scoreGoal,
    completed: false,
  };
}

/**
 * Select a random Fear or Danger for the current encounter
 */
export function selectEncounter(
  runState: RunState,
  config: EncounterConfig = defaultCoronataConfig,
  customSeed?: string,
  registryEntries?: RegistryEntry[]
): EncounterState {
  const seed = customSeed || runState.seed || Date.now().toString();
  const seededRandom = createSeededRandom(seed + runState.currentTrial + runState.currentEncounter);

  // Determine encounter type: Fear for encounters 1-(n-1), Danger for encounter n
  const encounterType: 'fear' | 'danger' = runState.currentEncounter === config.encountersPerTrial ? 'danger' : 'fear';

  console.log(`Trial ${runState.currentTrial}, Encounter ${runState.currentEncounter}: ${encounterType.toUpperCase()}`);

  // Get available encounters of the chosen type
  const availableEncounters = registryEntries?.filter(entry =>
    entry?.type === encounterType && entry?.id && entry?.label
  ) || [];

  // Use fallback if no encounters available
  if (availableEncounters.length === 0) {
    console.warn(`No ${encounterType} encounters available, using fallback`);
    return createFallbackEncounter(encounterType, runState, config);
  }

  // Select random encounter
  const randomIndex = Math.floor(seededRandom() * availableEncounters.length);
  const selectedEntry = availableEncounters[randomIndex];

  // Validate selection and fallback if needed
  if (!selectedEntry?.id) {
    console.error('Invalid encounter selected, using fallback');
    return createFallbackEncounter(encounterType, runState, config);
  }

  // Calculate score goal
  const encounterNumber = (runState.currentTrial - 1) * config.encountersPerTrial + runState.currentEncounter;
  const scoreGoal = config.baseScoreGoal + (encounterNumber - 1) * config.scoreGoalIncrease;

  return {
    id: `${encounterType}-${runState.currentTrial}-${runState.currentEncounter}`,
    type: encounterType,
    registryId: selectedEntry.id,
    name: selectedEntry.label,
    description: selectedEntry.description,
    effects: selectedEntry.effects || [],
    scoreGoal,
    completed: false,
  };
}

/**
 * Progress to the next encounter in the run
 */
export function progressEncounter(runState: RunState, config: EncounterConfig = defaultCoronataConfig, registryEntries?: RegistryEntry[]): RunState {
  const newRunState = { ...runState };

  // Move to next encounter
  newRunState.currentEncounter++;

  // Check if we need to move to next trial
  if (newRunState.currentEncounter > config.encountersPerTrial) {
    newRunState.currentTrial++;
    newRunState.currentEncounter = 1;
  }

  // Generate new encounter if still within run bounds
  if (newRunState.currentTrial <= config.totalTrials) {
    newRunState.encounter = selectEncounter(newRunState, config, undefined, registryEntries);
  } else {
    // Run completed
    newRunState.encounter = undefined;
  }

  return newRunState;
}

/**
 * Reset player state for a new encounter
 */
export function resetEncounterState(gameState: GameState): GameState {
  return {
    ...gameState,
    player: {
      ...gameState.player,
      score: 0, // Reset score for new encounter
      // Keep other player state like coins, exploits, etc.
    }
  };
}

/**
 * Check if the current encounter is completed
 */
export function checkEncounterCompletion(gameState: GameState): boolean {
  if (!gameState.run?.encounter) return false;
  
  const currentScore = gameState.player.score || 0;
  const scoreGoal = gameState.run.encounter.scoreGoal || 0;
  
  return currentScore >= scoreGoal;
}

/**
 * Check if the entire run is completed
 */
export function checkRunCompletion(runState: RunState): boolean {
  return runState.currentTrial > runState.totalTrials;
}

/**
 * Get run progress as a percentage
 */
export function getRunProgress(runState: RunState): number {
  const totalEncounters = runState.totalTrials * runState.encountersPerTrial;
  const completedEncounters = (runState.currentTrial - 1) * runState.encountersPerTrial + (runState.currentEncounter - 1);
  return Math.min(100, (completedEncounters / totalEncounters) * 100);
}

/**
 * Get encounter progress as a percentage
 */
export function getEncounterProgress(gameState: GameState): number {
  if (!gameState.run?.encounter) return 0;
  
  const currentScore = gameState.player.score || 0;
  const scoreGoal = gameState.run.encounter.scoreGoal || 1;
  
  return Math.min(100, (currentScore / scoreGoal) * 100);
}

/**
 * Simple seeded random number generator for consistent encounter selection
 */
function createSeededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return function() {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash) / 233280; // Ensure positive value
  };
}

/**
 * Update game state with a new run
 */
export function startNewRun(gameState: GameState, difficulty: number = 1, registryEntries?: RegistryEntry[]): GameState {
  const newRunState = initializeRun(difficulty);
  const initialEncounter = selectEncounter(newRunState, defaultCoronataConfig, undefined, registryEntries);
  
  return {
    ...gameState,
    run: {
      ...newRunState,
      encounter: initialEncounter,
    },
    player: {
      ...gameState.player,
      score: 0,
      exploits: [],
      curses: [],
      blessings: [],
      fortunes: [],
    }
  };
}