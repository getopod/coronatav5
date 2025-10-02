import React from 'react';
import './CoronataWelcomeScreen.css';

interface CoronataWelcomeScreenProps {
  onStart: () => void;
  onHowToPlay: () => void;
  onGlossary: () => void;
  onHistory: () => void;
  onOptions: () => void;
  onBack: () => void;
}

export function CoronataWelcomeScreen({
  onStart,
  onHowToPlay,
  onGlossary,
  onHistory,
  onOptions,
  onBack
}: CoronataWelcomeScreenProps) {
  return (
    <div className="coronata-welcome-screen">
      {/* New Logo and Branding */}
      <div className="welcome-logo">
        {/* New Logo Image - placeholder for now, will be replaced with actual image */}
        <div className="new-logo-container">
          <svg width="200" height="150" viewBox="0 0 200 150" className="new-logo-image">
            <defs>
              <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#fbbf24', stopOpacity:1}} />
                <stop offset="50%" style={{stopColor:'#f59e0b', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#d97706', stopOpacity:1}} />
              </linearGradient>
              
              <filter id="newGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Crown with Cards Logo */}
            <g transform="translate(100, 50)" filter="url(#newGlow)">
              {/* Crown Base */}
              <path d="M -60 35 L -50 15 L -35 30 L -20 5 L -10 30 L 0 0 L 10 30 L 20 5 L 35 30 L 50 15 L 60 35 L 60 50 L -60 50 Z" 
                    fill="url(#cardGrad)" stroke="#92400e" strokeWidth="2"/>
              <rect x="-60" y="50" width="120" height="12" fill="#f59e0b"/>
              
              {/* Gems */}
              <circle cx="-30" cy="22" r="6" fill="#dc2626"/>
              <circle cx="0" cy="15" r="8" fill="#1d4ed8"/>
              <circle cx="30" cy="22" r="6" fill="#16a34a"/>
              
              {/* Playing Cards */}
              <g transform="translate(-15, 60)">
                <rect x="0" y="0" width="30" height="40" rx="3" fill="white" stroke="#374151" strokeWidth="1"/>
                <text x="15" y="20" textAnchor="middle" fill="#dc2626" fontSize="16" fontWeight="bold">A</text>
                <text x="15" y="32" textAnchor="middle" fill="#dc2626" fontSize="12">♥</text>
              </g>
            </g>
          </svg>
        </div>
        
        {/* Coronata Title */}
        <h1 className="coronata-title">CORONATA</h1>
      </div>

      {/* Interactive buttons positioned below the logo */}
      <div className="button-overlay">
        <button className="welcome-button primary" onClick={onStart}>
          Start Game
        </button>
        
        <button className="welcome-button secondary" onClick={onHowToPlay}>
          How to Play
        </button>
        
        <button className="welcome-button secondary" onClick={onGlossary}>
          Glossary
        </button>
        
        <button className="welcome-button secondary" onClick={onHistory}>
          History
        </button>
        
        <button className="welcome-button secondary" onClick={onOptions}>
          Options
        </button>
        
        <button className="welcome-button back" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}