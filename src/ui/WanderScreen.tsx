import React, { useState, useEffect } from 'react';
import type { RegistryEntry } from '../registry/index';
import './WanderScreen.css';

interface WanderScreenProps {
  onChoiceMade: (wanderId: string, choice: string, outcome: string) => void;
  onBack?: () => void;
}

const WanderScreen: React.FC<WanderScreenProps> = ({
  onChoiceMade,
  onBack
}) => {
  const [currentWander, setCurrentWander] = useState<RegistryEntry | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcome, setOutcome] = useState<string>('');

  // Select a random wander on component mount
  useEffect(() => {
    // No wanders available; set currentWander to null or provide fallback.
    setCurrentWander(null);
  }, []);

  const handleChoiceClick = (choice: string) => {
    setSelectedChoice(choice);
  };

  const handleConfirmChoice = () => {
    if (!currentWander || !selectedChoice) return;

    // Get the outcome for the selected choice
    const choiceOutcome = currentWander.results[selectedChoice] || 'An unexpected event occurs.';
    setOutcome(choiceOutcome);
    setShowOutcome(true);
  };

  const handleProceed = () => {
    if (currentWander && selectedChoice) {
      onChoiceMade(currentWander.id, selectedChoice, outcome);
    }
  };


  if (!currentWander) {
    return (
      <div className="wander-screen-root">
        <div className="wander-screen">
          <div className="wander-loading">
            <h2>The path reveals itself...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wander-screen">
      {onBack && (
        <button className="wander-back-btn" onClick={onBack} style={{position:'absolute',top:10,left:10}}>
          ← Back
        </button>
      )}
      <div className="wander-content">
        <div className="wander-story">
          <div className="story-card">
            <div className="story-title">
              <h2>{currentWander.label}</h2>
            </div>
            <div className="story-description">
              <p>{currentWander.description}</p>
            </div>
            {!showOutcome ? (
              <div className="choices-section">
                <h3>What will you do?</h3>
                <div className="choices-list">
                  {currentWander.choices.map((choice: string) => (
                    <button
                      key={choice}
                      className={`choice-button ${selectedChoice === choice ? 'selected' : ''}`}
                      onClick={() => handleChoiceClick(choice)}
                    >
                      <div className="choice-text">{choice}</div>
                      <div className="choice-preview">
                        {currentWander.results[choice] && (
                          <span className="outcome-preview">
                            → {currentWander.results[choice]}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="choice-actions">
                  <button
                    className="btn-confirm"
                    onClick={handleConfirmChoice}
                    disabled={!selectedChoice}
                  >
                    Make Your Choice
                  </button>
                </div>
              </div>
            ) : (
              <div className="outcome-section">
                <h3>Your Choice</h3>
                <div className="chosen-action">
                  <p><strong>You chose:</strong> {selectedChoice}</p>
                </div>
                <div className="outcome-card">
                  <h4>What happens:</h4>
                  <p>{outcome}</p>
                </div>
                <div className="outcome-actions">
                  <button
                    className="btn-proceed"
                    onClick={handleProceed}
                  >
                    Continue Journey
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default WanderScreen;