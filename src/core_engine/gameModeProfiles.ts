
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
	},
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
	},
	coronata: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 18,
		deckWasteGap: 18,
		wasteFoundationGap: 28,
		foundationCount: 4,
		tableauCount: 8,
		deckType: 'standard',
		rules: 'coronata', // To be expanded with Coronata-specific rules
	},
};
