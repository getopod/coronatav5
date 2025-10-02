import { EngineController } from '../../src/engine/engineController';
import { makeTestRegistryConfig, makeTestRegistryEntries } from './testUtils';

describe('EngineController Integration', () => {
  let engine: EngineController;

  beforeEach(() => {
    engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
  });

  it('applies registry effects via effect engine', () => {
    let triggered = false;
    engine.registerEffectHandler('customEffect', (effect, state) => {
      triggered = true;
      return state;
    });
    engine.effectEngine.applyEffect({ type: 'customEffect', target: 'testPile', value: 'foo' }, engine.state);
    expect(triggered).toBe(true);
  });

  it('emits win event when win effect is triggered', () => {
    let winEmitted = false;
    engine.registerEffectHandler('win', (effect, state) => {
      engine.emitEvent('win', { effect, state });
      return state;
    });
    engine.eventEmitter.on('win', (event) => { winEmitted = true; });
    engine.effectEngine.applyEffect({ type: 'win', target: 'testPile' }, engine.state);
    expect(winEmitted).toBe(true);
  });

  it('serializes and loads state correctly', () => {
    engine.state.meta = { foo: 42 };
    const saved = engine.saveState();
    engine.state.meta = { foo: 0 };
    engine.loadState(saved);
    expect(engine.state.meta.foo).toBe(42);
  });
});
