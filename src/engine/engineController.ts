// Engine Controller: Registry-to-Engine Bootstrapping & Central Dispatcher
import { GameState, Move, Pile, Card } from './types';
import { loadRegistry, RegistryConfig } from './registryLoader';
import { EffectEngine, Effect, EffectHandler, builtInHandlers } from './effectEngine';
import { EventEmitter, EngineEvent } from './eventSystem';
import { RegistryEntry } from '../registry/index';
import { validateMove, moveCard as moveCardLogic } from './moveLogic';
import { gameModeProfiles } from './gameModeProfiles';
import type { GameModeProfile } from './gameModeProfiles';
import { integrateEnhancedScoring, EnhancedScoringSystem } from './enhancedScoring';
import { FeatTrackingSystem } from './featTracking';

export class EngineController {
  public state: GameState;
  public effectEngine: EffectEngine;
  public eventEmitter: EventEmitter;
  public scoringSystem?: EnhancedScoringSystem;
  public featTracker: FeatTrackingSystem;
  private registryEntries: RegistryEntry[];
  public plugins: EnginePlugin[] = [];

  constructor(config: EngineControllerConfig, mode: string = 'klondike', logicModule?: any) {
    // Load profile for selected mode
    this.config = gameModeProfiles[mode] || gameModeProfiles['klondike'];
    // Optionally load logic module for rules
    this.logic = logicModule || null;
    this.state = loadRegistry(config.registryConfig);
    this.registryEntries = config.registryEntries;
    // Attach engineController to state.registry for effect handlers
    if (this.state.registry) {
      this.state.registry.engineController = this;
    }
    // Merge built-in and custom effect handlers
    this.effectEngine = new EffectEngine({
      handlers: { ...builtInHandlers, ...(config.customHandlers || {}) }
    });
    this.eventEmitter = new EventEmitter();
    // Initialize feat tracking system
    this.featTracker = new FeatTrackingSystem();
    // Track new game session
    this.featTracker.updateStats('gamesStarted', 1);
    // Auto-integrate enhanced features based on game mode profile
    if (this.config.enableEnhancedScoring) {
      console.log(`Auto-integrating enhanced scoring for ${mode} mode`);
      integrateEnhancedScoring(this, mode);
    }
    // Set up player defaults based on game mode
    if (this.config.enableHandManagement && this.config.defaultMaxHandSize) {
      if (this.state.player) {
        this.state.player.maxHandSize = this.config.defaultMaxHandSize;
      }
    }
    this.wireEvents();
  }

  /**
   * Returns all valid destination pile IDs for a given cardId in the current state.
   * Finds the pile containing the card, then checks all piles to see if a move is valid.
   */
  public getValidDestinationsForCard(cardId: string): string[] {
    if (!this.state.piles) return [];
    // Find the pile containing the card
    let fromPileId: string | undefined = undefined;
    for (const [pileId, pile] of Object.entries(this.state.piles)) {
      const pileTyped = pile as Pile;
      if (Array.isArray(pileTyped.cards) && pileTyped.cards.some((c: Card) => c.id === cardId)) {
        fromPileId = pileId;
        break;
      }
    }
    if (!fromPileId) return [];
    const validDestinations: string[] = [];
    for (const [toPileId, toPile] of Object.entries(this.state.piles)) {
      if (toPileId === fromPileId) continue; // Don't move to same pile
      const move: Move = { from: fromPileId, to: toPileId, cardId };
      try {
        if (validateMove(move, this.state)) {
          validDestinations.push(toPileId);
        }
      } catch (e) {
        // Ignore errors, treat as invalid
      }
    }
    return validDestinations;
  }

  private checkMoveEffectConditions(effect: Effect, moveData: any): boolean {
    if (!effect.condition) return true;
    if (typeof effect.condition === 'function') return effect.condition(this.state);

    const { card, toPile } = moveData;

    // Check target pile type matching
    if (!this.checkTargetPileCondition(effect, toPile)) return false;

    // Check card-specific conditions if card exists
    if (!this.checkCardConditions(effect, card)) return false;

    // Event-based conditions would be handled elsewhere (on_play_from_hand, etc.)
    // For now, skip event conditions in move context
    const condition = effect.condition as any;
    if (condition?.event) {
      return false; // These need special handling
    }

    return true;
  }

  private checkTargetPileCondition(effect: Effect, toPile: any): boolean {
    if (!effect.target) return true;
    
    const targetTypes = effect.target.split('|');
    return targetTypes.some(targetType => {
      if (targetType === 'tableau' && toPile.type === 'tableau') return true;
      if (targetType === 'foundation' && toPile.type === 'foundation') return true;
      if (targetType === 'hand' && toPile.type === 'hand') return true;
      if (targetType === 'deck' && toPile.type === 'deck') return true;
      if (targetType === 'waste' && toPile.type === 'waste') return true;
      return false;
    });
  }

  private checkCardConditions(effect: Effect, card: any): boolean {
    if (!card || !effect.condition || typeof effect.condition === 'function') return true;
    
    const condition = effect.condition as any; // Type assertion for object conditions
    
    // Check card value
    if (condition.value) {
      const values = Array.isArray(condition.value) ? condition.value : [condition.value];
      if (!values.includes(card.value)) return false;
    }
    
    // Check card suit
    if (condition.suit) {
      const suits = Array.isArray(condition.suit) ? condition.suit : [condition.suit];
      if (!suits.includes(card.suit)) return false;
    }
    
    return true;
  }

  // Apply all active effects to the current state, warn/log for unhandled actions
  applyActiveEffects() {
    const oldScore = this.state.player?.score ?? 0;
    const effects = this.getActiveEffects();
    for (const effect of effects) {
      const handler = this.effectEngine['handlers'][effect.type];
      if (!handler) {
        console.warn(`[EngineController] No handler registered for effect action: ${effect.type}`);
      }
    }
    this.state = this.effectEngine.applyEffects(effects, this.state);

    // Check if score changed and update encounter progress if needed
    const newScore = this.state.player?.score ?? 0;
    if (newScore !== oldScore && this.scoringSystem) {
      console.log(`Score changed from ${oldScore} to ${newScore}, updating encounter progress`);
      this.state = this.scoringSystem.updateEncounterProgress(this.state);
      this.emitEvent('stateChange', this.state);
    }

    // Check for encounter progression
    this.checkEncounterProgression();
  }

  // Check if current encounter is completed and progress to next
  private checkEncounterProgression() {
    if (!this.state.run?.encounter || this.config?.rules !== 'coronata') return;

    // Check if current encounter is completed
    if (checkEncounterCompletion(this.state)) {
      console.log('Encounter completed! Progressing to next encounter...');

      // Mark current encounter as completed
      this.state.run.encounter.completed = true;

      // Progress to next encounter/trial
      const newRunState = progressEncounter(this.state.run, undefined, this.registryEntries);

      // Check if run is completed
      if (checkRunCompletion(newRunState)) {
        console.log('Run completed! All trials finished.');
        this.emitEvent('run_completed', { runState: newRunState });
        // Don't update the run state - let the UI handle victory screen
        return;
      }

      // Reset the board and player state for the new encounter
      if (this.scoringSystem && newRunState.encounter) {
        // Use encounter number from newRunState
        const encounterNumber = (newRunState.currentTrial - 1) * (newRunState.encountersPerTrial || 3) + newRunState.currentEncounter;
        this.state = this.scoringSystem.resetForNewEncounter({
          ...this.state,
          run: newRunState
        }, encounterNumber);
      } else {
        // Fallback: just update run state
        this.state = {
          ...this.state,
          run: newRunState
        };
      }

      // Emit encounter completion and progression events
      this.emitEvent('encounter_completed', {
        completedEncounter: this.state.run.encounter,
        nextEncounter: newRunState.encounter
      });

      // Apply immediate effects for the new encounter
      if (newRunState.encounter) {
        this.emitEvent('encounter_started', { encounter: newRunState.encounter });
        this.applyImmediateEffects([newRunState.encounter.registryId]);
      }

      this.emitEvent('stateChange', this.state);
    }
  }

  // Apply immediate effects for newly activated registry entries
  applyImmediateEffects(registryIds: string[]) {
    console.log('Applying immediate effects for registry entries:', registryIds);
    console.log('Registry entries available:', this.registryEntries.length);
    const immediateEffects: Effect[] = [];

    for (const registryId of registryIds) {
      console.log('Looking for registry entry:', registryId);
      const entry = this.registryEntries.find(e => e.id === registryId);
      console.log('Found entry:', entry ? entry.label : 'NOT FOUND');
      if (entry && entry.effects) {
        console.log('Entry effects:', entry.effects);
        for (const effect of entry.effects) {
          console.log('Checking effect:', effect);
          if (effect.condition && typeof effect.condition === 'object' && effect.condition.event === 'immediate') {
            console.log('Found immediate effect:', effect);
            // Remove the event condition since we're applying immediately
            const { event, ...otherConditions } = effect.condition;
            immediateEffects.push({
              type: effect.action,
              target: effect.target,
              value: effect.value,
              condition: Object.keys(otherConditions).length > 0 ? otherConditions : undefined,
              meta: { sourceEntry: entry.id, sourceLabel: entry.label }
            });
          }
        }
      }
    }

    if (immediateEffects.length > 0) {
      console.log(`Applying ${immediateEffects.length} immediate effects:`, immediateEffects);
      this.state = this.effectEngine.applyEffects(immediateEffects, this.state);
      console.log('State after applying effects:', { coins: this.state.player.coins, score: this.state.player.score });
      this.emitEvent('stateChange', this.state);
    } else {
      console.log('No immediate effects found to apply');
    }
  }

  // Helper method to find a card by ID in all piles
  private getCardById(cardId: string): Card | null {
    if (!this.state.piles) return null;
    
    // piles is a Record<string, Pile>, so iterate over values
    for (const pile of Object.values(this.state.piles)) {
      if (Array.isArray(pile.cards)) {
        const card = pile.cards.find((c: Card) => c.id === cardId);
        if (card) return card;
      }
    }
    return null;
  }

  // Helper method to handle feat tracking for moves
  private handleFeatTracking(move: Move): void {
    this.featTracker.updateStats('moves', 1);
    
    // Track card type moves
    if (move.cardId) {
      const card = this.getCardById(move.cardId);
      if (card) {
        if (card.value === 1) this.featTracker.updateStats('acesPlayed', 1);
        if (card.value === 13) this.featTracker.updateStats('kingsPlayed', 1);
      }
    }
    
    // Track foundation moves
    if (this.state.piles) {
      const toPile = Object.values(this.state.piles).find((p: Pile) => p.id === move.to);
      if (toPile?.type === 'foundation') {
        this.featTracker.updateStats('foundationMoves', 1);
      }
    }
    
    // Check for feat completions
    this.featTracker.checkFeats(this.state);
  }

  // Wire up event listeners for engine events
  wireEvents() {
    // Set up event-based effect handlers for coin earning, etc.
    this.setupEventBasedEffects();

    // On move: apply effects, update score, check win/loss, record undo/redo
    this.eventEmitter.on('move', (event: EngineEvent) => {
      this.applyActiveEffects();

      // Handle feat tracking
      const { move } = event.payload as { move: Move, state: GameState };
      this.handleFeatTracking(move);

      // Scoring - Skip base scoring if enhanced scoring is active (Coronata mode)
      console.log('Base scoring check - config.rules:', this.config?.rules, 'scoringSystem exists:', !!this.scoringSystem);
      if (this.scoringSystem && this.config?.rules !== 'coronata') {
        const { move } = event.payload as { move: Move, state: GameState };
        const score = this.scoringSystem.calculateMoveScore(move, this.state);
        console.log('Base scoring: Adding score', score, 'to player score');
        this.state.player.score = (this.state.player.score ?? 0) + score;
      } else {
        console.log('Base scoring: Skipped because rules =', this.config?.rules);
      }
      console.log('Encounter completed:', event.payload);
      // UI can show encounter completion feedback here
    });
    this.eventEmitter.on('encounter_started', (event: EngineEvent) => {
      console.log('New encounter started:', event.payload);
      // UI can show new encounter introduction here
    });
    this.eventEmitter.on('run_completed', (event: EngineEvent) => {
      console.log('Run completed! Victory achieved.');
      // Record run completion in run history (victory)
      try {
        const PersistenceManager = require('./persistenceManager').default || require('./persistenceManager');
        const pm = PersistenceManager?.getInstance?.();
        let run: any = {};
        if (event?.payload?.runState) {
          run = event.payload.runState as any;
        } else if (this.state?.run) {
          run = this.state.run as any;
        }
        pm?.endSession?.('victory', {
          score: run.score || 0,
          encountersCompleted: run.completedEncounters || 0,
          exploitsGained: run.exploitsGained || [],
          blessingsGained: run.blessingsGained || [],
          fearsGained: run.fearsGained || [],
          coinsEarned: run.coinsEarned || 0,
          selectedFortune: run.selectedFortune || undefined
        });
      } catch (e) {
        console.error('[EngineController] Failed to record run completion in history:', e);
      }
      this.emitEvent('win', this.state); // Trigger win state
    });
    // On win/loss: UI hooks and feat tracking
  this.eventEmitter.on('win', () => {
      // Update feat tracking for wins
      this.featTracker.updateStats('wins', 1);
      this.featTracker.checkFeats(this.state);
      // UI: show win modal, etc.
    });
  this.eventEmitter.on('loss', () => {
      // Update feat tracking for losses
      this.featTracker.updateStats('losses', 1);
      this.featTracker.checkFeats(this.state);
      // Record run completion in run history (defeat)
      try {
        const PersistenceManager = require('./persistenceManager').default || require('./persistenceManager');
        const pm = PersistenceManager?.getInstance?.();
        const run: any = this.state?.run || {};
        pm?.endSession?.('defeat', {
          score: run.score || 0,
          encountersCompleted: run.completedEncounters || 0,
          exploitsGained: run.exploitsGained || [],
          blessingsGained: run.blessingsGained || [],
          fearsGained: run.fearsGained || [],
          coinsEarned: run.coinsEarned || 0,
          selectedFortune: run.selectedFortune || undefined
        });
      } catch (e) {
        console.error('[EngineController] Failed to record run defeat in history:', e);
      }
      // UI: show loss modal, etc.
    });
  }
  // Optional: attach scoring, win/loss, undo/redo, and UI consumers
  public winLossDetector?: any;
  public undoRedoManager?: any;
  public uiConsumers: ((event: EngineEvent) => void)[] = [];

  attachScoringSystem(scoringSystem: EnhancedScoringSystem) {
    this.scoringSystem = scoringSystem;
  }
  attachWinLossDetector(winLossDetector: any) {
    this.winLossDetector = winLossDetector;
  }
  attachUndoRedoManager(undoRedoManager: any) {
    this.undoRedoManager = undoRedoManager;
  }

  // Register custom effect handler
  // Register custom effect handler and log registration
  registerEffectHandler(type: string, handler: EffectHandler) {
    this.effectEngine.registerHandler(type, handler);
    console.info(`[EngineController] Registered custom effect handler for action: ${type}`);
  }

  // Register a plugin
  registerPlugin(plugin: EnginePlugin) {
    this.plugins.push(plugin);
    if (plugin.onRegister) plugin.onRegister(this);
    // Register effect handlers
    if (plugin.effectHandlers) {
      for (const [type, handler] of Object.entries(plugin.effectHandlers)) {
        this.registerEffectHandler(type, handler);
      }
    }
    // Register UI consumers
    if (plugin.uiConsumers) {
      for (const consumer of plugin.uiConsumers) {
        this.addUIConsumer(consumer);
      }
    }
  }

  // Unregister a plugin
  unregisterPlugin(pluginId: string) {
    const idx = this.plugins.findIndex(p => p.id === pluginId);
    if (idx !== -1) {
      const plugin = this.plugins[idx];
      if (plugin.onUnregister) plugin.onUnregister(this);
      this.plugins.splice(idx, 1);
    }
  }

  // Emit engine event
  emitEvent(type: string, payload: any) {
    this.eventEmitter.emit({ type: type as any, payload });
    for (const plugin of this.plugins) {
      if (plugin.onEvent) plugin.onEvent({ type: type as any, payload }, this);
    }
  }

  // Example: Move a card and trigger effects
  moveCard(move: Move) {
    console.log('=== ENGINE CONTROLLER MOVE CARD ===');
    console.log('Move:', move);
    
    // Validate move before applying
    if (!validateMove(move, this.state)) {
      console.log('ENGINE: Move validation failed');
      throw new Error(`Invalid move: ${JSON.stringify(move)}`);
    }
    
    console.log('ENGINE: Move validation passed');
    
    // Get pile types for specific event emission
    const fromPile = this.state.piles[move.from];
    const toPile = this.state.piles[move.to];
    
    try {
      // Apply move logic and create new state object for React to detect changes
      console.log('ENGINE: Calling moveCardLogic...');
      let newState = moveCardLogic(this.state, move);
      console.log('ENGINE: moveCardLogic returned, checking result...');
      
      // Check if the move logic actually moved the card
      if (newState === this.state) {
        console.log('ENGINE ERROR: moveCardLogic returned original state - move failed silently');
        throw new Error('Move logic failed - returned original state');
      }
      
      console.log('ENGINE: Move logic succeeded, proceeding with effects...');
      const oldScore = newState.player?.score ?? 0;
    
      try {
        // Emit specific events for registry effects to catch
        console.log('ENGINE: Emitting specific move events...');
        this.emitSpecificMoveEvents(move, fromPile, toPile);
        // --- BEGIN PATCH: Lucky Streak (on_next_3_plays) event emission ---
        // If player has a fortune with on_next_3_plays, emit event and decrement counter
        if (fromPile.type === 'hand' && newState.player && newState.player.activeFortune) {
          // Find the active fortune with on_next_3_plays event condition
          const registry = this.registryEntries;
          const fortuneEntry = registry.find(e => e.id === newState.player.activeFortune);
          if (fortuneEntry && Array.isArray(fortuneEntry.effects) && fortuneEntry.effects.some(eff => eff.condition && eff.condition.event === 'on_next_3_plays')) {
            // Track remaining plays in player._luckyStreakPlays
            if (typeof newState.player._luckyStreakPlays !== 'number') {
              newState.player._luckyStreakPlays = 3;
            }
            if (newState.player._luckyStreakPlays > 0) {
              this.emitEvent('on_next_3_plays', { move, fromPile, toPile });
              newState.player._luckyStreakPlays--;
              if (newState.player._luckyStreakPlays === 0) {
                // Optionally, remove the fortune or mark it as completed
                // (leave as is for now)
              }
            }
          }
        }
        // --- END PATCH ---
        console.log('ENGINE: Specific move events emitted successfully');
      } catch (eventError) {
        console.error('ENGINE: Error during event emission:', eventError);
        // Continue anyway - events are not critical for basic moves
      }
      
      try {
        // Apply registry effects that trigger on moves
        console.log('ENGINE: Getting active effects...');
        const card = fromPile.cards.find(c => c.id === move.cardId);
        const moveData = { move, card, toPile, fromPile, fromState: this.state };
        const activeEffects = this.getActiveEffects(newState, 'move', moveData);
        console.log(`ENGINE: Found ${activeEffects.length} active effects`);
        
        if (activeEffects.length > 0) {
          console.log(`Applying ${activeEffects.length} registry effects for move:`, move);
          console.log('ENGINE: About to apply effects...');
          newState = this.effectEngine.applyEffects(activeEffects, newState);
          console.log('ENGINE: Effects applied successfully');
          
          // Check if score changed from registry effects and update encounter progress
          const newScore = newState.player?.score ?? 0;
          if (newScore !== oldScore && this.scoringSystem) {
            console.log(`Registry effects changed score from ${oldScore} to ${newScore}, updating encounter progress`);
            console.log('ENGINE: About to update encounter progress...');
            newState = this.scoringSystem.updateEncounterProgress(newState);
            console.log('ENGINE: Encounter progress updated successfully');
          }
        }
      } catch (effectsError) {
        console.error('ENGINE: Error during effects processing:', effectsError);
        console.log('ENGINE: Continuing without effects...');
        // Continue with the move anyway - the basic move should still work
      }
      
      console.log('ENGINE: About to update state and emit event...');
      this.state = { ...newState };
      console.log('ENGINE: State updated, about to emit move event...');
      try {
        this.emitEvent('move', { move, state: this.state });
        this.emitEvent('stateChange', this.state); // Force UI update after move
        console.log('ENGINE: Move and stateChange events emitted successfully');
      } catch (emitError) {
        console.error('ENGINE: Error during move event emission:', emitError);
        console.log('ENGINE: Move completed despite event emission error');
      }
      console.log('ENGINE: Move completed successfully');
      
    } catch (error) {
      console.error('ENGINE ERROR: Exception during move processing:', error);
      throw error;
    }
  }

  // Emit specific events based on move types for registry effects
  private emitSpecificMoveEvents(move: Move, fromPile: any, toPile: any) {
    // Determine move type and emit appropriate events
    
    // Hand to anywhere
    if (fromPile.type === 'hand') {
      this.emitEvent('on_play_from_hand', { move, fromPile, toPile });
      
      if (toPile.type === 'tableau') {
        this.emitEvent('on_tableau_play', { move, fromPile, toPile });
      } else if (toPile.type === 'foundation') {
        this.emitEvent('on_foundation_play', { move, fromPile, toPile });
        this.emitEvent('on_play_to_foundation', { move, fromPile, toPile });
      }
    }
    
    // Deck to anywhere
    if (fromPile.type === 'deck' || fromPile.type === 'stock') {
      this.emitEvent('on_play_from_deck', { move, fromPile, toPile });
      
      if (toPile.type === 'tableau') {
        this.emitEvent('on_tableau_play', { move, fromPile, toPile });
      } else if (toPile.type === 'foundation') {
        this.emitEvent('on_foundation_play', { move, fromPile, toPile });
      }
    }
    
    // Tableau to anywhere
    if (fromPile.type === 'tableau') {
      if (toPile.type === 'foundation') {
        this.emitEvent('on_foundation_play', { move, fromPile, toPile });
        this.emitEvent('on_play_to_foundation', { move, fromPile, toPile });
      } else if (toPile.type === 'tableau') {
        this.emitEvent('on_tableau_play', { move, fromPile, toPile });
      }
    }
    
    // General play event
    this.emitEvent('on_any_play', { move, fromPile, toPile });
  }

  // Set up event listeners for registry effects that trigger on specific events
  setupEventBasedEffects() {
    const eventTypes = [
      'on_play_from_hand', 'on_play_from_deck', 'on_tableau_play', 
      'on_foundation_play', 'on_play_to_foundation', 'on_any_play',
      'on_discard_from_hand', 'on_tableau_cleared', 'on_encounter_start',
      'on_encounter_complete', 'on_next_5_draws' // Add encounter completion events and custom draw event
    ];
    eventTypes.forEach(eventType => {
      this.eventEmitter.on(eventType as any, (eventData: any) => {
        this.applyEventBasedEffects(eventType, eventData);
      });
    });
  }

  // Apply effects that trigger on specific events
  applyEventBasedEffects(eventType: string, _eventData: any) {
    // Get all active effects from player's registry items
    const activeRegistryIds = [
      ...(this.state.player?.exploits || []),
      ...(this.state.player?.curses || []),
      ...(this.state.player?.blessings || []),
      ...(this.state.player?.fortunes || [])
    ];
    if (this.state.player?.activeFortune) {
      activeRegistryIds.push(this.state.player.activeFortune);
    }
    // Filter registry entries to only active ones
    const activeEntries = this.registryEntries.filter(entry => 
      activeRegistryIds.includes(entry.id)
    );
    // Find effects that match this event type
    const applicableEffects = [];
    // Add base coin earning for key actions to ensure steady coin flow
    if (eventType === 'on_foundation_play' || eventType === 'on_play_to_foundation') {
      applicableEffects.push({
        type: 'award_coin',
        value: 1,
        meta: { sourceEntry: 'base_game', sourceLabel: 'Base Foundation Reward' }
      });
    } else if (eventType === 'on_tableau_cleared') {
      applicableEffects.push({
        type: 'award_coin',
        value: 5,
        meta: { sourceEntry: 'base_game', sourceLabel: 'Tableau Clear Bonus' }
      });
    }
    for (const entry of activeEntries) {
      for (const effect of entry.effects || []) {
        if (effect.condition && effect.condition.event === eventType) {
          // Special handling for 'on_next_5_draws' (Blessed Draw)
          if (eventType === 'on_next_5_draws') {
            // Track how many draws remain for this effect
            if (!this.state.player._blessedDraws) {
              this.state.player._blessedDraws = 5;
            }
            if (this.state.player._blessedDraws > 0) {
              applicableEffects.push({
                type: effect.action,
                target: effect.target,
                value: effect.value,
                condition: effect.condition,
                meta: { sourceEntry: entry.id, sourceLabel: entry.label }
              });
              this.state.player._blessedDraws--;
            }
          } else {
            applicableEffects.push({
              type: effect.action,
              target: effect.target,
              value: effect.value,
              condition: effect.condition,
              meta: { sourceEntry: entry.id, sourceLabel: entry.label }
            });
          }
        }
      }
    }
    if (applicableEffects.length > 0) {
      console.log(`Applying ${applicableEffects.length} event-based effects for ${eventType}`);
      let newState = this.state;
      for (const effect of applicableEffects) {
        newState = this.effectEngine.applyEffect(effect, newState);
      }
      this.emitEvent('stateChange', this.state);
    }
  }

  // Serialization helpers
  saveState(): string {
    // Remove circular reference before serializing
    return JSON.stringify(this.state, (key, value) => {
      if (key === 'engineController') return undefined;
      return value;
    });
  }
  loadState(serialized: string) {
    try {
      this.state = JSON.parse(serialized);
      this.emitEvent('stateChange', this.state);
    } catch (e) {
      console.error('[EngineController] Failed to load state:', e);
    }
  }

  // Improved UI consumer wiring: allow event filtering
  addUIConsumer(consumer: (event: EngineEvent) => void, eventTypes: string[] = ['stateChange','move','win','loss']) {
    this.uiConsumers.push(consumer);
    for (const type of eventTypes) {
      this.eventEmitter.on(type as any, consumer);
    }
  }
}
