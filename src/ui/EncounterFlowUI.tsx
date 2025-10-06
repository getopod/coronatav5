import React, { useState, useEffect } from 'react';
import { GameState } from '../engine/types';
import { EncounterFlowManager } from '../engine/encounterFlow';
// Removed unused imports: TradeScreen, WanderScreen, registry
import './EncounterFlowUI.css';

interface EncounterFlowUIProps {
  gameState: GameState;
  engine: any;
  onFlowComplete: () => void;
  onPhaseChange?: (phase: string) => void;
}

interface ActivityUIState {
  phase: 'trade' | 'wander' | 'fortune-swap' | 'complete';
  data: any;
  loading: boolean;
  error: string | null;
}

export const EncounterFlowUI: React.FC<EncounterFlowUIProps> = ({ 
  gameState, 
  engine, 
  onFlowComplete, 
  onPhaseChange
}) => {
  const [activityState, setActivityState] = useState<ActivityUIState>({
    phase: 'complete',
    data: null,
    loading: false,
    error: null
  });

  const encounterFlow = gameState.run?.encounterFlow;

  useEffect(() => {
    if (encounterFlow?.currentActivity && encounterFlow.phase !== 'complete') {
      setActivityState({
        phase: encounterFlow.currentActivity.type,
        data: encounterFlow.currentActivity.data,
        loading: false,
        error: null
      });
      if (typeof onPhaseChange === 'function') {
        onPhaseChange(encounterFlow.currentActivity.type);
      }
    } else if (encounterFlow?.phase === 'complete') {
      onFlowComplete();
      if (typeof onPhaseChange === 'function') {
        onPhaseChange('complete');
      }
    }
  }, [encounterFlow, onFlowComplete, onPhaseChange]);

  const completeCurrentActivity = (results: any) => {
    // Create new flow manager instance and complete activity
    const flowManager = new EncounterFlowManager(gameState);
    
    // Complete the current activity
    flowManager.completeCurrentActivity(results);
    
    // Update game state
    const updatedState = flowManager.getUpdatedGameState();
    const newFlowState = flowManager.getFlowState();
    
    // Update engine state
    engine.state = {
      ...updatedState,
      run: {
        ...updatedState.run,
        encounterFlow: {
          active: !flowManager.isFlowComplete(),
          phase: newFlowState.phase,
          currentActivity: newFlowState.currentActivity,
          queuedActivities: newFlowState.queuedActivities,
          completedActivities: newFlowState.completedActivities
        }
      }
    };

    // Emit state change for React updates
    engine.emitEvent('stateChange', engine.state);
  };

  if (!encounterFlow || encounterFlow.phase === 'complete' || encounterFlow.phase === 'encounter') {
    return null;
  }

  return (
    <div className="encounter-flow-ui">
      {activityState.phase === 'fortune-swap' && (
        <FortuneSwapActivity 
          data={activityState.data}
          onComplete={completeCurrentActivity}
        />
      )}
      {/* TradeScreen and WanderScreen overlays are now handled by GameScreen */}
    </div>
  );
};

// Fortune Swap Activity Component
const FortuneSwapActivity: React.FC<{ data: any; onComplete: (results: any) => void }> = ({ 
  data, 
  onComplete 
}) => {
  const [selectedFortune, setSelectedFortune] = useState<string>('');

  const handleSwap = () => {
    if (!selectedFortune) return;
    
    onComplete({
      selectedFortune,
      oldFortune: data.currentFortune
    });
  };

  return (
    <div className="fortune-swap-activity">
      <div className="fortune-header">
        <h3>🔮 Fortune Swap Required</h3>
        <p>Current Fortune: {data.currentFortune}</p>
        <p>Choose a new fortune:</p>
      </div>

      <div className="fortune-options">
        {data.options.map((fortune: any) => (
          <button 
            key={fortune.id} 
            className={`fortune-option ${selectedFortune === fortune.id ? 'selected' : ''}`}
            onClick={() => setSelectedFortune(fortune.id)}
          >
            <h4>{fortune.label}</h4>
            <p>{fortune.description}</p>
          </button>
        ))}
      </div>

      <div className="fortune-actions">
        <button 
          onClick={handleSwap}
          disabled={!selectedFortune}
          className="swap-btn"
        >
          Swap Fortune
        </button>
      </div>
    </div>
  );
};