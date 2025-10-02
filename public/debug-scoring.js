// Debug script to test scoring system
console.log('=== SCORING DEBUG TEST ===');

// Check if we're in Coronata mode
const config = window.gameEngine?.config || {};
console.log('Game config:', config);
console.log('Is Coronata mode:', config.rules === 'coronata');

// Check if enhanced scoring is integrated
const eventEmitter = window.gameEngine?.eventEmitter;
console.log('Event emitter exists:', !!eventEmitter);
console.log('Event emitter listeners:', eventEmitter?._events);

// Check current player score
const gameState = window.gameEngine?.state;
console.log('Current player score:', gameState?.player?.score || 0);
console.log('Player object:', gameState?.player);

// Test moving a card manually
if (window.gameEngine) {
  const testMove = {
    from: 'tableau-0',
    to: 'foundation-0',
    cardId: 'test-card-id',
    type: 'normal'
  };
  
  console.log('Testing move:', testMove);
  
  // This would trigger the scoring if properly set up
  // window.gameEngine.moveCard(testMove);
}

console.log('=== END SCORING DEBUG ===');