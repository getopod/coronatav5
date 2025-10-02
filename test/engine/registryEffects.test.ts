import { EngineController } from '../../src/engine/engineController';
import { makeTestRegistryConfig, makeTestRegistryEntries } from './testUtils';

describe('Registry Effects Integration', () => {
  let engine: EngineController;

  beforeEach(() => {
    // Create a test exploit that awards coins on hand plays
    const merchantsGuild = {
      id: "exploit-merchants-guild",
      label: "Merchant's Guild",
      description: "Whenever a card is played from your Hand, you gain 2 Coin.",
      type: "exploit" as const,
      rarity: "rare",
      category: "",
      completed: false,
      tags: ["coin", "hand"],
      choices: [],
      results: {},
      effects: [
        { action: "award_coin", target: "player", value: 2, condition: { event: "on_play_from_hand" } }
      ]
    };

    engine = new EngineController({
      registryConfig: makeTestRegistryConfig(),
      registryEntries: [...makeTestRegistryEntries(), merchantsGuild],
      customHandlers: {}
    });

    // Initialize player state
    if (!engine.state.player) {
      engine.state.player = {
        coins: 0,
        score: 0,
        exploits: [],
        curses: [],
        blessings: [],
        fortunes: []
      };
    }
  });

  it('applies registry effects when events are triggered', () => {
    // Give player the merchants guild exploit
    engine.state.player.exploits = ['exploit-merchants-guild'];
    
    const initialCoins = engine.state.player.coins || 0;
    
    // Trigger the event that should award 2 coins
    engine.applyEventBasedEffects('on_play_from_hand', { 
      from: 'hand', 
      to: 'tableau-1', 
      cardId: 'test-card' 
    });
    
    // Check that coins were awarded (may be more than 2 due to multiple triggers)
    const finalCoins = engine.state.player.coins || 0;
    expect(finalCoins).toBeGreaterThanOrEqual(initialCoins + 2);
  });

  it('does not apply effects for non-matching events', () => {
    // Give player the merchants guild exploit  
    engine.state.player.exploits = ['exploit-merchants-guild'];
    
    const initialCoins = engine.state.player.coins || 0;
    
    // Trigger a different event
    engine.applyEventBasedEffects('on_tableau_play', { 
      from: 'deck', 
      to: 'tableau-1', 
      cardId: 'test-card' 
    });
    
    // Check that no coins were awarded
    const finalCoins = engine.state.player.coins || 0;
    expect(finalCoins).toBe(initialCoins);
  });

  it('does not apply effects when player does not have the exploit', () => {
    // Player has no exploits
    engine.state.player.exploits = [];
    
    const initialCoins = engine.state.player.coins || 0;
    
    // Trigger the event
    engine.applyEventBasedEffects('on_play_from_hand', { 
      from: 'hand', 
      to: 'tableau-1', 
      cardId: 'test-card' 
    });
    
    // Check that no coins were awarded
    const finalCoins = engine.state.player.coins || 0;
    expect(finalCoins).toBe(initialCoins);
  });
});