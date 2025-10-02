import React from 'react';
import './HowToPlay.css';

export interface HowToPlayProps {
  onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  return (
    <div className="how-to-play">
      <div className="how-to-play-container">
        <button className="close-button" onClick={onBack}>
          ✕
        </button>

        <div className="how-to-play-content">
          <section className="game-overview">
            <h2>Welcome to Coronata</h2>
            <p>
              Coronata is a roguesolitaire adventure where you build foundations and clear tableaus 
              while collecting powerful exploits and confronting challenging encounters. Each run takes you 
              through 5 trials with increasing difficulty as you grow stronger with magical items and abilities.
            </p>
          </section>

          <section className="basic-rules">
            <h2>Basic Solitaire Rules</h2>
            <div className="rules-grid">
              <div className="rule-card">
                <h3>🃏 Card Movement</h3>
                <ul>
                  <li>Build tableaus in descending order with alternating colors (Red-Black-Red...)</li>
                  <li>Move cards to foundations in ascending order by suit (A-2-3...J-Q-K)</li>
                  <li>Only face-up cards can be moved</li>
                  <li>Empty tableaus can only be filled with Kings</li>
                  <li>You can move stacks of properly sequenced cards together</li>
                </ul>
              </div>
              
              <div className="rule-card">
                <h3>✋ Player Hand</h3>
                <ul>
                  <li>Start with 5 cards each encounter</li>
                  <li>Play cards from your hand to tableaus or foundations</li>
                  <li>Hand automatically refills when you play cards (if deck has cards)</li>
                  <li>Click deck to reveal cards to the waste pile</li>
                  <li>Use Discard Hand button to shuffle hand back into deck (limited uses)</li>
                </ul>
              </div>

              <div className="rule-card">
                <h3>Resources</h3>
                <ul>
                  <li>Shuffles: Limited per encounter (usually 3) - used when deck is empty</li>
                  <li>Discards: Limited hand discards per encounter (usually 3)</li>
                  <li>Coins: Earned from encounters, used for trading</li>
                  <li>Some exploits and effects can increase these limits</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="coronata-features">
            <h2>Features</h2>
            
            <div className="feature-section">
              <h3>Trials & Encounters</h3>
              <p>
                Each run consists of 5 trials, each containing multiple encounters. Each encounter 
                requires you to clear cards while meeting score goals and managing limited resources. 
                Successfully completing encounters earns rewards and advances your journey through each trial.
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

        </div>
      </div>
    </div>
  );
};