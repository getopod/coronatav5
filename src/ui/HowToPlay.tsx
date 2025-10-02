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
                <h3>� Runs & Trials</h3>
                <ul>
                  <li>Each run contains 3 Trials</li>
                  <li>Each Trial has 3 Encounters: Fear, Fear, Danger</li>
                  <li>Complete encounters by meeting score goals</li>
                  <li>After Fears: choose Trade, Wander, or Gamble</li>
                  <li>After Dangers: option to swap Fortune</li>
                  <li>Final encounter: face the Usurper (boss)</li>
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
                Tactical, often one-time modifiers that attach to cards or trigger once. 
                Provide temporary benefits like extra points or special movement options.
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
                Narrative events with choice-based outcomes. Present options like 
                gaining coins, drawing cards, or receiving items with deterministic results.
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

          <section className="resources">
            <h2>Resources & Mechanics</h2>
            <div className="resource-grid">
              <div className="resource-item">
                <span className="resource-icon">🪙</span>
                <div>
                  <strong>Coins</strong>
                  <p>Earned through encounters and effects, used for trading. Interest rate: 20% per encounter.</p>
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
                  <p>Each encounter has a target score. Foundation plays score 2× base value by default.</p>
                </div>
              </div>

              <div className="resource-item">
                <span className="resource-icon">🛒</span>
                <div>
                  <strong>Trade</strong>
                  <p>After Fears: buy Exploits, Blessings, upgrades. Remove Curses. Reroll shop inventory.</p>
                </div>
              </div>

              <div className="resource-item">
                <span className="resource-icon">🎲</span>
                <div>
                  <strong>Gamble</strong>
                  <p>Skip Trade/Wander for 25% scoring bonus in next encounter. Risk vs reward.</p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};