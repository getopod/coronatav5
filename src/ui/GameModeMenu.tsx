import React, { useState } from 'react';
import { gameModeProfiles } from '../core_engine/gameModeProfiles';
import coronataCardBack from '../assets/coronata-card-back.png';
import coronataLogo from '../assets/coronata_logo_compact.svg';

// Game information for display
function getGameInfo(gameKey: string): { name: string; description: string } {
  const gameInfoMap: { [key: string]: { name: string; description: string } } = {
    klondike: { name: 'Klondike', description: 'Classic solitaire with building sequences' },
    spider: { name: 'Spider', description: 'Two-deck game with suit sequences' },
    freecell: { name: 'FreeCell', description: 'All cards visible, uses free cells' },
    pyramid: { name: 'Pyramid', description: 'Remove pairs that add to 13' },
    tripeaks: { name: 'Tri Peaks', description: 'Clear three overlapping peaks' },
    golf: { name: 'Golf', description: 'Clear tableau by building up or down' },
    yukon: { name: 'Yukon', description: 'Like Klondike but no stock pile' },
    aces_up: { name: 'Aces Up', description: 'Remove cards until only aces remain' },
    clock: { name: 'Clock', description: 'Turn over cards in clock formation' },
    forty_thieves: { name: 'Forty Thieves', description: 'Two-deck challenge solitaire' },
    canfield: { name: 'Canfield', description: 'Fast-paced foundation building' },
    baker_dozen: { name: "Baker's Dozen", description: 'Build foundations from 13 columns' },
    scorpion: { name: 'Scorpion', description: 'Build suit sequences in tableau' },
    wasp: { name: 'Wasp', description: 'Spider variant with different rules' }
  };
  
  return gameInfoMap[gameKey] || { name: gameKey.charAt(0).toUpperCase() + gameKey.slice(1), description: 'Classic solitaire variant' };
}

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
        <h2 style={{ marginBottom: 24, textAlign: 'center' }}>Classic Solitaire Games</h2>
        <p style={{ textAlign: 'center', color: '#ccc', marginBottom: 32, maxWidth: '600px' }}>
          Choose from {otherGameModes.length} different solitaire variants, each with unique rules and challenges.
        </p>
        
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
          {otherGameModes.map(([key, profile]) => {
            // Create proper display names and descriptions
            const gameInfo = getGameInfo(key);
            
            return (
              <button
                key={key}
                style={{
                  background: '#444', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '18px 24px', 
                  fontSize: 18, 
                  cursor: 'pointer', 
                  boxShadow: '0 2px 8px #0006', 
                  minWidth: 200,
                  maxWidth: 250,
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
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
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{gameInfo.name}</div>
                <div style={{ fontSize: 14, color: '#ccc', marginBottom: 6, lineHeight: '1.3' }}>{gameInfo.description}</div>
                <div style={{ fontSize: 12, color: '#aaa' }}>Tableau: {profile.tableauCount} • Foundation: {profile.foundationCount}</div>
              </button>
            );
          })}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <img src={coronataLogo} alt="Coronata Logo" style={{ width: 48, height: 72, filter: 'drop-shadow(0 4px 8px #0008)' }} />
            <span style={{ fontWeight: 700, fontSize: 32, color: '#ffd700', textShadow: '0 2px 4px #0008' }}>CORONATA</span>
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
