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
              Coronata is a solitaire-roguelike adventure that builds on Klondike-style patience. 
              Each run is a short campaign through trials of encounters that modify the base solitaire 
              game with narrative and mechanical twists. Collect powerful exploits, confront challenging 
              encounters, and grow stronger through each trial.
            </p>
          </section>

          <section className="basic-rules">
            <h2>Game Structure</h2>
            <div className="rules-grid">
              <div className="rule-card">
                <h3>🏔️ Runs & Trials</h3>
                <ul>
                  <li>Each run contains 5 Trials (15 total encounters)</li>
                  <li>Each Trial has 3 Encounters: Fear, Fear, Danger</li>
                  <li>Complete encounters by meeting score goals</li>
                  <li>After Fears: 1 Trade + 2 Wanders (random order)</li>
                  <li>After Dangers: mandatory Fortune swap + 50% bonus Trade</li>
                  <li>Final encounter: face the Usurper (boss)</li>
                  <li>Ascension System: 9 additional difficulty levels for replay</li>
                </ul>
              </div>
              
              <div className="rule-card">
                <h3>🃏 Card Movement</h3>
                <ul>
                  <li>Build tableaus in descending order with alternating colors</li>
                  <li>Move cards to foundations in ascending order by suit</li>
                  <li>Foundation plays score higher (2× base value by default)</li>
                  <li>Empty tableaus can only be filled with Kings</li>
                  <li>Move stacks of properly sequenced cards together</li>
                </ul>
              </div>

              <div className="rule-card">
                <h3>✋ Hand & Deck</h3>
                <ul>
                  <li>Start with 5 cards each encounter</li>
                  <li>Hand automatically refills when you play cards</li>
                  <li>Click deck to reveal cards to waste pile</li>
                  <li>Shuffle waste back to deck when empty (costs shuffle)</li>
                  <li>Discard Hand: shuffle entire hand back into deck</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="coronata-features">
            <h2>Registry Items</h2>
            
            <div className="feature-section">
              <h3>🔮 Fortunes</h3>
              <p>
                Run-level modifiers chosen at start and optionally swapped after Dangers. 
                Only one Fortune active at a time, providing persistent effects throughout the run.
              </p>
            </div>

            <div className="feature-section">
              <h3>⚔️ Exploits</h3>
              <p>
                Persistent items with passive or triggered effects (max 4 equipped). 
                Examples include bonus scoring, extra shuffles, or new movement rules.
              </p>
            </div>

            <div className="feature-section">
              <h3>✨ Blessings</h3>
              <p>
                Permanent card upgrades that attach to specific cards. Purchase blessings in Trade, 
                then apply them to individual cards in your deck. Blessed cards show sparkle effects 
                and provide enhanced benefits when played.
              </p>
            </div>

            <div className="feature-section">
              <h3>😈 Curses</h3>
              <p>
                Negative modifiers that restrict actions or impose costs. Applied during 
                encounters and can usually be removed through trading.
              </p>
            </div>

            <div className="feature-section">
              <h3>😨 Fears</h3>
              <p>
                Lightweight encounter modifiers for Fear encounters. Make encounters 
                more challenging with specific restrictions or effects.
              </p>
            </div>

            <div className="feature-section">
              <h3>⚠️ Dangers</h3>
              <p>
                Heavyweight encounter modifiers for Danger encounters. Multi-effect 
                challenges that significantly change gameplay mechanics.
              </p>
            </div>

            <div className="feature-section">
              <h3>🚶 Wanders</h3>
              <p>
                Narrative events with choice-based outcomes. <strong>The game randomly selects 
                which wander you encounter</strong> - you choose how to respond, not which event occurs.
                Present options like gaining coins, drawing cards, or receiving items.
              </p>
            </div>

            <div className="feature-section">
              <h3>🏆 Feats</h3>
              <p>
                Trackable achievements awarded for meeting specific objectives during runs. 
                Each feat provides coin and score rewards when completed.
              </p>
            </div>
          </section>

          <section className="progression-flow">
            <h2>⚠️ Important: Progression Flow</h2>
            <div className="feature-section">
              <p>
                <strong>After each Fear encounter:</strong> You get 1 Trade + 2 Wander events in random order.{' '}
                <strong>Once you leave the Trade window, you cannot return.</strong>{' '}
                Wanders are randomly selected by the game - you choose how to respond, not which event occurs.
                Plan your purchases carefully before leaving Trade!
              </p>
              <p>
                <strong>After each Danger encounter:</strong> You must swap your Fortune for a new one, 
                plus there's a 50% chance for a bonus Trade opportunity.
              </p>
            </div>
          </section>

          <section className="resources">
            <h2>Resources & Mechanics</h2>
            <div className="resource-grid">
              <div className="resource-item">
                <span className="resource-icon">🪙</span>
                <div>
                  <strong>Coins</strong>
                  <p>Start with 50 coins. Earn 25 per Fear, 40 per Danger, 60 from Usurper. Use for trading.</p>
                </div>
              </div>
              
              <div className="resource-item">
                <span className="resource-icon">🔄</span>
                <div>
                  <strong>Shuffles</strong>
                  <p>Limited per encounter (default 3). Used to shuffle waste pile back into deck.</p>
                </div>
              </div>
              
              <div className="resource-item">
                <span className="resource-icon">🗑️</span>
                <div>
                  <strong>Hand Discards</strong>
                  <p>Limited per encounter (default 3). Shuffle entire hand back into deck.</p>
                </div>
              </div>

              <div className="resource-item">
                <span className="resource-icon">🎯</span>
                <div>
                  <strong>Score Goals</strong>
                  <p>Smooth 25% growth per encounter. Foundation plays score 2× base value by default.</p>
                </div>
              </div>

              <div className="resource-item">
                <span className="resource-icon">🛒</span>
                <div>
                  <strong>Trade</strong>
                  <p>Fixed inventory each visit: 4 Exploits, 3 Blessings, 2 Curses. Plus upgrades, curse removal, reroll options.</p>
                </div>
              </div>

              <div className="resource-item">
                <span className="resource-icon">🏔️</span>
                <div>
                  <strong>Ascension Levels</strong>
                  <p>9 difficulty levels beyond base game. Higher costs, tougher goals, unique rewards and challenges.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};