// Helper: cryptographically secure shuffle
function secureShuffle(array: any[], cryptoModule?: any) {
  for (let i = array.length - 1; i > 0; i--) {
    let j;
    if (cryptoModule && typeof cryptoModule.randomInt === 'function') {
      j = cryptoModule.randomInt(0, i + 1);
    } else if (cryptoModule && typeof cryptoModule.randomBytes === 'function') {
      const randBytes = cryptoModule.randomBytes(4);
      const rand = randBytes.readUInt32BE(0);
      j = Math.floor((rand / (0xFFFFFFFF + 1)) * (i + 1));
    } else if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const randArray = new Uint32Array(1);
      window.crypto.getRandomValues(randArray);
      j = Math.floor((randArray[0] / (0xFFFFFFFF + 1)) * (i + 1));
    } else {
      throw new Error('No cryptographically secure random number generator available for shuffling.');
    }
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Helper: create new game state after discard
function getDiscardedState(gameState: any, handPile: any, deckPile: any, player: any, cryptoModule: any) {
  const newDeckCards = [...deckPile.cards, ...handPile.cards];
  secureShuffle(newDeckCards, cryptoModule);
  const newHandCards = newDeckCards.slice(0, 5);
  const remainingDeckCards = newDeckCards.slice(5);
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
    },
    _newHandCards: newHandCards // for logging only
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
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ gameState, selectedFortune, onNavigateToWelcome, onShowRunRecap }) => {
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

  // Debug logging
  console.log('PlayerHUD - gameState:', gameState);
  console.log('PlayerHUD - player:', player);
  console.log('PlayerHUD - run:', run);
  console.log('PlayerHUD - encounter:', encounter);
  console.log('PlayerHUD - selectedFortune:', selectedFortune);

  // Handle discard action - move hand cards back to deck, shuffle, and redraw
  const handleDiscardHand = () => {
    if (!engine) {
      console.error('Engine not available for discard action');
      return;
    }

    // Check if player has discards remaining
    const discardsRemaining = player.discards || 0;
    if (discardsRemaining <= 0) {
      alert('No discards remaining!');
      return;
    }

    // Get current hand and deck piles
    const handPile = gameState.piles?.hand;
    const deckPile = gameState.piles?.deck;

    if (!handPile || !deckPile) {
      console.error('Hand or deck pile not found');
      return;
    }

    if (handPile.cards.length === 0) {
      alert('No cards in hand to discard!');
      return;
    }

    // Create new state with discard logic:
    // 1. Move all hand cards back to deck
    // 2. Shuffle deck
    // 3. Draw 5 new cards
    // 4. Decrement discards resource
    let cryptoModule = undefined;
    if (typeof require !== 'undefined') {
      try {
        cryptoModule = require('crypto');
      } catch { /* ignore */ }
    }
  const newState = getDiscardedState(gameState, handPile, deckPile, player, cryptoModule);
  const { _newHandCards, ...cleanState } = newState;

    // Update engine state with new object reference for React to detect changes
  engine.state = { ...cleanState };
    
    // Emit event to trigger UI refresh
    engine.emitEvent('handDiscarded', { source: 'playerHUD' });
    
  console.log('Hand discarded and refreshed:', { newHandSize: newState._newHandCards.length, discardsLeft: discardsRemaining - 1 });
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
    const fortunes = (player.fortunes || []).map(id => registry.fortune.find(f => f.id === id)).filter(Boolean);
    if (selectedFortune) fortunes.push(selectedFortune);
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

      {/* Player Resources */}
      <div className="effects-section">
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
      </div>

      {/* Active Effects Summary */}
      <div className="effects-section">
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

      {/* HUD Controls */}
      <div className="hud-controls">
        <button 
          className="resign-button" 
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
          🏳️ Resign
        </button>

        <button 
          className="discard-button" 
          title="Discard selected cards from hand"
          onClick={handleDiscardHand}
        >
          🗑️ Discard
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
    </div>
  );
};