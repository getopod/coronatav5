import React, { useState } from 'react';
import { gameModeProfiles } from '../engine/gameModeProfiles';
import coronataCardBack from '../assets/coronata-card-back.png';
import coronataLogo from '../assets/coronata_logo_compact.svg';

export function GameModeMenu({ onSelect }: { onSelect: (mode: string) => void }) {
  const [showingOtherModes, setShowingOtherModes] = useState(false);

  // Get all game modes except coronata for the "Other" submenu
  const otherGameModes = Object.entries(gameModeProfiles).filter(([key]) => key !== 'coronata');
  const coronataProfile = gameModeProfiles.coronata;

  if (showingOtherModes) {
    // Show the "Other" submenu with all non-Coronata game modes
    return (
      <div className="game-mode-menu" style={{
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        background: '#222', 
        color: '#fff',
        zIndex: 1000
      }}>
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Other Game Modes</h2>
        
        {/* Back button */}
        <button
          style={{
            background: '#333', 
            color: '#ccc', 
            border: '2px solid #555', 
            borderRadius: 8, 
            padding: '12px 24px', 
            fontSize: 16, 
            cursor: 'pointer', 
            marginBottom: 32,
            transition: 'all 0.2s ease'
          }}
          onClick={() => setShowingOtherModes(false)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#444';
            e.currentTarget.style.borderColor = '#777';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#333';
            e.currentTarget.style.borderColor = '#555';
          }}
        >
          ← Back to Main Menu
        </button>

        <div style={{ 
          display: 'flex', 
          gap: 32, 
          flexWrap: 'wrap', 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {otherGameModes.map(([key, profile]) => (
            <button
              key={key}
              style={{
                background: '#444', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '18px 32px', 
                fontSize: 20, 
                cursor: 'pointer', 
                boxShadow: '0 2px 8px #0006', 
                minWidth: 180,
                transition: 'all 0.2s ease'
              }}
              onClick={() => onSelect(key)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#555';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px #0008';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#444';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px #0006';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 22 }}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </div>
              <div style={{ fontSize: 15, color: '#ccc', marginTop: 8 }}>{profile.rules}</div>
              <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>Tableau: {profile.tableauCount}, Foundation: {profile.foundationCount}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Show the main menu with Coronata first and "Other" option
  return (
    <div className="game-mode-menu" style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      width: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      background: '#222', 
      color: '#fff',
      zIndex: 1000
    }}>
      <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Select Game Mode</h2>
      <div style={{ 
        display: 'flex', 
        gap: 32, 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        
        {/* Coronata - Featured prominently */}
        <button
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', 
            color: '#fff', 
            border: '3px solid #ffd700', 
            borderRadius: 12, 
            padding: '24px 40px', 
            fontSize: 24, 
            cursor: 'pointer', 
            boxShadow: '0 4px 16px #0008', 
            minWidth: 220,
            transition: 'all 0.3s ease'
          }}
          onClick={() => onSelect('coronata')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 24px #0008, 0 0 20px #ffd70040';
            e.currentTarget.style.borderColor = '#ffed4e';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px #0008';
            e.currentTarget.style.borderColor = '#ffd700';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <img src={coronataLogo} alt="Coronata Logo" style={{ width: 24, height: 36, filter: 'drop-shadow(0 2px 4px #0004)' }} />
            <span style={{ fontWeight: 700, fontSize: 28, color: '#ffd700', textShadow: '0 2px 4px #0008' }}>CORONATA</span>
          </div>
          <div style={{ fontSize: 16, color: '#ccc', marginTop: 4, fontStyle: 'italic' }}>Solitaire Roguelike</div>
          <div style={{ fontSize: 14, color: '#aaa', marginTop: 6 }}>Tableau: {coronataProfile.tableauCount}, Foundation: {coronataProfile.foundationCount}</div>
        </button>

        {/* Other Game Modes */}
        <button
          style={{
            background: '#444', 
            color: '#fff', 
            border: '2px solid #666', 
            borderRadius: 8, 
            padding: '18px 32px', 
            fontSize: 20, 
            cursor: 'pointer', 
            boxShadow: '0 2px 8px #0006', 
            minWidth: 180,
            transition: 'all 0.2s ease'
          }}
          onClick={() => setShowingOtherModes(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#555';
            e.currentTarget.style.borderColor = '#888';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px #0008';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#444';
            e.currentTarget.style.borderColor = '#666';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px #0006';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 22 }}>Other</span>
            <span style={{ fontSize: 18, color: '#aaa' }}>→</span>
          </div>
          <div style={{ fontSize: 15, color: '#ccc', marginTop: 8 }}>Classic solitaire modes</div>
          <div style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>{otherGameModes.length} modes available</div>
        </button>

      </div>
    </div>
  );
}
