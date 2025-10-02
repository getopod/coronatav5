// Engine Controller: Registry-to-Engine Bootstrapping & Central Dispatcher
import { GameState, Move } from './types';
import { loadRegistry, RegistryConfig } from './registryLoader';
import { EffectEngine, Effect, EffectHandler, builtInHandlers } from './effectEngine';
import { EventEmitter, EngineEvent } from './eventSystem';
import { RegistryEntry } from '../registry/index';
import { validateMove, moveCard as moveCardLogic } from './moveLogic';
import { gameModeProfiles } from './gameModeProfiles';
import type { GameModeProfile } from './gameModeProfiles';
import { integrateEnhancedScoring, EnhancedScoringSystem } from './enhancedScoring';

export interface EngineControllerConfig {
  registryConfig: RegistryConfig;
  registryEntries: RegistryEntry[];
  customHandlers?: Record<string, EffectHandler>;
}

export interface EnginePlugin {
  id: string;
  onRegister?: (controller: EngineController) => void;
  onUnregister?: (controller: EngineController) => void;
  onEvent?: (event: EngineEvent, controller: EngineController) => void;
  effectHandlers?: Record<string, EffectHandler>;
  uiConsumers?: ((event: EngineEvent) => void)[];
}

export class EngineController {
  public config: GameModeProfile;
  public logic: any;
  // Save game state to localStorage (browser)
  saveToLocalStorage(key: string = 'coronata_game_state') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, this.saveState());
      }
    } catch (e) {
      console.error('[EngineController] Failed to save to localStorage:', e);
    }
  }

  // Load game state from localStorage (browser)
  loadFromLocalStorage(key: string = 'coronata_game_state') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const data = window.localStorage.getItem(key);
        if (data) this.loadState(data);
      }
    } catch (e) {
      console.error('[EngineController] Failed to load from localStorage:', e);
    }
  }

  // Save game state to file (Node/electron)
  saveToFile(path: string) {
    try {
      // Only works in Node/electron
      const fs = typeof require !== 'undefined' ? require('fs') : null;
      if (fs) {
        fs.writeFileSync(path, this.saveState(), 'utf8');
      }
    } catch (e) {
      console.error('[EngineController] Failed to save to file:', e);
    }
  }

  // Load game state from file (Node/electron)
  loadFromFile(path: string) {
    try {
      // Only works in Node/electron
      const fs = typeof require !== 'undefined' ? require('fs') : null;
      if (fs) {
        const data = fs.readFileSync(path, 'utf8');
        if (data) this.loadState(data);
      }
    } catch (e) {
      console.error('[EngineController] Failed to load from file:', e);
    }
  }
  // Switch game variant and reload config
  switchVariant(variant: string, newConfig?: RegistryConfig, newEntries?: RegistryEntry[]) {
    if (newConfig) {
      newConfig.variant = variant;
      this.state = loadRegistry(newConfig);
      this.registryEntries = newEntries || this.registryEntries;
      // Attach engineController to state.registry for effect handlers
      if (this.state.registry) {
        this.state.registry.engineController = this;
      }
    } else {
      this.state.registry.variant = variant;
    }
    this.emitEvent('stateChange', this.state);
  }
  public state: GameState;
  public effectEngine: EffectEngine;
  public eventEmitter: EventEmitter;
  public scoringSystem?: EnhancedScoringSystem;
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

  switchGameMode(mode: string, logicModule?: any) {
    this.config = gameModeProfiles[mode] || gameModeProfiles['klondike'];
    this.logic = logicModule || null;
    // Optionally reset state, registry, etc. as needed
    this.emitEvent('modeChange', { mode, config: this.config });
  }

  // Collect all active effects from registry entries, optionally filtered by context
  getActiveEffects(state?: GameState, context?: string, moveData?: any): Effect[] {
    const currentState = state || this.state;
    
    // Get player's active exploits, curses, fortunes
    const activeRegistryIds = [
      ...(currentState.player?.exploits || []),
      ...(currentState.player?.curses || []),
      ...(currentState.player?.fortunes || [])
    ];
    
    // Collect blessing IDs from all cards
    const cardBlessingIds: string[] = [];
    Object.values(currentState.piles || {}).forEach(pile => {
      pile.cards.forEach(card => {
        if (card.blessings) {
          cardBlessingIds.push(...card.blessings);
        }
      });
    });
    
    // Combine all active registry IDs
    const allActiveIds = [...activeRegistryIds, ...cardBlessingIds];
    
    // Filter registry entries to only active ones
    const activeEntries = this.registryEntries.filter(entry => 
      allActiveIds.includes(entry.id)
    );
    
    console.log('Active registry entries:', activeEntries.length, 'out of', this.registryEntries.length, '(including card blessings)');
    
    // Map RegistryEffect to Effect
    const allEffects = activeEntries.flatMap(entry =>
      (entry.effects || []).map(eff => ({
        type: eff.action, // map 'action' to 'type'
        target: eff.target,
        value: eff.value,
        condition: eff.condition,
        meta: { 
          context, 
          moveData, 
          sourceEntry: entry.id,
          sourceLabel: entry.label 
        },
        // Add other fields as needed
      }))
    );
    
    // If no context filtering requested, return all effects
    if (!context || !currentState || !moveData) {
      return allEffects;
    }
    
    // Filter effects for move context
    if (context === 'move') {
      return allEffects.filter(effect => this.checkMoveEffectConditions(effect, moveData));
    }
    
    return allEffects;
  }

  // Helper method to check move effect conditions
  private checkMoveEffectConditions(effect: Effect, moveData: any): boolean {
    if (!effect.condition) return true;
    if (typeof effect.condition === 'function') return effect.condition(this.state);
    
    const { card, toPile, move } = moveData;
    
    // Check target pile type matching
    if (effect.target) {
      const targetTypes = effect.target.split('|');
      const pileTypeMatches = targetTypes.some(targetType => {
        if (targetType === 'tableau' && toPile.type === 'tableau') return true;
        if (targetType === 'foundation' && toPile.type === 'foundation') return true;
        if (targetType === 'hand' && toPile.type === 'hand') return true;
        if (targetType === 'deck' && toPile.type === 'deck') return true;
        if (targetType === 'waste' && toPile.type === 'waste') return true;
        return false;
      });
      if (!pileTypeMatches) return false;
    }
    
    // Check card-specific conditions if card exists
    if (card && effect.condition) {
      // Check card value
      if (effect.condition.value) {
        const values = Array.isArray(effect.condition.value) ? effect.condition.value : [effect.condition.value];
        if (!values.includes(card.value)) return false;
      }
      
      // Check card suit
      if (effect.condition.suit) {
        const suits = Array.isArray(effect.condition.suit) ? effect.condition.suit : [effect.condition.suit];
        if (!suits.includes(card.suit)) return false;
      }
    }
    
    // Event-based conditions would be handled elsewhere (on_play_from_hand, etc.)
    // For now, skip event conditions in move context
    if (effect.condition.event) {
      return false; // These need special handling
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
  }

  // Wire up event listeners for engine events
  wireEvents() {
    // Set up event-based effect handlers for coin earning, etc.
    this.setupEventBasedEffects();
    
    // On move: apply effects, update score, check win/loss, record undo/redo
    this.eventEmitter.on('move', (event: EngineEvent) => {
      this.applyActiveEffects();
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
      // Win/Loss
      if (this.winLossDetector) {
        if (this.winLossDetector.checkWin(this.state)) {
          this.emitEvent('win', this.state);
        }
        if (this.winLossDetector.checkLoss(this.state)) {
          this.emitEvent('loss', this.state);
        }
      }
      // Undo/Redo
      if (this.undoRedoManager) {
        this.undoRedoManager.recordMove(event.payload as Move);
      }
      // UI hooks: can add event consumers here
    });
    // On state change: apply effects, check win/loss
  this.eventEmitter.on('stateChange', () => {
      this.applyActiveEffects();
      if (this.winLossDetector) {
        if (this.winLossDetector.checkWin(this.state)) {
          this.emitEvent('win', this.state);
        }
        if (this.winLossDetector.checkLoss(this.state)) {
          this.emitEvent('loss', this.state);
        }
      }
      // UI hooks: can add event consumers here
    });
    // On win/loss: UI hooks
  this.eventEmitter.on('win', () => {
      // UI: show win modal, etc.
    });
  this.eventEmitter.on('loss', () => {
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
        console.log('ENGINE: Specific move events emitted successfully');
      } catch (eventError) {
        console.error('ENGINE: Error during event emission:', eventError);
        // Continue anyway - events are not critical for basic moves
      }
      
      try {
        // Apply registry effects that trigger on moves
        console.log('ENGINE: Getting active effects...');
        const activeEffects = this.getActiveEffects(newState, 'move', { move, fromState: this.state });
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
      this.state = { ...newState }; // Create new object reference
      console.log('ENGINE: State updated, about to emit move event...');
      
      try {
        this.emitEvent('move', { move, state: this.state });
        console.log('ENGINE: Move event emitted successfully');
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
      'on_encounter_complete' // Add encounter completion events
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
    
    // Filter registry entries to only active ones
    const activeEntries = this.registryEntries.filter(entry => 
      activeRegistryIds.includes(entry.id)
    );
    
    // Find effects that match this event type
    const applicableEffects = [];
    
    // Add base coin earning for key actions to ensure steady coin flow
    if (eventType === 'on_foundation_play' || eventType === 'on_play_to_foundation') {
      // Base coin reward for foundation plays (1 coin per foundation card)
      applicableEffects.push({
        type: 'award_coin',
        value: 1,
        meta: { sourceEntry: 'base_game', sourceLabel: 'Base Foundation Reward' }
      });
    } else if (eventType === 'on_tableau_cleared') {
      // Base coin reward for clearing tableaux (5 coins per cleared tableau)
      applicableEffects.push({
        type: 'award_coin',
        value: 5,
        meta: { sourceEntry: 'base_game', sourceLabel: 'Tableau Clear Bonus' }
      });
    }
    
    for (const entry of activeEntries) {
      for (const effect of entry.effects || []) {
        if (effect.condition && effect.condition.event === eventType) {
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
    
    if (applicableEffects.length > 0) {
      console.log(`Applying ${applicableEffects.length} event-based effects for ${eventType}`);
      
      // Apply the effects
      let newState = this.state;
      for (const effect of applicableEffects) {
        newState = this.effectEngine.applyEffect(effect, newState);
      }
      
      // State was modified, emit change event
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
