import React, { useState } from 'react';
import './HowToPlay.css';

export interface UpdatesProps {
  onBack: () => void;
}

export const Updates: React.FC<UpdatesProps> = ({ onBack }) => {
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
          <section className="tutorial-section">
            <div className="section-header" onClick={() => toggleSection('working')}>
              <h2>What is working?</h2>
              <span className={`expand-icon ${expandedSection === 'working' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'working' && (
              <div className="section-content">
                <ul>
                  <li>First encounter score & random Fear selected</li>
                  <li>Score goal, coin, & game board updated after each encounter</li>
                  <li>Trade or Wander screen loads after each Fear encounter</li>
                  <li>Fortune swap screen loads after each Danger encounter</li>
                  <li>Player HUD updates to include equipped items</li>
                  <li>Test panel injects all requested changes</li>
                  <li>Resign button prompts for confirmation</li>
                  <li>Double-click auto-move for cards (multi-destination highlight)</li>
                  <li>Green outlines for cards with multiple move options</li>
                </ul>
              </div>
            )}
          </section>
          <section className="tutorial-section">
            <div className="section-header" onClick={() => toggleSection('broken')}>
              <h2>What is broken?</h2>
              <span className={`expand-icon ${expandedSection === 'broken' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'broken' && (
              <div className="section-content">
                <ul>
                  <li>Some registry features (feats, curses, fortunes, wanders) not yet implemented</li>
                  <li>Advanced run history not yet available</li>
                  <li>Ascension levels not yet integrated</li>
                  <li>Suit icon coloring on foundations not yet implemented</li>
                  <li>Roadmap section in How to Play needs update</li>
                  <li>Some UI polish and accessibility improvements pending</li>
                  <li>Mobile layout issues on some screens</li>
                  <li>Edge cases for auto-move logic</li>
                  <li>Performance optimizations for large runs</li>
                </ul>
              </div>
            )}
          </section>
          <section className="tutorial-section">
            <div className="section-header" onClick={() => toggleSection('coming')}>
              <h2>What’s coming next?</h2>
              <span className={`expand-icon ${expandedSection === 'coming' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'coming' && (
              <div className="section-content">
                <ul>
                  <li>Endless mode and classic solitaire variants</li>
                  <li>Daily challenges and streak tracking</li>
                  <li>Customizable effects and registry entries</li>
                  <li>Local multiplayer support</li>
                  <li>Ascension levels and progression</li>
                  <li>Advanced run history and encounter recaps</li>
                  <li>Improved How to Play and roadmap section</li>
                  <li>UI polish and accessibility upgrades</li>
                  <li>Mobile optimization and bug fixes</li>
                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
