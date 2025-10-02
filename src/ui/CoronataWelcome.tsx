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
          <div className="game-description">
            <p>Face your fears, overcome dangers, and confront the ultimate boss.</p>
            <p>Trade, wander, and gamble your way through endless encounters.</p>
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="welcome-menu">
          <button 
            className="menu-btn primary"
            onClick={onStart}
          >
            🚀 Start Run
            <span className="btn-description">Begin a new adventure</span>
          </button>

          <div className="menu-grid">
            <button 
              className="menu-btn secondary"
              onClick={handleHowToPlay}
            >
              📖 How to Play
              <span className="btn-description">Learn the rules</span>
            </button>

            <button 
              className="menu-btn secondary"
              onClick={handleGlossary}
            >
              📚 Glossary
              <span className="btn-description">Registry items guide</span>
            </button>

            <button 
              className="menu-btn secondary"
              onClick={handleHistory}
            >
              📊 History
              <span className="btn-description">Past run records</span>
            </button>

            <button 
              className="menu-btn secondary"
              onClick={handleOptions}
            >
              ⚙️ Options
              <span className="btn-description">Game settings</span>
            </button>
          </div>

          <button 
            className="menu-btn back"
            onClick={onBack}
          >
            ← Back to Game Selection
          </button>
        </div>

        {/* Footer */}
        <div className="welcome-footer">
          <p>Prepare yourself for the challenge ahead...</p>
        </div>
      </div>
    </div>
  );
};