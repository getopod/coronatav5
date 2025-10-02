import React, { useState, useEffect } from 'react';
import { fortunes } from '../registry/registry';
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
    const getRandomFortunes = () => {
      const shuffled = [...fortunes].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    };
    
    setSelectedFortunes(getRandomFortunes());
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
        <p>Before embarking on your journey, the fates offer you a gift. Choose wisely.</p>
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
            className="btn-primary"
            onClick={handleConfirmSelection}
            disabled={!selectedFortuneId}
          >
            Choose This Fortune
          </button>
          
          <button 
            className="btn-back"
            onClick={onBack}
          >
            Back to Welcome
          </button>
        </div>
      </div>
    </div>
  );
};

export default FortuneSelectionScreen;