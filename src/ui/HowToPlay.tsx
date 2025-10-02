import React from 'react';
import './HowToPlay.css';

export interface HowToPlayProps {
  onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  return (
    <div className="how-to-play">
      <div className="how-to-play-container">
        <header className="how-to-play-header">
          <h1>How to Play Coronata</h1>
          <button className="close-button" onClick={onBack}>
            ✕
          </button>
        </header>

        <div className="how-to-play-content">
          <section className="game-overview">
            <h2>Game Overview</h2>
            <p>
              Coronata is a mystical solitaire adventure where you explore an enchanted realm, 
              collecting powerful exploits, blessings, and confronting fears as you progress 
              through encounters. Your goal is to clear tableaus and build foundations while 
              managing your resources and growing stronger with each victory.
            </p>
          </section>

          <section className="basic-rules">
            <h2>Basic Solitaire Rules</h2>
            <div className="rules-grid">
              <div className="rule-card">
                <h3>🃏 Card Movement</h3>
                <ul>
                  <li>Build tableaus in descending order with alternating colors</li>
                  <li>Move cards to foundations in ascending order by suit (A-K)</li>
                  <li>Only face-up cards can be moved</li>
                  <li>Empty tableaus can only be filled with Kings</li>
                </ul>
              </div>
              
              <div className="rule-card">
                <h3>✋ Player Hand</h3>
                <ul>
                  <li>Start with 5 cards in your hand</li>
                  <li>Play cards from your hand to tableaus or foundations</li>
                  <li>When you play a card from hand, draw a new one from the deck</li>
                  <li>Use the Discard button to shuffle hand back into deck</li>
                </ul>
              </div>

              <div className="rule-card">
                <h3>🏆 Scoring</h3>
                <ul>
                  <li>Cards played to tableaus score their face value</li>
                  <li>Cards played to foundations score double their face value</li>
                  <li>Special effects can modify scoring rules</li>
                  <li>Aces = 1, Face cards = 10, Number cards = face value</li>
                </ul>
              </div>

              <div className="rule-card">
                <h3>🔄 Shuffles & Discards</h3>
                <ul>
                  <li>Limited shuffles per encounter (usually 3)</li>
                  <li>Limited discards per encounter</li>
                  <li>Use them wisely to access buried cards</li>
                  <li>Some effects can increase these limits</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="coronata-features">
            <h2>Coronata Adventure Features</h2>
            
            <div className="feature-section">
              <h3>🗺️ Encounters</h3>
              <p>
                Each round is an "encounter" where you must clear cards while managing limited resources. 
                Successfully completing encounters earns rewards and advances your journey.
              </p>
            </div>

            <div className="feature-section">
              <h3>⚔️ Exploits</h3>
              <p>
                Permanent upgrades that enhance your abilities. Examples include bonus scoring, 
                extra shuffles, or new movement rules. Collect these to become more powerful.
              </p>
            </div>

            <div className="feature-section">
              <h3>✨ Blessings</h3>
              <p>
                Temporary enchantments applied to specific cards. These provide one-time benefits 
                like extra points, special movement options, or resource gains.
              </p>
            </div>

            <div className="feature-section">
              <h3>😨 Fears</h3>
              <p>
                Negative effects that make encounters more challenging. These might limit your 
                movement options, reduce scoring, or impose other restrictions.
              </p>
            </div>
          </section>

          <section className="resources">
            <h2>Resources & Currency</h2>
            <div className="resource-grid">
              <div className="resource-item">
                <span className="resource-icon">🪙</span>
                <div>
                  <strong>Coin</strong>
                  <p>Earned through play and used for trading opportunities</p>
                </div>
              </div>
              
              <div className="resource-item">
                <span className="resource-icon">🔄</span>
                <div>
                  <strong>Shuffles</strong>
                  <p>Remaining deck shuffles for this encounter</p>
                </div>
              </div>
              
              <div className="resource-item">
                <span className="resource-icon">🗑️</span>
                <div>
                  <strong>Discards</strong>
                  <p>Remaining hand discards for this encounter</p>
                </div>
              </div>
            </div>
          </section>

          <section className="strategy-tips">
            <h2>Strategy Tips</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>🎯 Plan Ahead</h4>
                <p>Look at face-down cards when possible and plan your moves to reveal useful cards</p>
              </div>
              
              <div className="tip-card">
                <h4>⚡ Exploit Synergies</h4>
                <p>Combine exploits for powerful effects - some work better together than others</p>
              </div>
              
              <div className="tip-card">
                <h4>💰 Resource Management</h4>
                <p>Don't waste shuffles and discards early - save them for when you really need them</p>
              </div>
              
              <div className="tip-card">
                <h4>🎲 Risk vs Reward</h4>
                <p>Choose your path carefully - easier encounters give fewer rewards but safer progress</p>
              </div>
            </div>
          </section>

          <section className="victory-conditions">
            <h2>Victory & Progression</h2>
            <p>
              Win encounters by clearing all cards from the tableaus or meeting specific objectives. 
              Each victory grants you choices for future encounters and the chance to gain new abilities. 
              Your ultimate goal is to become powerful enough to face the final challenges of Coronata!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};