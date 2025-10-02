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
      {/* SVG Background with logo */}
      <div className="welcome-background">
        <svg viewBox="0 0 800 1200" className="welcome-svg" preserveAspectRatio="xMidYMid slice">
          {/* Background */}
          <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#1a1a2e', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#0f0f1a', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:1}} />
              <stop offset="50%" style={{stopColor:'#f8f8f8', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#e8e8e8', stopOpacity:1}} />
            </linearGradient>
            
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{stopColor:'#ffed4e', stopOpacity:1}} />
              <stop offset="30%" style={{stopColor:'#ffd700', stopOpacity:1}} />
              <stop offset="70%" style={{stopColor:'#f4c430', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#d4a700', stopOpacity:1}} />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="800" height="1200" fill="url(#bgGrad)"/>
          
          {/* Decorative corner elements */}
          <g filter="url(#glow)">
            <circle cx="60" cy="60" r="15" fill="#ffd700" opacity="0.3"/>
            <circle cx="740" cy="60" r="15" fill="#ffd700" opacity="0.3"/>
            <circle cx="60" cy="1140" r="15" fill="#ffd700" opacity="0.3"/>
            <circle cx="740" cy="1140" r="15" fill="#ffd700" opacity="0.3"/>
          </g>
          
          {/* Logo */}
          <g id="logo" transform="translate(400, 300)">
            {/* Cards and Crown - simplified for inline SVG */}
            <g transform="rotate(-12)" filter="url(#shadow)">
              <rect x="-70" y="-100" width="140" height="200" rx="12" fill="url(#cardGrad)" stroke="#2a2a2a" strokeWidth="2"/>
              <text x="0" y="-10" textAnchor="middle" fontSize="48" fill="#cc0000" fontFamily="Georgia">A</text>
              <path d="M -25 -5 C -25 -20, -8 -28, 10 -10 C 28 -28, 45 -20, 45 -5 C 45 20, 10 45, 10 65 C 10 45, -25 20, -25 -5 Z" 
                    fill="#cc0000" stroke="#990000" strokeWidth="2"/>
            </g>
            
            {/* Crown */}
            <g transform="translate(0, -180)" filter="url(#glow)">
              <path d="M -80 50 L -65 25 L -50 45 L -30 15 L -15 45 L 0 5 L 15 45 L 30 15 L 50 45 L 65 25 L 80 50 L 80 70 L -80 70 Z" 
                    fill="url(#crownGrad)" stroke="#b8860b" strokeWidth="3"/>
              <rect x="-80" y="70" width="160" height="20" fill="#f4c430"/>
              <circle cx="-45" cy="35" r="12" fill="#cc0000"/>
              <circle cx="0" cy="25" r="15" fill="#0066cc"/>
              <circle cx="45" cy="35" r="12" fill="#00cc66"/>
            </g>
          </g>
          
          {/* Game title */}
          <text x="400" y="580" fontSize="96" fontWeight="bold" textAnchor="middle" fill="#ffd700" letterSpacing="8" filter="url(#glow)">CORONATA</text>
          
          {/* Subtitle */}
          <text x="400" y="640" fontSize="32" textAnchor="middle" fill="#999" letterSpacing="4">SOLITAIRE ROGUELIKE</text>
        </svg>
      </div>

      {/* Interactive buttons positioned over the SVG */}
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