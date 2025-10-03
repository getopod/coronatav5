import React, { useState, useEffect } from 'react';
import { persistenceManager } from '../engine/persistenceManager';
import type { GameSessionData, PlayerProfile } from '../engine/persistenceManager';
import './History.css';

export interface HistoryProps {
  onBack: () => void;
}

export const History: React.FC<HistoryProps> = ({ onBack }) => {
  const [gameHistory, setGameHistory] = useState<GameSessionData[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerProfile | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'sessions' | 'achievements'>('overview');

  // Load history from persistence manager on component mount
  useEffect(() => {
    const history = persistenceManager.getGameHistory();
    setGameHistory(history);
    
    const profile = persistenceManager.getPlayerProfile();
    setPlayerStats(profile);
  }, []);

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get outcome emoji
  const getOutcomeEmoji = (outcome: string): string => {
    switch (outcome) {
      case 'victory': return '🏆';
      case 'defeat': return '💀';
      case 'resigned': return '🏳️';
      default: return '❓';
    }
  };

  // Clear history function
  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all game history? This cannot be undone.')) {
      persistenceManager.clearAllData();
      setGameHistory([]);
      setPlayerStats(persistenceManager.getPlayerProfile());
    }
  };

  if (!playerStats) {
    return <div className="history-loading">Loading history...</div>;
  }

  return (
    <div className="history">
      <div className="history-container">
        <header className="history-header">
          <h1>Game History</h1>
          <button className="close-button" onClick={onBack}>
            ✕
          </button>
        </header>

        <div className="history-navigation">
          <button 
            className={`nav-button ${selectedView === 'overview' ? 'active' : ''}`}
            onClick={() => setSelectedView('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`nav-button ${selectedView === 'sessions' ? 'active' : ''}`}
            onClick={() => setSelectedView('sessions')}
          >
            🎮 Sessions ({gameHistory.length})
          </button>
          <button 
            className={`nav-button ${selectedView === 'achievements' ? 'active' : ''}`}
            onClick={() => setSelectedView('achievements')}
          >
            🏅 Achievements
          </button>
        </div>

        <div className="history-content">
          {selectedView === 'overview' && (
            <div className="overview-section">
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-value">{playerStats.totalSessions}</div>
                  <div className="stat-label">Total Sessions</div>
                </div>
                
                <div className="stat-card success">
                  <div className="stat-value">{playerStats.totalVictories}</div>
                  <div className="stat-label">Victories</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{playerStats.winRate.toFixed(1)}%</div>
                  <div className="stat-label">Win Rate</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{playerStats.bestScore.toLocaleString()}</div>
                  <div className="stat-label">Best Score</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{playerStats.averageScore.toFixed(0)}</div>
                  <div className="stat-label">Average Score</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{formatDuration(playerStats.totalTime)}</div>
                  <div className="stat-label">Total Play Time</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{playerStats.totalCoinsEarned}</div>
                  <div className="stat-label">Coins Earned</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-value">{playerStats.uniqueExploitsFound.length}</div>
                  <div className="stat-label">Unique Exploits</div>
                </div>
              </div>

              {gameHistory.length === 0 && (
                <div className="no-history">
                  <div className="no-history-icon">🎮</div>
                  <h3>No game history yet</h3>
                  <p>Start playing Coronata to track your progress and achievements!</p>
                </div>
              )}
            </div>
          )}

          {selectedView === 'sessions' && (
            <div className="sessions-section">
              <div className="sessions-header">
                <h3>Recent Sessions</h3>
                {gameHistory.length > 0 && (
                  <button className="clear-button" onClick={clearHistory}>
                    🗑️ Clear History
                  </button>
                )}
              </div>

              <div className="sessions-list">
                {gameHistory.length === 0 ? (
                  <div className="no-sessions">
                    <p>No game sessions recorded yet.</p>
                  </div>
                ) : (
                  gameHistory
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((session, _index) => (
                      <div key={session.id} className="session-card">
                        <div className="session-header">
                          <div className="session-outcome">
                            <span className="outcome-icon">{getOutcomeEmoji(session.finalOutcome)}</span>
                            <span className="outcome-text">{session.finalOutcome.toUpperCase()}</span>
                          </div>
                          <div className="session-date">{formatDate(session.timestamp)}</div>
                        </div>
                        
                        <div className="session-stats">
                          <div className="session-stat">
                            <span className="stat-icon">🏆</span>
                            <span>{session.score.toLocaleString()} points</span>
                          </div>
                          <div className="session-stat">
                            <span className="stat-icon">⏱️</span>
                            <span>{formatDuration(session.duration)}</span>
                          </div>
                          <div className="session-stat">
                            <span className="stat-icon">🎯</span>
                            <span>{session.encountersCompleted} encounters</span>
                          </div>
                          <div className="session-stat">
                            <span className="stat-icon">🪙</span>
                            <span>{session.coinsEarned} coins</span>
                          </div>
                        </div>
                        
                        {(session.exploitsGained.length > 0 || session.blessingsGained.length > 0) && (
                          <div className="session-rewards">
                            {session.exploitsGained.length > 0 && (
                              <div className="reward-type">
                                <strong>⚔️ Exploits:</strong> {session.exploitsGained.length}
                              </div>
                            )}
                            {session.blessingsGained.length > 0 && (
                              <div className="reward-type">
                                <strong>✨ Blessings:</strong> {session.blessingsGained.length}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {selectedView === 'achievements' && (
            <div className="achievements-section">
              <h3>Discovery Progress</h3>
              
              <div className="achievement-categories">
                <div className="achievement-category">
                  <h4>⚔️ Exploits Discovered</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill exploits"
                      style={{ width: `${Math.min((playerStats.uniqueExploitsFound.length / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p>{playerStats.uniqueExploitsFound.length} / 20 discovered</p>
                </div>
                
                <div className="achievement-category">
                  <h4>✨ Blessings Encountered</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill blessings"
                      style={{ width: `${Math.min((playerStats.uniqueBlessingsFound.length / 12) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p>{playerStats.uniqueBlessingsFound.length} / 12 encountered</p>
                </div>
                
                <div className="achievement-category">
                  <h4>😨 Fears Overcome</h4>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill fears"
                      style={{ width: `${Math.min((playerStats.uniqueFearsEncountered.length / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p>{playerStats.uniqueFearsEncountered.length} / 20 overcome</p>
                </div>
              </div>

              <div className="milestones">
                <h4>🏅 Milestones</h4>
                <div className="milestone-grid">
                  <div className={`milestone ${playerStats.totalSessions >= 1 ? 'achieved' : ''}`}>
                    <span className="milestone-icon">🎮</span>
                    <div>
                      <strong>First Steps</strong>
                      <p>Complete your first session</p>
                    </div>
                  </div>
                  
                  <div className={`milestone ${playerStats.totalVictories >= 1 ? 'achieved' : ''}`}>
                    <span className="milestone-icon">🏆</span>
                    <div>
                      <strong>First Victory</strong>
                      <p>Win your first encounter</p>
                    </div>
                  </div>
                  
                  <div className={`milestone ${playerStats.bestScore >= 1000 ? 'achieved' : ''}`}>
                    <span className="milestone-icon">⭐</span>
                    <div>
                      <strong>High Scorer</strong>
                      <p>Reach 1,000 points in a single session</p>
                    </div>
                  </div>
                  
                  <div className={`milestone ${playerStats.totalSessions >= 10 ? 'achieved' : ''}`}>
                    <span className="milestone-icon">🎯</span>
                    <div>
                      <strong>Dedicated Player</strong>
                      <p>Complete 10 sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};