
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
	// CORONATA - Featured Mode
	coronata: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 18,
		deckWasteGap: 18,
		wasteFoundationGap: 28,
		foundationCount: 4,
		tableauCount: 8,
		deckType: 'standard',
		rules: 'coronata', // Solitaire Roguelike with encounters
	},
	
	// CLASSIC SOLITAIRE GAMES
	klondike: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 16,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 4,
		tableauCount: 7,
		deckType: 'standard',
		rules: 'klondike', // Traditional Klondike Solitaire
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
		rules: 'spider', // Two-deck Spider Solitaire
	},
	freecell: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 16,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 4,
		tableauCount: 8,
		deckType: 'standard',
		rules: 'freecell', // FreeCell with open cells
	},
	pyramid: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 14,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 1,
		tableauCount: 7,
		deckType: 'standard',
		rules: 'pyramid', // Pyramid Solitaire
	},
	tripeaks: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 12,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 1,
		tableauCount: 3,
		deckType: 'standard',
		rules: 'tripeaks', // Tri Peaks Solitaire
	},
	golf: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 16,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 1,
		tableauCount: 7,
		deckType: 'standard',
		rules: 'golf', // Golf Solitaire
	},
	yukon: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 16,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 4,
		tableauCount: 7,
		deckType: 'standard',
		rules: 'yukon', // Yukon Solitaire (no stock pile)
	},
	aces_up: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 20,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 4,
		tableauCount: 4,
		deckType: 'standard',
		rules: 'aces_up', // Aces Up Solitaire
	},
	clock: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 14,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 13,
		tableauCount: 13,
		deckType: 'standard',
		rules: 'clock', // Clock Solitaire
	},
	forty_thieves: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 12,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 8,
		tableauCount: 10,
		deckType: 'double',
		rules: 'forty_thieves', // Forty Thieves (two decks)
	},
	canfield: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 16,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 4,
		tableauCount: 4,
		deckType: 'standard',
		rules: 'canfield', // Canfield Solitaire
	},
	baker_dozen: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 12,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 4,
		tableauCount: 13,
		deckType: 'standard',
		rules: 'baker_dozen', // Baker's Dozen
	},
	scorpion: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 14,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 4,
		tableauCount: 7,
		deckType: 'standard',
		rules: 'scorpion', // Scorpion Solitaire
	},
	wasp: {
		cardWidth: 48,
		cardHeight: 72,
		tableauGap: 14,
		deckWasteGap: 16,
		wasteFoundationGap: 24,
		foundationCount: 4,
		tableauCount: 7,
		deckType: 'standard',
		rules: 'wasp', // Wasp Solitaire
	}
};
