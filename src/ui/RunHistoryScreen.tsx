import React, { useState } from 'react';
import './RunHistoryScreen.css';

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
  completed: boolean;
  duration: string;
}

export const RunHistoryScreen: React.FC<RunHistoryProps> = ({ onBack }) => {
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);

  // Mock data - replace with actual run history from localStorage/backend
  const runHistory: RunRecord[] = [
    {
      id: '1',
      date: '2025-10-02',
      score: 1450,
      encounters: 7,
      fortune: 'Merchant\'s Blessing',
      exploits: ['Lucky Coin', 'Swift Draw'],
      completed: true,
      duration: '12:34'
    },
    {
      id: '2', 
      date: '2025-10-01',
      score: 890,
      encounters: 4,
      fortune: 'Warrior\'s Resolve',
      exploits: ['Iron Will'],
      completed: false,
      duration: '8:15'
    }
  ];

  return (
    <div className="run-history-screen">
      <div className="run-history-header">
        <h2>Run History</h2>
        <p>View your past adventures and achievements</p>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="run-history-content">
        <div className="run-list">
          {runHistory.map(run => (
            <div 
              key={run.id} 
              className={`run-item ${selectedRun?.id === run.id ? 'selected' : ''}`}
              onClick={() => setSelectedRun(run)}
            >
              <div className="run-header">
                <span className="run-date">{run.date}</span>
                <span className={`run-status ${run.completed ? 'completed' : 'failed'}`}>
                  {run.completed ? '✓ Completed' : '✗ Failed'}
                </span>
              </div>
              <div className="run-stats">
                <span className="score">Score: {run.score}</span>
                <span className="encounters">Encounters: {run.encounters}</span>
                <span className="duration">Time: {run.duration}</span>
              </div>
              <div className="run-fortune">{run.fortune}</div>
            </div>
          ))}
        </div>

        {selectedRun && (
          <div className="run-details">
            <h3>Run Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Final Score:</label>
                <span>{selectedRun.score}</span>
              </div>
              <div className="detail-item">
                <label>Encounters Completed:</label>
                <span>{selectedRun.encounters}</span>
              </div>
              <div className="detail-item">
                <label>Duration:</label>
                <span>{selectedRun.duration}</span>
              </div>
              <div className="detail-item">
                <label>Fortune:</label>
                <span>{selectedRun.fortune}</span>
              </div>
              <div className="detail-item">
                <label>Exploits:</label>
                <div className="exploits-list">
                  {selectedRun.exploits.map(exploit => (
                    <span key={exploit} className="exploit-tag">{exploit}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunHistoryScreen;