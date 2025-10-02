/**
 * Encounter System for Coronata
 * Handles run structure, encounter selection (Fear/Danger), and progression
 */

import { GameState, RunState, EncounterState } from './types';
import { registry } from '../registry/index';

export interface EncounterConfig {
  totalTrials: number;
  encountersPerTrial: number;
  baseScoreGoal: number;
  scoreGoalIncrease: number;
  fearWeight: number; // 0-1, how often fears vs dangers appear
}

export const defaultCoronataConfig: EncounterConfig = {
  totalTrials: 5, // Updated to 5 trials
  encountersPerTrial: 3, // Fear, Fear, Danger per trial
  baseScoreGoal: 500,
  scoreGoalIncrease: 200,
  fearWeight: 0.67, // 2 Fear + 1 Danger per trial = 66.7% Fear
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
 * Select a random Fear or Danger for the current encounter
 */
export function selectEncounter(
  runState: RunState, 
  config: EncounterConfig = defaultCoronataConfig,
  customSeed?: string
): EncounterState {
  const seed = customSeed || runState.seed || Date.now().toString();
  const seededRandom = createSeededRandom(seed + runState.currentTrial + runState.currentEncounter);
  
  // Determine encounter type based on master doc pattern: Fear, Fear, Danger per trial
  // Encounter 1,2: Fear, Encounter 3: Danger (within each trial)
  const encounterInTrial = runState.currentEncounter;
  const isDanger = encounterInTrial === 3; // 3rd encounter in each trial is always Danger
  const encounterType = isDanger ? 'danger' : 'fear';
  
  console.log(`Trial ${runState.currentTrial}, Encounter ${encounterInTrial}: ${encounterType.toUpperCase()}`);
  
  // Get available encounters of the chosen type
  const rawEncounters = encounterType === 'fear' ? registry.fear : registry.danger;
  const availableEncounters = rawEncounters?.filter(encounter => encounter && encounter.id && encounter.label) || [];
  
  console.log('Encounter type:', encounterType);
  console.log('Registry fear length:', registry.fear?.length);
  console.log('Registry danger length:', registry.danger?.length);
  console.log('Raw encounters length:', rawEncounters?.length);
  console.log('Available encounters length:', availableEncounters.length);
  console.log('First few encounters:', availableEncounters.slice(0, 3));
  console.log('First encounter structure:', availableEncounters[0]);
  
  if (!availableEncounters || availableEncounters.length === 0) {
    console.warn(`No ${encounterType} encounters available in registry, using fallback`);
    // Temporary fallback for testing
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
      effects: fallbackEntry.effects || [],
      scoreGoal,
      completed: false,
    };
  }
  
  // Select random encounter
  const randomValue = seededRandom();
  const index = Math.floor(randomValue * availableEncounters.length);
  console.log('Random value:', randomValue);
  console.log('Array length:', availableEncounters.length);
  console.log('Calculated index:', index);
  console.log('Index in bounds?', index >= 0 && index < availableEncounters.length);
  
  const selectedEntry = availableEncounters[index];
  console.log('Selected entry:', selectedEntry);
  
  // Double-check selectedEntry is valid
  if (!selectedEntry || !selectedEntry.id) {
    console.error('Selected entry is invalid:', selectedEntry);
    console.error('Available encounters:', availableEncounters);
    console.error('Index used:', index);
    console.error('Array length:', availableEncounters.length);
    
    // Use first available encounter as fallback
    if (availableEncounters.length > 0 && availableEncounters[0]) {
      console.warn('Using first encounter as fallback');
      const fallbackEntry = availableEncounters[0];
      const encounterNumber = (runState.currentTrial - 1) * config.encountersPerTrial + runState.currentEncounter;
      const scoreGoal = config.baseScoreGoal + (encounterNumber - 1) * config.scoreGoalIncrease;
      
      return {
        id: `${encounterType}-${runState.currentTrial}-${runState.currentEncounter}`,
        type: encounterType,
        registryId: fallbackEntry.id,
        name: fallbackEntry.label,
        description: fallbackEntry.description,
        effects: fallbackEntry.effects || [],
        scoreGoal,
        completed: false,
      };
    }
    
    throw new Error(`Failed to select valid ${encounterType} encounter`);
  }
  
  // Calculate score goal based on trial and encounter
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
export function progressEncounter(runState: RunState, config: EncounterConfig = defaultCoronataConfig): RunState {
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
    newRunState.encounter = selectEncounter(newRunState, config);
  } else {
    // Run completed
    newRunState.encounter = undefined;
  }
  
  return newRunState;
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
    return hash / 233280;
  };
}

/**
 * Update game state with a new run
 */
export function startNewRun(gameState: GameState, difficulty: number = 1): GameState {
  const newRunState = initializeRun(difficulty);
  const initialEncounter = selectEncounter(newRunState);
  
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