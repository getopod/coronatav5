import React, { useState } from 'react';
import { Card, GameState } from '../engine/types';
import { RegistryEntry } from '../registry/index';
import './BlessingApplicationModal.css';

interface BlessingApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  blessing: RegistryEntry;
  gameState: GameState;
  onApplyBlessing: (blessingId: string, cardId: string) => void;
}

export const BlessingApplicationModal: React.FC<BlessingApplicationModalProps> = ({
  isOpen,
  onClose,
  blessing,
  gameState,
  onApplyBlessing
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedPile, setSelectedPile] = useState<string>('hand');

  if (!isOpen) return null;

  // Get cards from the selected pile
  const availableCards = gameState.piles?.[selectedPile]?.cards || [];

  const handleApply = () => {
    if (selectedCardId) {
      onApplyBlessing(blessing.id, selectedCardId);
      onClose();
    }
  };

  const getCardDisplayName = (card: Card) => {
    const suitSymbols = {
      hearts: '♥️',
      diamonds: '♦️',
      clubs: '♣️',
      spades: '♠️'
    };
    const valueNames = {
      1: 'A', 11: 'J', 12: 'Q', 13: 'K'
    };
    const valueName = valueNames[card.value as keyof typeof valueNames] || card.value.toString();
    return `${valueName}${suitSymbols[card.suit]}`;
  };

  return (
    <div className="blessing-modal-overlay">
      <div className="blessing-modal">
        <div className="blessing-modal-header">
          <h3>Apply Blessing to Card</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="blessing-info">
          <h4>{blessing.label}</h4>
          <p>{blessing.description}</p>
          <div className="blessing-rarity">{blessing.rarity}</div>
        </div>

        <div className="pile-selector">
          <label>Select pile:</label>
          <select 
            value={selectedPile} 
            onChange={(e) => {
              setSelectedPile(e.target.value);
              setSelectedCardId(null);
            }}
          >
            <option value="hand">Hand</option>
            <option value="tableau-1">Tableau 1</option>
            <option value="tableau-2">Tableau 2</option>
            <option value="tableau-3">Tableau 3</option>
            <option value="tableau-4">Tableau 4</option>
            <option value="tableau-5">Tableau 5</option>
            <option value="tableau-6">Tableau 6</option>
            <option value="tableau-7">Tableau 7</option>
            <option value="foundation-hearts">Foundation ♥️</option>
            <option value="foundation-diamonds">Foundation ♦️</option>
            <option value="foundation-clubs">Foundation ♣️</option>
            <option value="foundation-spades">Foundation ♠️</option>
          </select>
        </div>

        <div className="card-selector">
          <h4>Select a card:</h4>
          <div className="card-grid">
            {availableCards.length === 0 ? (
              <p>No cards available in {selectedPile}</p>
            ) : (
              availableCards.map((card) => (
                <div
                  key={card.id}
                  className={`card-option ${selectedCardId === card.id ? 'selected' : ''} ${
                    card.blessings?.length ? 'has-blessings' : ''
                  }`}
                  onClick={() => setSelectedCardId(card.id)}
                >
                  <div className="card-display">
                    {getCardDisplayName(card)}
                  </div>
                  {card.blessings && card.blessings.length > 0 && (
                    <div className="existing-blessings">
                      ✨ {card.blessings.length}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button 
            onClick={handleApply} 
            disabled={!selectedCardId}
            className="apply-btn"
          >
            Apply Blessing
          </button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};