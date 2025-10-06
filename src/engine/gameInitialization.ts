// Game initialization utilities for Coronata run structure
import { GameState, RunState, PlayerState, Card, Suit } from './types';
import { initializeRun, selectEncounter } from './encounterSystem';
import { integrateEnhancedScoring } from './enhancedScoring';

export interface GameInitConfig {
  variant: string;
  difficulty: number;
  seed?: string;
  playerProfile?: any;
}

export function initializeCoronataGame(config: GameInitConfig): Partial<GameState> {
  const { variant, difficulty } = config;

  // Initialize player state
  const player: PlayerState = {
    coins: 50, // Set starting coins to 50
    shuffles: 3, // Starting shuffles
    discards: 3, // Starting discards (per master doc)
    score: 0,
    exploits: [],
    curses: [],
    blessings: [],
    activeFortune: undefined,
    maxHandSize: 5, // Per master doc
    maxExploitSlots: 4 // Per master doc
  };

  // Initialize run state with balanced configuration
  const encounterConfig = {
    totalTrials: 5,
    encountersPerTrial: 3,
    baseScoreGoal: 0, // Not used, scoring handled by enhancedScoring.ts
    scoreGoalIncrease: 0, // Not used, scoring handled by enhancedScoring.ts
    fearWeight: 0.67 // 2/3 fear, 1/3 danger per trial
  };
  
  let run: RunState = initializeRun(difficulty, encounterConfig);

  // Select first encounter
  const firstEncounter = selectEncounter(run);
  run.encounter = firstEncounter;

  const gameState: Partial<GameState> = {
    player,
    run,
    piles: createDefaultCoronataPiles(), // Use the proper pile creation function
    history: [],
    meta: {
      variant,
      initialized: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  return gameState;
}

export function setupCoronataEngine(engineController: any, config: GameInitConfig) {
  console.log('setupCoronataEngine called with config:', config);
  console.log('engineController.state before setup:', engineController.state);

  // Initialize game state
  const initialState = initializeCoronataGame(config);
  console.log('initialState created:', initialState);
  
  // Merge with existing state or create new
  if (engineController.state) {
    Object.assign(engineController.state, initialState);
    console.log('Merged state:', engineController.state);
  } else {
    engineController.state = {
      piles: {},
      history: [],
      ...initialState
    } as GameState;
    console.log('Created new state:', engineController.state);
  }

  // Integrate enhanced scoring system
  console.log('setupCoronataEngine: Integrating enhanced scoring system...');
  integrateEnhancedScoring(engineController, config.variant);
  console.log('setupCoronataEngine: Enhanced scoring integration completed');

  // Update encounter progress to set correct score goal using enhanced scoring
  if (engineController.scoringSystem && engineController.state.run?.encounter) {
    console.log('setupCoronataEngine: Updating encounter goal with enhanced scoring...');
    const oldGoal = engineController.state.run.encounter.scoreGoal;
    engineController.state = engineController.scoringSystem.updateEncounterProgress(engineController.state);
    const newGoal = engineController.state.run.encounter.scoreGoal;
    console.log(`setupCoronataEngine: Score goal updated from ${oldGoal} to ${newGoal}`);
  }

  // Initialize default Coronata piles if not already set
  if (!engineController.state.piles || Object.keys(engineController.state.piles).length === 0) {
    engineController.state.piles = createDefaultCoronataPiles();
  }

  return engineController;
}

export function createDefaultCoronataPiles() {
  // Create and shuffle a deck
  const deck = [];
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  for (const suit of suits) {
    for (let i = 0; i < ranks.length; i++) {
      const rank = ranks[i];
      const value = i + 1; // A=1, 2=2, ..., K=13
      deck.push({ 
        id: `${rank}_${suit}`,
        suit, 
        value,
        faceUp: false
      });
    }
  }
  
  // Shuffle the deck using Math.random
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  // Deal cards to tableau (like Klondike solitaire)
  const tableauCards: Card[][] = [[], [], [], [], [], [], []];
  let deckIndex = 0;
  
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[deckIndex++];
      card.faceUp = row === col; // Only top card face up
      tableauCards[col].push(card);
    }
  }
  
  // Deal 5 cards to player hand (face up)
  const handCards: Card[] = [];
  for (let i = 0; i < 5; i++) {
    if (deckIndex < deck.length) {
      const card = deck[deckIndex++];
      card.faceUp = true; // Hand cards are always face up
      handCards.push(card);
    }
  }
  
  const stockCards = deck.slice(deckIndex);

  return {
    stock: { id: 'stock', type: 'stock', cards: stockCards, rules: { faceDown: true }, meta: {} },
    waste: { id: 'waste', type: 'waste', cards: [], rules: { faceUp: true }, meta: {} },
    hand: { id: 'hand', type: 'hand', cards: handCards, rules: { faceUp: true }, meta: {} },
    foundation1: { id: 'foundation1', type: 'foundation', cards: [], rules: { suit: 'hearts', faceUp: true }, meta: {} },
    foundation2: { id: 'foundation2', type: 'foundation', cards: [], rules: { suit: 'diamonds', faceUp: true }, meta: {} },
    foundation3: { id: 'foundation3', type: 'foundation', cards: [], rules: { suit: 'clubs', faceUp: true }, meta: {} },
    foundation4: { id: 'foundation4', type: 'foundation', cards: [], rules: { suit: 'spades', faceUp: true }, meta: {} },
    coronata1: { id: 'coronata1', type: 'coronata', cards: [], rules: { special: 'coronata_rules', faceUp: true }, meta: {} },
    coronata2: { id: 'coronata2', type: 'coronata', cards: [], rules: { special: 'coronata_rules', faceUp: true }, meta: {} },
    coronata3: { id: 'coronata3', type: 'coronata', cards: [], rules: { special: 'coronata_rules', faceUp: true }, meta: {} },
    tableau1: { id: 'tableau1', type: 'tableau', cards: tableauCards[0], rules: { building: 'down_alternate', faceUp: true }, meta: {} },
    tableau2: { id: 'tableau2', type: 'tableau', cards: tableauCards[1], rules: { building: 'down_alternate', faceUp: true }, meta: {} },
    tableau3: { id: 'tableau3', type: 'tableau', cards: tableauCards[2], rules: { building: 'down_alternate', faceUp: true }, meta: {} },
    tableau4: { id: 'tableau4', type: 'tableau', cards: tableauCards[3], rules: { building: 'down_alternate', faceUp: true }, meta: {} },
    tableau5: { id: 'tableau5', type: 'tableau', cards: tableauCards[4], rules: { building: 'down_alternate', faceUp: true }, meta: {} },
    tableau6: { id: 'tableau6', type: 'tableau', cards: tableauCards[5], rules: { building: 'down_alternate', faceUp: true }, meta: {} },
    tableau7: { id: 'tableau7', type: 'tableau', cards: tableauCards[6], rules: { building: 'down_alternate', faceUp: true }, meta: {} }
  };
}

// Helper function to check if engine is already initialized for Coronata
export function isCoronataInitialized(engineController: any): boolean {
  return !!(
    engineController.state?.run?.encounter &&
    engineController.state?.player &&
    engineController.scoringSystem?.getEncounterProgress
  );
}