import React, { useState } from 'react';
import { exploits, blessings, fears, curses, dangers, wanders, feats } from '../registry/registry';
import './Glossary.css';

export interface GlossaryProps {
  onBack: () => void;
}

type TabType = 'exploits' | 'blessings' | 'fears' | 'curses' | 'dangers' | 'wanders' | 'feats';

interface RegistryEntry {
  id: string;
  label: string;
  description: string;
  type: string;
  rarity: string;
  category: string;
  completed: boolean;
  tags: string[];
  choices: any[];
  results: any;
  effects: any[];
}

export const Glossary: React.FC<GlossaryProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('exploits');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  // Filter items based on search and rarity
  const filterItems = (items: RegistryEntry[]) => {
    return items.filter(item => {
      const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Only apply rarity filter for exploits
      const matchesRarity = activeTab !== 'exploits' || selectedRarity === 'all' || item.rarity === selectedRarity;
      
      return matchesSearch && matchesRarity;
    });
  };

  // Get unique rarities for filter (only for exploits)
  const getRarities = (items: RegistryEntry[]) => {
    // Only show rarities for exploits
    if (activeTab !== 'exploits') return [];
    const rarities = [...new Set(items.map(item => item.rarity).filter(Boolean))];
    return rarities.sort((a, b) => a.localeCompare(b));
  };

  // Get current items based on active tab
  const getCurrentItems = (): RegistryEntry[] => {
    switch (activeTab) {
      case 'exploits': return exploits;
      case 'blessings': return blessings;
      case 'fears': return fears;
      case 'curses': return curses;
      case 'dangers': return dangers;
      case 'wanders': return wanders;
      case 'feats': return feats;
      default: return [];
    }
  };

  const currentItems = getCurrentItems();
  const filteredItems = filterItems(currentItems);
  const availableRarities = getRarities(currentItems);

  // Get effect description
  const getEffectDescription = (effect: any): string => {
    let description = effect.action.replace(/_/g, ' ');
    
    if (effect.target) {
      description += ` on ${effect.target.replace(/_/g, ' ').replace(/\|/g, ' or ')}`;
    }
    
    if (effect.value) {
      description += ` (${effect.value})`;
    }
    
    if (effect.condition) {
      const conditions = Object.entries(effect.condition)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join(', ');
      description += ` when ${conditions}`;
    }
    
    if (effect.oneShot) {
      description += ' (one-time use)';
    }
    
    return description;
  };

  // New concise effect description with icons
  const getConciseEffectDescription = (effect: any): string => {
    const action = effect.action;
    const value = effect.value || 1;
    const target = effect.target;
    
    // Handle score multiplier effects specially
    if (action === 'score_multiplier' || action === 'modify_setting' && target?.includes('score')) {
      return getScoreMultiplierDescription(effect);
    }
    
    // Map actions to icons and concise descriptions
    const effectMap: { [key: string]: { icon: string; text: string } } = {
      'modify_setting': {
        icon: getSettingIcon(target),
        text: getSettingText(target, value)
      },
      'award_score': {
        icon: '⭐',
        text: `+${value} score`
      },
      'award_coin': {
        icon: '🪙',
        text: `+${value} coins`
      },
      'score_multiplier': {
        icon: '✨',
        text: getScoreMultiplierDescription(effect)
      },
      'draw_cards': {
        icon: '🎴',
        text: `Draw ${value}`
      },
      'reveal': {
        icon: '👁️',
        text: `Reveal ${value}`
      },
      'allow_move': {
        icon: '🔄',
        text: 'Special move allowed'
      },
      'add_cards': {
        icon: '🃏',
        text: `+${value} cards`
      },
      'gain_coins': {
        icon: '🪙',
        text: `+${value} coins`
      },
      'increase_score': {
        icon: '⭐',
        text: `+${value} score`
      },
      'heal': {
        icon: '💚',
        text: `+${value} health`
      },
      'damage': {
        icon: '💥',
        text: `${value} damage`
      },
      'unlock': {
        icon: '🔓',
        text: 'Unlock feature'
      },
      'block': {
        icon: '⛔',
        text: 'Block action'
      },
      'curse': {
        icon: '🩸',
        text: 'Apply curse'
      },
      'bless': {
        icon: '✨',
        text: 'Apply blessing'
      }
    };

    const effectInfo = effectMap[action];
    if (effectInfo) {
      return `${effectInfo.icon} ${effectInfo.text}`;
    }

    // Fallback to original description for unknown effects
    return getEffectDescription(effect);
  };

  const getScoreMultiplierDescription = (effect: any): string => {
    const value = effect.value || 1;
    const condition = effect.condition;
    let description = `X${value} score`;
    
    if (!condition) return description;
    
    // Handle suit conditions
    if (condition.suit) {
      const suits = Array.isArray(condition.suit) ? condition.suit : [condition.suit];
      const suitIcons = suits.map(getSuitIcon).join(' ');
      description += ` ${suitIcons}`;
    }
    
    // Handle target/pile type conditions
    const targetField = condition.target || condition.pile_type;
    if (targetField) {
      const targets = Array.isArray(targetField) ? targetField : [targetField];
      const targetIcons = targets.map(getTargetIcon).join(' ');
      description += ` to ${targetIcons}`;
    }
    
    return description;
  };

  const getSuitIcon = (suit: string): string => {
    const suitMap: { [key: string]: string } = {
      'hearts': '♥️',
      'diamonds': '♦️', 
      'clubs': '♣️',
      'spades': '♠️',
      'heart': '♥️',
      'diamond': '♦️',
      'club': '♣️',
      'spade': '♠️'
    };
    return suitMap[suit.toLowerCase()] || suit;
  };

  const getTargetIcon = (target: string): string => {
    const targetMap: { [key: string]: string } = {
      'tableau': '📋',
      'tableaus': '📋',
      'foundation': '🏛️',
      'foundations': '🏛️',
      'hand': '✋',
      'deck': '🎴',
      'waste': '🗑️',
      'pile': '📚',
      'piles': '📚'
    };
    return targetMap[target.toLowerCase()] || target;
  };

  const getSettingIcon = (target: string): string => {
    const iconMap: { [key: string]: string } = {
      'shufflesLeft': '🔄',
      'shuffles': '🔄', 
      'discardsLeft': '🗑️',
      'discards': '🗑️',
      'handSize': '✋',
      'coins': '🪙',
      'health': '💚',
      'mana': '💙',
      'energy': '⚡',
      'strength': '💪',
      'defense': '🛡️',
      'score': '⭐',
      'lives': '❤️',
      'moves': '📋'
    };
    return iconMap[target] || '⚙️';
  };

  const getSettingText = (target: string, value: number): string => {
    const sign = value > 0 ? '+' : '';
    const textMap: { [key: string]: string } = {
      'shufflesLeft': 'shuffles',
      'shuffles': 'shuffles',
      'discardsLeft': 'discards', 
      'discards': 'discards',
      'coins': 'coins',
      'health': 'health',
      'mana': 'mana',
      'energy': 'energy',
      'strength': 'strength',
      'defense': 'defense'
    };
    const text = textMap[target] || target.replace(/_/g, ' ');
    return `${sign}${value} ${text}`;
  };

  return (
    <div className="glossary">
      <div className="glossary-container">
        <button className="close-button" onClick={onBack}>
          ✕
        </button>

        <div className="glossary-controls">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'exploits' ? 'active' : ''}`}
              onClick={() => setActiveTab('exploits')}
            >
              ⚔️ Exploits ({exploits.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'blessings' ? 'active' : ''}`}
              onClick={() => setActiveTab('blessings')}
            >
              ✨ Blessings ({blessings.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'fears' ? 'active' : ''}`}
              onClick={() => setActiveTab('fears')}
            >
              😨 Fears ({fears.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'curses' ? 'active' : ''}`}
              onClick={() => setActiveTab('curses')}
            >
              🩸 Curses ({curses.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'dangers' ? 'active' : ''}`}
              onClick={() => setActiveTab('dangers')}
            >
              ⚡ Dangers ({dangers.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'wanders' ? 'active' : ''}`}
              onClick={() => setActiveTab('wanders')}
            >
              🌟 Wanders ({wanders.length})
            </button>
            <button 
              className={`tab-button ${activeTab === 'feats' ? 'active' : ''}`}
              onClick={() => setActiveTab('feats')}
            >
              🏆 Feats ({feats.length})
            </button>
          </div>

          {/* Search */}
          <div className="filter-controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="glossary-content">
          <div className="results-info">
            Showing {filteredItems.length} of {currentItems.length} {activeTab}
          </div>

          <div className="items-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className={`item-card ${activeTab === 'feats' && 'completed' in item && !item.completed ? 'feat-incomplete' : ''}`}>
                <div className="item-header">
                  <h3 className="item-title">{item.label}</h3>
                  {activeTab === 'exploits' && item.rarity && (
                    <span 
                      className={`rarity-badge ${item.rarity.toLowerCase()}`}
                    >
                      {item.rarity}
                    </span>
                  )}
                </div>
                
                <p className="item-description">{item.description}</p>
                
                {item.effects && item.effects.length > 0 && (
                  <div className="item-effects">
                    <ul>
                      {item.effects.map((effect, effectIndex) => (
                        <li key={`${item.id}-effect-${effectIndex}-${effect.action || 'unknown'}`}>{getConciseEffectDescription(effect)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No {activeTab} found</h3>
              <p>
                {searchTerm || selectedRarity !== 'all' 
                  ? 'Try adjusting your search terms or filters'
                  : `No ${activeTab} available in the registry`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};