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
  const [activeTab, setActiveTab] = useState<'general' | 'audio' | 'display'>('general');
  const [settings, setSettings] = useState<SettingsState>({
    audioEnabled: true,
    animationsEnabled: true,
    difficulty: 'normal',
    autoSave: true
  });
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [completedFeats, setCompletedFeats] = useState<string[]>([]);
  const [featStats, setFeatStats] = useState<Record<string, number>>({});

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

  const renderAchievements = () => (
    <div className="options-section">
      <h3>Achievements</h3>
      
      <div className="achievements-stats">
        <div className="achievement-summary">
          <div className="stat-card">
            <span className="stat-number">{completedFeats.length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{featStats.moves || 0}</span>
            <span className="stat-label">Total Moves</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{featStats.wins || 0}</span>
            <span className="stat-label">Games Won</span>
          </div>
        </div>
      </div>

      {completedFeats.length > 0 ? (
        <div className="completed-feats">
          <h4>Recent Achievements</h4>
          {completedFeats.slice(-5).map((featId) => (
            <div key={featId} className="feat-item">
              <span className="feat-icon">🏆</span>
              <span className="feat-name">{featId}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-achievements">
          <p>No achievements unlocked yet. Keep playing to earn your first feat!</p>
        </div>
      )}
    </div>
  );

  const renderStatistics = () => (
    <div className="options-section">
      <h3>Statistics</h3>
      
      {playerProfile ? (
        <div className="statistics-grid">
          <div className="stat-category">
            <h4>Game Performance</h4>
            <div className="stat-row">
              <span>Total Sessions:</span>
              <span>{playerProfile.totalSessions}</span>
            </div>
            <div className="stat-row">
              <span>Total Score:</span>
              <span>{playerProfile.totalScore.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span>Best Score:</span>
              <span>{playerProfile.bestScore.toLocaleString()}</span>
            </div>
            <div className="stat-row">
              <span>Win Rate:</span>
              <span>{(playerProfile.winRate * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="stat-category">
            <h4>Game History</h4>
            <div className="stat-row">
              <span>Victories:</span>
              <span>{playerProfile.totalVictories}</span>
            </div>
            <div className="stat-row">
              <span>Defeats:</span>
              <span>{playerProfile.totalDefeats}</span>
            </div>
            <div className="stat-row">
              <span>Resigned:</span>
              <span>{playerProfile.totalResigns}</span>
            </div>
            <div className="stat-row">
              <span>Average Score:</span>
              <span>{Math.round(playerProfile.averageScore).toLocaleString()}</span>
            </div>
          </div>

          <div className="stat-category">
            <h4>Progress</h4>
            <div className="stat-row">
              <span>Coins Earned:</span>
              <span>{playerProfile.totalCoinsEarned}</span>
            </div>
            <div className="stat-row">
              <span>Exploits Found:</span>
              <span>{playerProfile.unlockedExploits.length}</span>
            </div>
            <div className="stat-row">
              <span>Blessings Found:</span>
              <span>{playerProfile.unlockedBlessings.length}</span>
            </div>
            <div className="stat-row">
              <span>Fears Faced:</span>
              <span>{playerProfile.encounteredFears.length}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-statistics">
          <p>No statistics available yet. Play some games to build your profile!</p>
        </div>
      )}
    </div>
  );

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
        </div>

        <div className="options-content">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'audio' && renderAudioSettings()}
          {activeTab === 'display' && renderDisplaySettings()}
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