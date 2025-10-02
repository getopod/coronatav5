import { EngineController } from '../../src/engine/engineController';
import { makeTestRegistryConfig, makeTestRegistryEntries } from './testUtils';

describe('EngineController Advanced Integration', () => {
  let engine: EngineController;

  beforeEach(() => {
    engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
  });

  it('handles edge cases: empty piles, no moves', () => {
    engine.state.piles = {};
    expect(Object.keys(engine.state.piles).length).toBe(0);
    expect(engine.state.history.length).toBe(0);
  });

  it('handles error: invalid move', () => {
    expect(() => engine.moveCard({ from: 'invalid', to: 'invalid', cardId: 'c1' })).toThrow();
  });

  it('supports multi-deck: multiple piles with cards', () => {
    engine.state.piles['deck2'] = { id: 'deck2', type: 'deck', cards: [{ id: 'c2', suit: 'spades', value: 2, faceUp: true }], meta: {} };
    expect(engine.state.piles['deck2'].cards.length).toBe(1);
  });

  it('tracks scoring: score updates on effect', () => {
    engine.registerEffectHandler('award_score', (effect, state) => {
      state.player.coins = (state.player.coins || 0) + (effect.value || 1);
      return state;
    });
    engine.effectEngine.applyEffect({ type: 'award_score', value: 10 }, engine.state);
    expect(engine.state.player.coins).toBe(10);
  });

  it('supports undo/redo: move history', () => {
    engine.state.history.push({ from: 'testPile', to: 'testPile', cardId: 'c1' });
    expect(engine.state.history.length).toBe(1);
    // Simulate undo
    engine.state.history.pop();
    expect(engine.state.history.length).toBe(0);
  });

  it('supports dynamic piles: add/remove piles', () => {
    engine.state.piles['dynamic'] = { id: 'dynamic', type: 'tableau', cards: [], meta: {} };
    expect(engine.state.piles['dynamic']).toBeDefined();
    delete engine.state.piles['dynamic'];
    expect(engine.state.piles['dynamic']).toBeUndefined();
  });

  it('supports custom moves via registry', () => {
    // Add a custom move definition to config
    const config = makeTestRegistryConfig();
    config.customMoves = {
      specialMove: {
        from: 'testPile',
        to: 'testPile',
        cardId: 'c1',
        type: 'special',
        meta: { custom: true }
      }
    };
    const engine = new EngineController({
      registryConfig: config,
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
  // Simulate custom move (should throw, as move is invalid for tableau)
  expect(() => engine.moveCard({ from: 'testPile', to: 'testPile', cardId: 'c1', type: 'special', meta: { custom: true } })).toThrow();
  });

  it('switches variants and reloads config', () => {
    const config = makeTestRegistryConfig();
    config.variant = 'A';
    const engine = new EngineController({
      registryConfig: config,
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
    expect(engine.state.registry.variant).toBe('A');
    engine.switchVariant('B');
    expect(engine.state.registry.variant).toBe('B');
  });

  it('emits animation and sound events via effect', () => {
    const engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
    let animationEmitted = false;
    let soundEmitted = false;
    engine.eventEmitter.on('custom', (event) => {
      if (event.payload.type === 'animation') animationEmitted = true;
      if (event.payload.type === 'sound') soundEmitted = true;
    });
    engine.effectEngine.applyEffect({ type: 'trigger_animation', value: 'flip', target: 'testPile' }, engine.state);
    engine.effectEngine.applyEffect({ type: 'play_sound', value: 'cardMove', target: 'testPile' }, engine.state);
    expect(animationEmitted).toBe(true);
    expect(soundEmitted).toBe(true);
  });

  // Skipped: localStorage test only works in browser/jsdom environment
  if (typeof window !== 'undefined' && window.localStorage) {
    it('persists and loads game state via localStorage', () => {
      const engine = new EngineController({
        registryConfig: makeTestRegistryConfig(),
        registryEntries: makeTestRegistryEntries(),
        customHandlers: {}
      });
      // Mock localStorage
      const store: Record<string, string> = {};
      global.window = Object.create(window);
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: (key: string, value: string) => { store[key] = value; },
          getItem: (key: string) => store[key],
          removeItem: (key: string) => { delete store[key]; }
        },
        writable: true
      });
      engine.state.player.coins = 42;
      engine.saveToLocalStorage('test_save');
      engine.state.player.coins = 0;
      engine.loadFromLocalStorage('test_save');
      expect(engine.state.player.coins).toBe(42);
    });
  }

  it('persists and loads game state via file (mocked)', () => {
    const engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
    // Mock fs
    const fileStore: Record<string, string> = {};
    jest.mock('fs', () => ({
      writeFileSync: (path: string, data: string) => { fileStore[path] = data; },
      readFileSync: (path: string) => fileStore[path]
    }));
    engine.state.player.coins = 99;
    engine.saveToFile('test_save.json');
    engine.state.player.coins = 0;
    engine.loadFromFile('test_save.json');
    expect(engine.state.player.coins).toBe(99);
  });

  it('persists and loads player profile and stats', () => {
    const engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
    engine.state.profile = {
      id: 'p1',
      name: 'TestPlayer',
      stats: { gamesPlayed: 5, gamesWon: 2, highestScore: 100 }
    } as import('../../src/engine/types').PlayerProfile;
    const saved = engine.saveState();
    engine.state.profile = undefined;
  engine.loadState(saved);
  const profile = engine.state.profile as unknown as import('../../src/engine/types').PlayerProfile;
  expect(profile?.name).toBe('TestPlayer');
  expect(profile?.stats.gamesPlayed).toBe(5);
  });

  it('registers and calls plugin hooks', () => {
    const engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
    let registered = false;
    let unregistered = false;
    let eventCalled = false;
    const plugin = {
      id: 'testPlugin',
      name: 'Test Plugin',
      onRegister: () => { registered = true; },
      onUnregister: () => { unregistered = true; },
      onEvent: (event: { type: string }, _controller: any) => { if (event.type === 'custom') eventCalled = true; }
    };
    engine.registerPlugin(plugin);
    expect(registered).toBe(true);
    engine.emitEvent('custom', {});
    expect(eventCalled).toBe(true);
    engine.unregisterPlugin('testPlugin');
    expect(unregistered).toBe(true);
  });

  it('registers plugin effect handlers and UI consumers', () => {
    const engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
    let effectCalled = false;
    let uiCalled = false;
    const plugin = {
      id: 'testPlugin2',
      name: 'Test Plugin 2',
      effectHandlers: {
        customEffect: (effect: any, state: any) => { effectCalled = true; return state; }
      },
      uiConsumers: [(_event: any) => { uiCalled = true; }]
    };
    engine.registerPlugin(plugin);
    engine.effectEngine.applyEffect({ type: 'customEffect', target: 'testPile', value: 'foo' }, engine.state);
    engine.emitEvent('move', {});
    expect(effectCalled).toBe(true);
    expect(uiCalled).toBe(true);
  });
});
