import React, { useState, useEffect } from 'react';
import './RunHistory.css';

interface RunHistoryProps {
  onBack: () => void;
}

interface RunRecord {
  id: string;
  date: string;
  score: number;
  encounters: number;
  fortune: string;
  exploits: string[];
  blessings: string[];
  curses: string[];
  completed: boolean;
  duration: string;
  coinsEarned: number;
  ascensionLevel: number;
  finalEncounter: string;
}

export const RunHistory: React.FC<RunHistoryProps> = ({ onBack }) => {
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);
  const [runHistory, setRunHistory] = useState<RunRecord[]>([]);

  // Load run history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('coronata-run-history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setRunHistory(parsedHistory);
      } else {
        // Mock data for demonstration
        const mockHistory: RunRecord[] = [
          {
            id: '1',
            date: '2025-10-02',
            score: 1450,
            encounters: 7,
            fortune: 'Merchant\'s Blessing',
            exploits: ['Lucky Coin', 'Swift Draw'],
            blessings: ['Ace of Hearts', 'King of Spades'],
            curses: [],
            completed: true,
            duration: '12:34',
            coinsEarned: 245,
            ascensionLevel: 0,
            finalEncounter: 'Fear of the Unknown'
          },
          {
            id: '2',
            date: '2025-10-01',
            score: 890,
            encounters: 4,
            fortune: 'Warrior\'s Resolve',
            exploits: ['Iron Will'],
            blessings: ['Queen of Diamonds'],
            curses: ['Shaky Hands'],
            completed: false,
            duration: '8:15',
            coinsEarned: 120,
            ascensionLevel: 0,
            finalEncounter: 'Danger in the Depths'
          },
          {
            id: '3',
            date: '2025-09-28',
            score: 2100,
            encounters: 15,
            fortune: 'Scholar\'s Insight',
            exploits: ['Memory Palace', 'Lucky Coin', 'Swift Draw', 'Iron Will'],
            blessings: ['Ace of Hearts', 'King of Spades', 'Queen of Diamonds', 'Jack of Clubs'],
            curses: [],
            completed: true,
            duration: '28:45',
            coinsEarned: 480,
            ascensionLevel: 1,
            finalEncounter: 'The Usurper'
          }
        ];
        setRunHistory(mockHistory);
      }
    } catch (error) {
      console.error('Error loading run history:', error);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCompletionRate = (encounters: number, completed: boolean) => {
    if (completed) return '100%';
    return `${Math.round((encounters / 15) * 100)}%`;
  };

  const getPerformanceRating = (score: number, encounters: number) => {
    const avgScorePerEncounter = score / encounters;
    if (avgScorePerEncounter >= 150) return 'Legendary';
    if (avgScorePerEncounter >= 120) return 'Excellent';
    if (avgScorePerEncounter >= 90) return 'Good';
    if (avgScorePerEncounter >= 60) return 'Fair';
    return 'Needs Practice';
  };

  return (
    <div className="run-history-screen">
      <div className="run-history-header">
        <h2>📊 Run History</h2>
        <p>Review your past adventures and track your progress</p>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="run-history-content">
        <div className="run-list">
          {runHistory.length === 0 ? (
            <div className="no-runs">
              <p>No completed runs yet. Start your first adventure!</p>
            </div>
          ) : (
            runHistory.map(run => (
              <div
                key={run.id}
                className={`run-item ${selectedRun?.id === run.id ? 'selected' : ''} ${run.completed ? 'completed' : 'failed'}`}
                onClick={() => setSelectedRun(run)}
              >
                <div className="run-header">
                  <span className="run-date">{formatDate(run.date)}</span>
                  <span className={`run-status ${run.completed ? 'completed' : 'failed'}`}>
                    {run.completed ? '✓ Completed' : '✗ Failed'}
                  </span>
                </div>
                <div className="run-stats">
                  <span className="score">Score: {run.score.toLocaleString()}</span>
                  <span className="encounters">Encounters: {run.encounters}/15</span>
                  <span className="duration">Time: {run.duration}</span>
                </div>
                <div className="run-fortune">{run.fortune}</div>
                <div className="run-performance">
                  <span className="completion-rate">{getCompletionRate(run.encounters, run.completed)}</span>
                  <span className="rating">{getPerformanceRating(run.score, run.encounters)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedRun && (
          <div className="run-details">
            <h3>🏆 Run Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Final Score:</label>
                <span className="highlight">{selectedRun.score.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Encounters Completed:</label>
                <span>{selectedRun.encounters}/15 ({getCompletionRate(selectedRun.encounters, selectedRun.completed)})</span>
              </div>
              <div className="detail-item">
                <label>Duration:</label>
                <span>{selectedRun.duration}</span>
              </div>
              <div className="detail-item">
                <label>Coins Earned:</label>
                <span className="coins">{selectedRun.coinsEarned}</span>
              </div>
              <div className="detail-item">
                <label>Ascension Level:</label>
                <span>{selectedRun.ascensionLevel}</span>
              </div>
              <div className="detail-item">
                <label>Final Encounter:</label>
                <span>{selectedRun.finalEncounter}</span>
              </div>
              <div className="detail-item">
                <label>Starting Fortune:</label>
                <span className="fortune">{selectedRun.fortune}</span>
              </div>
              <div className="detail-item">
                <label>Performance:</label>
                <span className="rating">{getPerformanceRating(selectedRun.score, selectedRun.encounters)}</span>
              </div>
            </div>

            <div className="run-inventory">
              <h4>🎒 Collected Items</h4>
              <div className="inventory-sections">
                {selectedRun.exploits.length > 0 && (
                  <div className="inventory-section">
                    <h5>⚔️ Exploits ({selectedRun.exploits.length})</h5>
                    <div className="item-list">
                      {selectedRun.exploits.map(exploit => (
                        <span key={exploit} className="item-tag exploit">{exploit}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRun.blessings.length > 0 && (
                  <div className="inventory-section">
                    <h5>✨ Blessings ({selectedRun.blessings.length})</h5>
                    <div className="item-list">
                      {selectedRun.blessings.map(blessing => (
                        <span key={blessing} className="item-tag blessing">{blessing}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRun.curses.length > 0 && (
                  <div className="inventory-section">
                    <h5>😈 Curses ({selectedRun.curses.length})</h5>
                    <div className="item-list">
                      {selectedRun.curses.map(curse => (
                        <span key={curse} className="item-tag curse">{curse}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="run-insights">
              <h4>📈 Run Insights</h4>
              <div className="insights-grid">
                <div className="insight">
                  <span className="insight-label">Avg Score/Encounter:</span>
                  <span className="insight-value">{Math.round(selectedRun.score / selectedRun.encounters)}</span>
                </div>
                <div className="insight">
                  <span className="insight-label">Coins/Encounter:</span>
                  <span className="insight-value">{Math.round(selectedRun.coinsEarned / selectedRun.encounters)}</span>
                </div>
                <div className="insight">
                  <span className="insight-label">Items Collected:</span>
                  <span className="insight-value">{selectedRun.exploits.length + selectedRun.blessings.length + selectedRun.curses.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunHistory;