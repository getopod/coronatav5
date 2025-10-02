import React, { useEffect, useRef, useState } from 'react';
import './Card.css';

export interface CardProps {
  id: string;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number;
  faceUp: boolean;
  design?: string;
  style?: React.CSSProperties;
  selected?: boolean;
  shake?: boolean;
  draggable?: boolean;
  blessings?: string[]; // IDs of blessings attached to this card
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const suitColors: Record<string, string> = {
  hearts: '#e53935',
  diamonds: '#e53935',
  clubs: '#222',
  spades: '#222',
};


function getCardLabel(value: number) {
  if (value === 1) return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return value.toString();
}

export function Card({ 
  id, suit, value, faceUp, design, style, selected, shake, draggable, blessings,
  onClick, onDoubleClick, onDragStart, onDragEnd, onDrop 
}: CardProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const prevFaceUp = useRef(faceUp);

  useEffect(() => {
    if (prevFaceUp.current !== faceUp) {
      setIsFlipping(true);
      const timer = setTimeout(() => setIsFlipping(false), 400);
      prevFaceUp.current = faceUp;
      return () => clearTimeout(timer);
    }
  }, [faceUp]);

  const cardClass = [
    'card',
    faceUp ? 'face-up' : 'face-down',
    suit,
    isFlipping ? 'flip' : '',
    selected ? 'selected' : '',
    shake ? 'shake' : '',
    draggable ? 'draggable' : '',
  ].filter(Boolean).join(' ');

  // Debug logging for shake
  if (shake) {
    console.log('Card', id, 'is shaking, classes:', cardClass);
  }

  // Add suit color class for text color
  const colorClass = (suit === 'hearts' || suit === 'diamonds') ? 'card-red' : 'card-black';

  return (
    <div
      className={cardClass}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      style={selected ? { outline: '2px solid #1976d2', zIndex: 2 } : {}}
    >
      {faceUp ? (
        <div className="card-face">
          <div className="card-corners-row">
            <span className={["card-label", colorClass].join(" ")}>{getCardLabel(value)}</span>
            <span className={["card-suit", colorClass].join(" ")}>{suitSymbols[suit]}</span>
          </div>
          {blessings && blessings.length > 0 && (
            <div className="card-blessings">
              {blessings.slice(0, 3).map((_, index) => (
                <span key={index} className="blessing-indicator">✨</span>
              ))}
              {blessings.length > 3 && (
                <span className="blessing-count">+{blessings.length - 3}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={`card-back default-back`}>
          {blessings && blessings.length > 0 && (
            <div className="card-blessings-back">
              <span className="blessing-indicator-back">✨</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
