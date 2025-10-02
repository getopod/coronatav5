import React, { useState, useEffect } from 'react';
import { AscensionManager, AscensionLevel } from '../core_engine/ascensionSystem';
import './AscensionMenu.css';

interface AscensionMenuProps {
  onSelectAscension: (level: number) => void;
  onBack: () => void;
}

export const AscensionMenu: React.FC<AscensionMenuProps> = ({ onSelectAscension, onBack }) => {
  const [ascensionLevels, setAscensionLevels] = useState<AscensionLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(0);

  useEffect(() => {
    const levels = AscensionManager.getAllLevels();
    setAscensionLevels(levels);
    
    // Select the highest unlocked level by default
    const unlockedLevels = levels.filter(l => l.unlocked);
    if (unlockedLevels.length > 0) {
      const highestUnlocked = Math.max(...unlockedLevels.map(l => l.level));
      setSelectedLevel(highestUnlocked);
    }
  }, []);

  const handleStartRun = () => {
    onSelectAscension(selectedLevel);
  };

  return (
    <div className="ascension-menu">
      <div className="ascension-header">
        <h1>Choose Ascension Level</h1>
        <p>Higher ascension levels increase difficulty but provide greater rewards</p>
      </div>

      <div className="ascension-grid">
        {ascensionLevels.map((level) => (
          <div
            key={level.level}
            className={`ascension-card ${
              level.unlocked ? 'unlocked' : 'locked'
            } ${selectedLevel === level.level ? 'selected' : ''}`}
            onClick={() => level.unlocked && setSelectedLevel(level.level)}
          >
            <div className="ascension-number">
              {level.unlocked ? level.level : '🔒'}
            </div>
            <div className="ascension-info">
              <h3>Ascension {level.level}</h3>
              <p className="ascension-description">{level.description}</p>
              {level.level > 0 && level.unlocked && (
                <div className="ascension-modifiers">
                  <div className="modifier">
                    💰 Costs: {Math.round((level.costMultiplier - 1) * 100)}%
                  </div>
                  <div className="modifier">
                    ⚔️ Difficulty: +{Math.round((level.difficultyModifier - 1) * 100)}%
                  </div>
                  <div className="modifier">
                    💎 Rewards: +{level.level * 10}%
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="ascension-actions">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button 
          className="btn-primary" 
          onClick={handleStartRun}
          disabled={!ascensionLevels.find(l => l.level === selectedLevel)?.unlocked}
        >
          Start Run (Ascension {selectedLevel})
        </button>
      </div>

      {selectedLevel > 0 && (
        <div className="ascension-preview">
          <h4>Ascension {selectedLevel} Effects:</h4>
          <div className="preview-stats">
            <div>Starting Coins: 50</div>
            <div>Fear Rewards: {Math.round(4 * (1 + selectedLevel * 0.1))} coins avg</div>
            <div>Danger Rewards: {Math.round(6.5 * (1 + selectedLevel * 0.1))} coins avg</div>
            <div>Item Costs: ×{(1 + selectedLevel * 0.1).toFixed(1)}</div>
          </div>
        </div>
      )}
    </div>
  );
};