// Extend window type for engine
declare global {
  interface Window {
    engine: any;
  }
}

import React from 'react';
import './DebugPanel.css';

// DebugPanel subcomponent for GameScreen
interface DebugPanelProps {
  showRegistryLog: boolean;
  setShowRegistryLog: (show: boolean) => void;
  registryEffectLog: any[];
  selectedBlessingForCard: string;
  setSelectedBlessingForCard: (id: string) => void;
  selectedCardForBlessing: string;
  setSelectedCardForBlessing: (id: string) => void;
  handleApplyBlessingToCard: () => void;
  handleJumpToScreen: (screen: string) => void;
  handleJumpToEncounter: (trial: number, encounter: number) => void;
  currentScreen: string;
  gameState: any;
  registry: any;
  onClose: () => void;
}


const DebugPanel: React.FC<DebugPanelProps> = ({
  showRegistryLog,
  setShowRegistryLog,
  registryEffectLog,
  selectedBlessingForCard,
  setSelectedBlessingForCard,
  selectedCardForBlessing,
  setSelectedCardForBlessing,
  handleApplyBlessingToCard,
  handleJumpToScreen,
  handleJumpToEncounter,
  currentScreen,
  gameState,
  registry,
  onClose
}) => {
  // Local state for new debug features
  const [pointValue, setPointValue] = React.useState(0);
  // For gridlines toggle
  const [gridlinesOn, setGridlinesOn] = React.useState(false);

  // New debug states for registry actions
  const [selectedExploit, setSelectedExploit] = React.useState('');
  const [selectedCurse, setSelectedCurse] = React.useState('');
  const [selectedFortune, setSelectedFortune] = React.useState('');
  const [coinAmount, setCoinAmount] = React.useState(0);
  const [restartValidation, setRestartValidation] = React.useState('');

  // Handler: Gain points
  const handleGainPoints = () => {
    if (window.engine && typeof window.engine.gainPoints === 'function') {
      window.engine.gainPoints(pointValue);
    } else if (window.engine && window.engine.state && window.engine.state.player) {
      window.engine.state.player.score = (window.engine.state.player.score || 0) + pointValue;
      window.engine.emitEvent && window.engine.emitEvent('stateChange', window.engine.state);
    }
  };
  // Handler: Restart current encounter
  const handleRestartEncounter = () => {
    if (window.engine && typeof window.engine.restartEncounter === 'function') {
      window.engine.restartEncounter();
    } else if (window.engine && window.engine.state && window.engine.state.run) {
      // Naive reset: just re-emit stateChange
      window.engine.emitEvent && window.engine.emitEvent('stateChange', window.engine.state);
    }
  };
  // Handler: Skip to next encounter
  const handleSkipEncounter = () => {
    if (window.engine && typeof window.engine.skipToNextEncounter === 'function') {
      window.engine.skipToNextEncounter();
    } else if (window.engine && window.engine.state && window.engine.state.run) {
      // Naive: increment encounter and emit
      window.engine.state.run.currentEncounter = (window.engine.state.run.currentEncounter || 0) + 1;
      window.engine.emitEvent && window.engine.emitEvent('stateChange', window.engine.state);
    }
  };
  // Handler: Toggle gridlines
  const handleToggleGridlines = () => {
    setGridlinesOn(g => {
      const newVal = !g;
      document.body.classList.toggle('show-gridlines', newVal);
      return newVal;
    });
  };

  // Handler: Gain Exploit
  const handleGainExploit = () => {
    if (!selectedExploit) return;
    if (window.engine && window.engine.state && window.engine.state.player) {
      const exploits = window.engine.state.player.exploits || [];
      if (!exploits.includes(selectedExploit)) {
        window.engine.state.player.exploits = [...exploits, selectedExploit];
        window.engine.emitEvent && window.engine.emitEvent('stateChange', window.engine.state);
      }
    }
    setSelectedExploit('');
  };

  // Handler: Gain Curse
  const handleGainCurse = () => {
    if (!selectedCurse) return;
    if (window.engine && window.engine.state && window.engine.state.player) {
      const curses = window.engine.state.player.curses || [];
      if (!curses.includes(selectedCurse)) {
        window.engine.state.player.curses = [...curses, selectedCurse];
        window.engine.emitEvent && window.engine.emitEvent('stateChange', window.engine.state);
      }
    }
    setSelectedCurse('');
  };

  // Handler: Gain Fortune
  const handleGainFortune = () => {
    if (!selectedFortune) return;
    if (window.engine && window.engine.state && window.engine.state.player) {
      const fortunes = window.engine.state.player.fortunes || [];
      if (!fortunes.includes(selectedFortune)) {
        window.engine.state.player.fortunes = [...fortunes, selectedFortune];
        window.engine.emitEvent && window.engine.emitEvent('stateChange', window.engine.state);
      }
    }
    setSelectedFortune('');
  };

  // Handler: Gain Coins
  const handleGainCoins = () => {
    if (!coinAmount) return;
    if (window.engine && window.engine.state && window.engine.state.player) {
      window.engine.state.player.coins = (window.engine.state.player.coins || 0) + coinAmount;
      window.engine.emitEvent && window.engine.emitEvent('stateChange', window.engine.state);
    }
    setCoinAmount(0);
  };

  // Handler: Restart Encounter with Validation
  const handleRestartEncounterValidated = () => {
    if (restartValidation.trim().toLowerCase() === 'restart') {
      handleRestartEncounter();
      setRestartValidation('');
    } else {
      alert('Type "restart" to confirm.');
    }
  };

  return (
    <div className="debug-panel compact-debug-panel">
      <div className="debug-panel-modal">
        <button
          className="debug-panel-close-btn"
          aria-label="Close debug panel"
          onClick={onClose}
          tabIndex={0}
        >
          ×
        </button>
        <h3>Debug Panel</h3>
  {/* New debug controls */}
  <div className="debug-section compact-section">
          <h4>Quick Actions</h4>
          <div className="quick-actions-row compact-row">
            <input
              type="number"
              min={-9999}
              max={9999}
              value={pointValue}
              onChange={e => setPointValue(Number(e.target.value))}
              title="Point Value"
              className="compact-input compact-width-60"
            />
            <button className="compact-btn compact-btn-narrow" onClick={handleGainPoints}>Gain</button>
            <button className="compact-btn compact-btn-narrow" onClick={handleRestartEncounter}>Restart</button>
            <button className="compact-btn compact-btn-narrow" onClick={handleSkipEncounter}>Skip</button>
            <button className="compact-btn compact-btn-narrow" onClick={handleToggleGridlines}>{gridlinesOn ? 'Grid Off' : 'Grid On'}</button>
          </div>
        </div>

        {/* Gain Exploit */}
  <div className="debug-section compact-section">
          <h4>Gain Exploit</h4>
          <div className="quick-actions-row compact-row">
            <select value={selectedExploit} onChange={e => setSelectedExploit(e.target.value)} title="Select Exploit" className="compact-select compact-width-110">
              <option value="">Exploit</option>
              {(registry.exploit || []).map((exploit: any) => (
                <option key={exploit.id} value={exploit.id}>{exploit.label}</option>
              ))}
            </select>
            <button className="compact-btn compact-btn-narrow" onClick={handleGainExploit} disabled={!selectedExploit}>Gain</button>
          </div>
        </div>

        {/* Gain Curse */}
  <div className="debug-section compact-section">
          <h4>Gain Curse</h4>
          <div className="quick-actions-row compact-row">
            <select value={selectedCurse} onChange={e => setSelectedCurse(e.target.value)} title="Select Curse" className="compact-select compact-width-110">
              <option value="">Curse</option>
              {(registry.curse || []).map((curse: any) => (
                <option key={curse.id} value={curse.id}>{curse.label}</option>
              ))}
            </select>
            <button className="compact-btn compact-btn-narrow" onClick={handleGainCurse} disabled={!selectedCurse}>Gain</button>
          </div>
        </div>

        {/* Gain Fortune */}
  <div className="debug-section compact-section">
          <h4>Gain Fortune</h4>
          <div className="quick-actions-row compact-row">
            <select value={selectedFortune} onChange={e => setSelectedFortune(e.target.value)} title="Select Fortune" className="compact-select compact-width-110">
              <option value="">Fortune</option>
              {(registry.fortune || []).map((fortune: any) => (
                <option key={fortune.id} value={fortune.id}>{fortune.label}</option>
              ))}
            </select>
            <button className="compact-btn compact-btn-narrow" onClick={handleGainFortune} disabled={!selectedFortune}>Gain</button>
          </div>
        </div>

        {/* Gain Coins */}
  <div className="debug-section compact-section">
          <h4>Gain Coins</h4>
          <div className="quick-actions-row compact-row">
            <input
              type="number"
              min={-9999}
              max={9999}
              value={coinAmount}
              onChange={e => setCoinAmount(Number(e.target.value))}
              title="Coin Amount"
              className="compact-input compact-width-60"
            />
            <button className="compact-btn compact-btn-narrow" onClick={handleGainCoins} disabled={!coinAmount}>Gain</button>
          </div>
        </div>

        {/* Restart Encounter with Validation */}
  <div className="debug-section compact-section">
          <h4>Restart Encounter (Validation)</h4>
          <div className="quick-actions-row compact-row">
            <input
              type="text"
              value={restartValidation}
              onChange={e => setRestartValidation(e.target.value)}
              placeholder="Type 'restart' to confirm"
              title="Type 'restart' to confirm"
              className="compact-input compact-width-90"
            />
            <button className="compact-btn compact-btn-narrow" onClick={handleRestartEncounterValidated} disabled={restartValidation.trim().toLowerCase() !== 'restart'}>
              Confirm
            </button>
          </div>

        {/* Simple Icon Glossary */}
        <div className="debug-section compact-section glossary-section">
          <h4 className="glossary-title">Icon Glossary</h4>
          <div className="glossary-list">
            <span title="Score">⭐ score</span>
            <span title="Coins">🪙 coins</span>
            <span title="Reveal">👁️ reveal</span>
            <span title="Draw">🎴 draw</span>
            <span title="Tableau">📋 tableau</span>
            <span title="Foundation">🏛️ foundation</span>
            <span title="Hand">✋ hand</span>
            <span title="Block">⛔ block</span>
            <span title="Blessing">✨ blessing</span>
            <span title="Curse">🩸 curse</span>
            <span title="Shuffle">🔄 shuffle</span>
            <span title="Discard">🗑️ discard</span>
            <span title="Health">💚 health</span>
            <span title="Damage">💥 damage</span>
            <span title="Unlock">🔓 unlock</span>
            <span title="Wild">🃏 wild</span>
          </div>
        </div>
        </div>
        {/* Blessing Application */}
        <div className="debug-section">
          <h4>Apply Blessing to Card</h4>
          <div className="blessing-select-row">
            <select
              value={selectedBlessingForCard}
              onChange={(e) => setSelectedBlessingForCard(e.target.value)}
              title="Select Blessing"
            >
              <option value="">Select Blessing</option>
              {Object.values(registry.blessing || {}).flat().map((blessing: any) => (
                <option key={blessing.id} value={blessing.id}>
                  {blessing.label}
                </option>
              ))}
            </select>
            <select
              value={selectedCardForBlessing}
              onChange={(e) => setSelectedCardForBlessing(e.target.value)}
              title="Select Card"
            >
              <option value="">Select Card</option>
              {Object.values(gameState.piles || {}).flatMap((pile: any) =>
                pile.cards?.map((card: any) => (
                  <option key={card.id} value={card.id}>
                    {card.id} ({pile.id})
                  </option>
                )) || []
              )}
            </select>
          </div>
          <button
            className="apply-blessing-btn"
            onClick={handleApplyBlessingToCard}
            disabled={!selectedBlessingForCard || !selectedCardForBlessing}
          >
            Apply Blessing
          </button>
        </div>
        {/* Jump to Screen */}
        <div className="debug-section">
          <h4>Jump to Screen</h4>
          <div className="screen-btn-row">
            {['game', 'trade', 'wander', 'fortune-swap'].map(screen => (
              <button
                key={screen}
                className="screen-btn"
                onClick={() => handleJumpToScreen(screen)}
              >
                {screen.charAt(0).toUpperCase() + screen.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Jump to Encounter */}
        <div className="debug-section">
          <h4>Jump to Encounter</h4>
          <div className="encounter-jump-row">
            <span>Trial:</span>
            <input
              type="number"
              min="1"
              max="5"
              defaultValue="1"
              id="debug-trial-input"
              title="Trial Number"
              placeholder="Trial"
            />
            <span>Encounter:</span>
            <input
              type="number"
              min="1"
              max="3"
              defaultValue="1"
              id="debug-encounter-input"
              title="Encounter Number"
              placeholder="Encounter"
            />
            <button
              className="jump-btn"
              onClick={() => {
                const trial = parseInt((document.getElementById('debug-trial-input') as HTMLInputElement)?.value || '1');
                const encounter = parseInt((document.getElementById('debug-encounter-input') as HTMLInputElement)?.value || '1');
                handleJumpToEncounter(trial, encounter);
              }}
            >
              Jump
            </button>
          </div>
        </div>
        {/* Registry Effect Logging */}
        <div className="debug-section">
          <h4>Registry Effect Log</h4>
          <button
            className={"log-toggle-btn" + (showRegistryLog ? " active" : "")}
            onClick={() => setShowRegistryLog(!showRegistryLog)}
          >
            {showRegistryLog ? 'Stop Logging' : 'Start Logging'}
          </button>
          {showRegistryLog && registryEffectLog.length > 0 && (
            <div className="registry-log">
              {registryEffectLog.slice(-10).map((entry, idx) => (
                <div key={idx} className="registry-log-entry">
                  <div className="registry-log-timestamp"><strong>{entry.timestamp.split('T')[1].split('.')[0]}</strong> - {entry.type}</div>
                  <div className="registry-log-effect">
                    {entry.effect} → {entry.payload?.cardId || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Current Game State */}
        <div className="debug-section">
          <h4>Current State</h4>
          <div className="state-info">
            <div>Screen: {currentScreen}</div>
            <div>Score: {gameState.player?.score || 0}</div>
            <div>Coins: {gameState.player?.coins || 0}</div>
            <div>Trial: {gameState.run?.currentTrial || 0}</div>
            <div>Encounter: {gameState.run?.currentEncounter || 0}</div>
            <div>Encounter Type: {gameState.run?.encounter?.type || 'N/A'}</div>
            {/* Show encounter name and effect/description if available */}
            {gameState.run?.encounter?.name && (
              <div>Fear/Danger Name: <strong>{gameState.run.encounter.name}</strong></div>
            )}
            {gameState.run?.encounter?.description && (
              <div>Effect: <em>{gameState.run.encounter.description}</em></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main GameScreen imports ---
import { registry } from '../registry/index';
import { useEngineEvent } from './EngineEventProvider';
import { Card } from './Card';
import { getMovableStack } from '../engine/moveLogic';
import { PlayerHUD } from './PlayerHUD';
import TradeScreen from './TradeScreen';
import WanderScreen from './WanderScreen';
import FortuneSwapActivity from './FortuneSwapActivity';
import { endGameSession } from '../engine/persistenceManager';
import { EncounterFlowManager } from '../engine/encounterFlow';
import { EncounterFlowUI } from './EncounterFlowUI';
import './GameScreen.css';

// Helper to safely get piles as an array of any
const getPiles = (piles: any): any[] => Array.isArray(piles) ? piles : Object.values(piles || {});

interface GameScreenProps {
  onNavigateToWelcome?: () => void;
  selectedFortune?: any;
}





export function GameScreen({ onNavigateToWelcome, selectedFortune }: GameScreenProps = {}) {
  // Highlighted destinations for card moves
  const [highlightedDestinations, setHighlightedDestinations] = React.useState<string[]>([]);
  // Zoom level for floating zoom window
  const [zoomLevel, setZoomLevel] = React.useState(100);
  // Tableau row height (default value, can be adjusted as needed)
  const tableauRowHeight = 120;
  // isCoronata mode (assume true for now, or derive from gameState if available)
  const isCoronata = true;
  // Resign modal and run recap modal
  const [showResignModal, setShowResignModal] = React.useState(false);
  const [showRunRecap, setShowRunRecap] = React.useState(false);

  // --- Hooks: always call at the top, unconditionally ---
  const ctx = useEngineEvent();
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = React.useState<string | null>(null);
  const [dragOverPileId, setDragOverPileId] = React.useState<string | null>(null);
  const [shakeCardId, setShakeCardId] = React.useState<string | null>(null);
  // DebugPanel state
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  const [showRegistryLog, setShowRegistryLog] = React.useState(false);
  // Registry effect log (read-only for now)
  const [registryEffectLog] = React.useState<any[]>([]);
  const [selectedBlessingForCard, setSelectedBlessingForCard] = React.useState('');
  const [selectedCardForBlessing, setSelectedCardForBlessing] = React.useState('');

  // Game state and registry
  // These should be available from engine or context
  // Engine instance (assume available globally or via context)
  // @ts-ignore
  const engine = window.engine || (window as any).engine;
  // Provide robust defaults to prevent undefined errors in PlayerHUD
  const gameState = {
    player: {
      exploits: [],
      curses: [],
      fortunes: [],
      score: 0,
      coins: 0,
      // ...add any other expected player fields
      ...(engine?.state?.player || {})
    },
    run: {
      currentTrial: 0,
      currentEncounter: 0,
      encounter: {},
      encounterFlow: {},
      // ...add any other expected run fields
      ...(engine?.state?.run || {})
    },
    piles: {},
    registry: {},
    history: [],
    meta: {},
    ...(engine?.state || {})
  };
  // Ref for shake animation timeout
  const shakeTimeoutRef = React.useRef<any>(null);
  // registry is imported at the top
  // currentScreen: needs to be defined and managed
  const [currentScreen, setCurrentScreen] = React.useState('game');
  // Track if PlayerHUD should be expanded (for overlays)
  const [hudExpanded, setHudExpanded] = React.useState(false);
  // Handler for EncounterFlowUI phase changes
  const handleEncounterPhaseChange = React.useCallback((phase: string) => {
    if (phase === 'trade') {
      setCurrentScreen('trade');
      setHudExpanded(true);
    } else if (phase === 'wander') {
      setCurrentScreen('wander');
      setHudExpanded(true);
    } else if (phase === 'fortune-swap') {
      setCurrentScreen('fortune-swap');
      setHudExpanded(true);
    } else {
      setCurrentScreen('game');
      setHudExpanded(false);
    }
  }, []);

  // Handlers for DebugPanel
  const handleApplyBlessingToCard = React.useCallback(() => {
    if (!selectedBlessingForCard || !selectedCardForBlessing) return;
    // Use the blessing application logic from the main component
    // (Assume handleBlessingApplication is defined below)
    handleBlessingApplication(selectedBlessingForCard, selectedCardForBlessing);
    setSelectedBlessingForCard('');
    setSelectedCardForBlessing('');
  }, [selectedBlessingForCard, selectedCardForBlessing]);

  const handleJumpToScreen = React.useCallback((screen: string) => {
    setCurrentScreen(screen);
  }, []);

  const handleJumpToEncounter = React.useCallback((trial: number, encounter: number) => {
    // Use EncounterFlowManager or similar logic to jump to a specific encounter
    // For now, just log and set currentScreen to 'game'
    // TODO: Implement actual jump logic if needed
    console.log('Jump to trial', trial, 'encounter', encounter);
    setCurrentScreen('game');
  }, []);

  // (removed duplicate early return; main UI will render below)
// (removed stray code that was outside of any function)

  // Responsive scaling effect
  React.useEffect(() => {
    const handleResize = () => {
      const gameScreen = document.querySelector('.game-screen-root') as HTMLElement;
      if (!gameScreen) return;

      const minWidth = 266; // Minimum width to show all cards
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Calculate scale factor to fit content while respecting minimum width
      let scaleX = viewportWidth / minWidth;
      let scaleY = viewportHeight / 600; // Approximate game height
      let scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
      // Ensure we don't go below minimum width
      if (viewportWidth < minWidth) {
        scale = viewportWidth / minWidth;
      }
      // Apply scaling
      if (scale < 1) {
        gameScreen.style.transform = `translate(-50%, -50%) scale(${scale})`;
        gameScreen.style.transformOrigin = 'center center';
      } else {
        gameScreen.style.transform = 'translate(-50%, -50%)';
      }
    };
    // Initial resize
    handleResize();
    // Add resize listener
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only render fallback UI after all hooks have been called
  if (!ctx) return <div>No engine context</div>;

  // --- State hooks ---

  // --- Registry-driven effect HUD ---
  // Get only truly active effects from game state (equipped exploits, active fears/dangers, etc.)
  // const activeEffects: any[] = React.useMemo(() => {
  //   const effects: any[] = [];
  //   const player = gameState.player || {};
  //   const encounter = gameState.run?.encounter || {} as any;
  //   // Get effects from equipped exploits
  //   if (player.exploits && Array.isArray(player.exploits)) {
  //     player.exploits.forEach((exploitId: string) => {
  //       const exploit = registry.exploit.find((e: any) => e.id === exploitId);
  //       if (exploit && exploit.effects) {
  //         exploit.effects.forEach((eff: any) => {
  //           effects.push({
  //             ...eff,
  //             label: exploit.label,
  //             description: exploit.description,
  //             type: exploit.type,
  //             id: exploit.id,
  //             source: 'exploit'
  //           });
  //         });
  //       }
  //     });
  //   }
  //   // Get effects from active fear/danger
  //   if (encounter.fear) {
  //     const fear = registry.fear.find((f: any) => f.id === encounter.fear);
  //     if (fear && fear.effects) {
  //       fear.effects.forEach((eff: any) => {
  //         effects.push({
  //           ...eff,
  //           label: fear.label,
  //           description: fear.description,
  //           type: fear.type,
  //           id: fear.id,
  //           source: 'fear'
  //         });
  //       });
  //     }
  //   }
  //   if (encounter.danger) {
  //     const danger = registry.danger.find((d: any) => d.id === encounter.danger);
  //     if (danger && danger.effects) {
  //       danger.effects.forEach((eff: any) => {
  //         effects.push({
  //           ...eff,
  //           label: danger.label,
  //           description: danger.description,
  //           type: danger.type,
  //           id: danger.id,
  //           source: 'danger'
  //         });
  //       });
  //     }
  //   }
  //   // Get effects from active curses
  //   if (player.curses && Array.isArray(player.curses)) {
  //     player.curses.forEach((curseId: string) => {
  //       const curse = registry.curse.find((c: any) => c.id === curseId);
  //       if (curse && curse.effects) {
  //         curse.effects.forEach((eff: any) => {
  //           effects.push({
  //             ...eff,
  //             label: curse.label,
  //             description: curse.description,
  //             type: curse.type,
  //             id: curse.id,
  //             source: 'curse'
  //           });
  //         });
  //       }
  //     });
  //   }
  //   return effects;
  // }, [gameState]);

  
  // Choice screen states


  
  // Function to trigger shake animation for invalid moves
  // Helper function to check if a move actually succeeded despite exceptions


  const triggerShake = (cardId: string) => {
    // Only shake if the card is present in the UI (visible in any pile)
    const cardIsVisible = Object.values(gameState.piles || {}).some((pile: any) =>
      Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
    );
    if (!cardIsVisible) return;

    // Prevent overlapping shakes by clearing any existing timeout
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = null;
    }
    setShakeCardId(cardId);
    shakeTimeoutRef.current = setTimeout(() => {
      setShakeCardId(null);
      shakeTimeoutRef.current = null;
    }, 600);
  };

  // Handle trade screen actions
  const handleTradeBack = () => {
    // Check if we're in an encounter flow context
    if (gameState.run?.encounterFlow?.active) {
      // Use EncounterFlowManager to progress to next activity
      const flowManager = new EncounterFlowManager(gameState);

      // Complete the current trade activity
      flowManager.completeCurrentActivity({ skipped: true });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        let updatedState = flowManager.onFlowComplete();
        // Immediately process pending encounter reset
        if (engine.scoringSystem && typeof engine.scoringSystem.updateEncounterProgress === 'function') {
          updatedState = engine.scoringSystem.updateEncounterProgress(updatedState);
        }
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
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
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    } else {
      // Fallback to legacy behavior
      setCurrentScreen('choice');
    }
  };

  const handleTradePurchase = (item: any, cost: number) => {
    console.log('Purchased item:', item, 'for', cost, 'coins');
    
    // Check if player has enough coins
    const currentCoins = gameState.player?.coins || 0;
    if (currentCoins < cost) {
      console.warn('Not enough coins for purchase:', { required: cost, available: currentCoins });
      return;
    }
    
    // Apply purchase effects through the engine's effect system
    const purchaseEffects = [
      { type: 'award_coin', value: -cost }, // Deduct coins
      { type: 'add_item', target: item.type, value: item.id } // Add item to inventory
    ];
    
    // Apply item's own effects if it has any
    if (item.effects && Array.isArray(item.effects)) {
      purchaseEffects.push(...item.effects);
    }
    
    // Use engine to apply all effects properly
    engine.state = engine.effectEngine.applyEffects(purchaseEffects, engine.state);
    
    // Emit events for UI updates
    engine.emitEvent('stateChange', engine.state);
    engine.emitEvent('trade_purchase', { item: item.id, cost, newCoinBalance: engine.state.player.coins });
    
    console.log('Purchase completed:', { item: item.id, newCoinBalance: engine.state.player.coins });
  };

  const handleBlessingApplication = (blessingId: string, cardId: string) => {
    console.log('Applying blessing to card:', { blessingId, cardId });
    
    // Find the card in the appropriate pile
    let targetCard = null;
    let targetPile = null;
    
    // Check draw pile
    if (gameState.piles.draw.cards.some((card: any) => card.id === cardId)) {
      targetCard = gameState.piles.draw.cards.find((card: any) => card.id === cardId);
      targetPile = 'draw';
    }
    // Check discard pile
    else if (gameState.piles.discard.cards.some((card: any) => card.id === cardId)) {
      targetCard = gameState.piles.discard.cards.find((card: any) => card.id === cardId);
      targetPile = 'discard';
    }
    // Check hand
    else if (gameState.piles.hand.cards.some((card: any) => card.id === cardId)) {
      targetCard = gameState.piles.hand.cards.find((card: any) => card.id === cardId);
      targetPile = 'hand';
    }
    
    if (!targetCard || !targetPile) {
      console.error('Card not found for blessing application:', cardId);
      return;
    }
    
    // Apply blessing to card through engine
    const blessingEffect = {
      type: 'apply_blessing_to_card',
      target: cardId,
      value: blessingId
    };
    
    engine.state = engine.effectEngine.applyEffects([blessingEffect], engine.state);
    
    // Emit events for UI updates
    engine.emitEvent('stateChange', engine.state);
    engine.emitEvent('blessing_applied', { blessingId, cardId, pile: targetPile });
    
    console.log('Blessing application completed:', { blessingId, cardId, pile: targetPile });
  };

  const handleTradeSell = (item: any, value: number) => {
    console.log('Sold item:', item, 'for', value, 'coins');
    
    // Apply sale effects through the engine's effect system
    const saleEffects = [
      { type: 'award_coin', value: value }, // Add coins
      { type: 'remove_item', target: item.type, value: item.id } // Remove item from inventory
    ];
    
    // Apply any negative effects from losing the item
    if (item.effects && Array.isArray(item.effects)) {
      // Create inverse effects for item removal
      const inverseEffects = item.effects.map((effect: any) => ({
        ...effect,
        value: effect.value ? -effect.value : effect.value
      }));
      saleEffects.push(...inverseEffects);
    }
    
    // Use engine to apply all effects properly
    engine.state = engine.effectEngine.applyEffects(saleEffects, engine.state);
    
    // Emit events for UI updates
    engine.emitEvent('stateChange', engine.state);
    engine.emitEvent('trade_sale', { item: item.id, value, newCoinBalance: engine.state.player.coins });
    
    console.log('Sale completed:', { item: item.id, newCoinBalance: engine.state.player.coins });
  };

  // Handle wander screen actions
  const handleWanderBack = () => {
    // Check if we're in an encounter flow context
    if (gameState.run?.encounterFlow?.active) {
      // Use EncounterFlowManager to progress to next activity
      const flowManager = new EncounterFlowManager(gameState);

      // Complete the current wander activity
      flowManager.completeCurrentActivity({ skipped: true });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        let updatedState = flowManager.onFlowComplete();
        if (engine.scoringSystem && typeof engine.scoringSystem.updateEncounterProgress === 'function') {
          updatedState = engine.scoringSystem.updateEncounterProgress(updatedState);
        }
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
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
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'trade') {
          setCurrentScreen('trade');
        } else if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    } else {
      // Fallback to legacy behavior
      setCurrentScreen('choice');
    }
  };

  const handleWanderChoice = (wanderId: string, choice: string, outcome: string) => {
    console.log('Wander choice made:', { wanderId, choice, outcome });

    // Use EncounterFlowManager to progress to next activity (mirroring handleWanderBack)
    if (gameState.run?.encounterFlow?.active) {
      const flowManager = new EncounterFlowManager(gameState);
      // Complete the current wander activity, passing choice/outcome as payload
      flowManager.completeCurrentActivity({ wanderId, choice, outcome });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        let updatedState = flowManager.onFlowComplete();
        if (engine.scoringSystem && typeof engine.scoringSystem.updateEncounterProgress === 'function') {
          updatedState = engine.scoringSystem.updateEncounterProgress(updatedState);
        }
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
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
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'trade') {
          setCurrentScreen('trade');
        } else if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    } else {
      // Fallback to legacy behavior (apply effects directly)
      // --- original effect application logic here ---
      // Create a copy of the current state to modify
      const newState = { ...engine.state };
      // Find the wander in the registry to get its effects
      const wander = registry.wander?.find(w => w.id === wanderId);
      if (!wander) {
        console.warn('Wander not found in registry:', wanderId);
        return;
      }
      // Get the effects for the chosen outcome
      let wanderEffects: any[] = [];
      if (wander.effects && Array.isArray(wander.effects)) {
        wanderEffects = wander.effects.filter((effect: any) =>
          !effect.condition || effect.condition.choice === choice
        );
      }
      if (wanderEffects.length === 0 && wander.results && wander.results[choice]) {
        const result = wander.results[choice];
        if (result.includes('coin')) {
          const coinMatch = result.match(/(\+|-)?(\d+)\s*coin/i);
          if (coinMatch) {
            const value = parseInt(coinMatch[2]) * (coinMatch[1] === '-' ? -1 : 1);
            wanderEffects.push({ type: 'award_coin', value });
          }
        }
      }
      if (wanderEffects.length > 0) {
        engine.state = engine.effectEngine.applyEffects(wanderEffects, engine.state);
      }
      engine.emitEvent('stateChange', engine.state);
      engine.emitEvent('wander_complete', { wanderId, choice, outcome, effects: wanderEffects });
      console.log('Wander completed:', { wanderId, choice, effects: wanderEffects });
      if (outcome.includes('Gain') && outcome.includes('Coin')) {
        const coinMatch = outcome.match(/(\d+)\s*Coin/i);
        if (coinMatch) {
          const coinAmount = parseInt(coinMatch[1]);
          newState.player.coins = (newState.player.coins || 0) + coinAmount;
          console.log(`Applied wander effect: +${coinAmount} coins`);
        }
      }
      if (outcome.includes('lose') && outcome.includes('Coin')) {
        const coinMatch = outcome.match(/lose.*?(\d+)\s*Coin/i) || outcome.match(/(\d+)\s*Coin.*?lose/i);
        if (coinMatch) {
          const coinAmount = parseInt(coinMatch[1]);
          newState.player.coins = Math.max(0, (newState.player.coins || 0) - coinAmount);
          console.log(`Applied wander effect: -${coinAmount} coins`);
        }
      }
      if (outcome.includes('all of your Coin')) {
        newState.player.coins = 0;
        console.log('Applied wander effect: lost all coins');
      }
      if (outcome.includes('Gain a random Rare Exploit')) {
        console.log('Applied wander effect: would gain rare exploit (needs implementation)');
      }
      if (outcome.includes('Gain a random Curse')) {
        console.log('Applied wander effect: would gain curse (needs implementation)');
      }
      engine.state = newState;
      if (engine.scoringSystem) {
        const updatedState = engine.scoringSystem.updateEncounterProgress(newState);
        if (updatedState !== newState) {
          engine.state = updatedState;
          console.log('Wander choice triggered encounter progress update');
        }
      }
      engine.emitEvent('stateChange', engine.state);
      console.log('Wander effects applied, returning to game');
      setCurrentScreen('game');
    }
  };

  // Handle fortune swap screen actions
  const handleFortuneSwapBack = () => {
    // Check if we're in an encounter flow context
    if (gameState.run?.encounterFlow?.active) {
      // Use EncounterFlowManager to progress to next activity
      const flowManager = new EncounterFlowManager(gameState);

      // Complete the current fortune swap activity
      flowManager.completeCurrentActivity({ skipped: true });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        let updatedState = flowManager.onFlowComplete();
        if (engine.scoringSystem && typeof engine.scoringSystem.updateEncounterProgress === 'function') {
          updatedState = engine.scoringSystem.updateEncounterProgress(updatedState);
        }
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
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
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'trade') {
          setCurrentScreen('trade');
        } else if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    } else {
      // Fallback to legacy behavior
      setCurrentScreen('choice');
    }
  };

  const handleFortuneSwapSelection = (fortuneId: string) => {
    console.log('Fortune swap selected:', fortuneId);

    // Apply fortune swap through encounter flow manager
    if (gameState.run?.encounterFlow?.active) {
      const flowManager = new EncounterFlowManager(gameState);

      // Complete the fortune swap activity with the selected fortune
      flowManager.completeCurrentActivity({ selectedFortune: fortuneId });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        let updatedState = flowManager.onFlowComplete();
        if (engine.scoringSystem && typeof engine.scoringSystem.updateEncounterProgress === 'function') {
          updatedState = engine.scoringSystem.updateEncounterProgress(updatedState);
        }
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
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
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'trade') {
          setCurrentScreen('trade');
        } else if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    }

    console.log('Fortune swap completed, returning to game');
  };

  // Function to find all valid move destinations for a card

  // Card click handler (select/deselect or move if card selected)
  const handleCardClick = (cardId: string, pileId: string) => {
    console.log('=== CARD CLICK DEBUG ===');
    console.log('Card ID:', cardId);
    console.log('Pile ID:', pileId);
    console.log('Selected card ID:', selectedCardId);
    
    if (selectedCardId && selectedCardId !== cardId) {
      // Block moves to deck pile (stock)
      const targetPile = getPiles(gameState.piles).find((pile: any) => pile.id === pileId);
      if (targetPile && (targetPile.type === 'stock' || targetPile.type === 'deck')) {
        triggerShake(selectedCardId);
        return;
      }
      // Try to move selected card to this pile
      const fromPileId = getPiles(engine.state.piles).find((pile: any) =>
        Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === selectedCardId)
      )?.id;
      if (fromPileId) {
        try {
          console.log('GameScreen: Attempting move', { from: fromPileId, to: pileId, cardId: selectedCardId });
          engine.moveCard({ from: fromPileId, to: pileId, cardId: selectedCardId });
          setSelectedCardId(null);
          setHighlightedDestinations([]);
        } catch (e) {
          console.error('GameScreen: Move failed, triggering shake. Error:', e, { from: fromPileId, to: pileId, cardId: selectedCardId });
          triggerShake(selectedCardId);
          setSelectedCardId(null);
          setHighlightedDestinations([]);
        }
      }
    } else if (selectedCardId === cardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
    }
  };

  // Pile click handler (for moving selected card to empty pile)
  const handlePileClick = (pileId: string) => {
    if (selectedCardId) {
      // Block moves to deck pile (stock)
      const targetPile = getPiles(engine.state.piles).find((pile: any) => pile.id === pileId);
      if (targetPile && (targetPile.type === 'stock' || targetPile.type === 'deck')) {
        triggerShake(selectedCardId);
        return;
      }
      const fromPileId = getPiles(engine.state.piles).find((pile: any) => 
        Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === selectedCardId)
      )?.id;
      if (fromPileId) {
        try {
          console.log('GameScreen: Attempting pile move', { from: fromPileId, to: pileId, cardId: selectedCardId });
          engine.moveCard({ from: fromPileId, to: pileId, cardId: selectedCardId });
          setSelectedCardId(null);
        } catch (e) {
          console.error('GameScreen: Pile move failed, triggering shake. Error:', e, { from: fromPileId, to: pileId, cardId: selectedCardId });
          triggerShake(selectedCardId);
          setSelectedCardId(null); // Deselect card after failed move
        }
      }
    }
  };

  // Helper function to check if a card should be highlighted as part of a movable stack
  const isCardInMovableStack = (cardId: string, pileId: string): boolean => {
    if (!selectedCardId) return false;
    
    const pile = getPiles(gameState.piles).find((p: any) => p.id === pileId);
    if (!pile) return false;
    
    // Get the movable stack from the selected card
    const movableStack = getMovableStack(pile, selectedCardId);
    return movableStack.some((card: any) => card.id === cardId);
  };

  // Background click handler (deselect card when clicking empty areas)
  const handleBackgroundClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Only deselect if clicking directly on the background container,
    // not on any child elements (cards, piles, etc.)
    if (
      ('target' in e && 'currentTarget' in e && e.target === e.currentTarget && selectedCardId) ||
      (e.type === 'keydown' && selectedCardId)
    ) {
      setSelectedCardId(null);
    }
  };

  // Enhanced card double-click handler (auto-move with intelligent destination detection)
  const handleCardDoubleClick = (cardId: string) => {
    // Prevent double-click interference with normal selection by adding a small delay
    setTimeout(() => {
      setHighlightedDestinations([]);
      // Try to move to the first available foundation pile
      const fromPile = getPiles(engine.state.piles).find((pile: any) =>
        Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
      );
      const fromPileId = fromPile && typeof fromPile === 'object' && 'id' in fromPile ? fromPile.id : undefined;
      const foundationPile = getPiles(engine.state.piles).find((pile: any) => pile.type === 'foundation');
      if (fromPileId && foundationPile) {
        try {
          console.log('GameScreen: Attempting double-click move', { from: fromPileId, to: foundationPile.id, cardId });
          engine.moveCard({ from: fromPileId, to: foundationPile.id, cardId });
          setSelectedCardId(null);
        } catch (e) {
          console.error('GameScreen: Double-click move failed, triggering shake. Error:', e, { from: fromPileId, to: foundationPile.id, cardId });
          triggerShake(cardId);
          setSelectedCardId(null);
        }
      } else {
        triggerShake(cardId);
        setSelectedCardId(null);
      }
    }, 100);
  };

  // Drag handlers
  const handleDragStart = (cardId: string) => {
    setDraggedCardId(cardId);
  };
  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverPileId(null);
  };
  const handleDragOver = (pileId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPileId(pileId);
  };
  const handleDrop = (pileId: string) => {
    if (draggedCardId) {
      // Find source pile
      const fromPileId = getPiles(engine.state.piles).find((pile: any) => Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === draggedCardId))?.id;
      if (fromPileId) {
        try {
          console.log('GameScreen: Attempting drag-and-drop move', { from: fromPileId, to: pileId, cardId: draggedCardId });
          engine.moveCard({ from: fromPileId, to: pileId, cardId: draggedCardId });
        } catch (e) {
          console.error('GameScreen: Drag-and-drop move failed, triggering shake. Error:', e, { from: fromPileId, to: pileId, cardId: draggedCardId });
          triggerShake(draggedCardId);
        }
      }
    }
    setDraggedCardId(null);
    setDragOverPileId(null);
    setSelectedCardId(null);
  };
  // Example: render piles and player state
  const piles = gameState.piles || {};
  // const player = gameState.player || {}; // Remove duplicate


  // Separate piles by type
  console.log('GameScreen - piles before separation:', piles);
  console.log('GameScreen - available pile types:', Object.values(piles).map((p: any) => p.type));
  
  const pileArray = getPiles(piles);
  const tableauPiles = pileArray.filter((pile: any) => pile && pile.type === 'tableau').sort((a: any, b: any) => a.id.localeCompare(b.id));
  const deckPile = pileArray.find((pile: any) => pile && (pile.type === 'deck' || pile.type === 'stock'));
  const wastePile = pileArray.find((pile: any) => pile && pile.type === 'waste');
  const handPile = pileArray.find((pile: any) => pile && pile.type === 'hand');
  
  console.log('GameScreen - deckPile found:', deckPile);
  console.log('GameScreen - deckPile cards:', deckPile?.cards?.length || 0);
  console.log('GameScreen - handPile found:', handPile);
  console.log('GameScreen - handPile cards:', handPile?.cards?.length || 0);
  const foundationPiles = pileArray.filter((pile: any) => pile && pile.type === 'foundation').sort((a: any, b: any) => a.id.localeCompare(b.id));

  // Debug deck pile
  console.log('Debug deck pile:', deckPile);
  console.log('All pile types:', Object.values(piles).map((p: any) => ({ id: p.id, type: p.type, cardCount: p.cards?.length || 0 })));

  // Draw from deck to waste
  const handleDrawFromDeck = () => {
    if (!deckPile || deckPile.cards.length === 0) return;
    // Remove top card from deck, flip face up, add to waste
    const newDeck = [...deckPile.cards];
    const topCard = newDeck.pop();
    if (!topCard) return;
    const card = { ...topCard, faceUp: true };
    let newWaste = wastePile ? [...wastePile.cards] : [];
    newWaste.push(card);
    // Ensure the new top card in the deck is always face down
    if (newDeck.length > 0) {
      newDeck[newDeck.length - 1].faceUp = false;
    }
    // Update piles
    const newPiles = { ...engine.state.piles };
    newPiles[deckPile.id] = { ...deckPile, cards: newDeck };
    if (wastePile) {
      newPiles[wastePile.id] = { ...wastePile, cards: newWaste };
    } else {
      // Create waste pile if missing
      newPiles['waste'] = { id: 'waste', type: 'waste', cards: newWaste };
    }
    engine.state.piles = newPiles;
    engine.emitEvent('stateChange', engine.state);
  };

  // Shuffle waste pile back into deck
  const handleShuffleDeck = () => {
    if (!wastePile || wastePile.cards.length === 0 || !deckPile) return;
    if ((gameState.player.shuffles || 0) <= 0) {
      return;
    }
    
    // Move all waste cards back to deck face down
    const wasteCards = [...wastePile.cards].map(card => ({ ...card, faceUp: false }));
    // Shuffle the cards
    // Use cryptographically secure random number generator for shuffling
    // Use cryptographically secure random number generator for shuffling
    // window.crypto.getRandomValues is the browser-standard CSPRNG (see: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
    // This is the recommended approach for secure randomness in browsers, equivalent to Node.js crypto.randomBytes for this use case.
    for (let i = wasteCards.length - 1; i > 0; i--) {
      const randArray = new Uint32Array(1);
      window.crypto.getRandomValues(randArray);
      const j = Math.floor((randArray[0] / (0xFFFFFFFF + 1)) * (i + 1));
      [wasteCards[i], wasteCards[j]] = [wasteCards[j], wasteCards[i]];
    }
    
    // Update piles and consume shuffle
    const newPiles = { ...engine.state.piles };
    newPiles[deckPile.id] = { ...deckPile, cards: wasteCards };
    newPiles[wastePile.id] = { ...wastePile, cards: [] };
    engine.state.piles = newPiles;
    
    // Consume shuffle count
    const newPlayer = { ...engine.state.player };
    newPlayer.shuffles = (newPlayer.shuffles || 0) - 1;
    engine.state.player = newPlayer;
    
    engine.emitEvent('stateChange', engine.state);
    console.log('Deck shuffled! Shuffles remaining:', newPlayer.shuffles);
  };

  // Zoom handler for floating zoom window
  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseInt(event.target.value);
    setZoomLevel(newZoom);
    
    // Apply zoom to the game screen
    const gameScreen = document.querySelector('.game-screen-root') as HTMLElement;
    if (gameScreen) {
      gameScreen.style.transform = `translate(-50%, -50%) scale(${newZoom / 100})`;
    }
  };

  return (
  <div 
    className="game-screen-root" 
    data-tableau-row-height={tableauRowHeight}
    onClick={handleBackgroundClick}
    aria-label="Game area"
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBackgroundClick(e); }}
  >
      {/* Floating Zoom Window */}
      <div className="floating-zoom-window">
        <input
          type="range"
          min="50"
          max="150"
          value={zoomLevel}
          onChange={handleZoomChange}
          className="floating-zoom-slider"
          title={`Zoom: ${zoomLevel}%`}
        />
        <span className="floating-zoom-value">{zoomLevel}%</span>
      </div>
      {/* Registry-driven Effect HUD - HIDDEN PER USER REQUEST */}
      {/*
      <div
        className="effect-hud"
        role="region"
        aria-label="Active Effects"
        aria-live="polite"
        ref={effectFeedbackRef}
      >
        <div className="effect-hud-title">Active Effects</div>
        {activeEffects.length === 0 ? (
          <div className="effect-hud-empty">No active effects</div>
        ) : (
          <div className="effect-hud-categories">
            {Object.entries(effectsByCategory).map(([cat, effects]) => (
              <div key={cat} className="effect-hud-category">
                <div className="effect-hud-category-header clickable" onClick={() => toggleCategory(cat)}>
                  {collapsedCategories[cat] ? '▶' : '▼'} {cat} ({effects.length})
                </div>
                {!collapsedCategories[cat] && (
                  <ul className="effect-hud-list">
                    {effects.map((eff, idx) => (
                      <li key={eff.id + '-' + idx} className="effect-hud-item">
                        {eff.icon ? (
                          <span className="effect-hud-icon">{eff.icon}</span>
                        ) : (
                          <span className="effect-hud-dot">•</span>
                        )}
                        <span>
                          <span className="effect-hud-label">{eff.label}</span>
                          <span className="effect-hud-type">{eff.type}</span>
                          <div className="effect-hud-desc">{eff.description}</div>
                          {eff.condition && (
                            <div className="effect-hud-cond">
                              Condition: {typeof eff.condition === 'string' ? eff.condition : JSON.stringify(eff.condition)}
                            </div>
                          )}
                          {eff.value !== undefined && (
                            <div className="effect-hud-value">
                              Value: {eff.value}
                            </div>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      */}
      <div className="deck-area">
        {/* Deck */}
        <div>
          <div className="pile-cards">
            {deckPile && deckPile.cards.length > 0 ? (
              <Card
                key={deckPile.cards[deckPile.cards.length - 1].id}
                id={deckPile.cards[deckPile.cards.length - 1].id}
                suit={deckPile.cards[deckPile.cards.length - 1].suit}
                value={deckPile.cards[deckPile.cards.length - 1].value}
                faceUp={deckPile.cards[deckPile.cards.length - 1].faceUp}
                design={isCoronata && !deckPile.cards[deckPile.cards.length - 1].faceUp ? 'coronata' : deckPile.cards[deckPile.cards.length - 1].design}
                shake={shakeCardId === deckPile.cards[deckPile.cards.length - 1].id}
                onClick={() => handleDrawFromDeck()}
                draggable={false}
              />
            ) : (
              // Show shuffle button when deck is empty and waste has cards
              wastePile && wastePile.cards.length > 0 ? (
                <div 
                  className="shuffle-button"
                  onClick={handleShuffleDeck}
                  title={`Shuffle waste pile back into deck (${gameState.player.shuffles || 0} shuffles remaining)`}
                >
                  ♻️<br/>Shuffle
                </div>
              ) : (
                <span>(empty)</span>
              )
            )}
          </div>
        </div>
  
        {/* Waste */}
        <div>
          <div className="pile-cards">
            {wastePile && wastePile.cards.length > 0 ? (
              <Card
                key={wastePile.cards[wastePile.cards.length - 1].id}
                id={wastePile.cards[wastePile.cards.length - 1].id}
                suit={wastePile.cards[wastePile.cards.length - 1].suit}
                value={wastePile.cards[wastePile.cards.length - 1].value}
                faceUp={wastePile.cards[wastePile.cards.length - 1].faceUp}
                design={isCoronata && !wastePile.cards[wastePile.cards.length - 1].faceUp ? 'coronata' : wastePile.cards[wastePile.cards.length - 1].design}
                selected={selectedCardId === wastePile.cards[wastePile.cards.length - 1].id}
                shake={shakeCardId === wastePile.cards[wastePile.cards.length - 1].id}
                draggable={wastePile.cards[wastePile.cards.length - 1].faceUp}
                onClick={() => handleCardClick(wastePile.cards[wastePile.cards.length - 1].id, wastePile.id)}
                onDoubleClick={() => handleCardDoubleClick(wastePile.cards[wastePile.cards.length - 1].id)}
                onDragStart={() => handleDragStart(wastePile.cards[wastePile.cards.length - 1].id)}
                onDragEnd={handleDragEnd}
              />
            ) : <div className="card-outline" />}
          </div>
        </div>
        {/* Spacer for increased gap between waste and foundation */}
        <div className="waste-foundation-gap" />
  {/* Foundations */}
  <div className="foundation-area">
          {foundationPiles.map((pile: any, idx: number) => (
            <div 
              key={pile.id} 
              className={[
                idx === 0 ? "foundation-pile first-foundation" : "foundation-pile",
                highlightedDestinations.includes(pile.id) ? "pile valid-destination" : "pile"
              ].join(" ")}
              onClick={() => handlePileClick(pile.id)}
            >
              <div className="pile-cards">
                {pile.cards.length > 0 ? (
                  <Card
                    key={pile.cards[pile.cards.length - 1].id}
                    id={pile.cards[pile.cards.length - 1].id}
                    suit={pile.cards[pile.cards.length - 1].suit}
                    value={pile.cards[pile.cards.length - 1].value}
                    faceUp={pile.cards[pile.cards.length - 1].faceUp}
                    design={isCoronata && !pile.cards[pile.cards.length - 1].faceUp ? 'coronata' : pile.cards[pile.cards.length - 1].design}
                    selected={selectedCardId === pile.cards[pile.cards.length - 1].id}
                    shake={shakeCardId === pile.cards[pile.cards.length - 1].id}
                    onClick={() => handleCardClick(pile.cards[pile.cards.length - 1].id, pile.id)}
                  />
                ) : (
                  <div className="card-outline foundation-suit-container" onClick={() => handlePileClick(pile.id)}>
                    <span className="foundation-suit-symbol">
                      {pile.rules?.suit === 'hearts' && '♥'}
                      {pile.rules?.suit === 'diamonds' && '♦'}
                      {pile.rules?.suit === 'clubs' && '♣'}
                      {pile.rules?.suit === 'spades' && '♠'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resign confirmation modal */}
      {showResignModal && (
        <div className="modal-overlay" onClick={() => setShowResignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Resign Run?</h2>
            <p>Are you sure you want to end this run? Your progress will be lost.</p>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel"
                onClick={() => setShowResignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button confirm"
                onClick={() => {
                  setShowResignModal(false);
                  setShowRunRecap(true);
                }}
              >
                Resign
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Run recap modal */}
      {showRunRecap && (
        <div className="modal-overlay">
          <div className="modal-content run-recap">
            <h2>Run Summary</h2>
            <div className="recap-stats">
              <div className="stat-item">
                <label>Final Score:</label>
                <span>{gameState.player?.score || 0}</span>
              </div>
              <div className="stat-item">
                <label>Coins Earned:</label>
                <span>{gameState.player?.coins || 0}</span>
              </div>
              <div className="stat-item">
                <label>Cards Moved:</label>
                <span>{gameState.history?.length || 0}</span>
              </div>
              <div className="stat-item">
                <label>Shuffles Used:</label>
                <span>{3 - (gameState.player?.shuffles || 3)}</span>
              </div>
            </div>
            <div className="modal-buttons">
              <button 
                className="modal-button confirm"
                onClick={() => {
                  // End the game session and save to history
                  try {
                    const gameData = {
                      score: gameState.player?.score || 0,
                      coinsEarned: gameState.player?.coins || 0,
                      encountersCompleted: gameState.player?.encountersCompleted || 0,
                      exploitsGained: gameState.player?.exploits || [],
                      blessingsGained: gameState.player?.blessings || [],
                      fearsGained: gameState.player?.fears || [],
                      selectedFortune: selectedFortune
                    };
                    
                    // Save as resigned since this is triggered from resign button
                    endGameSession('resigned', gameData);
                    console.log('Game session ended and saved to history');
                  } catch (error) {
                    console.error('Error saving game session:', error);
                  }
                  
                  // Navigate back to welcome screen
                  if (onNavigateToWelcome) {
                    onNavigateToWelcome();
                  } else {
                    window.location.reload(); // Fallback for non-Coronata modes
                  }
                }}
              >
                Return to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Player Hand Area (only for Coronata) */}
      {isCoronata && handPile && (
        <div className="player-hand-area">
          <div className="hand-cards">
            {handPile.cards.length > 0 ? (
              handPile.cards.map((card: any, index: number) => (
                <Card
                  key={card.id}
                  id={card.id}
                  suit={card.suit}
                  value={card.value}
                  faceUp={card.faceUp}
                  design={card.faceUp ? card.design : 'coronata'}
                  selected={selectedCardId === card.id}
                  shake={shakeCardId === card.id}
                  draggable={card.faceUp}
                  onClick={() => handleCardClick(card.id, handPile.id)}
                  onDoubleClick={() => handleCardDoubleClick(card.id)}
                  onDragStart={() => handleDragStart(card.id)}
                  onDragEnd={handleDragEnd}
                  style={{ 
                    marginLeft: index > 0 ? '-20px' : '0',
                    zIndex: index + 1,
                    position: 'relative'
                  }}
                />
              ))
            ) : (
              <div className="hand-empty">No cards in hand</div>
            )}
          </div>
        </div>
      )}
      
      {/* Tableau row */}
  <div className="tableau-row">
        {tableauPiles.map((pile: any) => (
          <div
            key={pile.id}
            className={[
              dragOverPileId === pile.id ? 'tableau-pile drag-over' : 'tableau-pile',
              highlightedDestinations.includes(pile.id) ? 'pile valid-destination' : 'pile'
            ].join(' ')}
            onDragOver={e => handleDragOver(pile.id, e)}
            onDrop={() => handleDrop(pile.id)}
            onClick={() => handlePileClick(pile.id)}
          >
            <div className="pile-cards-vertical">
              {pile.cards.length > 0 ? (
                pile.cards.map((card: any) => (
                  <Card
                    key={card.id}
                    id={card.id}
                    suit={card.suit}
                    value={card.value}
                    faceUp={card.faceUp}
                    design={isCoronata && !card.faceUp ? 'coronata' : card.design}
                    selected={selectedCardId === card.id || isCardInMovableStack(card.id, pile.id)}
                    shake={shakeCardId === card.id}
                    draggable={card.faceUp}
                    onClick={() => handleCardClick(card.id, pile.id)}
                    onDoubleClick={() => handleCardDoubleClick(card.id)}
                    onDragStart={() => handleDragStart(card.id)}
                    onDragEnd={handleDragEnd}
                  />
                ))
              ) : (
                <div className="card-outline" onClick={() => handlePileClick(pile.id)} />
              )}
            </div>
          </div>
        ))}
      </div>
      

      {/* Encounter Flow UI (phase signaling) */}
      <EncounterFlowUI
        gameState={gameState}
        engine={engine}
        onFlowComplete={() => {
          setCurrentScreen('game');
          setHudExpanded(false);
        }}
        onPhaseChange={handleEncounterPhaseChange}
      />

      {/* Player HUD, expanded if overlay is active */}
      {isCoronata && (
        <PlayerHUD
          gameState={gameState}
          selectedFortune={selectedFortune}
          onNavigateToWelcome={onNavigateToWelcome}
          onShowRunRecap={() => setShowRunRecap(true)}
          onOpenTrade={() => setCurrentScreen('trade')}
          onOpenWander={() => setCurrentScreen('wander')}
          onNextEncounter={() => {
            // Actually advance to the next encounter using EncounterFlowManager
            if (engine && gameState.run?.encounterFlow) {
              const flowManager = new EncounterFlowManager(engine.state);
              // Complete the flow and advance to the next encounter
              const updatedState = flowManager.onFlowComplete();
              // Update engine state and encounterFlow
              let nextState = updatedState;
              if (engine.scoringSystem && typeof engine.scoringSystem.updateEncounterProgress === 'function') {
                nextState = engine.scoringSystem.updateEncounterProgress(updatedState);
              }
              engine.state = {
                ...nextState,
                run: {
                  ...nextState.run,
                  encounterFlow: {
                    active: false,
                    phase: 'encounter',
                    currentActivity: null,
                    queuedActivities: [],
                    completedActivities: []
                  }
                }
              };
              // Emit state change for React/UI update
              engine.emitEvent('stateChange', engine.state);
              setCurrentScreen('game');
            }
          }}
          onOpenDebugPanel={() => setShowDebugPanel(true)}
          expanded={hudExpanded}
        />
      )}

      {/* Debug Panel Toggle Button */}

      {/* Debug Panel as subcomponent */}
      {showDebugPanel && (
        <DebugPanel
          showRegistryLog={showRegistryLog}
          setShowRegistryLog={setShowRegistryLog}
          registryEffectLog={registryEffectLog}
          selectedBlessingForCard={selectedBlessingForCard}
          setSelectedBlessingForCard={setSelectedBlessingForCard}
          selectedCardForBlessing={selectedCardForBlessing}
          setSelectedCardForBlessing={setSelectedCardForBlessing}
          handleApplyBlessingToCard={handleApplyBlessingToCard}
          handleJumpToScreen={handleJumpToScreen}
          handleJumpToEncounter={handleJumpToEncounter}
          currentScreen={currentScreen}
          gameState={gameState}
          registry={registry}
          onClose={() => setShowDebugPanel(false)}
        />
      )}
      
      {/* Resign confirmation modal */}
      {showResignModal && (
        <div className="modal-overlay" onClick={() => setShowResignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Resign Run?</h2>
            <p>Are you sure you want to end this run? Your progress will be lost.</p>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel"
                onClick={() => setShowResignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button confirm"
                onClick={() => {
                  setShowResignModal(false);
                  setShowRunRecap(true);
                }}
              >
                Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Screen - overlay when not in game mode */}
      {currentScreen === 'trade' && (
        <div className="screen-overlay">
          <TradeScreen
            onBack={handleTradeBack}
            onPurchase={handleTradePurchase}
            onSell={handleTradeSell}
            onBlessingApplication={handleBlessingApplication}
            playerCoin={gameState.player?.coins || 0}
            equippedExploits={gameState.player?.exploits?.map((id: string) =>
              registry.exploit.find((e: any) => e.id === id)).filter((item: any): item is any => item !== undefined) || []}
            gameState={gameState}
          />
        </div>
      )}

      {currentScreen === 'wander' && (
        <div className="screen-overlay">
          <WanderScreen
            onChoiceMade={handleWanderChoice}
            onBack={handleWanderBack}
          />
        </div>
      )}

      {currentScreen === 'fortune-swap' && (
        <div className="screen-overlay">
          <FortuneSwapActivity
            currentFortune={gameState.player?.activeFortune ? registry.fortune.find(f => f.id === gameState.player.activeFortune) : undefined}
            availableFortunes={gameState.run?.encounterFlow?.currentActivity?.data?.options || []}
            onFortuneSelected={handleFortuneSwapSelection}
            onBack={handleFortuneSwapBack}
          />
        </div>
      )}
    </div>
  );
}
