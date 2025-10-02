import React from 'react';
import './CoronataWelcome.css';

export interface CoronataWelcomeProps {
  onStart: () => void;
  onBack: () => void;
}

export const CoronataWelcome: React.FC<CoronataWelcomeProps> = ({ onStart, onBack }) => {
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
        {/* Header */}
        <div className="welcome-header">
          <h1 className="game-title">🌀 CORONATA</h1>
          <p className="game-subtitle">A Solitaire Adventure</p>
        </div>

        {/* Menu Buttons */}
        <div className="welcome-menu">
          <button 
            className="menu-btn primary"
            onClick={onStart}
          >
            🚀 Start
          </button>

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

          <button 
            className="menu-btn back"
            onClick={onBack}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};