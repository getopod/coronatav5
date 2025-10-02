import { EngineController } from '../../src/engine/engineController';
import { makeTestRegistryConfig, makeTestRegistryEntries } from './testUtils';

describe('EngineController Integration: Registry-to-Engine Contract', () => {
  let engine;

  beforeEach(() => {
    engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: makeTestRegistryEntries(),
      customHandlers: {}
    });
  });

  it('should apply registry effects via effect engine', () => {
    let triggered = false;
    engine.registerEffectHandler('customEffect', (effect, state) => {
      triggered = true;
      return state;
    });
    engine.effectEngine.applyEffect({ type: 'customEffect', target: 'testPile', value: 'foo' }, engine.state);
    expect(triggered).toBe(true);
  });

  it('should emit win event when win effect is triggered', () => {
    let winEmitted = false;
    engine.eventEmitter.on('win', (event) => { winEmitted = true; });
    engine.effectEngine.applyEffect({ type: 'win', target: 'testPile' }, engine.state);
    expect(winEmitted).toBe(true);
  });

  it('should serialize and load state correctly', () => {
    engine.state.meta = { foo: 42 };
    const saved = engine.saveState();
    engine.state.meta = { foo: 0 };
    engine.loadState(saved);
    expect(engine.state.meta.foo).toBe(42);
  });
});
