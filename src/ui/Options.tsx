import React, { useState, useEffect } from 'react';
import { persistenceManager } from '../engine/persistenceManager';
import type { PlayerProfile } from '../engine/persistenceManager';
import './Options.css';

export interface OptionsProps {
  onBack: () => void;
  engine?: any; // Optional engine instance for accessing feat tracker
}

interface SettingsState {
  audioEnabled: boolean;
  animationsEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  autoSave: boolean;
}

export const Options: React.FC<OptionsProps> = ({ onBack, engine }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'display' | 'testing'>('general');
  const [settings, setSettings] = useState<SettingsState>({
    audioEnabled: true,
    animationsEnabled: true,
    difficulty: 'normal',
    autoSave: true
  });
  const [_playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [_completedFeats, setCompletedFeats] = useState<string[]>([]);
  const [_featStats, setFeatStats] = useState<Record<string, number>>({});

  // Testing state
  const [selectedBlessing, setSelectedBlessing] = useState<string>('');
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [selectedWindow, setSelectedWindow] = useState<string>('welcome');
  const [registryEffectLogging, setRegistryEffectLogging] = useState<boolean>(false);
  const [effectLog, setEffectLog] = useState<Array<{timestamp: string, effect: string, value: any, source: string}>>([]);

  // Load user preferences and data on component mount
  useEffect(() => {
    const profile = persistenceManager.getPlayerProfile();
    setPlayerProfile(profile);
    
    if (profile?.preferences) {
      setSettings({
        audioEnabled: profile.preferences.soundEnabled,
        animationsEnabled: profile.preferences.animations,
        difficulty: profile.preferences.difficulty,
        autoSave: profile.preferences.autoSave
      });
    }

    // Load feat data if engine is available
    if (engine?.featTracker) {
      try {
        const completedFeatsData = engine.featTracker.getCompletedFeats?.() || [];
        const sessionStatsData = engine.featTracker.getSessionStats?.() || {};
        setCompletedFeats(completedFeatsData);
        setFeatStats(sessionStatsData);
      } catch (error) {
        console.warn('Error loading feat data:', error);
        setCompletedFeats([]);
        setFeatStats({});
      }
    }
  }, [engine]);

  // Save settings to persistence manager
  const saveSettings = (newSettings: Partial<SettingsState>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Update player profile preferences
    const profile = persistenceManager.getPlayerProfile();
    if (profile) {
      persistenceManager.savePlayerProfile({
        ...profile,
        preferences: {
          ...profile.preferences,
          soundEnabled: updatedSettings.audioEnabled,
          animations: updatedSettings.animationsEnabled,
          difficulty: updatedSettings.difficulty,
          autoSave: updatedSettings.autoSave
        }
      });
    }
  };

  const renderGeneralSettings = () => (
    <div className="options-section">
      <h3>General Settings</h3>
      
      <div className="setting-item">
        <label className="setting-label" htmlFor="difficulty-select">Difficulty</label>
        <select 
          id="difficulty-select"
          className="setting-select"
          value={settings.difficulty}
          onChange={(e) => saveSettings({ difficulty: e.target.value as 'easy' | 'normal' | 'hard' })}
        >
          <option value="easy">Easy</option>
          <option value="normal">Normal</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="setting-item">
        <label className="setting-label" htmlFor="auto-save-checkbox">Auto-Save Game Progress</label>
        <input
          id="auto-save-checkbox"
          type="checkbox"
          className="setting-checkbox"
          checked={settings.autoSave}
          onChange={(e) => saveSettings({ autoSave: e.target.checked })}
        />
      </div>
    </div>
  );

  const renderAudioSettings = () => (
    <div className="options-section">
      <h3>Audio Settings</h3>
      
      <div className="setting-item">
        <label className="setting-label" htmlFor="sound-effects-checkbox">Sound Effects</label>
        <input
          id="sound-effects-checkbox"
          type="checkbox"
          className="setting-checkbox"
          checked={settings.audioEnabled}
          onChange={(e) => saveSettings({ audioEnabled: e.target.checked })}
        />
      </div>

      <div className="setting-item">
        <label className="setting-label" htmlFor="master-volume-slider">Master Volume</label>
        <input
          id="master-volume-slider"
          type="range"
          className="setting-slider"
          min="0"
          max="100"
          defaultValue="75"
          disabled={!settings.audioEnabled}
          aria-label="Master Volume"
        />
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="options-section">
      <h3>Display Settings</h3>

      <div className="setting-item">
        <label className="setting-label" htmlFor="animations-checkbox">Animations</label>
        <input
          id="animations-checkbox"
          type="checkbox"
          className="setting-checkbox"
          checked={settings.animationsEnabled}
          onChange={(e) => saveSettings({ animationsEnabled: e.target.checked })}
          aria-label="Enable animations"
        />
      </div>

      <div className="setting-item">
        <label className="setting-label" htmlFor="animation-speed-select">Card Animation Speed</label>
        <select
          id="animation-speed-select"
          className="setting-select"
          disabled={!settings.animationsEnabled}
          aria-label="Card animation speed"
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </div>

      <div className="setting-item">
        <label className="setting-label" htmlFor="theme-select">Theme</label>
        <select
          id="theme-select"
          className="setting-select"
          aria-label="Select theme"
        >
          <option value="default">Default</option>
          <option value="dark">Dark</option>
          <option value="classic">Classic</option>
        </select>
      </div>
    </div>
  );

  const renderTestingSettings = () => {
    // Get available blessings and cards from registry and game state
    const availableBlessings = engine?.state?.registry ? Object.values(engine.state.registry).flat().filter((item: any) => item.type === 'blessing') : [];
    const allCards = engine?.state?.piles ? Object.values(engine.state.piles).flatMap((pile: any) => pile.cards || []) : [];

    return (
      <div className="options-section">
        <h3>Testing Tools</h3>

        {/* Blessing Application */}
        <div className="setting-item">
          <label className="setting-label">Apply Blessing to Card</label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select
              className="setting-select"
              value={selectedBlessing}
              onChange={(e) => setSelectedBlessing(e.target.value)}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <option value="">Select Blessing</option>
              {availableBlessings.map((blessing: any) => (
                <option key={blessing.id} value={blessing.id}>
                  {blessing.label}
                </option>
              ))}
            </select>
            <select
              className="setting-select"
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
              style={{ flex: '1', minWidth: '150px' }}
            >
              <option value="">Select Card</option>
              {allCards.map((card: any) => (
                <option key={card.id} value={card.id}>
                  {card.suit} {card.value} ({card.id})
                </option>
              ))}
            </select>
            <button
              className="setting-button"
              onClick={() => {
                if (selectedBlessing && selectedCard && engine) {
                  const blessingEffect = {
                    type: 'apply_blessing_to_card',
                    target: selectedCard,
                    value: selectedBlessing
                  };
                  engine.state = engine.effectEngine.applyEffects([blessingEffect], engine.state);
                  engine.emitEvent('stateChange', engine.state);
                  alert(`Applied ${selectedBlessing} to card ${selectedCard}`);
                }
              }}
              disabled={!selectedBlessing || !selectedCard}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Window/Stage Jump */}
        <div className="setting-item">
          <label className="setting-label" htmlFor="window-select">Jump to Window/Stage</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              id="window-select"
              className="setting-select"
              value={selectedWindow}
              onChange={(e) => setSelectedWindow(e.target.value)}
              style={{ flex: '1' }}
            >
              <option value="welcome">Welcome Screen</option>
              <option value="fortune-selection">Fortune Selection</option>
              <option value="game">Game Screen</option>
              <option value="trade">Trade Screen</option>
              <option value="wander">Wander Screen</option>
              <option value="options">Options</option>
              <option value="glossary">Glossary</option>
              <option value="history">History</option>
              <option value="next-encounter">Next Encounter</option>
              <option value="next-trial">Next Trial</option>
            </select>
            <button
              className="setting-button"
              onClick={() => {
                // This would need to be handled by the parent component
                // For now, we'll emit a custom event that the app can listen to
                if (engine) {
                  engine.emitEvent('jump_to_window', { window: selectedWindow });
                }
                alert(`Attempting to jump to: ${selectedWindow}`);
              }}
            >
              Jump
            </button>
          </div>
        </div>

        {/* Registry Effect Logging */}
        <div className="setting-item">
          <label className="setting-label" htmlFor="effect-logging-checkbox">Registry Effect Logging</label>
          <input
            id="effect-logging-checkbox"
            type="checkbox"
            className="setting-checkbox"
            checked={registryEffectLogging}
            onChange={(e) => {
              setRegistryEffectLogging(e.target.checked);
              if (engine) {
                engine.emitEvent('toggle_effect_logging', { enabled: e.target.checked });
              }
            }}
          />
        </div>

        {/* Effect Log Display */}
        {registryEffectLogging && (
          <div className="setting-item">
            <label className="setting-label">Effect Log</label>
            <div style={{
              maxHeight: '200px',
              overflowY: 'auto',
              background: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}>
              {effectLog.length === 0 ? (
                <div>No effects logged yet</div>
              ) : (
                effectLog.map((entry, index) => (
                  <div key={index} style={{ marginBottom: '5px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                    <div><strong>{entry.timestamp}</strong></div>
                    <div>Effect: {entry.effect}</div>
                    <div>Value: {JSON.stringify(entry.value)}</div>
                    <div>Source: {entry.source}</div>
                  </div>
                ))
              )}
            </div>
            <button
              className="setting-button"
              onClick={() => setEffectLog([])}
              style={{ marginTop: '10px' }}
            >
              Clear Log
            </button>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="options">
      <div className="options-container">
        <header className="options-header">
          <h1>Game Options</h1>
          <button className="close-button" onClick={onBack}>
            ✕
          </button>
        </header>

        <div className="options-navigation">
          <button
            className={`nav-button ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            ⚙️ General
          </button>
          <button
            className={`nav-button ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
          >
            🔊 Audio
          </button>
          <button
            className={`nav-button ${activeTab === 'display' ? 'active' : ''}`}
            onClick={() => setActiveTab('display')}
          >
            🎨 Display
          </button>
          <button
            className={`nav-button ${activeTab === 'testing' ? 'active' : ''}`}
            onClick={() => setActiveTab('testing')}
          >
            🧪 Testing
          </button>
        </div>

        <div className="options-content">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'audio' && renderAudioSettings()}
          {activeTab === 'display' && renderDisplaySettings()}
          {activeTab === 'testing' && renderTestingSettings()}
        </div>

        <div className="options-footer">
          <button className="back-button" onClick={onBack}>
            ← Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};