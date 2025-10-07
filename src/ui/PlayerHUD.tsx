// Helper: simple and fast shuffle for card games
function fastShuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Helper: create new game state after discard - optimized for performance
function getDiscardedState(gameState: any, handPile: any, deckPile: any, player: any) {
  // Use player's maxHandSize (default 5) for hand draw
  const handSize = player.maxHandSize || 5;
  // Shuffle the existing deck
  const shuffledDeck = [...deckPile.cards];
  fastShuffle(shuffledDeck);
  // Draw up to handSize cards from shuffled deck
  const newHandCards = shuffledDeck.slice(0, handSize).map(card => ({ ...card, faceUp: true }));
  const remainingDeckCards = shuffledDeck.slice(handSize);
  // Logging for debugging
  console.log('[Discard] Discarding hand. Drawing', handSize, 'cards. Deck before:', deckPile.cards.length, 'Hand before:', handPile.cards.length);
  console.log('[Discard] New hand cards:', newHandCards.map(c => c.id));
  console.log('[Discard] Remaining deck cards:', remainingDeckCards.length);
  return {
    ...gameState,
    piles: {
      ...gameState.piles,
      hand: {
        ...handPile,
        cards: newHandCards
      },
      stock: {
        ...deckPile,
        cards: remainingDeckCards
      }
    },
    player: {
      ...player,
      discards: (player.discards || 0) - 1
    }
  };
}
import React from 'react';
import { GameState } from '../engine/types'; // Changed from core_engine to engine
import { registry } from '../registry/index';
import { keywordRegistry, generateKeywordDescription } from '../registry/keyword-registry';
import { useEngineEvent } from './EngineEventProvider';
import { EncounterFlowUI } from './EncounterFlowUI';
import './PlayerHUD.css';

export interface PlayerHUDProps {
  gameState: GameState;
  selectedFortune?: any;
  onNavigateToWelcome?: () => void;
  onShowRunRecap?: () => void;
  onOpenTrade?: () => void;
  onOpenWander?: () => void;
  onNextEncounter?: () => void;
  onOpenDebugPanel?: () => void;
  expanded?: boolean; // If true, HUD is expanded for overlays
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ 
  gameState, 
  selectedFortune, 
  onNavigateToWelcome, 
  onShowRunRecap,
  onOpenTrade,
  onOpenWander,
  onNextEncounter,
  onOpenDebugPanel,
  expanded = false
}) => {
  const { player, run } = gameState;
  const encounter = run?.encounter;
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  
  // Get engine context for state updates
  const ctx = useEngineEvent();
  const engine = ctx?.engine;
  
  // Modal states: separate for effect details and resign confirmation
  const [showEffectModal, setShowEffectModal] = React.useState(false);
  const [showResignModal, setShowResignModal] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<any[]>([]);
  
  // Testing window state
  const [showTestingWindow, setShowTestingWindow] = React.useState(false);
  const [testingAuthenticated, setTestingAuthenticated] = React.useState(false);
  const [testingWindowPosition, setTestingWindowPosition] = React.useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  // Debug logging
  console.log('PlayerHUD - gameState:', gameState);
  console.log('PlayerHUD - player:', player);
  console.log('PlayerHUD - run:', run);
  console.log('PlayerHUD - encounter:', encounter);
  console.log('PlayerHUD - selectedFortune:', selectedFortune);

  // Testing window handlers
  const handleTestingClick = () => {
    if (!testingAuthenticated) {
      const password = prompt('Enter password:');
      if (password === 'please') {
        setTestingAuthenticated(true);
        setShowTestingWindow(true);
      } else {
        alert('Incorrect password');
      }
    } else {
      setShowTestingWindow(!showTestingWindow);
    }
  };



  // Testing admin functions
  const handleAddCoins = () => {
    if (!engine?.state?.player) return;
    try {
      // Directly modify the player's coins
      engine.state.player.coins = (engine.state.player.coins || 0) + 100;
      // Try to trigger a re-render by calling any available update method
      if (engine.emitEvent) engine.emitEvent('stateChange', engine.state);
    } catch (error) {
      console.error('Failed to add coins:', error);
    }
  };

  const handleOpenTrade = () => {
    console.log('Opening trade window...');
    if (onOpenTrade) {
      onOpenTrade();
    }
  };

  const handleOpenWander = () => {
    console.log('Opening wander window...');
    if (onOpenWander) {
      onOpenWander();
    }
  };

  const handleNextEncounter = () => {
    console.log('Attempting to progress to next encounter...');
    if (onNextEncounter) {
      onNextEncounter();
    }
  };

  // Dragging handlers for testing window
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - testingWindowPosition.x,
      y: e.clientY - testingWindowPosition.y
    });
  };

  // --- Dynamic style injection for testing window position ---
  React.useEffect(() => {
    if (!showTestingWindow) return;
    const className = `testing-window-draggable--x${testingWindowPosition.x}y${testingWindowPosition.y}`;
    const styleId = `testing-window-style-${className}`;
    let styleTag = document.getElementById(styleId);
    const css = `.${className} { left: ${testingWindowPosition.x}px !important; top: ${testingWindowPosition.y}px !important; }`;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      styleTag.appendChild(document.createTextNode(css));
      document.head.appendChild(styleTag);
    } else {
      styleTag.textContent = css;
    }
    return () => {
      styleTag?.parentNode?.removeChild(styleTag);
    };
  }, [testingWindowPosition.x, testingWindowPosition.y, showTestingWindow]);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setTestingWindowPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Handle discard action - shuffle deck and redraw hand (optimized)
  const handleDiscardHand = () => {
    if (!engine) return;

    const discardsRemaining = player.discards || 0;
    if (discardsRemaining <= 0) {
      alert('No discards remaining!');
      return;
    }

    // Find hand pile by type
    const handPile = Object.values(gameState.piles || {}).find((p: any) => p.type === 'hand');
    // Find deck pile by type 'deck' or 'stock'
    const deckPile = Object.values(gameState.piles || {}).find((p: any) => p.type === 'deck' || p.type === 'stock');
    if (!handPile || !deckPile) {
      alert('Hand or deck pile missing!');
      return;
    }
    if (!Array.isArray(handPile.cards)) {
      alert('Hand pile cards missing!');
      return;
    }
    if (handPile.cards.length === 0) {
      alert('No cards in hand to discard!');
      return;
    }
    // Fast discard and redraw
    const newState = getDiscardedState(gameState, handPile, deckPile, player);
    engine.state = { ...newState };
    // Emit both stateChange and handDiscarded for robust UI update
    if (engine.emitEvent) engine.emitEvent('stateChange', engine.state);
    engine.emitEvent('handDiscarded', { source: 'playerHUD' });
    // Logging for debugging
    console.log('[Discard] Discarded hand. New hand:', newState.piles.hand.cards.map((c: any) => c.id));
  };

  // Get counts for different item types
  const exploitCount = player.exploits?.length || 0;
  const curseCount = player.curses?.length || 0;
  const blessingCount = player.blessings?.length || 0;
  const fortuneCount = (player.fortunes?.length || 0) + (selectedFortune ? 1 : 0);
  
  // Helper functions to get registry items
  const getPlayerExploits = () => {
    const exploits = (player.exploits || []).map(id => registry.exploit.find(e => e.id === id)).filter(Boolean);
    return exploits;
  };
  
  const getPlayerCurses = () => {
    const curses = (player.curses || []).map(id => registry.curse.find(c => c.id === id)).filter(Boolean);
    return curses;
  };
  
  const getPlayerBlessings = () => {
    const blessings = (player.blessings || []).map((id: string) => registry.blessing.find(b => b.id === id)).filter(Boolean);
    return blessings;
  };
  
  const getPlayerFortunes = () => {
    const fortuneIds = new Set(player.fortunes || []);
    const fortunes = (player.fortunes || []).map((id: string) => registry.fortune.find(f => f.id === id)).filter(Boolean);
    // Only add selectedFortune if it is not already in player.fortunes
    if (selectedFortune && !fortuneIds.has(selectedFortune.id)) {
      fortunes.push(selectedFortune);
    }
    return fortunes;
  };
  
  // Handle click to show modal (unified for all effect types)
  const handleEffectClick = (type: string) => {
    let items: any[] = [];
    let typeKey = '';
    switch (type) {
      case 'exploits':
        items = getPlayerExploits();
        typeKey = 'exploit';
        break;
      case 'curses':
        items = getPlayerCurses();
        typeKey = 'curse';
        break;
      case 'blessings':
        items = getPlayerBlessings();
        typeKey = 'blessing';
        break;
      case 'fortunes':
        items = getPlayerFortunes();
        typeKey = 'fortune';
        break;
    }
    // For each item, try to find the keyword registry entry
    const keywordItems = items.map((item: any) => {
      const keywordEntry = keywordRegistry.find(
        (k: any) => k.id === item.id && k.type === typeKey
      );
      return {
        ...item,
        keywordDescription: keywordEntry ? generateKeywordDescription(keywordEntry.keywords) : null,
        keywordEntry
      };
    });
  setModalContent(keywordItems);
  setShowEffectModal(true);
  };

  // Update progress bar width
  React.useEffect(() => {
    if (progressBarRef.current && encounter?.scoreGoal) {
      const percentage = Math.min(100, ((player.score || 0) / encounter.scoreGoal) * 100);
      progressBarRef.current.style.setProperty('--score', String(player.score || 0));
      progressBarRef.current.style.setProperty('--goal', String(encounter.scoreGoal));
      progressBarRef.current.style.setProperty('--progress-width', `${percentage}%`);
      console.log(`Progress bar updated: ${percentage}% (${player.score}/${encounter.scoreGoal})`);
    }
  }, [player.score, encounter?.scoreGoal]);

  return (
    <div className={"player-hud" + (expanded ? " player-hud-expanded" : "") }>
      {/* Current Encounter Info */}
      {encounter && (
        <div className="encounter-section">
          <div className="encounter-header">
            <span className={`encounter-type ${encounter?.type || ''}`}>
              {encounter?.type === 'fear' ? '😰' : '⚡'} {typeof encounter?.type === 'string' ? encounter.type.toUpperCase() : ''}
            </span>
            <span className="encounter-name">{encounter.title || encounter.name}</span>
          </div>
          <div className="encounter-description">{encounter.description}</div>
        </div>
      )}

      {/* Full-width Progress Bar */}
      {encounter && (
        <div className="progress-container-full">
          <div 
            ref={progressBarRef}
            className="full-progress-bar"
            data-score={player.score || 0}
            data-goal={encounter.scoreGoal || 0}
          >
            <span className="progress-text-centered">
              {player.score || 0} / {encounter.scoreGoal || 0}
            </span>
          </div>
        </div>
      )}

                {/* Encounter Flow Interface */}
                <EncounterFlowUI 
                  gameState={gameState}
                  engine={engine}
                  onFlowComplete={() => {
                    console.log('Encounter flow completed');
                  }}
                />

                {/* Player Resources and Active Effects Summary */}
                <div className="effects-section">
                  <div className="effects-row">
                    <div className="effects-grid">
                      <div className="effect-count has-items">
                        <div className="resource-header">
                          <span className="effect-icon">🪙</span>
                          <span className="effect-value">{player.coins || 0}</span>
                        </div>
                      </div>
                      <div className="effect-count has-items">
                        <div className="resource-header">
                          <span className="effect-icon">🔄</span>
                          <span className="effect-value">{player.shuffles || 0}</span>
                        </div>
                      </div>
                      <div className="effect-count has-items">
                        <div className="resource-header">
                          <span className="effect-icon">🗑️</span>
                          <span className="effect-value">{player.discards || 0}</span>
                        </div>
                      </div>
                      <div className="effect-count has-items">
                        <div className="resource-header">
                          <span className="effect-icon">✋</span>
                          <span className="effect-value">{player.maxHandSize || 5}</span>
                        </div>
                      </div>
                    </div>
                    <div className="effects-grid">
                      <button
                        className={`effect-count ${exploitCount > 0 ? 'has-items clickable' : ''}`}
                        type="button"
                        onClick={() => exploitCount > 0 && handleEffectClick('exploits')}
                      >
                        <div className="resource-header">
                          <span className="effect-icon">⚔️</span>
                          <span className="effect-value">{exploitCount}</span>
                        </div>
                      </button>
                      <button
                        className={`effect-count ${curseCount > 0 ? 'has-items clickable' : ''}`}
                        type="button"
                        onClick={() => curseCount > 0 && handleEffectClick('curses')}
                      >
                        <div className="resource-header">
                          <span className="effect-icon">💀</span>
                          <span className="effect-value">{curseCount}</span>
                        </div>
                      </button>
                      <button
                        className={`effect-count ${blessingCount > 0 ? 'has-items clickable' : ''}`}
                        type="button"
                        onClick={() => blessingCount > 0 && handleEffectClick('blessings')}
                      >
                        <div className="resource-header">
                          <span className="effect-icon">✨</span>
                          <span className="effect-value">{blessingCount}</span>
                        </div>
                      </button>
                      <button
                        className={`effect-count ${fortuneCount > 0 ? 'has-items clickable' : ''}`}
                        type="button"
                        onClick={() => fortuneCount > 0 && handleEffectClick('fortunes')}
                      >
                        <div className="resource-header">
                          <span className="effect-icon">🍀</span>
                          <span className="effect-value">{fortuneCount}</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* HUD Controls */}
                <div className="hud-controls">
                  <button 
                    className="testing-button hud-action-button" 
                    title="Testing functions (admin)"
                    onClick={() => {
                      if (onOpenDebugPanel) {
                        onOpenDebugPanel();
                      } else {
                        handleTestingClick();
                      }
                    }}
                  >
                    Testing
                  </button>

                  <button 
                    className="resign-button hud-action-button" 
                    title="Resign and view run summary"
                    onClick={() => setShowResignModal(true)}
                  >
                    Resign
                  </button>

                  {/* Resign confirmation modal */}
                  {showResignModal && (
                    <div className="modal-bg">
                      <div className="modal">
                        <h3>Confirm Resignation</h3>
                        <p>Are you sure you want to resign and view the run recap?</p>
                        <div className="modal-buttons">
                          <button onClick={() => {
                            setShowResignModal(false);
                            console.log('Player resigned - showing run recap');
                            if (onShowRunRecap) {
                              onShowRunRecap();
                            } else if (onNavigateToWelcome) {
                              onNavigateToWelcome();
                            }
                          }}>Yes, Resign</button>
                          <button onClick={() => setShowResignModal(false)}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    className="discard-button hud-action-button" 
                    title="Discard selected cards from hand"
                    onClick={handleDiscardHand}
                  >
                    Discard
                  </button>
                </div>

                {/* Fortune Popup removed; all effect popups use unified modal */}

                {/* Effect details modal: Only modal-item contents (header and effect) */}
                {showEffectModal && (
                  <div className="modal-bg">
                    <div className="modal">
                      {modalContent.map((item, idx) => (
                        <div key={typeof item === 'string' ? item : idx + '-' + String(item)} className="modal-item">
                          <div className="modal-item-header">
                            <span className="modal-item-category">{item.category ? item.category.toUpperCase() : ''}</span>
                            {item.category ? ' - ' : ''}
                            <span className="modal-item-name">{item.label}</span>
                          </div>
                          <div className="modal-item-effect">
                            {item.description}
                          </div>
                        </div>
                      ))}
                      <div className="modal-buttons">
                        <button onClick={() => setShowEffectModal(false)}>Close</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Testing Window */}
                {showTestingWindow && (
                  <div 
                    className={`testing-window-draggable testing-window-draggable--x${testingWindowPosition.x}y${testingWindowPosition.y}`}
                  >
                    <div className="testing-window-header-row">
                      <button
                        type="button"
                        className="testing-window-header-btn"
                        onMouseDown={handleMouseDown}
                      >
                        <span>🔧 Testing Admin</span>
                      </button>
                      <button 
                        className="close-testing close-testing-margin"
                        onClick={() => setShowTestingWindow(false)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="testing-window-content">
                      <button 
                        className="testing-action-btn"
                        onClick={handleAddCoins}
                      >
                        💰 Add 100 Coins
                      </button>
                      <button 
                        className="testing-action-btn"
                        onClick={handleOpenTrade}
                      >
                        🛒 Open Trade
                      </button>
                      <button 
                        className="testing-action-btn"
                        onClick={handleOpenWander}
                      >
                        🚶 Open Wander
                      </button>
                      <button 
                        className="testing-action-btn"
                        onClick={handleNextEncounter}
                      >
                        ➡️ Next Encounter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          };