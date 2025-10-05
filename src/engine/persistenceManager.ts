/**
 * Persistence Manager for Coronata Game
 * Handles saving and loading game state, player progress, and history to localStorage
 */

// Type alias for run outcome/category
export type RunOutcome = 'victory' | 'defeat' | 'resigned';

export interface GameSessionData {
  id: string;
  timestamp: number;
  duration: number;
  score: number;
  encountersCompleted: number;
  finalOutcome: RunOutcome;
  exploitsGained: string[];
  blessingsGained: string[];
  fearsGained: string[];
  coinsEarned: number;
  selectedFortune?: string;
  /**
   * Area or zone(s) where the run took place (e.g., 'Haunted Forest', 'Goblin Market').
   * Can be a string or array of strings if multiple areas are relevant.
   */
  area?: string | string[];
  /**
   * Category for grouping runs (e.g., 'victory', 'defeat', 'resigned').
   * This can be used for richer filtering/grouping in the UI.
   */
  category?: RunOutcome;
  /**
   * Richer stats object for future extensibility (e.g., { moves: 42, perfectEncounters: 2, ... })
   */
  stats?: Record<string, any>;
}

export interface PlayerProfile {
  id: string;
  name: string;
  createdAt: number;
  lastPlayed: number;
  totalSessions: number;
  totalScore: number;
  totalTime: number;
  totalVictories: number;
  totalDefeats: number;
  totalResigns: number;
  bestScore: number;
  longestSession: number;
  averageScore: number;
  winRate: number;
  totalCoinsEarned: number;
  unlockedExploits: string[];
  unlockedBlessings: string[];
  encounteredFears: string[];
  uniqueExploitsFound: string[];
  uniqueBlessingsFound: string[];
  uniqueFearsEncountered: string[];
  preferences: {
    autoSave: boolean;
    difficulty: 'easy' | 'normal' | 'hard';
    animations: boolean;
    soundEnabled: boolean;
  };
}

export interface SavedGameState {
  id: string;
  timestamp: number;
  gameMode: string;
  selectedFortune?: any;
  gameState: any;
  playerStats: any;
  sessionStartTime: number;
  autosaveSlot: number;
}

class PersistenceManager {
  private static instance: PersistenceManager;
  private readonly STORAGE_KEYS = {
    PLAYER_PROFILE: 'coronata-player-profile',
    GAME_HISTORY: 'coronata-game-history',
    SAVED_GAMES: 'coronata-saved-games',
    CURRENT_SESSION: 'coronata-current-session',
    PREFERENCES: 'coronata-preferences'
  };

  private constructor() {}

  public static getInstance(): PersistenceManager {
    if (!PersistenceManager.instance) {
      PersistenceManager.instance = new PersistenceManager();
    }
    return PersistenceManager.instance;
  }

  // Player Profile Management
  public getPlayerProfile(): PlayerProfile | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PLAYER_PROFILE);
      if (!data) return null;
      
      const profile: PlayerProfile = JSON.parse(data);
      
      // Calculate derived statistics from game history
      const history = this.getGameHistory();
      if (history.length > 0) {
        profile.totalSessions = history.length;
        profile.totalScore = history.reduce((sum, session) => sum + session.score, 0);
        profile.totalTime = history.reduce((sum, session) => sum + session.duration, 0);
        profile.totalVictories = history.filter(s => s.finalOutcome === 'victory').length;
        profile.totalDefeats = history.filter(s => s.finalOutcome === 'defeat').length;
        profile.totalResigns = history.filter(s => s.finalOutcome === 'resigned').length;
        profile.bestScore = Math.max(...history.map(s => s.score));
        profile.longestSession = Math.max(...history.map(s => s.duration));
        profile.averageScore = profile.totalScore / profile.totalSessions;
        profile.winRate = (profile.totalVictories / profile.totalSessions) * 100;
        profile.totalCoinsEarned = history.reduce((sum, session) => sum + session.coinsEarned, 0);
        
        // Calculate unique items found
        const allExploits = history.flatMap(s => s.exploitsGained);
        const allBlessings = history.flatMap(s => s.blessingsGained);
        const allFears = history.flatMap(s => s.fearsGained);
        
        profile.uniqueExploitsFound = [...new Set(allExploits)];
        profile.uniqueBlessingsFound = [...new Set(allBlessings)];
        profile.uniqueFearsEncountered = [...new Set(allFears)];
      }
      
      return profile;
    } catch (error) {
      console.error('Error loading player profile:', error);
      return null;
    }
  }

  public savePlayerProfile(profile: PlayerProfile): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEYS.PLAYER_PROFILE, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving player profile:', error);
      return false;
    }
  }

  public createPlayerProfile(name: string = 'Player'): PlayerProfile {
    const profile: PlayerProfile = {
      id: this.generateId(),
      name,
      createdAt: Date.now(),
      lastPlayed: Date.now(),
      totalSessions: 0,
      totalScore: 0,
      totalTime: 0,
      totalVictories: 0,
      totalDefeats: 0,
      totalResigns: 0,
      bestScore: 0,
      longestSession: 0,
      averageScore: 0,
      winRate: 0,
      totalCoinsEarned: 0,
      unlockedExploits: [],
      unlockedBlessings: [],
      encounteredFears: [],
      uniqueExploitsFound: [],
      uniqueBlessingsFound: [],
      uniqueFearsEncountered: [],
      preferences: {
        autoSave: true,
        difficulty: 'normal',
        animations: true,
        soundEnabled: true
      }
    };
    
    this.savePlayerProfile(profile);
    return profile;
  }

  // Game History Management
  public getGameHistory(): GameSessionData[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.GAME_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading game history:', error);
      return [];
    }
  }

  public addGameSession(session: GameSessionData): boolean {
    try {
      const history = this.getGameHistory();
      history.push(session);
      
      // Keep only the last 100 sessions to prevent localStorage overflow
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history));
      
      // Update player profile with session data
      this.updatePlayerProfileWithSession(session);
      
      return true;
    } catch (error) {
      console.error('Error saving game session:', error);
      return false;
    }
  }

  public clearGameHistory(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.GAME_HISTORY);
      return true;
    } catch (error) {
      console.error('Error clearing game history:', error);
      return false;
    }
  }

  // Game State Management
  public getSavedGames(): SavedGameState[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SAVED_GAMES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading saved games:', error);
      return [];
    }
  }

  public saveGameState(gameState: any, gameMode: string, selectedFortune?: any, slotName?: string): boolean {
    try {
      const savedGame: SavedGameState = {
        id: slotName || this.generateId(),
        timestamp: Date.now(),
        gameMode,
        selectedFortune,
        gameState,
        playerStats: this.getPlayerProfile(),
        sessionStartTime: this.getCurrentSessionStartTime(),
        autosaveSlot: slotName ? 0 : 1
      };

      const savedGames = this.getSavedGames();
      const existingIndex = savedGames.findIndex(save => save.id === savedGame.id);
      
      if (existingIndex >= 0) {
        savedGames[existingIndex] = savedGame;
      } else {
        savedGames.push(savedGame);
        
        // Keep only the last 10 save slots
        if (savedGames.length > 10) {
          savedGames.splice(0, savedGames.length - 10);
        }
      }

      localStorage.setItem(this.STORAGE_KEYS.SAVED_GAMES, JSON.stringify(savedGames));
      return true;
    } catch (error) {
      console.error('Error saving game state:', error);
      return false;
    }
  }

  public loadGameState(saveId: string): SavedGameState | null {
    try {
      const savedGames = this.getSavedGames();
      return savedGames.find(save => save.id === saveId) || null;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  }

  public deleteGameSave(saveId: string): boolean {
    try {
      const savedGames = this.getSavedGames();
      const filteredSaves = savedGames.filter(save => save.id !== saveId);
      localStorage.setItem(this.STORAGE_KEYS.SAVED_GAMES, JSON.stringify(filteredSaves));
      return true;
    } catch (error) {
      console.error('Error deleting game save:', error);
      return false;
    }
  }

  // Current Session Management
  public startSession(): void {
    try {
      const sessionData = {
        startTime: Date.now(),
        id: this.generateId()
      };
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  public endSession(outcome: RunOutcome, gameData: any): void {
    try {
      const sessionData = this.getCurrentSession();
      if (!sessionData) return;

      const sessionDuration = Math.floor((Date.now() - sessionData.startTime) / 1000);
      
      const gameSession: GameSessionData = {
        id: sessionData.id,
        timestamp: sessionData.startTime,
        duration: sessionDuration,
        score: gameData.score || 0,
        encountersCompleted: gameData.encountersCompleted || 0,
        finalOutcome: outcome,
        exploitsGained: gameData.exploitsGained || [],
        blessingsGained: gameData.blessingsGained || [],
        fearsGained: gameData.fearsGained || [],
        coinsEarned: gameData.coinsEarned || 0,
        selectedFortune: gameData.selectedFortune,
        // New fields for area, category, and stats
        area: gameData.area,
        category: gameData.category || outcome,
        stats: gameData.stats
      };

      this.addGameSession(gameSession);
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_SESSION);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  private getCurrentSession(): any {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CURRENT_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  private getCurrentSessionStartTime(): number {
    const session = this.getCurrentSession();
    return session ? session.startTime : Date.now();
  }

  // Utility Methods
  private updatePlayerProfileWithSession(session: GameSessionData): void {
    const profile = this.getPlayerProfile();
    if (!profile) return;

    profile.lastPlayed = Date.now();
    profile.totalSessions++;
    profile.totalScore += session.score;
    profile.totalTime += session.duration;
    profile.totalCoinsEarned += session.coinsEarned;
    
    if (session.finalOutcome === 'victory') {
      profile.totalVictories++;
    }
    
    if (session.score > profile.bestScore) {
      profile.bestScore = session.score;
    }

    // Update discovered items
    session.exploitsGained.forEach(exploit => {
      if (!profile.unlockedExploits.includes(exploit)) {
        profile.unlockedExploits.push(exploit);
      }
    });

    session.blessingsGained.forEach(blessing => {
      if (!profile.unlockedBlessings.includes(blessing)) {
        profile.unlockedBlessings.push(blessing);
      }
    });

    session.fearsGained.forEach(fear => {
      if (!profile.encounteredFears.includes(fear)) {
        profile.encounteredFears.push(fear);
      }
    });

    this.savePlayerProfile(profile);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Auto-save functionality
  public enableAutoSave(interval: number = 30000): void {
    setInterval(() => {
      const profile = this.getPlayerProfile();
      if (profile?.preferences.autoSave) {
        // This would be called from the game engine to auto-save current state
        console.log('Auto-save triggered');
      }
    }, interval);
  }

  // Clear all data (for reset/debugging)
  public clearAllData(): boolean {
    try {
      Object.values(this.STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Export/Import functionality
  public exportPlayerData(): string {
    try {
      const data = {
        profile: this.getPlayerProfile(),
        history: this.getGameHistory(),
        savedGames: this.getSavedGames(),
        exportDate: Date.now(),
        version: '1.0.0'
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting player data:', error);
      return '';
    }
  }

  public importPlayerData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profile) {
        this.savePlayerProfile(data.profile);
      }
      
      if (data.history) {
        localStorage.setItem(this.STORAGE_KEYS.GAME_HISTORY, JSON.stringify(data.history));
      }
      
      if (data.savedGames) {
        localStorage.setItem(this.STORAGE_KEYS.SAVED_GAMES, JSON.stringify(data.savedGames));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing player data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const persistenceManager = PersistenceManager.getInstance();

// Export helper functions for easy use
export const saveGame = (gameState: any, gameMode: string, selectedFortune?: any, slotName?: string) => 
  persistenceManager.saveGameState(gameState, gameMode, selectedFortune, slotName);

export const loadGame = (saveId: string) => 
  persistenceManager.loadGameState(saveId);

export const getGameHistory = () => 
  persistenceManager.getGameHistory();

export const getPlayerProfile = () => 
  persistenceManager.getPlayerProfile();

export const createProfile = (name?: string) => 
  persistenceManager.createPlayerProfile(name);

export const startGameSession = () => 
  persistenceManager.startSession();

export const endGameSession = (outcome: RunOutcome, gameData: any) => 
  persistenceManager.endSession(outcome, gameData);