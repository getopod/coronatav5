/**
 * Ascension System - Progressive difficulty scaling for Coronata
 */

export interface AscensionLevel {
  level: number;
  costMultiplier: number;
  difficultyModifier: number;
  description: string;
  unlocked: boolean;
}

export class AscensionManager {
  private static readonly MAX_ASCENSION = 9;
  private static readonly STORAGE_KEY = 'coronata_ascension_progress';

  /**
   * Get all ascension levels with current unlock status
   */
  static getAllLevels(): AscensionLevel[] {
    const unlockedLevels = this.getUnlockedLevels();
    
    return Array.from({ length: this.MAX_ASCENSION + 1 }, (_, i) => ({
      level: i,
      costMultiplier: 1.0 + (i * 0.1),
      difficultyModifier: 1.0 + (i * 0.05),
      description: i === 0 ? 'Base game' : `+${i * 10}% costs, +${i * 5}% difficulty`,
      unlocked: unlockedLevels.includes(i)
    }));
  }

  /**
   * Get currently unlocked ascension levels
   */
  static getUnlockedLevels(): number[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        // Default: only level 0 unlocked
        this.setUnlockedLevels([0]);
        return [0];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load ascension progress:', error);
      return [0];
    }
  }

  /**
   * Set unlocked ascension levels
   */
  static setUnlockedLevels(levels: number[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(levels));
    } catch (error) {
      console.error('Failed to save ascension progress:', error);
    }
  }

  /**
   * Unlock the next ascension level after completing a run
   */
  static unlockNextLevel(currentLevel: number): boolean {
    const nextLevel = currentLevel + 1;
    if (nextLevel > this.MAX_ASCENSION) {
      return false; // Already at max
    }

    const unlockedLevels = this.getUnlockedLevels();
    if (!unlockedLevels.includes(nextLevel)) {
      unlockedLevels.push(nextLevel);
      unlockedLevels.sort((a, b) => a - b);
      this.setUnlockedLevels(unlockedLevels);
      return true; // New level unlocked
    }
    return false; // Already unlocked
  }

  /**
   * Check if a specific ascension level is unlocked
   */
  static isLevelUnlocked(level: number): boolean {
    return this.getUnlockedLevels().includes(level);
  }

  /**
   * Get ascension-scaled coin rewards for encounters
   */
  static getScaledCoinReward(baseReward: number, ascensionLevel: number): number {
    const multiplier = 1 + (ascensionLevel * 0.1);
    return Math.round(baseReward * multiplier);
  }

  /**
   * Get ascension-scaled item costs
   */
  static getScaledCost(baseCost: number, ascensionLevel: number): number {
    const level = this.getAllLevels().find(l => l.level === ascensionLevel);
    if (!level) return baseCost;
    return Math.round(baseCost * level.costMultiplier);
  }

  /**
   * Get ascension-scaled score targets
   */
  static getScaledScoreTarget(baseTarget: number, ascensionLevel: number): number {
    const level = this.getAllLevels().find(l => l.level === ascensionLevel);
    if (!level) return baseTarget;
    return Math.round(baseTarget * level.difficultyModifier);
  }

  /**
   * Reset all ascension progress (for testing/debugging)
   */
  static resetProgress(): void {
    this.setUnlockedLevels([0]);
  }
}

// Default encounter rewards (increased for better balance)
export const ENCOUNTER_REWARDS = {
  FEAR: { min: 4, max: 6 }, // Increased from 3-5
  DANGER: { min: 7, max: 10 } // Increased from 5-8
} as const;

// Helper function to get random coin reward for encounter type
export function getEncounterCoinReward(
  encounterType: 'FEAR' | 'DANGER', 
  ascensionLevel: number
): number {
  const rewards = ENCOUNTER_REWARDS[encounterType];
  const baseReward = Math.floor(Math.random() * (rewards.max - rewards.min + 1)) + rewards.min;
  return AscensionManager.getScaledCoinReward(baseReward, ascensionLevel);
}