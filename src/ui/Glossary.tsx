import React, { useState } from 'react';
import { exploits, blessings, fears } from '../registry/registry';
import './Glossary.css';

export interface GlossaryProps {
  onBack: () => void;
}

type TabType = 'exploits' | 'blessings' | 'fears';

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

  // Get rarity color
  const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'common': return '#6b7280';
      case 'uncommon': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#8b5cf6';
      case 'legendary': return '#f59e0b';
      default: return '#374151';
    }
  };

  // Filter items based on search and rarity
  const filterItems = (items: RegistryEntry[]) => {
    return items.filter(item => {
      const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesRarity = selectedRarity === 'all' || item.rarity === selectedRarity;
      
      return matchesSearch && matchesRarity;
    });
  };

  // Get unique rarities for filter
  const getRarities = (items: RegistryEntry[]) => {
    const rarities = [...new Set(items.map(item => item.rarity).filter(Boolean))];
    return rarities.sort();
  };

  // Get current items based on active tab
  const getCurrentItems = (): RegistryEntry[] => {
    switch (activeTab) {
      case 'exploits': return exploits;
      case 'blessings': return blessings;
      case 'fears': return fears;
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

  return (
    <div className="glossary">
      <div className="glossary-container">
        <header className="glossary-header">
          <h1>Coronata Glossary</h1>
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
        </header>

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
          </div>

          {/* Search and Filter */}
          <div className="filter-controls">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {availableRarities.length > 0 && (
              <select 
                className="rarity-filter"
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
              >
                <option value="all">All Rarities</option>
                {availableRarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="glossary-content">
          <div className="results-info">
            Showing {filteredItems.length} of {currentItems.length} {activeTab}
          </div>

          <div className="items-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <h3 className="item-title">{item.label}</h3>
                  {item.rarity && (
                    <span 
                      className="rarity-badge"
                      style={{ backgroundColor: getRarityColor(item.rarity) }}
                    >
                      {item.rarity}
                    </span>
                  )}
                </div>
                
                <p className="item-description">{item.description}</p>
                
                {item.effects && item.effects.length > 0 && (
                  <div className="item-effects">
                    <h4>Effects:</h4>
                    <ul>
                      {item.effects.map((effect, index) => (
                        <li key={index}>{getEffectDescription(effect)}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {item.tags && item.tags.length > 0 && (
                  <div className="item-tags">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
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