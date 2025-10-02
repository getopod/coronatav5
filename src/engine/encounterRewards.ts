// Encounter Completion Rewards System
import { GameState } from './types';
import { builtInHandlers } from './effectEngine';

export interface EncounterReward {
  type: 'coin' | 'score' | 'item';
  amount?: number;
  itemId?: string;
}

export interface EncounterConfig {
  id: string;
  type: 'fear' | 'danger' | 'usurper';
  baseRewards: EncounterReward[];
  bonusConditions?: {
    condition: string;
    reward: EncounterReward;
  }[];
}

// Base encounter rewards per master doc
export const encounterRewards: Record<string, EncounterConfig> = {
  'fear-encounter': {
    id: 'fear-encounter',
    type: 'fear',
    baseRewards: [
      { type: 'coin', amount: 25 }, // Updated to new balance
      { type: 'score', amount: 50 }
    ]
  },
  'danger-encounter': {
    id: 'danger-encounter', 
    type: 'danger',
    baseRewards: [
      { type: 'coin', amount: 40 }, // Updated to new balance
      { type: 'score', amount: 100 }
    ]
  },
  'usurper-encounter': {
    id: 'usurper-encounter',
    type: 'usurper',
    baseRewards: [
      { type: 'coin', amount: 60 }, // Updated to new balance
      { type: 'score', amount: 200 }
    ]
  }
};

export function awardEncounterCompletion(
  encounterType: 'fear' | 'danger' | 'usurper',
  state: GameState,
  scoreAchieved?: number,
  targetScore?: number
): GameState {
  console.log('Awarding encounter completion rewards:', { encounterType, scoreAchieved, targetScore });
  
  const config = encounterRewards[`${encounterType}-encounter`];
  if (!config) {
    console.warn('No reward config found for encounter type:', encounterType);
    return state;
  }

  let newState = { ...state };
  
  // Apply base rewards
  for (const reward of config.baseRewards) {
    if (reward.type === 'coin') {
      const coinHandler = builtInHandlers.award_coin;
      newState = coinHandler({ type: 'award_coin', value: reward.amount }, newState);
      console.log(`Awarded ${reward.amount} coins for ${encounterType} completion`);
    } else if (reward.type === 'score') {
      const scoreHandler = builtInHandlers.award_score;
      newState = scoreHandler({ type: 'award_score', value: reward.amount }, newState);
      console.log(`Awarded ${reward.amount} score for ${encounterType} completion`);
    }
  }

  // Check bonus conditions
  if (config.bonusConditions && scoreAchieved && targetScore) {
    for (const bonus of config.bonusConditions) {
      let conditionMet = false;
      
      // Parse bonus conditions
      if (bonus.condition === 'exceed_target' && scoreAchieved > targetScore) {
        conditionMet = true;
      } else if (bonus.condition === 'perfect_score' && scoreAchieved >= targetScore * 1.5) {
        conditionMet = true;
      }
      
      if (conditionMet) {
        if (bonus.reward.type === 'coin') {
          const coinHandler = builtInHandlers.award_coin;
          newState = coinHandler({ type: 'award_coin', value: bonus.reward.amount }, newState);
          console.log(`Bonus: Awarded ${bonus.reward.amount} coins for ${bonus.condition}`);
        }
      }
    }
  }

  // Update encounter completion count
  if (!newState.run) {
    newState.run = { encountersCompleted: 0 };
  }
  newState.run.encountersCompleted = (newState.run.encountersCompleted || 0) + 1;
  
  console.log('Updated player state after rewards:', {
    coins: newState.player?.coins,
    score: newState.player?.score,
    encountersCompleted: newState.run?.encountersCompleted
  });

  return newState;
}

// Helper function to trigger encounter completion from game events
export function triggerEncounterCompletion(
  encounterType: 'fear' | 'danger' | 'usurper',
  gameState: GameState,
  engineController: any,
  scoreDetails?: { achieved: number; target: number }
): void {
  console.log('Triggering encounter completion:', encounterType);
  
  const updatedState = awardEncounterCompletion(
    encounterType,
    gameState,
    scoreDetails?.achieved,
    scoreDetails?.target
  );
  
  // Update engine state
  engineController.state = updatedState;
  
  // Emit event for UI updates
  engineController.emitEvent('encounterCompleted', {
    type: encounterType,
    rewards: encounterRewards[`${encounterType}-encounter`]?.baseRewards || [],
    newCoinTotal: updatedState.player?.coins || 0,
    newScore: updatedState.player?.score || 0
  });
  
  // Check if this should trigger choice screen (only after Fears)
  if (encounterType === 'fear') {
    setTimeout(() => {
      engineController.emitEvent('showChoiceScreen', { reason: 'fear-completed' });
    }, 1000); // Small delay to let completion animation finish
  }
}