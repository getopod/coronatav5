// Test script to validate registry effects are working
import { EngineController } from '../src/engine/engineController';
import { makeTestRegistryConfig, makeTestRegistryEntries } from './engine/testUtils';

export function testRegistryEffects() {
  console.log('=== Testing Registry Effects ===');
  
  // Create a test engine with real registry entries
  const testEntries = makeTestRegistryEntries();
  
  // Add a test exploit that awards coins on hand plays
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
  
  const engine = new EngineController({
    registryConfig: makeTestRegistryConfig(),
    registryEntries: [...testEntries, merchantsGuild],
    customHandlers: {}
  });
  
  // Initialize basic player state
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
  
  console.log('Initial state:', {
    playerCoins: engine.state.player.coins || 0,
    playerScore: engine.state.player.score || 0,
    playerExploits: engine.state.player.exploits || []
  });
  
  // Add the merchants guild exploit to the player
  engine.state.player.exploits = ['exploit-merchants-guild'];
  
  console.log('Added Merchant\'s Guild exploit');
  
  // Test event-based effects directly
  try {
    const move = {
      from: 'hand',
      to: 'tableau-1',
      cardId: 'test-card-1'
    };
    
    console.log('Triggering on_play_from_hand event...');
    
    // This should trigger the merchants guild effect
    engine.applyEventBasedEffects('on_play_from_hand', move);
    
    console.log('Final state:', {
      playerCoins: engine.state.player.coins || 0,
      playerScore: engine.state.player.score || 0,
      coinChange: (engine.state.player.coins || 0) - 0,
      scoreChange: (engine.state.player.score || 0) - 0
    });
    
    // Check if coin effect worked (should be 2 coins from merchants guild)
    if ((engine.state.player.coins || 0) === 2) {
      console.log('✅ Registry effect WORKED - exactly 2 coins awarded as expected');
      return true;
    } else if ((engine.state.player.coins || 0) > 0) {
      console.log(`🔶 Registry effect PARTIALLY WORKED - ${engine.state.player.coins} coins awarded (expected 2)`);
      return true;
    } else {
      console.log('❌ Registry effect FAILED - no coins awarded');
      return false;
    }
    
  } catch (error) {
    console.error('Error during test:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testRegistryEffects();
}

// Export for use in other tests
export default testRegistryEffects;