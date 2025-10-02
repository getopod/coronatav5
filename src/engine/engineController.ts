// Engine Controller: Registry-to-Engine Bootstrapping & Central Dispatcher
import { GameState, Move } from './types';
import { loadRegistry, RegistryConfig } from './registryLoader';
import { EffectEngine, Effect, EffectHandler, builtInHandlers } from './effectEngine';
import { EventEmitter, EngineEvent } from './eventSystem';
import { RegistryEntry } from '../registry/index';
import { validateMove, moveCard as moveCardLogic } from './moveLogic';
import { gameModeProfiles } from './gameModeProfiles';
import type { GameModeProfile } from './gameModeProfiles';

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
    this.wireEvents();
  }

  switchGameMode(mode: string, logicModule?: any) {
    this.config = gameModeProfiles[mode] || gameModeProfiles['klondike'];
    this.logic = logicModule || null;
    // Optionally reset state, registry, etc. as needed
    this.emitEvent('modeChange', { mode, config: this.config });
  }

  // Collect all active effects from registry entries
  getActiveEffects(): Effect[] {
    // Map RegistryEffect to Effect
    return this.registryEntries.flatMap(entry =>
      (entry.effects || []).map(eff => ({
        type: eff.action, // map 'action' to 'type'
        target: eff.target,
        value: eff.value,
        condition: eff.condition,
        meta: {},
        // Add other fields as needed
      }))
    );
  }

  // Apply all active effects to the current state, warn/log for unhandled actions
  applyActiveEffects() {
    const effects = this.getActiveEffects();
    for (const effect of effects) {
      const handler = this.effectEngine['handlers'][effect.type];
      if (!handler) {
        console.warn(`[EngineController] No handler registered for effect action: ${effect.type}`);
      }
    }
    this.state = this.effectEngine.applyEffects(effects, this.state);
  }

  // Wire up event listeners for engine events
  wireEvents() {
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
    this.eventEmitter.on('stateChange', (event: EngineEvent) => {
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
    this.eventEmitter.on('win', (event: EngineEvent) => {
      // UI: show win modal, etc.
    });
    this.eventEmitter.on('loss', (event: EngineEvent) => {
      // UI: show loss modal, etc.
    });
  }
  // Optional: attach scoring, win/loss, undo/redo, and UI consumers
  public scoringSystem?: any;
  public winLossDetector?: any;
  public undoRedoManager?: any;
  public uiConsumers: ((event: EngineEvent) => void)[] = [];

  attachScoringSystem(scoringSystem: any) {
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
    // Validate move before applying
    if (!validateMove(move, this.state)) {
      throw new Error(`Invalid move: ${JSON.stringify(move)}`);
    }
    // Apply move logic
    this.state = moveCardLogic(this.state, move);
    this.emitEvent('move', { move, state: this.state });
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
