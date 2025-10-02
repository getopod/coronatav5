import React from 'react';
import { gameModeProfiles } from '../engine/gameModeProfiles';
import coronataCardBack from '../assets/coronata-card-back.png';

export function GameModeMenu({ onSelect }: { onSelect: (mode: string) => void }) {
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
        {Object.entries(gameModeProfiles).map(([key, profile]) => (
          <button
            key={key}
            style={{
              background: '#444', color: '#fff', border: 'none', borderRadius: 8, padding: '18px 32px', fontSize: 20, cursor: 'pointer', boxShadow: '0 2px 8px #0006', minWidth: 180
            }}
            onClick={() => onSelect(key)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {key === 'coronata' && (
                <img src={coronataCardBack} alt="Coronata Card Back" style={{ width: 32, height: 44, borderRadius: 4, boxShadow: '0 1px 4px #0008' }} />
              )}
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
