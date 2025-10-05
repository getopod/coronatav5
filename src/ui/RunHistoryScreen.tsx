
import React, { useState } from 'react';
import './RunHistoryScreen.css';
import { getGameHistory, GameSessionData, RunOutcome } from '../engine/persistenceManager';

// Helper to get run status label
function getRunStatusLabel(outcome: RunOutcome): string {
  if (outcome === 'victory') return '🏆 Victory';
  if (outcome === 'defeat') return '☠️ Defeat';
  return '🛑 Resigned';
}

interface RunHistoryProps {
  onBack: () => void;
}

// Helper to format timestamp to readable date
function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Helper to format duration in seconds to mm:ss
function formatDuration(secs: number): string {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Group runs by category (victory/defeat/resigned)
function groupByCategory(history: GameSessionData[]): Record<RunOutcome, GameSessionData[]> {
  return history.reduce((acc, run) => {
    const cat = run.category || run.finalOutcome || 'defeat';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(run);
    return acc;
  }, {} as Record<RunOutcome, GameSessionData[]>);
}

export const RunHistoryScreen: React.FC<RunHistoryProps> = ({ onBack }) => {
  const [selectedRun, setSelectedRun] = useState<GameSessionData | null>(null);
  const runHistory: GameSessionData[] = getGameHistory().slice().reverse();
  const grouped = groupByCategory(runHistory);
  const categories: RunOutcome[] = ['victory', 'defeat', 'resigned'];

  return (
    <div className="run-history-screen fantasy-tavern-bg">
      <div className="run-history-header">
        <h2>Run History</h2>
        <p>Relive your most daring adventures, glorious victories, and tragic defeats.</p>
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="run-history-content">
        <div className="run-list-grouped">
          {categories.map(cat => (
            <div key={cat} className={`run-category-group ${cat}`}>
              <h3 className="category-title">{cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>
              {grouped[cat]?.length ? (
                grouped[cat].map(run => (
                  <button
                    key={run.id}
                    className={`run-item ${selectedRun?.id === run.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRun(run)}
                    tabIndex={0}
                    type="button"
                  >
                    <div className="run-header">
                      <span className="run-date">{formatDate(run.timestamp)}</span>
                      <span className={`run-status ${run.finalOutcome}`}>{getRunStatusLabel(run.finalOutcome)}</span>
                    </div>
                    <div className="run-stats">
                      <span className="score">Score: {run.score}</span>
                      <span className="encounters">Encounters: {run.encountersCompleted}</span>
                      <span className="duration">Time: {formatDuration(run.duration)}</span>
                      {run.area && <span className="area">Area: {Array.isArray(run.area) ? run.area.join(', ') : run.area}</span>}
                    </div>
                    <div className="run-fortune">{run.selectedFortune}</div>
                  </button>
                ))
              ) : (
                <div className="empty-category">No runs in this category yet.</div>
              )}
            </div>
          ))}
        </div>

        {selectedRun && (
          <div className="run-details fantasy-tavern-card">
            <h3>Run Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Final Score:</span>
                <span>{selectedRun.score}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Encounters Completed:</span>
                <span>{selectedRun.encountersCompleted}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span>{formatDuration(selectedRun.duration)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fortune:</span>
                <span>{selectedRun.selectedFortune || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Area/Zone:</span>
                <span>{Array.isArray(selectedRun.area) ? selectedRun.area.join(', ') : selectedRun.area || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Exploits:</span>
                <div className="exploits-list">
                  {selectedRun.exploitsGained?.length ? selectedRun.exploitsGained.map(exploit => (
                    <span key={exploit} className="exploit-tag">{exploit}</span>
                  )) : <span>—</span>}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Blessings:</span>
                <div className="blessings-list">
                  {selectedRun.blessingsGained?.length ? selectedRun.blessingsGained.map(blessing => (
                    <span key={blessing} className="blessing-tag">{blessing}</span>
                  )) : <span>—</span>}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fears:</span>
                <div className="fears-list">
                  {selectedRun.fearsGained?.length ? selectedRun.fearsGained.map(fear => (
                    <span key={fear} className="fear-tag">{fear}</span>
                  )) : <span>—</span>}
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Coins Earned:</span>
                <span>{selectedRun.coinsEarned}</span>
              </div>
              {selectedRun.stats && (
                <div className="detail-item">
                  <span className="detail-label">Stats:</span>
                  <div className="stats-list">
                    {Object.entries(selectedRun.stats).map(([k, v]) => (
                      <span key={k} className="stat-tag">{k}: {v}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunHistoryScreen;