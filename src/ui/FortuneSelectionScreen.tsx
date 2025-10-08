import React, { useState, useEffect } from 'react';
import type { RegistryEntry } from '../registry/index';
import './FortuneSelectionScreen.css';

interface FortuneSelectionScreenProps {
  onBack: () => void;
  onFortuneSelected: (fortune: RegistryEntry) => void;
}

const FortuneSelectionScreen: React.FC<FortuneSelectionScreenProps> = ({
  onBack,
  onFortuneSelected
}) => {
  const [selectedFortunes, setSelectedFortunes] = useState<RegistryEntry[]>([]);
  const [selectedFortuneId, setSelectedFortuneId] = useState<string | null>(null);

  // Select 3 random fortunes on component mount
  useEffect(() => {
    // No fortunes available; set selectedFortunes to empty array or provide fallback.
    setSelectedFortunes([]);
  }, []);

  const handleFortuneClick = (fortune: RegistryEntry) => {
    setSelectedFortuneId(fortune.id);
  };

  const handleConfirmSelection = () => {
    const selectedFortune = selectedFortunes.find(f => f.id === selectedFortuneId);
    if (selectedFortune) {
      onFortuneSelected(selectedFortune);
    }
  };

  return (
    <div className="fortune-selection-screen">
      <div className="fortune-selection-header">
        <h1>Choose Your Fortune</h1>
      </div>

      <div className="fortune-selection-content">
        <div className="fortunes-grid">
          {selectedFortunes.map((fortune) => (
            <button
              key={fortune.id}
              className={`fortune-card ${selectedFortuneId === fortune.id ? 'selected' : ''}`}
              onClick={() => handleFortuneClick(fortune)}
              type="button"
            >
              <div className="fortune-card-header">
                <h3>{fortune.label}</h3>
              </div>
              <div className="fortune-card-body">
                <p>{fortune.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="fortune-selection-actions">
          <button 
            className="btn-back"
            onClick={onBack}
          >
            Back
          </button>
          
          <button
            className="btn-primary"
            onClick={handleConfirmSelection}
            disabled={!selectedFortuneId}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default FortuneSelectionScreen;