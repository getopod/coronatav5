import React, { useState } from 'react';
import './HowToPlay.css';

export interface HowToPlayProps {
  onBack: () => void;
}

export const HowToPlay: React.FC<HowToPlayProps> = ({ onBack }) => {
  // Only one section can be expanded at a time; all collapsed by default
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const toggleSection = (sectionId: string) => {
    setExpandedSection(prev => (prev === sectionId ? null : sectionId));
  };
  return (
    <div className="how-to-play">
      <div className="how-to-play-container">
        <button className="close-button" onClick={onBack}>
          ✕
        </button>

        <div className="how-to-play-content">
          <section className="game-overview">
            <h2>🌀 Welcome to Coronata</h2>
            <p>
              <strong>Coronata</strong> transforms classic Klondike solitaire into an epic roguelike adventure.
              Each run is a unique journey through 15 encounters across 5 trials, where every decision shapes
              your path to victory. Master the art of patience while wielding powerful registry items,
              confronting fearsome challenges, and building an unstoppable deck that defies the odds.
            </p>
          </section>

          {/* Quick Start Guide */}
          <section className="tutorial-section">
            <div className="section-header" onClick={() => toggleSection('quick-start')}>
              <h2>Quick Start</h2>
              <span className={`expand-icon ${expandedSection === 'quick-start' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'quick-start' && (
              <div className="section-content">
                <div className="tutorial-step">
                  <h3>Step 1: Choose Your Fortune</h3>
                  <p>Every run starts by selecting one of three Fortunes. These define your playstyle:</p>
                  <ul>
                    <li><strong>Foundation Focus:</strong> Bonus points for building suits</li>
                    <li><strong>Tableau Master:</strong> Enhanced card movement and reveals</li>
                    <li><strong>Resource Hoarder:</strong> Extra shuffles and discards</li>
                  </ul>
                </div>
                <div className="tutorial-step">
                  <h3>Step 2: Master Basic Card Movement</h3>
                  <p>The core of Coronata is still Klondike solitaire:</p>
                  <ul>
                    <li><strong>Tableau:</strong> Build descending sequences of alternating colors</li>
                    <li><strong>Foundation:</strong> Build ascending sequences by suit (A-2-3...K)</li>
                    <li><strong>Empty Columns:</strong> Only Kings can fill empty tableau spots</li>
                    <li><strong>Stack Moves:</strong> Move properly sequenced groups together</li>
                  </ul>
                </div>
                <div className="tutorial-step">
                  <h3>Step 3: Understand Your Resources</h3>
                  <p>You start with limited resources that refresh each encounter:</p>
                  <ul>
                    <li><strong>Coins:</strong> 50 starting, earn 25/40/60 per encounter</li>
                    <li><strong>Shuffles:</strong> 3 per encounter (recycle waste to deck)</li>
                    <li><strong>Discards:</strong> 3 per encounter (reshuffle entire hand)</li>
                    <li><strong>Hand Size:</strong> 5 cards (upgradeable)</li>
                  </ul>
                </div>
                <div className="tutorial-step">
                  <h3>Step 4: Win Your First Encounter</h3>
                  <p>Each encounter has a score goal that increases over time:</p>
                  <ul>
                    <li><strong>Foundation Priority:</strong> Foundation plays score 2× points</li>
                    <li><strong>Goal Scaling:</strong> ~25% increase per encounter</li>
                    <li><strong>Progress Bar:</strong> Shows current score vs. goal</li>
                    <li><strong>Time Pressure:</strong> No strict timer, but efficiency matters</li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Complete Rules Reference */}
          <section className="tutorial-section">
            <div className="section-header" onClick={() => toggleSection('rules')}>
              <h2>Structure</h2>
              <span className={`expand-icon ${expandedSection === 'rules' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'rules' && (
              <div className="section-content">
                <div className="rules-grid">
                  <div className="rule-card">
                    <h3>🏔️ Structure</h3>
                    <ul>
                      <li><strong>5 Trials, 15 Encounters:</strong> Fear → Fear → Danger × 5</li>
                      <li><strong>Victory:</strong> Meet score goals to progress</li>
                      <li><strong>After Fears:</strong> Trade + 2 random Wanders</li>
                      <li><strong>After Dangers:</strong> Fortune swap + 50% bonus Trade</li>
                      <li><strong>Final Boss:</strong> Usurper encounter</li>
                    </ul>
                  </div>
                <div className="feature-section">
                  <h3>🎯 After Fear Encounters</h3>
                  <p>
                    You receive <strong>1 Trade + 2 Wander events</strong> in random order.
                    Wanders are randomly selected by the game - you choose responses, not events.
                    <em> Plan purchases carefully - timing is everything!</em>
                  </p>
                  <h3>⚡ After Danger Encounters</h3>
                  <p>
                    <strong>Fortune swap</strong> - you <strong>must</strong> exchange your current Fortune for a new one.
                    Plus <strong>50% chance for bonus Trade</strong> opportunity.
                    Use this to adapt your strategy mid-run!
                  </p>
                  <h3>🏆 Final Challenge</h3>
                  <p>
                    After completing all 15 encounters, face the <strong>Usurper</strong> - the ultimate boss.
                    Your build, resources, and choices determine victory or defeat.
                  </p>
                </div>
                  <div className="rule-card">
                    <h3>🃏 Moves</h3>
                    <ul>
                      <li><strong>Tableau:</strong> Descending, alternating colors</li>
                      <li><strong>Foundation:</strong> Ascending by suit (2× score)</li>
                      <li><strong>King Rule:</strong> Only Kings fill empty columns</li>
                      <li><strong>Stack Moves:</strong> Properly sequenced groups</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="tutorial-section">
            <div className="section-header" onClick={() => toggleSection('registry-items')}>
              <h2>Mechanics</h2>
              <span className={`expand-icon ${expandedSection === 'registry-items' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'registry-items' && (
              <div className="section-content">
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
              </div>
            )}
          </section>

          <section className="tutorial-section">
            <div className="section-header" onClick={() => toggleSection('beginner-tips')}>
              <h2>Tips</h2>
              <span className={`expand-icon ${expandedSection === 'beginner-tips' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'beginner-tips' && (
              <div className="section-content">
                <div className="tips-grid">
                  <div className="tip-card">
                    <h3>🎯 Play where you want</h3>
                    <p>Foundation plays score 2× and 3x if that card has not been played to a Tableau that encounter, so no need to worry about missing out on points!</p>
                  </div>
                  <div className="tip-card">
                    <h3>🪙 Save Early, Spend Wisely</h3>
                    <p>Don't blow your starting coins on the first trade. Save for powerful items that appear later in your run.</p>
                  </div>
                  <div className="tip-card">
                    <h3>🔮 Choose Fortunes Carefully</h3>
                    <p>Your starting Fortune defines your playstyle. Some favor aggressive foundation building, others enable complex tableau strategies.</p>
                  </div>
                  <div className="tip-card">
                    <h3>⚔️ Build Synergies</h3>
                    <p>Exploits work best in combination. Look for items that complement your Fortune and playing style.</p>
                  </div>
                  <div className="tip-card">
                    <h3>✨ Bless Key Cards</h3>
                    <p>Apply blessings to cards you play frequently (Kings for empty columns, Aces for foundations, high-value cards).</p>
                  </div>
                  <div className="tip-card">
                    <h3>🎲 Embrace the Chaos</h3>
                    <p>Every run is different! Failed runs teach you more than successful ones. Learn from each attempt.</p>
                  </div>
                </div>
              </div>
            )}
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