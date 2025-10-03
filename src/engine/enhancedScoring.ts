// Enhanced scoring system with encounter goal integration
import { GameState, Move } from './types';
import { initializeRun, selectEncounter, defaultCoronataConfig } from './encounterSystem';
import { EncounterFlowManager } from './encounterFlow';

// Import from relative paths since we're consolidating into /engine/
export interface EnhancedScoringSystem {
  calculateMoveScore(move: Move, state: GameState): number;
  calculateTotalScore(state: GameState): number;
  checkEncounterGoals(state: GameState): boolean;
  updateEncounterProgress(state: GameState): GameState;
  getEncounterProgress(state: GameState): number;
  awardBonus(state: GameState, bonusType: string, amount: number): GameState;
  scoreSequence(state: GameState, sequenceLength: number): number;
  applyPenalty(state: GameState, penaltyType: string, amount: number): GameState;
}

export class CoronataScoringSystem implements EnhancedScoringSystem {
  private variant: string;

  constructor(variant: string = 'coronata') {
    this.variant = variant;
  }

  calculateMoveScore(move: Move, state: GameState): number {
    // Step 1: Calculate base score (card face value)
    let baseScore = this.getCardValue(move.from, state, move.cardId);
    
    // Step 2: Apply foundation multiplier (default 2x for foundation moves)
    console.log('Move destination:', move.to, 'includes foundation?', move.to?.includes('foundation'));
    if (move.to && move.to.includes('foundation')) {
      baseScore *= 2; // Foundation multiplier from master doc
      console.log('Applied foundation multiplier: base score', baseScore / 2, '→', baseScore);
    }
    
    // Step 3: Apply registry effects if engine controller is available
    let finalScore = baseScore;
    if (state.registry?.engineController) {
      const engineController = state.registry.engineController;
      const card = this.findCard(state, move.cardId);
      const toPile = state.piles[move.to];
      
      if (card && toPile) {
        const moveData = { card, toPile, move };
        const effects = engineController.getActiveEffects(state, 'move', moveData);
        
        console.log('Applying', effects.length, 'move effects for card', card.value, 'to', toPile.type);
        
        // Apply score-related effects
        for (const effect of effects) {
          if (effect.type === 'award_score') {
            console.log(`Registry effect: +${effect.value} points from ${effect.meta?.sourceLabel}`);
            finalScore += effect.value || 0;
          } else if (effect.type === 'score_multiplier') {
            console.log(`Registry effect: ${effect.value}x multiplier from ${effect.meta?.sourceLabel}`);
            finalScore *= effect.value || 1;
          }
        }
      }
    }
    
    return Math.max(0, Math.floor(finalScore));
  }
  
  // Helper to find card by ID across all piles
  private findCard(state: GameState, cardId?: string): any {
    if (!cardId) return null;
    for (const pile of Object.values(state.piles)) {
      if (Array.isArray(pile.cards)) {
        const card = pile.cards.find((c: any) => c.id === cardId);
        if (card) return card;
      }
    }
    return null;
  }

  // Helper method to get card face value
  private getCardValue(from: string, state: GameState, cardId?: string): number {
    // Try to find the actual card being moved
    if (cardId) {
      // Look through all piles to find the card
      for (const pile of Object.values(state.piles)) {
        if (Array.isArray(pile.cards)) {
          const card = pile.cards.find((c: any) => c.id === cardId);
          if (card && typeof card.value === 'number') {
            console.log(`Found card ${cardId} with value ${card.value}`);
            return card.value; // Card values are 1-13
          }
        }
      }
    }
    
    console.log(`Card ${cardId} not found, using pile-based estimation for pile ${from}`);
    // Fallback to pile-based estimation if card not found
    if (from?.includes('deck') || from?.includes('waste')) {
      return 1; // Ace or low card
    }
    if (from?.includes('tableau')) {
      return 7; // Average tableau card value
    }
    return 5; // Default card value
  }

  calculateTotalScore(state: GameState): number {
    // For now, just use player accumulated score
    // TODO: Integrate with core scoring system if needed
    return state.player.score || 0;
  }

  // Handle player choice after encounter completion - DEPRECATED
  // This method is replaced by the new EncounterFlowManager system
  progressAfterChoice(state: GameState, choice: 'trade' | 'wander' | 'fortune-swap'): GameState {
    console.warn('progressAfterChoice is deprecated. Use EncounterFlowManager instead.');
    
    // Fallback behavior for compatibility
    if (!state.run?.awaitingPlayerChoice) {
      console.warn('No player choice awaiting');
      return state;
    }

    console.log('Player chose (legacy):', choice);
    
    // Clear choice state
    state.run.awaitingPlayerChoice = false;
    state.run.availableChoices = undefined;
    
    // Progress to next encounter using legacy logic
    const { progressEncounter } = require('./encounterSystem');
    const newRunState = progressEncounter(state.run);
    state.run = newRunState;
    
    console.log('Progressed to new encounter (legacy):', state.run?.encounter);
    return state;
  }

  checkEncounterGoals(state: GameState): boolean {
    if (!state.run?.encounter) return false;
    
    const currentScore = this.calculateTotalScore(state);
    const encounterNumber = typeof state.run.encounter.id === 'string' ? 
      parseInt(state.run.encounter.id) || 1 : 
      state.run.encounter.id || 1;
    const goalScore = this.calculateEncounterGoal(encounterNumber);
    
    return currentScore >= goalScore;
  }

  // Calculate encounter goal based on master doc formula and table
  calculateEncounterGoal(encounterNumber: number): number {
    // Score Goal Table from working system (matches previous implementation)
    const scoreGoalTable: { [key: number]: number } = {
      1: 112,    // Fear (previous working value)
      2: 149,    // Fear (previous working value)
      3: 224,    // Danger (previous working value)
      4: 234,    // Fear
      5: 293,    // Fear
      6: 439,    // Danger (366 * 1.2)
      7: 458,    // Fear
      8: 572,    // Fear
      9: 858,    // Danger (715 * 1.2)
      10: 894,   // Fear
      11: 1118,  // Fear
      12: 1676,  // Danger (1397 * 1.2)
      13: 1746,  // Fear
      14: 2183,  // Fear
      15: 4092   // Usurper (2728 * 1.5)
    };

    // Return goal for encounter, default to first encounter if not in table
    return scoreGoalTable[encounterNumber] || scoreGoalTable[1];
  }

  updateEncounterProgress(state: GameState): GameState {
    if (!state.run) return state;

    // Update total score
    const totalScore = this.calculateTotalScore(state);
    state.player.score = totalScore;

    // Update encounter goal using master doc formula
    if (state.run.encounter) {
      const encounterNumber = typeof state.run.encounter.id === 'string' ? 
        parseInt(state.run.encounter.id) || 1 : 
        state.run.encounter.id || 1;
      state.run.encounter.scoreGoal = this.calculateEncounterGoal(encounterNumber);
    }

    // Check encounter completion using proper goal
    const encounterComplete = this.checkEncounterGoals(state);
    
    if (encounterComplete && !state.run.encounter?.completed) {
      // Mark encounter as completed
      if (state.run.encounter) {
        state.run.encounter.completed = true;
        
        // NEW: Use EncounterFlowManager for proper post-encounter flow
        const encounterType = state.run.encounter.type || 'fear';
        
        // Initialize encounter flow manager
        const flowManager = new EncounterFlowManager(state);
        
        // Set up post-encounter activities based on Master Doc
        const flowState = flowManager.onEncounterComplete(encounterType);
        
        // Store flow state in run for UI to access
        state.run.encounterFlow = {
          active: true,
          phase: flowState.phase,
          currentActivity: flowState.currentActivity,
          queuedActivities: flowState.queuedActivities,
          completedActivities: flowState.completedActivities
        };
        
        console.log(`Encounter completed! Starting ${encounterType} flow:`, state.run.encounterFlow);
        
        // DEPRECATED: Remove old choice system
        // state.run.awaitingPlayerChoice = true;
        // state.run.availableChoices = [...];
      }
    }

    return state;
  }

  // Calculate progress percentage for current encounter
  getEncounterProgress(state: GameState): number {
    if (!state.run?.encounter) return 0;
    
    const currentScore = this.calculateTotalScore(state);
    const goalScore = state.run.encounter.scoreGoal || this.calculateEncounterGoal(1);
    
    return Math.min(100, (currentScore / goalScore) * 100);
  }

  // Award bonus points for special achievements
  awardBonus(state: GameState, bonusType: string, amount: number): GameState {
    let bonus = amount;

    // Apply blessing multipliers
    if (state.player.blessings) {
      state.player.blessings.forEach(blessingId => {
        switch (blessingId) {
          case 'golden_touch':
            bonus *= 1.5;
            break;
          case 'luck_blessing': {
            // Use cryptographically secure random for security compliance
            const crypto = require('crypto');
            bonus += Math.floor(crypto.randomInt(0, 10));
            break;
          }
        }
      });
    }

    state.player.score = (state.player.score || 0) + Math.floor(bonus);
    return state;
  }

  // Special scoring for completing card sequences
  scoreSequence(state: GameState, sequenceLength: number): number {
    let score = sequenceLength * 5; // Base 5 points per card in sequence

    // Exponential bonus for longer sequences
    if (sequenceLength >= 5) {
      score += Math.pow(sequenceLength - 4, 2) * 10;
    }

    return score;
  }

  /**
   * Reset game board for a new encounter while preserving player inventory
   * This should be called when starting each new encounter in a run
   */
  resetForNewEncounter(state: GameState, newEncounterNumber: number): GameState {
    console.log(`Resetting for encounter ${newEncounterNumber}...`);
    
    // Preserve player inventory (coins, exploits, curses, blessings, fortunes)
    const preservedInventory = {
      coins: state.player.coins,
      exploits: [...(state.player.exploits || [])],
      curses: [...(state.player.curses || [])],
      blessings: [...(state.player.blessings || [])],
      fortunes: [...(state.player.fortunes || [])],
      shuffles: 3, // Reset shuffles for new encounter
      discards: 2 // Reset discards for new encounter
    };

    // Reset game board state
    state.player.score = 0; // Fresh score for new encounter
    
    // Reset all piles to fresh state
    if (state.piles) {
      // Collect all cards from all piles
      const allCards: any[] = [];
      Object.values(state.piles).forEach(pile => {
        if (pile.cards) {
          allCards.push(...pile.cards);
        }
      });

      // Reset all cards to default state (face down, no special effects)
      allCards.forEach(card => {
        card.faceUp = false;
        card.blessed = false;
        card.tempEffects = [];
      });

      // Shuffle all cards back into deck
      this.shuffleArray(allCards);

      // Reset pile structures
      state.piles.deck.cards = allCards;
      state.piles.waste.cards = [];
      state.piles.hand.cards = [];
      
      // Reset foundations
      for (let i = 1; i <= 4; i++) {
        if (state.piles[`foundation-${i}`]) {
          state.piles[`foundation-${i}`].cards = [];
        }
      }
      
      // Reset tableau
      for (let i = 1; i <= 7; i++) {
        if (state.piles[`tableau-${i}`]) {
          state.piles[`tableau-${i}`].cards = [];
        }
      }
    }

    // Restore preserved inventory
    Object.assign(state.player, preservedInventory);

    // Deal fresh hand
    const handSize = state.player.maxHandSize || 5;
    if (state.piles?.deck?.cards && state.piles?.hand?.cards) {
      for (let i = 0; i < handSize && state.piles.deck.cards.length > 0; i++) {
        const card = state.piles.deck.cards.pop();
        if (card) {
          card.faceUp = true; // Hand cards should be face up
          state.piles.hand.cards.push(card);
        }
      }
    }

    // Set new encounter goal
    const newGoal = this.calculateEncounterGoal(newEncounterNumber);
    if (state.run?.encounter) {
      state.run.encounter.scoreGoal = newGoal;
      state.run.encounter.completed = false;
    }

    console.log(`Encounter reset complete:`, {
      newScore: state.player.score,
      newGoal,
      preservedCoins: state.player.coins,
      preservedExploits: state.player.exploits?.length || 0,
      preservedCurses: state.player.curses?.length || 0,
      handSize: state.piles?.hand?.cards?.length || 0,
      deckSize: state.piles?.deck?.cards?.length || 0
    });

    return state;
  }

  // Helper method for array shuffling (Fisher-Yates with crypto-secure random)
  private shuffleArray(array: any[]): void {
    const crypto = require('crypto');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor((crypto.randomBytes(4).readUInt32BE(0) / 0x100000000) * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Penalty system for negative actions
  applyPenalty(state: GameState, _penaltyType: string, amount: number): GameState {
    let penalty = amount;

    // Fortune can reduce penalties
    if (state.player.fortunes && state.player.fortunes.length > 0) {
      penalty *= 0.7; // 30% reduction
    }

    state.player.score = Math.max(0, (state.player.score || 0) - Math.floor(penalty));
    return state;
  }
}

// Factory function for creating scoring systems
export function createScoringSystem(_variant: string): EnhancedScoringSystem {
  // For now, always return CoronataScoringSystem
  // Future variants can be added here
  return new CoronataScoringSystem();
}

// Integration helper for engine controller
export function integrateEnhancedScoring(engineController: any, variant: string) {
  const scoringSystem = createScoringSystem(variant);
  
  // Replace or enhance the existing scoring system
  engineController.scoringSystem = scoringSystem;
  
  // Initialize Coronata-specific state if needed
  if (variant === 'coronata') {
    engineController.state = initializeCoronataState(engineController);
  }
  
  // Add encounter-specific event handlers
  engineController.eventEmitter.on('move', (eventData: any) => {
    console.log('Enhanced scoring: Move event received:', eventData);
    try {
      // Extract move and state from the event payload
      const { move, state } = eventData.payload || { move: eventData.payload, state: engineController.state };
      console.log('Enhanced scoring: Processing move:', move, 'Current player score:', state.player?.score || 0);
      
      // Calculate base score for this specific move
      const moveScore = scoringSystem.calculateMoveScore(move, state);
      console.log('Enhanced scoring: Calculated move score:', moveScore);
      
      // Add base move score to player's accumulated score
      if (state.player) {
        const oldScore = state.player.score || 0;
        state.player.score = oldScore + moveScore;
        console.log('Enhanced scoring: Updated player score from', oldScore, 'to', state.player.score, '(added', moveScore, ')');
      }
      
      // Process any registry effects that should trigger on moves
      // This will handle effects like "exploit-scholars-eye" that award bonus points
      if (engineController.effectEngine && state.player.exploits) {
        // Get card and pile information for effect filtering
        const movedCard = move.card || Object.values(state.piles)
          .flatMap((pile: any) => pile.cards)
          .find((card: any) => card.id === move.cardId);
        const toPile = Object.values(state.piles).find((pile: any) => pile.id === move.to);
        
        const moveData = {
          card: movedCard,
          toPile: toPile,
          move: move
        };
        
        // Trigger move-based effects from equipped exploits with proper filtering
        const moveEffects = engineController.getActiveEffects(state, 'move', moveData);
        console.log('Enhanced scoring: Found', moveEffects.length, 'applicable move effects');
        
        if (moveEffects.length > 0) {
          // Apply effects and update state
          console.log('Enhanced scoring: Applying effects:', moveEffects);
          engineController.state = engineController.effectEngine.applyEffects(moveEffects, state);
          console.log('Enhanced scoring: Player score after effects:', engineController.state.player?.score || 0);
        }
      }
      
      // Update encounter progress with new total
      engineController.state = scoringSystem.updateEncounterProgress(engineController.state);
      
      // Emit stateChange event to notify React components
      engineController.emitEvent('stateChange', engineController.state);
      
      console.log(`Base move score: ${moveScore}, Total player score: ${engineController.state.player?.score || 0}`);
    } catch (error) {
      console.error('Error updating move scoring:', error);
    }
  });

  engineController.eventEmitter.on('encounter_complete', (event: any) => {
    const { bonusPoints } = event.payload || {};
    if (bonusPoints) {
      engineController.state = scoringSystem.awardBonus(
        engineController.state,
        'encounter_complete',
        bonusPoints
      );
    }
  });

  return scoringSystem;
}

// Initialize Coronata-specific state
function initializeCoronataState(engineController: any) {
  const state = engineController.state;
  
  // Initialize player defaults for Coronata
  if (state.player) {
    state.player.coins = state.player.coins || 0;
    state.player.shuffles = state.player.shuffles || 3;
    state.player.discards = state.player.discards || 2;
    state.player.score = state.player.score || 0;
    state.player.exploits = state.player.exploits || [];
    state.player.curses = state.player.curses || [];
    state.player.blessings = state.player.blessings || [];
    state.player.fortunes = state.player.fortunes || [];
    state.player.maxHandSize = state.player.maxHandSize || 5;
    
    // Initialize player inventory - start clean except for selected fortune
    // REMOVED: Demo effects that were polluting the game state
    // Players should start with only their chosen fortune and acquire effects through gameplay

    console.log('Player inventory initialized clean:', {
      exploits: state.player.exploits,
      curses: state.player.curses, 
      fortunes: state.player.fortunes
    });

    // Process immediate effects for all active registry entries
    if (engineController?.effectEngine) {
      console.log('Processing immediate effects for active registry entries...');
      const activeRegistryIds = [
        ...(state.player.exploits || []),
        ...(state.player.curses || []),
        ...(state.player.fortunes || [])
      ];

      const immediateEffects = [];
      for (const registryId of activeRegistryIds) {
        const registryEntry = engineController.registryEntries.find((entry: any) => entry.id === registryId);
        if (registryEntry?.effects) {
          for (const effect of registryEntry.effects) {
            if (effect.condition && effect.condition.event === 'immediate') {
              immediateEffects.push({
                type: effect.action,
                target: effect.target,
                value: effect.value,
                condition: effect.condition,
                meta: { 
                  context: 'immediate',
                  sourceEntry: registryEntry.id,
                  sourceLabel: registryEntry.label 
                }
              });
            }
          }
        }
      }

      if (immediateEffects.length > 0) {
        console.log(`Applying ${immediateEffects.length} immediate effects:`, immediateEffects);
        const newState = engineController.effectEngine.applyEffects(immediateEffects, state);
        console.log('Immediate effects applied. Player coins before:', state.player?.coins, 'after:', newState.player?.coins);
        
        // Return the updated state
        return newState;
      }
    }
  }
  
  // Ensure hand pile exists and initialize it with cards from deck
  if (!state.piles.hand) {
    state.piles.hand = {
      id: 'hand',
      type: 'hand',
      cards: [],
      rules: { faceUp: true },
      meta: {}
    };
  }
  
  // Ensure waste pile exists (for Coronata's deck cycling)
  if (!state.piles.waste) {
    state.piles.waste = {
      id: 'waste',
      type: 'waste',
      cards: [],
      rules: { faceUp: true },
      meta: {}
    };
  }
  
  // If hand is empty and deck has cards, deal initial hand
  if (state.piles.hand.cards.length === 0 && state.piles.deck && state.piles.deck.cards.length > 0) {
    const handSize = Math.min(state.player.maxHandSize || 5, state.piles.deck.cards.length);
    console.log(`Dealing initial hand of ${handSize} cards from deck with ${state.piles.deck.cards.length} cards`);
    
    // Move cards from deck to hand
    for (let i = 0; i < handSize; i++) {
      const card = state.piles.deck.cards.pop();
      if (card) {
        card.faceUp = true; // Hand cards should be face up
        state.piles.hand.cards.push(card);
      }
    }
    
    console.log(`Hand now has ${state.piles.hand.cards.length} cards, deck has ${state.piles.deck.cards.length} cards`);
  }
  
  // Initialize basic run state for Coronata
  if (!state.run) {
    // Update config to match new balance specifications
    const coronataConfig = {
      ...defaultCoronataConfig,
      totalTrials: 5,
      encountersPerTrial: 3,
      baseScoreGoal: 120, // Starting goal for first encounter
      scoreGoalIncrease: 0, // We'll use the calculateEncounterGoal function instead
      fearWeight: 0.67 // 2/3 fear, 1/3 danger per trial
    };
    
    const runState = initializeRun(1, coronataConfig);
    const firstEncounter = selectEncounter(runState, coronataConfig);
    
    // Create a scoring system instance to calculate the goal
    const scoringSystem = new CoronataScoringSystem();
    
    state.run = {
      ...runState,
      completedEncounters: [],
      encounter: {
        id: firstEncounter.id,
        type: firstEncounter.type,
        title: firstEncounter.name,
        description: firstEncounter.description,
        scoreGoal: scoringSystem.calculateEncounterGoal(1), // Use proper goal calculation
        completed: false,
        registryId: firstEncounter.registryId,
        effects: firstEncounter.effects
      }
    };
  }
  
  // Initialize meta data
  if (!state.meta) {
    state.meta = {
      variant: 'coronata',
      initialized: new Date().toISOString(),
      version: '1.0.0'
    };
  }
  
  console.log('Coronata state initialized:', state);
  console.log('Final deck cards:', state.piles.deck?.cards?.length || 0);
  console.log('Final hand cards:', state.piles.hand?.cards?.length || 0);
  
  return state;
}