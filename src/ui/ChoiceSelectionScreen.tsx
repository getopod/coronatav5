import React, { useState } from 'react';
import './ChoiceSelectionScreen.css';

interface ChoiceSelectionScreenProps {
  onTradeSelected: () => void;
  onWanderSelected: () => void;
  onGambleSelected: () => void;
  onBack?: () => void;
}

const ChoiceSelectionScreen: React.FC<ChoiceSelectionScreenProps> = ({
  onTradeSelected,
  onWanderSelected,
  onGambleSelected,
  onBack
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const choices = [
    {
      id: 'trade',
      title: 'Trade',
      description: 'Visit the merchant for exploits, blessings, and upgrades. Purchase equipment or sell existing items for coin.',
      details: [
        '4 Exploits available for purchase',
        '3 Blessings and 2 Curses',
        'Run upgrades (+1 hand size, shuffles, discards)',
        'Curse removal and reroll options',
        'Sell equipped exploits for coin'
      ],
      icon: '🏪',
      action: onTradeSelected
    },
    {
      id: 'wander',
      title: 'Wander',
      description: 'Explore the unknown paths. Face narrative choices that may bring rewards or consequences.',
      details: [
        'Narrative event with choices',
        'Deterministic outcomes',
        'Gain coin, cards, or items',
        'Risk curses or other effects',
        'Story-driven experiences'
      ],
      icon: '🗺️',
      action: onWanderSelected
    },
    {
      id: 'gamble',
      title: 'Gamble',
      description: 'Skip directly to the next encounter and gain a 25% scoring bonus for that encounter only.',
      details: [
        '25% bonus scoring multiplier',
        'Skip Trade and Wander opportunities',
        'Quick progression option',
        'Risk vs. reward choice',
        'Bonus applies to next encounter only'
      ],
      icon: '🎲',
      action: onGambleSelected
    }
  ];

  const handleChoiceClick = (choiceId: string) => {
    setSelectedChoice(choiceId === selectedChoice ? null : choiceId);
  };

  const handleConfirmChoice = () => {
    const choice = choices.find(c => c.id === selectedChoice);
    if (choice) {
      choice.action();
    }
  };

  return (
    <div className="choice-selection-screen">
      <div className="choice-selection-header">
        <h1>Choose Your Path</h1>
        <p>The Fear has been vanquished. What will you do before facing the next challenge?</p>
      </div>

      <div className="choice-selection-content">
        <div className="choices-grid">
          {choices.map((choice) => (
            <button
              key={choice.id}
              className={`choice-card ${selectedChoice === choice.id ? 'selected' : ''}`}
              onClick={() => handleChoiceClick(choice.id)}
              type="button"
            >
              <div className="choice-card-header">
                <div className="choice-icon">{choice.icon}</div>
                <h3>{choice.title}</h3>
              </div>
              
              <div className="choice-card-body">
                <p className="choice-description">{choice.description}</p>
                
                <div className="choice-details">
                  <h4>What to Expect:</h4>
                  <ul>
                    {choice.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedChoice === choice.id && (
                <div className="choice-card-selected-indicator">
                  <span>✓ Selected</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="choice-selection-actions">
          <button
            className="btn-primary"
            onClick={handleConfirmChoice}
            disabled={!selectedChoice}
          >
            Proceed with {selectedChoice ? choices.find(c => c.id === selectedChoice)?.title : 'Choice'}
          </button>
          
          {onBack && (
            <button 
              className="btn-back"
              onClick={onBack}
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChoiceSelectionScreen;