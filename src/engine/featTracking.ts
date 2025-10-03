/**
 * Feat Tracking System for Coronata
 * Monitors game events and automatically completes feats when conditions are met
 */

import { GameState } from './types';
import { feats } from '../registry/registry';
import type { RegistryEntry } from '../registry/index';

export interface FeatProgress {
  featId: string;
  progress: number;
  target: number;
  completed: boolean;
  completedAt?: Date;
}

export interface FeatTracker {
  completedFeats: string[];
  featProgress: Record<string, FeatProgress>;
  sessionStats: {
    encountersCompleted: number;
    coinsEarned: number;
    coinsSpent: number;
    cardsPlayed: number;
    exploitsAcquired: string[];
    blessingsUsed: string[];
    cursesRemoved: string[];
    wandersEncountered: string[];
    fearsDefeated: string[];
    dangersDefeated: string[];
    highScore: number;
    moveCount: number;
    perfectEncounters: number;
    foundationPlays: number;
    tableauPlays: number;
  };
}

export class FeatTrackingSystem {
  private tracker: FeatTracker;

  constructor(initialTracker?: FeatTracker) {
    this.tracker = initialTracker || this.createEmptyTracker();
  }

  private createEmptyTracker(): FeatTracker {
    return {
      completedFeats: [],
      featProgress: {},
      sessionStats: {
        encountersCompleted: 0,
        coinsEarned: 0,
        coinsSpent: 0,
        cardsPlayed: 0,
        exploitsAcquired: [],
        blessingsUsed: [],
        cursesRemoved: [],
        wandersEncountered: [],
        fearsDefeated: [],
        dangersDefeated: [],
        highScore: 0,
        moveCount: 0,
        perfectEncounters: 0,
        foundationPlays: 0,
        tableauPlays: 0,
      },
    };
  }

  /**
   * Check all feats against current game state and session stats
   */
  public checkFeats(gameState: GameState): RegistryEntry[] {
    const completedFeats: RegistryEntry[] = [];

    feats.forEach(feat => {
      if (this.tracker.completedFeats.includes(feat.id)) {
        return; // Already completed
      }

      if (this.checkFeatCondition(feat, gameState)) {
        this.completeFeat(feat);
        completedFeats.push(feat);
      }
    });

    return completedFeats;
  }

  /**
   * Check if a specific feat's condition is met
   */
  private checkFeatCondition(feat: RegistryEntry, gameState: GameState): boolean {
    return this.checkBasicFeats(feat, gameState) || 
           this.checkProgressFeats(feat, gameState) ||
           this.checkCollectionFeats(feat, gameState);
  }

  private checkBasicFeats(feat: RegistryEntry, gameState: GameState): boolean {
    const stats = this.tracker.sessionStats;
    
    switch (feat.id) {
      case 'feat-unflinching':
        return stats.encountersCompleted >= 5;
      case 'feat-gilded-hand':
        return stats.coinsEarned >= 100;
      case 'feat-moneylender':
        return stats.coinsEarned >= 300;
      case 'feat-midas':
        return (gameState.player?.coins || 0) >= 200;
      case 'feat-wayfarer':
        return stats.wandersEncountered.length >= 3;
      case 'feat-loremaster':
        return stats.wandersEncountered.length >= 5;
      default:
        return false;
    }
  }

  private checkProgressFeats(feat: RegistryEntry, gameState: GameState): boolean {
    const stats = this.tracker.sessionStats;
    
    switch (feat.id) {
      case 'feat-artisan':
        return stats.blessingsUsed.length >= 5;
      case 'feat-unburdened':
        return stats.cursesRemoved.length >= 3;
      case 'feat-grand-strategist':
        return (gameState.player?.exploits?.length || 0) >= 5;
      case 'feat-collector':
        return (gameState.player?.exploits?.length || 0) >= 20;
      case 'feat-demigod':
        return (gameState.player?.score || 0) >= 10000;
      case 'feat-perfectionist':
        return stats.perfectEncounters >= 5;
      default:
        return false;
    }
  }

  private checkCollectionFeats(feat: RegistryEntry, gameState: GameState): boolean {
    const stats = this.tracker.sessionStats;
    
    switch (feat.id) {
      case 'feat-enduring':
        return (gameState.player?.curses?.length || 0) >= 3;
      case 'feat-foundationer':
        return stats.foundationPlays >= 10;
      case 'feat-master-builder':
        return stats.tableauPlays >= 20;
      case 'feat-legend-builder':
        return stats.encountersCompleted >= 100;
      default:
        return false;
    }
  }

  /**
   * Complete a feat and add it to completed list
   */
  private completeFeat(feat: RegistryEntry): void {
    this.tracker.completedFeats.push(feat.id);
    console.log(`🏆 Feat completed: ${feat.label}`);
  }

  /**
   * Update session stats based on game events
   */
  public updateStats(eventType: string, eventData: any): void {
    switch (eventType) {
      case 'encounter_completed':
        this.handleEncounterEvent(eventData);
        break;
      case 'coin_earned':
        this.tracker.sessionStats.coinsEarned += eventData?.amount || 0;
        break;
      case 'coin_spent':
        this.tracker.sessionStats.coinsSpent += eventData?.amount || 0;
        break;
      case 'card_played':
        this.handleCardPlayEvent(eventData);
        break;
      default:
        this.handleMiscEvents(eventType, eventData);
        break;
    }
  }

  private handleEncounterEvent(eventData: any): void {
    this.tracker.sessionStats.encountersCompleted++;
    if (eventData?.perfect) {
      this.tracker.sessionStats.perfectEncounters++;
    }
  }

  private handleCardPlayEvent(eventData: any): void {
    this.tracker.sessionStats.cardsPlayed++;
    if (eventData?.destination === 'foundation') {
      this.tracker.sessionStats.foundationPlays++;
    } else if (eventData?.destination?.startsWith('tableau')) {
      this.tracker.sessionStats.tableauPlays++;
    }
  }

  private handleMiscEvents(eventType: string, eventData: any): void {
    const stats = this.tracker.sessionStats;
    
    switch (eventType) {
      case 'exploit_acquired':
        if (eventData?.exploitId && !stats.exploitsAcquired.includes(eventData.exploitId)) {
          stats.exploitsAcquired.push(eventData.exploitId);
        }
        break;
      case 'blessing_used':
        if (eventData?.blessingId && !stats.blessingsUsed.includes(eventData.blessingId)) {
          stats.blessingsUsed.push(eventData.blessingId);
        }
        break;
      case 'curse_removed':
        if (eventData?.curseId && !stats.cursesRemoved.includes(eventData.curseId)) {
          stats.cursesRemoved.push(eventData.curseId);
        }
        break;
      case 'wander_encountered':
        if (eventData?.wanderId && !stats.wandersEncountered.includes(eventData.wanderId)) {
          stats.wandersEncountered.push(eventData.wanderId);
        }
        break;
      case 'score_updated':
        if (eventData?.newScore > stats.highScore) {
          stats.highScore = eventData.newScore;
        }
        break;
      case 'move_made':
        stats.moveCount++;
        break;
    }
  }

  /**
   * Get current tracker state
   */
  public getTracker(): FeatTracker {
    return { ...this.tracker };
  }

  /**
   * Get completed feats count
   */
  public getCompletedCount(): number {
    return this.tracker.completedFeats.length;
  }

  /**
   * Check if a specific feat is completed
   */
  public isFeatCompleted(featId: string): boolean {
    return this.tracker.completedFeats.includes(featId);
  }

  /**
   * Reset session stats (but keep completed feats)
   */
  public resetSessionStats(): void {
    this.tracker.sessionStats = this.createEmptyTracker().sessionStats;
  }

  /**
   * Get available (uncompleted) feats
   */
  public getAvailableFeats(): RegistryEntry[] {
    return feats.filter(feat => !this.tracker.completedFeats.includes(feat.id));
  }

  /**
   * Get completed feats with details
   */
  public getCompletedFeats(): RegistryEntry[] {
    return feats.filter(feat => this.tracker.completedFeats.includes(feat.id));
  }
}

// Global feat tracker instance
let globalFeatTracker: FeatTrackingSystem | null = null;

export function getFeatTracker(): FeatTrackingSystem {
  if (!globalFeatTracker) {
    globalFeatTracker = new FeatTrackingSystem();
  }
  return globalFeatTracker;
}

export function initializeFeatTracker(savedTracker?: FeatTracker): void {
  globalFeatTracker = new FeatTrackingSystem(savedTracker);
}