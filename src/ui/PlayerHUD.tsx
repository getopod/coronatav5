import React from 'react';
import { GameState } from '../core_engine/types';
import { registry } from '../registry/index';
import { useEngineEvent } from './EngineEventProvider';
import './PlayerHUD.css';

export interface PlayerHUDProps {
  gameState: GameState;
  selectedFortune?: any;
  onNavigateToWelcome?: () => void;
  onShowRunRecap?: () => void;
  onChoiceSelected?: (choice: 'trade' | 'wander' | 'gamble') => void;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ gameState, selectedFortune, onNavigateToWelcome, onShowRunRecap, onChoiceSelected }) => {
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
  const [tooltip, setTooltip] = React.useState<{show: boolean, content: string, x: number, y: number}>({show: false, content: '', x: 0, y: 0});

  // Debug logging
  console.log('PlayerHUD - gameState:', gameState);
  console.log('PlayerHUD - player:', player);
  console.log('PlayerHUD - run:', run);
  console.log('PlayerHUD - encounter:', encounter);
  console.log('PlayerHUD - selectedFortune:', selectedFortune);

  // Handle player choice after encounter completion
  const handlePlayerChoice = (choice: 'trade' | 'wander' | 'gamble') => {
    console.log('Player selected choice:', choice);
    if (onChoiceSelected) {
      onChoiceSelected(choice);
    } else {
      alert(`Choice "${choice}" selected! (Progression logic to be implemented)`);
    }
  };

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
    const newDeckCards = [...deckPile.cards, ...handPile.cards];
    
    // Simple shuffle (Fisher-Yates)
    for (let i = newDeckCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeckCards[i], newDeckCards[j]] = [newDeckCards[j], newDeckCards[i]];
    }

    // Draw 5 new cards for hand
    const newHandCards = newDeckCards.slice(0, 5);
    const remainingDeckCards = newDeckCards.slice(5);

    // Create updated state
    const newState = {
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
        discards: discardsRemaining - 1
      }
    };

    // Update engine state
    engine.state = newState;
    
    // Emit event to trigger UI refresh
    engine.emitEvent('handDiscarded', { source: 'playerHUD' });
    
    console.log('Hand discarded and refreshed:', { newHandSize: newHandCards.length, discardsLeft: discardsRemaining - 1 });
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
    const blessings = (player.blessings || []).map(id => registry.blessing.find(b => b.id === id)).filter(Boolean);
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
  
  // Handle hover for tooltip
  const handleEffectHover = (event: React.MouseEvent, type: string) => {
    let items: any[];
    
    if (type === 'exploits') {
      items = getPlayerExploits();
    } else if (type === 'curses') {
      items = getPlayerCurses();
    } else if (type === 'blessings') {
      items = getPlayerBlessings();
    } else {
      items = getPlayerFortunes();
    }
    
    if (items.length > 0) {
      const content = items.filter(item => item).map(item => `${item.label}: ${item.description}`).join('\n\n');
      setTooltip({
        show: true,
        content,
        x: event.clientX,
        y: event.clientY
      });
    }
  };
  
  const handleEffectLeave = () => {
    setTooltip({show: false, content: '', x: 0, y: 0});
  };

  // Update progress bar width
  React.useEffect(() => {
    if (progressBarRef.current && encounter?.scoreGoal) {
      const percentage = Math.min(100, ((player.score || 0) / encounter.scoreGoal) * 100);
      progressBarRef.current.style.width = `${percentage}%`;
      console.log(`Progress bar updated: ${percentage}% (${player.score}/${encounter.scoreGoal})`);
    }
  }, [player.score, encounter?.scoreGoal]);

  return (
    <div className="player-hud">
      {/* Player Choice Interface */}
      {run?.awaitingPlayerChoice && (
        <div className="choice-interface">
          <div className="choice-header">
            <h3>🎉 Encounter Complete!</h3>
            <p>Choose your next action:</p>
          </div>
          <div className="choice-buttons">
            <button 
              className="choice-btn trade"
              onClick={() => handlePlayerChoice('trade')}
            >
              💰 Trade
              <br />
              <span className="choice-description">Exchange resources</span>
            </button>
            <button 
              className="choice-btn wander"
              onClick={() => handlePlayerChoice('wander')}
            >
              🚶 Wander
              <br />
              <span className="choice-description">Explore new paths</span>
            </button>
            <button 
              className="choice-btn gamble"
              onClick={() => handlePlayerChoice('gamble')}
            >
              🎲 Gamble
              <br />
              <span className="choice-description">Risk for reward</span>
            </button>
          </div>
        </div>
      )}

      {/* Current Encounter Info */}
      {encounter && (
        <div className="encounter-section">
          <div className="encounter-header">
            <span className={`encounter-type ${encounter.type}`}>
              {encounter.type === 'fear' ? '😰' : '⚡'} {encounter.type.toUpperCase()}
            </span>
            <span className="encounter-name">{encounter.name}</span>
          </div>
          <div className="encounter-description">{encounter.description}</div>
          
          {/* Score Display with Compact Progress Bar */}
          <div className="score-display">
            <div className="progress-container-compact">
              <div 
                ref={progressBarRef}
                className="compact-progress-bar"
                data-score={player.score || 0}
                data-goal={encounter.scoreGoal || 0}
              >
                <span className="progress-text-centered">
                  {player.score || 0} / {encounter.scoreGoal || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Resources */}
      <div className="effects-section">
        <div className="effects-grid">
          <div className="effect-count has-items">
            <div className="resource-header">
              <span className="effect-icon">🪙</span>
              <span className="effect-value">{player.coins || 0}</span>
            </div>
            <span className="effect-label">Coin</span>
          </div>
          
          <div className="effect-count has-items">
            <div className="resource-header">
              <span className="effect-icon">🔄</span>
              <span className="effect-value">{player.shuffles || 0}</span>
            </div>
            <span className="effect-label">Shuffles</span>
          </div>
          
          <div className="effect-count has-items">
            <div className="resource-header">
              <span className="effect-icon">🗑️</span>
              <span className="effect-value">{player.discards || 0}</span>
            </div>
            <span className="effect-label">Discards</span>
          </div>
          
          <div className="effect-count has-items">
            <div className="resource-header">
              <span className="effect-icon">✋</span>
              <span className="effect-value">{player.maxHandSize || 5}</span>
            </div>
            <span className="effect-label">Max Hand Size</span>
          </div>
        </div>
      </div>

      {/* Active Effects Summary */}
      <div className="effects-section">
        <div className="effects-grid">
          <div 
            className={`effect-count ${exploitCount > 0 ? 'has-items clickable' : ''}`}
            onClick={() => exploitCount > 0 && handleEffectClick('exploits')}
            onMouseEnter={(e) => exploitCount > 0 && handleEffectHover(e, 'exploits')}
            onMouseLeave={handleEffectLeave}
          >
            <div className="resource-header">
              <span className="effect-icon">⚔️</span>
              <span className="effect-value">{exploitCount}</span>
            </div>
            <span className="effect-label">Exploits</span>
          </div>
          
          <div 
            className={`effect-count ${curseCount > 0 ? 'has-items clickable' : ''}`}
            onClick={() => curseCount > 0 && handleEffectClick('curses')}
            onMouseEnter={(e) => curseCount > 0 && handleEffectHover(e, 'curses')}
            onMouseLeave={handleEffectLeave}
          >
            <div className="resource-header">
              <span className="effect-icon">💀</span>
              <span className="effect-value">{curseCount}</span>
            </div>
            <span className="effect-label">Curses</span>
          </div>
          
          <div 
            className={`effect-count ${blessingCount > 0 ? 'has-items clickable' : ''}`}
            onClick={() => blessingCount > 0 && handleEffectClick('blessings')}
            onMouseEnter={(e) => blessingCount > 0 && handleEffectHover(e, 'blessings')}
            onMouseLeave={handleEffectLeave}
          >
            <div className="resource-header">
              <span className="effect-icon">✨</span>
              <span className="effect-value">{blessingCount}</span>
            </div>
            <span className="effect-label">Blessings</span>
          </div>
          
          <div 
            className={`effect-count ${fortuneCount > 0 ? 'has-items clickable' : ''}`}
            onClick={() => fortuneCount > 0 && handleEffectClick('fortunes')}
            onMouseEnter={(e) => fortuneCount > 0 && handleEffectHover(e, 'fortunes')}
            onMouseLeave={handleEffectLeave}
          >
            <div className="resource-header">
              <span className="effect-icon">🍀</span>
              <span className="effect-value">{fortuneCount}</span>
            </div>
            <span className="effect-label">Fortunes</span>
          </div>
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
          className="toggle-button" 
          title="Toggle HUD compact mode"
          onClick={() => {
            // Toggle compact mode
            const hud = document.querySelector('.player-hud');
            if (hud) {
              hud.classList.toggle('compact-mode');
            }
          }}
        >
          📊
        </button>
        <button 
          className="discard-button" 
          title="Discard selected cards from hand"
          onClick={handleDiscardHand}
        >
          🗑️ Discard
        </button>
      </div>
      
      {/* Tooltip */}
      {tooltip.show && (
        <div 
          className="effect-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            zIndex: 2000
          }}
        >
          {tooltip.content.split('\n\n').map((item, index) => (
            <div key={index} className="tooltip-item">{item}</div>
          ))}
        </div>
      )}
      
      {/* Modal */}
      {showModal && (
        <div className="effect-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="effect-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalTitle}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-content">
              {modalContent.map((item, index) => (
                <div key={index} className="modal-item">
                  <div className="modal-item-title">{item.label}</div>
                  <div className="modal-item-description">{item.description}</div>
                  {item.effects && item.effects.length > 0 && (
                    <div className="modal-item-effects">
                      <strong>Effects:</strong>
                      {item.effects.map((effect: any, effectIndex: number) => (
                        <div key={effectIndex} className="effect-detail">
                          {effect.action} {effect.target} {effect.value && `(${effect.value})`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};