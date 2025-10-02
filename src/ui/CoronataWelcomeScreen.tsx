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
      {/* Simplified Logo positioned above buttons */}
      <div className="welcome-logo">
        <svg width="300" height="200" viewBox="0 0 300 200" className="logo-svg">
          <defs>
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#ffed4e', stopOpacity:1}} />
              <stop offset="30%" style={{stopColor:'#ffd700', stopOpacity:1}} />
              <stop offset="70%" style={{stopColor:'#f4c430', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#d4a700', stopOpacity:1}} />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Crown Logo */}
          <g transform="translate(150, 60)" filter="url(#glow)">
            <path d="M -60 35 L -50 15 L -35 30 L -20 5 L -10 30 L 0 0 L 10 30 L 20 5 L 35 30 L 50 15 L 60 35 L 60 50 L -60 50 Z" 
                  fill="url(#crownGrad)" stroke="#b8860b" strokeWidth="2"/>
            <rect x="-60" y="50" width="120" height="15" fill="#f4c430"/>
            <circle cx="-30" cy="22" r="8" fill="#cc0000"/>
            <circle cx="0" cy="15" r="10" fill="#0066cc"/>
            <circle cx="30" cy="22" r="8" fill="#00cc66"/>
          </g>
          
          {/* Game Title */}
          <text x="150" y="120" fontSize="36" fontWeight="bold" textAnchor="middle" fill="#ffd700" letterSpacing="4" filter="url(#glow)">CORONATA</text>
          
          {/* Subtitle */}
          <text x="150" y="145" fontSize="14" textAnchor="middle" fill="#cccccc" letterSpacing="2">SOLITAIRE ROGUELIKE</text>
        </svg>
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