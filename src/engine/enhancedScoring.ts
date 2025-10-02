// Enhanced scoring system with encounter goal integration
import { GameState, Move } from './types';

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
    
    // Step 3: The actual exploit/curse bonuses should be handled by the effect engine
    // when processing registry effects with "award_score" actions.
    // This method calculates the base move score only.
    
    return Math.max(0, Math.floor(baseScore));
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
    // Score Goal Table from master doc
    const scoreGoalTable: { [key: number]: number } = {
      1: 112,
      2: 149,
      3: 224,
      4: 769,
      5: 878,
      6: 988,
      7: 3511,
      8: 3830,
      9: 4022,
      10: 5107
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
        // Set state to show trade/wander/gamble choices
        state.run.awaitingPlayerChoice = true;
        state.run.availableChoices = ['trade', 'wander', 'gamble'];
        console.log('Encounter completed! Awaiting player choice:', state.run.availableChoices);
      }

      // Don't automatically progress - wait for player choice
      // The UI should show the choice interface and call progressAfterChoice()
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
          case 'luck_blessing':
            bonus += Math.floor(Math.random() * 10);
            break;
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

  // Penalty system for negative actions
  applyPenalty(state: GameState, penaltyType: string, amount: number): GameState {
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
export function createScoringSystem(variant: string): EnhancedScoringSystem {
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
    initializeCoronataState(engineController);
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
  }
  
  // Initialize basic run state for Coronata
  if (!state.run) {
    state.run = {
      currentTrial: 1,
      currentEncounter: 1,
      totalTrials: 3,
      encountersPerTrial: 4,
      difficulty: 1,
      completedEncounters: [],
      encounter: {
        id: 1,
        type: 'fear',
        title: 'Practice Round',
        description: 'Get familiar with the game mechanics',
        scoreGoal: 112,
        completed: false
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
}