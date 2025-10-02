import React, { useState, useEffect } from 'react';
import { exploits, blessings, curses } from '../registry/registry';
import type { RegistryEntry } from '../registry/index';
import './TradeScreen.css';

interface TradeScreenProps {
  onBack: () => void;
  onPurchase: (item: RegistryEntry, cost: number) => void;
  onSell: (item: RegistryEntry, value: number) => void;
  playerCoin: number;
  equippedExploits: RegistryEntry[];
}

interface TradeItem {
  id: string;
  label: string;
  description: string;
  type: string;
  rarity: string;
  category: 'exploit' | 'blessing' | 'curse' | 'upgrade';
  completed: boolean;
  tags: string[];
  choices: any[];
  results: Record<string, any>;
  effects: any[];
  cost: number;
}

interface Upgrade {
  id: string;
  label: string;
  description: string;
  cost: number;
  type: 'hand-size' | 'shuffle-count' | 'discard-count';
}

const TradeScreen: React.FC<TradeScreenProps> = ({
  onBack,
  onPurchase,
  onSell,
  playerCoin,
  equippedExploits
}) => {
  const [tradeItems, setTradeItems] = useState<TradeItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'buy' | 'sell' | 'upgrades'>('buy');
  const [rerollCount, setRerollCount] = useState(0);
  const [curseRemovalCount, setCurseRemovalCount] = useState(0);

  // Rarity weights for random selection
  const rarityWeights = {
    'common': 50,
    'uncommon': 30,
    'rare': 15,
    'legendary': 5
  };

  // Upgrades available for purchase
  const upgrades: Upgrade[] = [
    {
      id: 'upgrade-hand-size',
      label: '+1 Hand Size',
      description: 'Permanently increase your hand size by 1 for the rest of the run.',
      cost: 150,
      type: 'hand-size'
    },
    {
      id: 'upgrade-shuffle-count',
      label: '+1 Shuffle Count',
      description: 'Gain one additional shuffle resource for each encounter.',
      cost: 100,
      type: 'shuffle-count'
    },
    {
      id: 'upgrade-discard-count',
      label: '+1 Discard Count',
      description: 'Gain one additional discard resource for each encounter.',
      cost: 100,
      type: 'discard-count'
    }
  ];

  // Calculate item cost based on rarity
  const calculateCost = (rarity: string, type: string): number => {
    const baseCosts = {
      exploit: { common: 50, uncommon: 100, rare: 200, legendary: 500 },
      blessing: { common: 75, uncommon: 150, rare: 300, legendary: 750 },
      curse: { common: 25, uncommon: 50, rare: 100, legendary: 250 }
    };
    
    const costs = baseCosts[type as keyof typeof baseCosts] || baseCosts.exploit;
    return costs[rarity as keyof typeof costs] || costs.common;
  };

  // Generate random trade items
  const generateTradeItems = (): TradeItem[] => {
    const items: TradeItem[] = [];
    
    // Get available exploits (not already equipped)
    const availableExploits = exploits.filter(
      exploit => !equippedExploits.some(equipped => equipped.id === exploit.id)
    );
    
    // Select 4 random exploits
    const selectedExploits = getRandomByRarity(availableExploits, 4);
    selectedExploits.forEach(exploit => {
      items.push({
        ...exploit,
        cost: calculateCost(exploit.rarity, 'exploit'),
        category: 'exploit'
      });
    });
    
    // Select 3 random blessings
    const selectedBlessings = getRandomByRarity(blessings, 3);
    selectedBlessings.forEach(blessing => {
      items.push({
        ...blessing,
        cost: calculateCost(blessing.rarity, 'blessing'),
        category: 'blessing'
      });
    });
    
    // Select 2 random curses
    const selectedCurses = getRandomByRarity(curses, 2);
    selectedCurses.forEach(curse => {
      items.push({
        ...curse,
        cost: calculateCost(curse.rarity, 'curse'),
        category: 'curse'
      });
    });
    
    return items;
  };

  // Get random items based on rarity weights
  const getRandomByRarity = (items: RegistryEntry[], count: number): RegistryEntry[] => {
    const weightedItems = items.flatMap(item => {
      const weight = rarityWeights[item.rarity as keyof typeof rarityWeights] || rarityWeights.common;
      return Array(weight).fill(item);
    });
    
    const selected: RegistryEntry[] = [];
    
    while (selected.length < count && selected.length < items.length) {
      const randomIndex = Math.floor(Math.random() * weightedItems.length);
      const item = weightedItems[randomIndex];
      
      if (!selected.some(s => s.id === item.id)) {
        selected.push(item);
      }
    }
    
    return selected;
  };

  // Initialize trade items on component mount
  useEffect(() => {
    setTradeItems(generateTradeItems());
  }, [equippedExploits]);

  // Handle reroll
  const handleReroll = () => {
    const rerollCost = 50 + (rerollCount * 25); // Escalating cost
    if (playerCoin >= rerollCost) {
      setTradeItems(generateTradeItems());
      setRerollCount(prev => prev + 1);
      // Trigger purchase with negative cost to deduct coin
      onPurchase({ id: 'reroll', label: 'Reroll', description: 'Reroll shop items' } as RegistryEntry, rerollCost);
    }
  };

  // Handle curse removal
  const handleCurseRemoval = () => {
    const removalCost = 100 + (curseRemovalCount * 50); // Escalating cost
    if (playerCoin >= removalCost) {
      setCurseRemovalCount(prev => prev + 1);
      onPurchase({ id: 'curse-removal', label: 'Curse Removal', description: 'Remove curses' } as RegistryEntry, removalCost);
    }
  };

  // Handle purchase
  const handlePurchase = (item: TradeItem | Upgrade) => {
    if (playerCoin >= item.cost) {
      // Convert to RegistryEntry format for the callback
      const registryItem: RegistryEntry = {
        id: item.id,
        label: item.label,
        description: item.description,
        type: 'type' in item ? item.type : 'upgrade',
        rarity: 'rarity' in item ? item.rarity : '',
        category: '',
        completed: false,
        tags: 'tags' in item ? item.tags : [],
        choices: [],
        results: {},
        effects: 'effects' in item ? item.effects : []
      };
      onPurchase(registryItem, item.cost);
    }
  };

  // Handle sell
  const handleSell = (item: RegistryEntry) => {
    const sellValue = Math.floor(calculateCost(item.rarity, 'exploit') * 0.6); // 60% of purchase price
    onSell(item, sellValue);
  };

  const rerollCost = 50 + (rerollCount * 25);
  const curseRemovalCost = 100 + (curseRemovalCount * 50);

  return (
    <div className="trade-screen">
      <div className="trade-header">
        <h1>Merchant's Shop</h1>
        <div className="coin-display">
          <span className="coin-icon">🪙</span>
          <span className="coin-amount">{playerCoin} Coin</span>
        </div>
      </div>

      <div className="trade-tabs">
        <button
          className={`trade-tab ${selectedTab === 'buy' ? 'active' : ''}`}
          onClick={() => setSelectedTab('buy')}
        >
          Buy Items
        </button>
        <button
          className={`trade-tab ${selectedTab === 'sell' ? 'active' : ''}`}
          onClick={() => setSelectedTab('sell')}
        >
          Sell Equipment
        </button>
        <button
          className={`trade-tab ${selectedTab === 'upgrades' ? 'active' : ''}`}
          onClick={() => setSelectedTab('upgrades')}
        >
          Upgrades & Services
        </button>
      </div>

      <div className="trade-content">
        {selectedTab === 'buy' && (
          <div className="buy-section">
            <div className="items-grid">
              {tradeItems.map((item) => (
                <div key={item.id} className={`trade-item ${item.category}`}>
                  <div className="item-header">
                    <h3>{item.label}</h3>
                    <span className={`rarity ${item.rarity}`}>{item.rarity}</span>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <div className="item-tags">
                    {item.tags.map((tag: string) => (
                      <span key={tag} className="item-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="item-footer">
                    <span className="item-cost">🪙 {item.cost}</span>
                    <button
                      className="btn-buy"
                      onClick={() => handlePurchase(item)}
                      disabled={playerCoin < item.cost}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="shop-actions">
              <button
                className="btn-reroll"
                onClick={handleReroll}
                disabled={playerCoin < rerollCost}
              >
                Reroll Items (🪙 {rerollCost})
              </button>
            </div>
          </div>
        )}

        {selectedTab === 'sell' && (
          <div className="sell-section">
            <h3>Your Equipped Exploits</h3>
            {equippedExploits.length === 0 ? (
              <p className="no-items">No exploits equipped to sell.</p>
            ) : (
              <div className="items-grid">
                {equippedExploits.map((item) => {
                  const sellValue = Math.floor(calculateCost(item.rarity, 'exploit') * 0.6);
                  return (
                    <div key={item.id} className="trade-item exploit">
                      <div className="item-header">
                        <h3>{item.label}</h3>
                        <span className={`rarity ${item.rarity}`}>{item.rarity}</span>
                      </div>
                      <p className="item-description">{item.description}</p>
                      <div className="item-footer">
                        <span className="item-value">🪙 {sellValue}</span>
                        <button
                          className="btn-sell"
                          onClick={() => handleSell(item)}
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'upgrades' && (
          <div className="upgrades-section">
            <h3>Run Upgrades</h3>
            <div className="items-grid">
              {upgrades.map((upgrade) => (
                <div key={upgrade.id} className="trade-item upgrade">
                  <div className="item-header">
                    <h3>{upgrade.label}</h3>
                  </div>
                  <p className="item-description">{upgrade.description}</p>
                  <div className="item-footer">
                    <span className="item-cost">🪙 {upgrade.cost}</span>
                    <button
                      className="btn-buy"
                      onClick={() => handlePurchase(upgrade)}
                      disabled={playerCoin < upgrade.cost}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <h3>Services</h3>
            <div className="services-grid">
              <div className="service-item">
                <h4>Curse Removal</h4>
                <p>Remove up to 2 curses from your current loadout.</p>
                <button
                  className="btn-service"
                  onClick={handleCurseRemoval}
                  disabled={playerCoin < curseRemovalCost}
                >
                  Remove Curses (🪙 {curseRemovalCost})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="trade-actions">
        <button className="btn-back" onClick={onBack}>
          Leave Shop
        </button>
      </div>
    </div>
  );
};

export default TradeScreen;