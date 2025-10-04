import React, { useState } from 'react';
import coronataLogo from '../assets/coronata_logo_compact.svg';
import './CoronataWelcome.css';

export interface CoronataWelcomeProps {
  onStart: (ascensionLevel: number) => void;
  onBack: () => void;
}

export const CoronataWelcome: React.FC<CoronataWelcomeProps> = ({ onStart, onBack }) => {
  const [showAscensionSelect, setShowAscensionSelect] = useState(false);
  const [selectedAscension, setSelectedAscension] = useState(0);

  // Mock ascension unlock status - replace with actual game state
  const ascensionLevels = [
    { level: 0, name: 'Apprentice', unlocked: true, description: 'Standard difficulty' },
    { level: 1, name: 'Journeyman', unlocked: false, description: 'Increased challenge' },
    { level: 2, name: 'Master', unlocked: false, description: 'Expert level' },
    { level: 3, name: 'Legend', unlocked: false, description: 'Ultimate challenge' },
    { level: 4, name: 'Mythic', unlocked: false, description: 'Impossible mode' },
    { level: 5, name: 'Divine', unlocked: false, description: 'God-like difficulty' },
    { level: 6, name: 'Transcendent', unlocked: false, description: 'Beyond human' },
    { level: 7, name: 'Cosmic', unlocked: false, description: 'Universal scale' },
    { level: 8, name: 'Infinite', unlocked: false, description: 'Endless void' },
    { level: 9, name: 'Absolute', unlocked: false, description: 'Final frontier' }
  ];

  const handleLogoClick = () => {
    setShowAscensionSelect(!showAscensionSelect);
  };

  const handleAscensionSelect = (level: number) => {
    setSelectedAscension(level);
    setShowAscensionSelect(false);
    onStart(level);
  };

  const handleHowToPlay = () => {
    alert('How to Play guide will be implemented soon!');
  };

  const handleGlossary = () => {
    alert('Glossary of registry items will be implemented soon!');
  };

  const handleHistory = () => {
    alert('Run history will be implemented soon!');
  };

  const handleOptions = () => {
    alert('Game options will be implemented soon!');
  };

  return (
    <div className="coronata-welcome">
      <div className="welcome-container">
        {/* Header - Now a clickable button */}
        <button className="welcome-header-button" onClick={handleLogoClick}>
          <div className="welcome-header">
            <img src={coronataLogo} alt="Coronata Logo" className="game-logo" />
            <p className="game-subtitle">A Solitaire Adventure</p>
            {selectedAscension > 0 && (
              <p className="ascension-indicator">Ascension {selectedAscension}</p>
            )}
          </div>
        </button>

        {/* Ascension Level Selector */}
        {showAscensionSelect && (
          <div className="ascension-selector">
            <h3>Select Ascension Level</h3>
            <div className="ascension-grid">
              {ascensionLevels.map(level => (
                <button
                  key={level.level}
                  className={`ascension-btn ${level.unlocked ? 'unlocked' : 'locked'} ${selectedAscension === level.level ? 'selected' : ''}`}
                  onClick={() => level.unlocked && handleAscensionSelect(level.level)}
                  disabled={!level.unlocked}
                >
                  <div className="ascension-level">{level.level}</div>
                  <div className="ascension-name">{level.name}</div>
                  <div className="ascension-desc">{level.description}</div>
                  {!level.unlocked && <div className="lock-icon">🔒</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Buttons */}
        <div className="welcome-menu">
          <div className="menu-grid">
            <button
              className="menu-btn secondary"
              onClick={handleHowToPlay}
            >
              📖 How to
            </button>

            <button
              className="menu-btn secondary"
              onClick={handleGlossary}
            >
              📚 Glossary
            </button>

            <button
              className="menu-btn secondary"
              onClick={handleHistory}
            >
              📊 History
            </button>

            <button
              className="menu-btn secondary"
              onClick={handleOptions}
            >
              ⚙️ Options
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};