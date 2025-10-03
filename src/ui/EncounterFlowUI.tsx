import React, { useState, useEffect } from 'react';
import { GameState } from '../engine/types';
import TradeScreen from './TradeScreen';
import WanderScreen from './WanderScreen';
import { registry } from '../registry/index';
import './EncounterFlowUI.css';

interface EncounterFlowUIProps {
  gameState: GameState;
  engine: any;
  onFlowComplete: () => void;
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
  onFlowComplete 
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
    } else if (encounterFlow?.phase === 'complete') {
      onFlowComplete();
    }
  }, [encounterFlow, onFlowComplete]);

  const completeCurrentActivity = (results: any) => {
    // Create new flow manager instance and complete activity
    const { EncounterFlowManager } = require('../engine/encounterFlow');
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
      {activityState.phase === 'trade' && (
        <TradeScreen
          onBack={() => completeCurrentActivity({ skipped: true })}
          onPurchase={(item, cost) => {
            // Update game state with purchase
            const purchases = [{ item, cost }];
            completeCurrentActivity({ purchases });
          }}
          onSell={(item, value) => {
            // Update game state with sale
            const sales = [{ item, value }];
            completeCurrentActivity({ sales });
          }}
          onBlessingApplication={(blessingId, cardId) => {
            // Handle blessing application
            console.log('Applying blessing', blessingId, 'to card', cardId);
          }}
          playerCoin={gameState.player?.coins || 0}
          equippedExploits={gameState.player?.exploits?.map(id => 
            registry.exploit?.find((e: any) => e.id === id)).filter((item): item is any => item !== undefined) || []}
          gameState={gameState}
        />
      )}
      
      {activityState.phase === 'wander' && (
        <WanderScreen 
          onChoiceMade={(wanderId, choice, outcome) => {
            completeCurrentActivity({ 
              choice,
              wanderId,
              outcome 
            });
          }}
          onBack={() => {
            setActivityState(prev => ({
              ...prev,
              phase: 'complete'
            }));
          }}
        />
      )}
      
      {activityState.phase === 'fortune-swap' && (
        <FortuneSwapActivity 
          data={activityState.data}
          onComplete={completeCurrentActivity}
        />
      )}

      {/* Activity Queue Display */}
      {encounterFlow.queuedActivities.length > 0 && (
        <div className="activity-queue">
          <h4>Upcoming Activities:</h4>
          <div className="queue-items">
            {encounterFlow.queuedActivities.map((activity: any) => {
              const getActivityIcon = (type: string) => {
                if (type === 'trade') return '💰';
                if (type === 'wander') return '🚶';
                return '🔮';
              };
              
              return (
                <span key={activity.id} className={`queue-item ${activity.type}`}>
                  {getActivityIcon(activity.type)}
                  {activity.type}
                </span>
              );
            })}
          </div>
        </div>
      )}
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