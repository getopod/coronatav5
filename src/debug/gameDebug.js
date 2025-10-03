/**
 * Debug utility to check game state and encounter flow
 */

// Function to inspect the current game state
export function debugGameState() {
  if (typeof window !== 'undefined' && window.gameEngine) {
    const engine = window.gameEngine;
    const state = engine.state;
    
    console.log('=== GAME STATE DEBUG ===');
    console.log('Player state:', state.player);
    console.log('Run state:', state.run);
    console.log('Encounter flow:', state.run?.encounterFlow);
    console.log('Engine controller:', engine);
    console.log('Scoring system:', engine.scoringSystem);
    console.log('Effect engine:', engine.effectEngine);
    console.log('Registry entries:', engine.registryEntries?.length || 'undefined');
    console.log('========================');
    
    return state;
  } else {
    console.log('Game engine not available in window');
    return null;
  }
}

// Function to manually trigger encounter completion for testing
export function debugTriggerEncounter() {
  if (typeof window !== 'undefined' && window.gameEngine) {
    const engine = window.gameEngine;
    const state = engine.state;
    
    console.log('=== MANUAL ENCOUNTER TRIGGER ===');
    
    if (engine.scoringSystem && 'updateEncounterProgress' in engine.scoringSystem) {
      // Manually set encounter as completed
      if (state.run?.encounter) {
        state.run.encounter.completed = true;
        console.log('Marked encounter as completed');
        
        // Trigger encounter progress update
        const updatedState = engine.scoringSystem.updateEncounterProgress(state);
        engine.state = updatedState;
        
        console.log('Updated state after encounter progress:', updatedState.run?.encounterFlow);
        
        // Emit state change
        engine.emitEvent('stateChange', engine.state);
        
        return updatedState;
      } else {
        console.log('No active encounter found');
      }
    } else {
      console.log('No scoring system with updateEncounterProgress found');
    }
    
    console.log('================================');
  } else {
    console.log('Game engine not available');
  }
}

// Function to manually trigger immediate effects
export function debugTriggerImmediateEffects() {
  if (typeof window !== 'undefined' && window.gameEngine) {
    const engine = window.gameEngine;
    
    console.log('=== MANUAL IMMEDIATE EFFECTS TRIGGER ===');
    
    if (engine.scoringSystem?.initializeCoronataState) {
      const updatedState = engine.scoringSystem.initializeCoronataState(engine);
      engine.state = updatedState;
      engine.emitEvent('stateChange', engine.state);
      console.log('Immediate effects triggered, new state:', updatedState.player);
      return updatedState;
    } else {
      console.log('initializeCoronataState not available');
    }
    
    console.log('========================================');
  }
}

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  window.debugGameState = debugGameState;
  window.debugTriggerEncounter = debugTriggerEncounter;
  window.debugTriggerImmediateEffects = debugTriggerImmediateEffects;
}