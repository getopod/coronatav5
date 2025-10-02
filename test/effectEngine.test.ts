import { EffectEngine, RegistryEntry } from '../src/core_engine/effectEngine';
import { GameState } from '../src/core_engine/types';

describe('EffectEngine edge cases', () => {
  const baseState: GameState = {
    piles: {},
    player: {},
    history: [],
    meta: {},
  };

  it('stacks multiple award_score effects', () => {
    const entries: RegistryEntry[] = [
      { id: 'a', effects: [{ type: 'award_score', value: 10 }] },
      { id: 'b', effects: [{ type: 'award_score', value: 5 }] },
    ];
    const engine = new EffectEngine();
    const result = engine.processRegistryEntries(entries, baseState);
    expect(result.player.coins).toBe(15);
  });

  it('resolves block vs allow_move by priority', () => {
    const entries: RegistryEntry[] = [
      { id: 'block', effects: [{ type: 'block', priority: 2 }] },
      { id: 'allow', effects: [{ type: 'allow_move', priority: 1 }] },
    ];
  const engine = new EffectEngine();
  const result = engine.processRegistryEntries(entries, baseState);
  expect(result.blocked).toBe(true);
  expect(result.blockReason).toBeDefined();
  });

  it('activates run-limited entries only once', () => {
    const entries: RegistryEntry[] = [
      { id: 'run1', effects: [{ type: 'award_score', value: 10 }], runLimited: true, completed: true },
      { id: 'run2', effects: [{ type: 'award_score', value: 5 }], runLimited: true },
    ];
    const engine = new EffectEngine();
    const result = engine.processRegistryEntries(entries, baseState);
    expect(result.player.coins).toBe(5);
  });

  it('activates encounter-limited entries only when active', () => {
    const entries: RegistryEntry[] = [
      { id: 'enc1', effects: [{ type: 'award_score', value: 10 }], encounterLimited: true, active: false },
      { id: 'enc2', effects: [{ type: 'award_score', value: 5 }], encounterLimited: true, active: true },
    ];
    const engine = new EffectEngine();
    const result = engine.processRegistryEntries(entries, baseState);
    expect(result.player.coins).toBe(5);
  });

  it('activates conditional unlocks', () => {
    const entries: RegistryEntry[] = [
      { id: 'cond', effects: [{ type: 'award_score', value: 10 }], unlockCondition: (state) => state.meta?.unlock === true },
    ];
    const engine = new EffectEngine();
    const unlockedState = { ...baseState, meta: { unlock: true } };
    const lockedState = { ...baseState, meta: { unlock: false } };
    expect(engine.processRegistryEntries(entries, unlockedState).player.coins).toBe(10);
    expect(engine.processRegistryEntries(entries, lockedState).player.coins).toBeUndefined();
  });

  it('handles empty registry gracefully', () => {
    const engine = new EffectEngine();
    const result = engine.processRegistryEntries([], baseState);
    expect(result).toEqual(baseState);
  });

  it('handles duplicate effects', () => {
    const entries: RegistryEntry[] = [
      { id: 'dup', effects: [{ type: 'award_score', value: 5 }, { type: 'award_score', value: 5 }] },
    ];
    const engine = new EffectEngine();
    const result = engine.processRegistryEntries(entries, baseState);
    expect(result.player.coins).toBe(10);
  });

  it('is performant with many entries', () => {
    const entries: RegistryEntry[] = [];
    for (let i = 0; i < 1000; ++i) {
      entries.push({ id: `e${i}`, effects: [{ type: 'award_score', value: 1 }] });
    }
    const engine = new EffectEngine();
    const t0 = performance.now();
    const result = engine.processRegistryEntries(entries, baseState);
    const t1 = performance.now();
    expect(result.player.coins).toBe(1000);
    expect(t1 - t0).toBeLessThan(100); // Should run in <100ms
  });
});
