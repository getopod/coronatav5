import React from 'react';
import { GameState } from '../core_engine/types';
import './PlayerHUD.css';

export interface PlayerHUDProps {
  gameState: GameState;
}

export const PlayerHUD: React.FC<PlayerHUDProps> = ({ gameState }) => {
  const { player, run } = gameState;
  const encounter = run?.encounter;
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('PlayerHUD - gameState:', gameState);
  console.log('PlayerHUD - player:', player);
  console.log('PlayerHUD - run:', run);
  console.log('PlayerHUD - encounter:', encounter);

  // Handle player choice after encounter completion
  const handlePlayerChoice = (choice: 'trade' | 'wander' | 'gamble') => {
    console.log('Player selected choice:', choice);
    // Call scoring system to progress after choice
    // This will be connected to the engine controller's scoring system
    alert(`Choice "${choice}" selected! (Progression logic to be implemented)`);
  };

  // Get counts for different item types
  const exploitCount = player.exploits?.length || 0;
  const curseCount = player.curses?.length || 0;
  const blessingCount = player.blessings?.length || 0;
  const fortuneCount = player.fortunes?.length || 0;

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
          
          {/* Score Display with Working Progress Bar */}
          <div className="score-display">
            <div>Score: {player.score || 0} / Goal: {encounter.scoreGoal || 0}</div>
            <div className="simple-progress-container">
              <div 
                ref={progressBarRef}
                className="simple-progress-bar"
                data-score={player.score || 0}
                data-goal={encounter.scoreGoal || 0}
              ></div>
            </div>
            <div className="progress-text">
              {encounter.scoreGoal ? Math.round(((player.score || 0) / encounter.scoreGoal) * 100) : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Player Resources */}
      <div className="resources-section">
        <div className="resource-grid">
          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-icon">🪙</span>
              <span className="resource-value">{player.coins || 0}</span>
            </div>
            <span className="resource-label">Coin</span>
          </div>
          
          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-icon">🔄</span>
              <span className="resource-value">{player.shuffles || 0}</span>
            </div>
            <span className="resource-label">Shuffles</span>
          </div>
          
          <div className="resource-item">
            <div className="resource-header">
              <span className="resource-icon">🗑️</span>
              <span className="resource-value">{player.discards || 0}</span>
            </div>
            <span className="resource-label">Discards</span>
          </div>
        </div>
      </div>

      {/* Active Effects Summary */}
      <div className="effects-section">
        <div className="effects-grid">
          <div className={`effect-count ${exploitCount > 0 ? 'has-items' : ''}`}>
            <div className="resource-header">
              <span className="effect-icon">⚔️</span>
              <span className="effect-value">{exploitCount}</span>
            </div>
            <span className="effect-label">Exploits</span>
          </div>
          
          <div className={`effect-count ${curseCount > 0 ? 'has-items' : ''}`}>
            <div className="resource-header">
              <span className="effect-icon">💀</span>
              <span className="effect-value">{curseCount}</span>
            </div>
            <span className="effect-label">Curses</span>
          </div>
          
          <div className={`effect-count ${blessingCount > 0 ? 'has-items' : ''}`}>
            <div className="resource-header">
              <span className="effect-icon">✨</span>
              <span className="effect-value">{blessingCount}</span>
            </div>
            <span className="effect-label">Blessings</span>
          </div>
          
          <div className={`effect-count ${fortuneCount > 0 ? 'has-items' : ''}`}>
            <span className="effect-icon">🍀</span>
            <span className="effect-value">{fortuneCount}</span>
            <span className="effect-label">Fortunes</span>
          </div>
        </div>
      </div>

      {/* Compact Mode Toggle (for smaller screens) */}
      <div className="hud-toggle">
        <button className="toggle-button" title="Toggle HUD size">📊</button>
      </div>
    </div>
  );
};