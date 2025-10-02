// Default settings for each game mode
export interface GameModeProfile {
  cardWidth: number;
  cardHeight: number;
  tableauGap: number;
  deckWasteGap: number;
  wasteFoundationGap: number;
  foundationCount: number;
  tableauCount: number;
  deckType: string;
  rules: string;
  
  // Enhanced features (optional - used by advanced game modes like Coronata)
  enableEnhancedScoring?: boolean;
  enableEffectSystem?: boolean;
  enableHandManagement?: boolean;
  defaultMaxHandSize?: number;
  enableEncounterSystem?: boolean;
  enableRegistryEffects?: boolean;
}

export interface GameModeProfiles {
  [key: string]: GameModeProfile;
}

export const gameModeProfiles: GameModeProfiles = {
  klondike: {
    cardWidth: 48,
    cardHeight: 72,
    tableauGap: 16,
    deckWasteGap: 16,
    wasteFoundationGap: 24,
    foundationCount: 4,
    tableauCount: 7,
    deckType: 'standard',
    rules: 'klondike',
    // Add more as needed
  },
  // Example stub for Spider
  spider: {
    cardWidth: 48,
    cardHeight: 72,
    tableauGap: 12,
    deckWasteGap: 16,
    wasteFoundationGap: 24,
    foundationCount: 8,
    tableauCount: 10,
    deckType: 'spider',
    rules: 'spider',
    // Add more as needed
  },
  coronata: {
    cardWidth: 48,
    cardHeight: 72,
    tableauGap: 16,
    deckWasteGap: 16,
    wasteFoundationGap: 24,
    foundationCount: 4,
    tableauCount: 7,
    deckType: 'standard',
    rules: 'coronata',
    
    // Enable Coronata-specific features
    enableEnhancedScoring: true,
    enableEffectSystem: true,
    enableHandManagement: true,
    defaultMaxHandSize: 5,
    enableEncounterSystem: true,
    enableRegistryEffects: true,
    
    // Asset references for Coronata (for use in UI/registry)
    // cardBack: require('../assets/coronata-card-back.txt'),
    // background: require('../assets/coronata-background.txt'),
    // icon: require('../assets/coronata-icon.txt'),
  },
  // Add more game modes here
};
