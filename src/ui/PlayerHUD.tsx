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
      deck: {
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
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ 
  gameState, 
  selectedFortune, 
  onNavigateToWelcome, 
  onShowRunRecap,
  onOpenTrade,
  onOpenWander,
  onNextEncounter
}) => {
  const { player, run } = gameState;
  const encounter = run?.encounter;
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  
  // Get engine context for state updates
  const ctx = useEngineEvent();
  const engine = ctx?.engine;
  
  // Modal and tooltip state
  const [showModal, setShowModal] = React.useState(false);
  const [modalContent, setModalContent] = React.useState<any[]>([]);
  const [modalTitle, setModalTitle] = React.useState('');
  const [showFortunePopup, setShowFortunePopup] = React.useState(false);
  
  // Testing and options state
  const [showTestingWindow, setShowTestingWindow] = React.useState(false);
  const [showOptionsWindow, setShowOptionsWindow] = React.useState(false);
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

  const handleOptionsClick = () => {
    setShowOptionsWindow(!showOptionsWindow);
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
  
  // Handle click to show modal
  const handleEffectClick = (type: string) => {
    let items: any[] = [];
    let title = '';
    
    switch (type) {
      case 'exploits':
        items = getPlayerExploits();
        title = 'Active Exploits';
        break;
      case 'curses':
        items = getPlayerCurses();
        title = 'Active Curses';
        break;
      case 'blessings':
        items = getPlayerBlessings();
        title = 'Active Blessings';
        break;
      case 'fortunes':
        items = getPlayerFortunes();
        title = 'Active Fortunes';
        break;
    }
    
    setModalContent(items);
    setModalTitle(title);
    setShowModal(true);
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
    <div className="player-hud">
      {/* Current Encounter Info */}
      {encounter && (
        <div className="encounter-section">
          <div className="encounter-header">
            <span className={`encounter-type ${encounter.type}`}>
              {encounter.type === 'fear' ? '😰' : '⚡'} {encounter.type.toUpperCase()}
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
                        onClick={() => {
                          if (fortuneCount > 0) {
                            setShowFortunePopup(!showFortunePopup);
                          }
                        }}
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
                    onClick={handleTestingClick}
                  >
                    Testing
                  </button>

                  <button 
                    className="options-button hud-action-button" 
                    title="Options"
                    onClick={handleOptionsClick}
                  >
                    Options
                  </button>

                  <button 
                    className="resign-button hud-action-button" 
                    title="Resign and view run summary"
                    onClick={() => {
                      if (confirm('Are you sure you want to resign and view the run recap?')) {
                        console.log('Player resigned - showing run recap');
                        if (onShowRunRecap) {
                          onShowRunRecap();
                        } else if (onNavigateToWelcome) {
                          onNavigateToWelcome();
                        }
                      }
                    }}
                  >
                    Resign
                  </button>

                  <button 
                    className="discard-button hud-action-button" 
                    title="Discard selected cards from hand"
                    onClick={handleDiscardHand}
                  >
                    Discard
                  </button>
                </div>

                {/* Fortune Popup */}
                {showFortunePopup && selectedFortune && (
                  <div className="fortune-popup">
                    <div className="fortune-popup-content">
                      <div className="fortune-popup-header">
                        <h3>{selectedFortune.label}</h3>
                        <button 
                          className="fortune-popup-close" 
                          onClick={() => setShowFortunePopup(false)}
                        >
                          ×
                        </button>
                      </div>
                      <div className="fortune-popup-body">
                        <p>{selectedFortune.description}</p>
                        {selectedFortune.effects && selectedFortune.effects.length > 0 && (
                          <div className="fortune-effects">
                            <strong>Effects:</strong>
                            {selectedFortune.effects.map((effect: any, effectIndex: number) => (
                              <div key={`fortune-effect-${effectIndex}-${effect.action || 'unknown'}`} className="effect-detail">
                                {effect.action} {effect.target} {effect.value && `(${effect.value})`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal */}
                {showModal && (
                  <div className="effect-modal-overlay">
                    <section className="effect-modal" aria-label="Effect Modal">
                      <button className="modal-close modal-close-abs" type="button" aria-label="Close modal" onClick={() => setShowModal(false)}>&times;</button>
                      <div className="modal-header">
                        <h3>{modalTitle}</h3>
                        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                      </div>
                      <div className="modal-content">
                        {modalContent.map((item, idx) => (
                          <div key={typeof item === 'string' ? item : idx + '-' + String(item)} className="modal-item">
                            <div className="modal-item-title">{item.label}</div>
                            <div className="modal-item-description">{item.description}</div>
                            {item.effects && item.effects.length > 0 && (
                              <div className="modal-item-effects">
                                <strong>Effects:</strong>
                                {item.effects.map((effect: any, effectIndex: number) => (
                                  <div key={typeof effect === 'string' ? effect : effectIndex + '-' + String(effect)} className="effect-detail">
                                    {effect.action} {effect.target} {effect.value && `(${effect.value})`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* Testing Window */}
                {showTestingWindow && (
                  <div 
                    className="testing-window-draggable"
                    style={{
                      left: `${testingWindowPosition.x}px`,
                      top: `${testingWindowPosition.y}px`
                    }}
                  >
                    <div 
                      className="testing-window-header"
                      onMouseDown={handleMouseDown}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleMouseDown(e as any); }}
                    >
                      <span>🔧 Testing Admin</span>
                      <button 
                        className="close-testing"
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