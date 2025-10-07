// React import not needed for JSX in modern setup

import './CoronataWelcomeScreen.css';
import { useState } from 'react';
import { RunHistoryWindow, RunHistory } from './TavernUI';
import { persistenceManager } from '../engine/persistenceManager';
interface CoronataWelcomeScreenProps {
  onStart: () => void;
  onHowToPlay: () => void;
  onGlossary: () => void;
  onUpdates: () => void;
}

export function CoronataWelcomeScreen({
  onStart,
  onHowToPlay,
  onGlossary,
  onUpdates
}: Readonly<CoronataWelcomeScreenProps>) {
  const [showHistory, setShowHistory] = useState(false);

  // Load and map game history to RunHistoryWindow format
  const gameHistory = persistenceManager.getGameHistory();
  const runs: RunHistory[] = gameHistory.map((session, i) => ({
    id: session.id,
    trial: i + 1,
    result: session.finalOutcome.charAt(0).toUpperCase() + session.finalOutcome.slice(1),
    score: session.score,
    date: new Date(session.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  })).reverse();

  return (
    <div className="coronata-welcome-screen">
      {/* Logo */}
      <div className="welcome-logo">
        <svg width="300" height="200" viewBox="0 0 300 200" className="logo-svg">
          <defs>
            <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              {/* eslint-disable-next-line react/no-inline-styles */}
              <stop offset="0%" style={{stopColor:'#ffed4e', stopOpacity:1}} />
              {/* eslint-disable-next-line react/no-inline-styles */}
              <stop offset="30%" style={{stopColor:'#ffd700', stopOpacity:1}} />
              {/* eslint-disable-next-line react/no-inline-styles */}
              <stop offset="70%" style={{stopColor:'#f4c430', stopOpacity:1}} />
              {/* eslint-disable-next-line react/no-inline-styles */}
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
          <g transform="translate(150, 60)" filter="url(#glow)">
            <path d="M -60 35 L -50 15 L -35 30 L -20 5 L -10 30 L 0 0 L 10 30 L 20 5 L 35 30 L 50 15 L 60 35 L 60 50 L -60 50 Z" 
                  fill="url(#crownGrad)" stroke="#b8860b" strokeWidth="2"/>
            <rect x="-60" y="50" width="120" height="15" fill="#f4c430"/>
            <circle cx="-30" cy="22" r="8" fill="#cc0000"/>
            <circle cx="0" cy="15" r="10" fill="#0066cc"/>
            <circle cx="30" cy="22" r="8" fill="#00cc66"/>
          </g>
          <text x="150" y="175" fontSize="48" fontWeight="bold" textAnchor="middle" fill="#ffd700" letterSpacing="4" filter="url(#glow)">CORONATA</text>
          <text x="150" y="200" fontSize="14" textAnchor="middle" fill="#cccccc" letterSpacing="2">ROGUE-LIKE SOLITAIRE</text>
        </svg>
      </div>

      {/* Buttons */}
      <div className="button-overlay">
        <button className="welcome-button primary" onClick={onStart}>
          Start
        </button>
        <button className="welcome-button secondary" onClick={onHowToPlay}>
          How To
        </button>
        <button className="welcome-button secondary" onClick={onGlossary}>
          Glossary
        </button>
        <button className="welcome-button secondary" onClick={() => setShowHistory(true)}>
          History
        </button>
        <button className="welcome-button secondary" onClick={onUpdates}>
          Updates
        </button>
      </div>

      {/* Run History Modal */}
      {showHistory && (
        <div className="tavern-modal-bg">
          <div className="tavern-modal">
            <RunHistoryWindow runs={runs} onClose={() => setShowHistory(false)} />
          </div>
        </div>
      )}
    </div>
  );
}