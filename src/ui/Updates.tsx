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
            <div className="section-header" onClick={() => toggleSection('broken')}>
              <h2>What's Broken</h2>
              <span className={`expand-icon ${expandedSection === 'broken' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'broken' && (
              <div className="section-content">
                <ul>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>
                  <li></li>

                </ul>
              </div>
            )}
          </section>
          <section className="tutorial-section">
            <div className="section-header" onClick={() => toggleSection('working')}>
              <h2>What's Working</h2>
              <span className={`expand-icon ${expandedSection === 'working' ? 'expanded' : ''}`}>▼</span>
            </div>
            {expandedSection === 'working' && (
              <div className="section-content">
                <ul>
                  <li>First encounter score & random Fear selected</li>
                  <li>Score goal, coin, & game board updated after each encounter</li>
                  <li>Trade or Wander screen loads after each Fear encounter</li>
                  <li>Fortune swap screen loads after each Danger encounter</li>
                  <li>Player HUD updates to include equiped items</li>
                  <li>Test panel injects all requested changes </li>
                  <li>Resign button prompts for confirmation </li>
                  <li></li>

                </ul>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
