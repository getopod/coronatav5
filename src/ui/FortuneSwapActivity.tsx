import React, { useState } from 'react';
import { fortunes } from '../registry/registry';
import type { RegistryEntry } from '../registry/index';
import './FortuneSwapActivity.css';

interface FortuneSwapActivityProps {
  currentFortune?: RegistryEntry;
  availableFortunes: RegistryEntry[];
  onFortuneSelected: (fortuneId: string) => void;
  onBack: () => void;
}

const FortuneSwapActivity: React.FC<FortuneSwapActivityProps> = ({
  currentFortune,
  availableFortunes,
  onFortuneSelected,
  onBack
}) => {
  const [selectedFortuneId, setSelectedFortuneId] = useState<string | null>(null);

  const handleFortuneClick = (fortune: RegistryEntry) => {
    setSelectedFortuneId(fortune.id);
  };

  const handleConfirmSelection = () => {
    if (selectedFortuneId) {
      onFortuneSelected(selectedFortuneId);
    }
  };

  return (
    <div className="fortune-swap-activity">
      <div className="fortune-swap-header">
        <h3>Fortune Swap</h3>
        <p>Choose a new fortune to replace your current one</p>
      </div>

      {currentFortune && (
        <div className="current-fortune-section">
          <h4>Current Fortune</h4>
          <div className="current-fortune-card">
            <div className="fortune-card-header">
              <h5>{currentFortune.label}</h5>
            </div>
            <div className="fortune-card-body">
              <p>{currentFortune.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="available-fortunes-section">
        <h4>Choose New Fortune</h4>
        <div className="fortunes-grid">
          {availableFortunes.map((fortune) => (
            <button
              key={fortune.id}
              className={`fortune-card ${selectedFortuneId === fortune.id ? 'selected' : ''}`}
              onClick={() => handleFortuneClick(fortune)}
              type="button"
            >
              <div className="fortune-card-header">
                <h5>{fortune.label}</h5>
              </div>
              <div className="fortune-card-body">
                <p>{fortune.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="fortune-swap-actions">
        <button
          className="btn-swap"
          onClick={handleConfirmSelection}
          disabled={!selectedFortuneId}
        >
          Swap Fortune
        </button>
      </div>
    </div>
  );
};

export default FortuneSwapActivity;