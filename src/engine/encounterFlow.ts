/**
 * Encounter Flow Manager
 * Implements the correct post-encounter flow according to Master Doc V4.0:
 * - After Fear: 1 Trade + 2 Wanders (all happen in random order)
 * - After Danger: Mandatory Fortune Swap + 50% chance for bonus Trade
 * - Uses registry as source of truth for all content
 */

import { GameState } from './types';
import { registry } from '../registry/index';

export interface EncounterFlowState {
  phase: 'encounter' | 'trade' | 'wander' | 'fortune-swap' | 'complete';
  queuedActivities: EncounterActivity[];
  currentActivity: EncounterActivity | null;
  completedActivities: string[];
}

export interface EncounterActivity {
  type: 'trade' | 'wander' | 'fortune-swap';
  id: string;
  data?: any;
}

export interface TradeOffer {
  exploits: any[];
  blessings: any[];
  curses: any[];
  utilities: any[];
  rerollCost: number;
  rerollCount: number;
}

export interface WanderEvent {
  entry: any;
  choices: any[];
}

export class EncounterFlowManager {
  private readonly state: GameState;
  private flowState: EncounterFlowState;

  constructor(gameState: GameState) {
    this.state = gameState;
    this.flowState = {
      phase: 'encounter',
      queuedActivities: [],
      currentActivity: null,
      completedActivities: []
    };
  }

  /**
   * Called when an encounter is completed to set up the post-encounter flow
   */
  onEncounterComplete(encounterType: 'fear' | 'danger' | 'usurper'): EncounterFlowState {
    this.flowState.queuedActivities = [];
    this.flowState.completedActivities = [];
    this.flowState.currentActivity = null;


    if (encounterType === 'fear') {
      // After Fear: 1 Trade + 2 Wanders in random order
      const activities: EncounterActivity[] = [
        { type: 'trade', id: `trade-${Date.now()}` },
        { type: 'wander', id: `wander-${Date.now()}-1` },
        { type: 'wander', id: `wander-${Date.now()}-2` }
      ];
      // Randomize order as per Master Doc
      this.flowState.queuedActivities = this.shuffleArray(activities);
    } else if (encounterType === 'danger') {
      // After Danger: Mandatory Fortune Swap + 50% chance for bonus Trade
      this.flowState.queuedActivities = [
        { type: 'fortune-swap', id: `fortune-swap-${Date.now()}` }
      ];
      // 50% chance for bonus trade using Math.random
      if (Math.random() < 0.5) {
        this.flowState.queuedActivities.push({
          type: 'trade',
          id: `bonus-trade-${Date.now()}`
        });
      }
      // Check if this is the last Danger (Trial 5, Encounter 15)
      const isLastDanger = this.state.run &&
        this.state.run.currentTrial === 5 &&
        (
          // If currentEncounter is 2 (0-based: 0=Fear1, 1=Fear2, 2=Danger)
          this.state.run.currentEncounter === 2 ||
          // Or if encounter number is 15 (1-based)
          (((this.state.run.currentTrial - 1) * 3) + this.state.run.currentEncounter + 1) === 15
        );
      if (isLastDanger) {
        // Always add a Final Trade after the Fortune Swap and possible bonus Trade
        this.flowState.queuedActivities.push({
          type: 'trade',
          id: `final-trade-${Date.now()}`
        });
      }
    }
    // Usurper encounters don't have post-encounter flow

    // Start the first activity
    this.startNextActivity();
    
    return this.flowState;
  }

  /**
   * Start the next queued activity
   */
  private startNextActivity(): void {
    if (this.flowState.queuedActivities.length === 0) {
      this.flowState.phase = 'complete';
      this.flowState.currentActivity = null;
      return;
    }

    const nextActivity = this.flowState.queuedActivities.shift()!;
    this.flowState.currentActivity = nextActivity;
    this.flowState.phase = nextActivity.type;

    // Prepare activity-specific data
    switch (nextActivity.type) {
      case 'trade':
        nextActivity.data = this.prepareTradeOffer();
        break;
      case 'wander':
        nextActivity.data = this.prepareWanderEvent();
        break;
      case 'fortune-swap':
        nextActivity.data = this.prepareFortuneSwap();
        break;
    }
  }

  /**
   * Complete the current activity and move to next
   */
  completeCurrentActivity(results?: any): void {
    if (!this.flowState.currentActivity) return;

    // Apply activity results
    this.applyActivityResults(this.flowState.currentActivity, results);

    // Mark as completed
    this.flowState.completedActivities.push(this.flowState.currentActivity.id);
    
    // Move to next activity
    this.startNextActivity();
  }

  /**
   * Prepare trade offer according to Master Doc: 4 Exploits, 3 Blessings, 2 Curses
   */
  private prepareTradeOffer(): TradeOffer {
    const currentRun = this.state.run;
    const playerExploits = this.state.player?.exploits || [];
    
    // Get available exploits (excluding already equipped ones)
    const availableExploits = registry.exploit.filter(exploit => 
      !playerExploits.includes(exploit.id)
    );
    
    // Randomly select 4 exploits
    const selectedExploits = this.selectRandomItems(availableExploits, 4);
    
    // Randomly select 3 blessings
    const selectedBlessings = this.selectRandomItems(registry.blessing, 3);
    
    // Randomly select 2 curses
    const selectedCurses = this.selectRandomItems(registry.curse, 2);

    // Utility options from Master Doc
    const utilities = [
      { id: 'hand-size', label: 'Hand Size +1', cost: 80, type: 'hand_size_increase' },
      { id: 'shuffle', label: 'Shuffle +1', cost: 40, type: 'shuffle_increase' },
      { id: 'discard', label: 'Discard +1', cost: 40, type: 'discard_increase' },
      { id: 'curse-removal', label: 'Remove Curse', cost: this.calculateCurseRemovalCost(), type: 'curse_removal' }
    ];

    const rerollCount = currentRun?.tradeRerollCount || 0;
    const rerollCost = 50 + (25 * rerollCount); // Escalating cost per Master Doc

    return {
      exploits: selectedExploits,
      blessings: selectedBlessings,
      curses: selectedCurses,
      utilities,
      rerollCost,
      rerollCount
    };
  }

  /**
   * Prepare wander event by selecting from registry
   */
  private prepareWanderEvent(): WanderEvent {
    // Select random wander from registry appropriate for current difficulty
    const wanderPool = registry.wander.filter(_wander => {
      // Filter by difficulty/encounter level if wander has such metadata
      return true; // For now, use all wanders
    });

    const randomIndex = Math.floor(Math.random() * wanderPool.length);
    const selectedWander = wanderPool[randomIndex];
    
    return {
      entry: selectedWander,
      choices: Object.keys(selectedWander.choices || selectedWander.results || {})
    };
  }

  /**
   * Prepare fortune swap options
   */
  private prepareFortuneSwap(): any {
    const currentFortune = this.state.player?.activeFortune;
    const recentlyUsed = this.state.run?.recentFortunes || [];
    
    // Available fortunes exclude current one and recently used ones
    const availableFortunes = registry.fortune.filter(fortune => 
      fortune.id !== currentFortune && 
      !recentlyUsed.includes(fortune.id)
    );

    // Select 3 random options
    const options = this.selectRandomItems(availableFortunes, 3);
    
    return {
      currentFortune,
      options,
      mandatory: true
    };
  }

  /**
   * Apply the results of completed activities
   */
  private applyActivityResults(activity: EncounterActivity, results: any): void {
    switch (activity.type) {
      case 'trade':
        this.applyTradeResults(results);
        break;
      case 'wander':
        this.applyWanderResults(activity.data, results);
        break;
      case 'fortune-swap':
        this.applyFortuneSwapResults(results);
        break;
    }
  }

  private applyTradeResults(results: any): void {
    if (!results) return;

    // Apply purchases (subtract coins, add items to player)
    if (results.purchases) {
      for (const purchase of results.purchases) {
        this.state.player.coins = (this.state.player.coins || 0) - purchase.cost;
        
        switch (purchase.type) {
          case 'exploit':
            this.state.player.exploits = [...(this.state.player.exploits || []), purchase.id];
            break;
          case 'blessing':
            // Blessings are applied to specific cards
            this.applyBlessingToCard(purchase.id, purchase.targetCard);
            break;
          case 'curse':
            this.state.player.curses = [...(this.state.player.curses || []), purchase.id];
            break;
          case 'utility':
            this.applyUtilityPurchase(purchase);
            break;
        }
      }
    }

    // Track reroll count
    if (results.rerolled) {
      if (!this.state.run) this.state.run = {} as any;
      this.state.run.tradeRerollCount = (this.state.run.tradeRerollCount || 0) + 1;
    }
  }

  private applyWanderResults(wanderData: WanderEvent, results: any): void {
    if (!results || !wanderData.entry) return;

    const wander = wanderData.entry;
    const chosenOption = results.choice;
    
    // Parse wander effects from registry
    if (wander.results && wander.results[chosenOption]) {
      const outcome = wander.results[chosenOption];
      this.parseAndApplyWanderOutcome(outcome);
    }

    if (wander.effects) {
      const relevantEffects = wander.effects.filter((effect: any) => 
        !effect.condition || effect.condition.choice === chosenOption
      );
      
      // Apply structured effects through effect engine
      if (relevantEffects.length > 0) {
        // This would integrate with the existing effect engine
        console.log('Applying wander effects:', relevantEffects);
      }
    }
  }

  private applyFortuneSwapResults(results: any): void {
    if (!results || !results.selectedFortune) return;

    // Update active fortune
    const oldFortune = this.state.player?.activeFortune;
    this.state.player.activeFortune = results.selectedFortune;

    // Track recently used fortunes
    if (!this.state.run) this.state.run = {} as any;
    if (!this.state.run.recentFortunes) this.state.run.recentFortunes = [];
    
    if (oldFortune && !this.state.run.recentFortunes.includes(oldFortune)) {
      this.state.run.recentFortunes.push(oldFortune);
    }

    // Keep only last few fortunes to prevent pool from becoming too small
    if (this.state.run.recentFortunes.length > 3) {
      this.state.run.recentFortunes.shift();
    }
  }

  // Helper methods
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private selectRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  private calculateCurseRemovalCost(): number {
    const curseCount = this.state.player?.curses?.length || 0;
    return 60 + (curseCount * 20); // Escalating cost per curse
  }

  private applyBlessingToCard(blessingId: string, cardId: string): void {
    // Find the card in any pile and apply blessing
    for (const pile of Object.values(this.state.piles || {})) {
      const card = pile.cards.find((c: any) => c.id === cardId);
      if (card) {
        if (!card.blessings) card.blessings = [];
        card.blessings.push(blessingId);
        break;
      }
    }
  }

  private applyUtilityPurchase(purchase: any): void {
    switch (purchase.id) {
      case 'hand-size':
        this.state.player.maxHandSize = (this.state.player.maxHandSize || 5) + 1;
        break;
      case 'shuffle':
        this.state.player.shuffles = (this.state.player.shuffles || 3) + 1;
        break;
      case 'discard':
        this.state.player.discards = (this.state.player.discards || 3) + 1;
        break;
      case 'curse-removal':
        if (this.state.player.curses && this.state.player.curses.length > 0) {
          this.state.player.curses.pop(); // Remove most recent curse
        }
        break;
    }
  }

  private parseAndApplyWanderOutcome(outcome: string): void {
    // Parse text-based outcomes and apply effects
    console.log('Parsing wander outcome:', outcome);

    // Handle coin gains
    if (outcome.includes('Gain') && outcome.includes('coin')) {
      const coinMatch = outcome.match(/(\d+)\s*coin/i);
      if (coinMatch) {
        const coins = parseInt(coinMatch[1]);
        this.state.player.coins = (this.state.player.coins || 0) + coins;
        console.log(`Applied coin gain: +${coins}`);
      }
    }

    // Handle coin losses
    if (outcome.includes('lose') && outcome.includes('Coin')) {
      const coinMatch = outcome.match(/lose.*?(\d+)\s*Coin/i) || outcome.match(/(\d+)\s*Coin.*?lose/i);
      if (coinMatch) {
        const coins = parseInt(coinMatch[1]);
        this.state.player.coins = Math.max(0, (this.state.player.coins || 0) - coins);
        console.log(`Applied coin loss: -${coins}`);
      }
    }

    // Handle losing all coins
    if (outcome.includes('lose all of your Coin')) {
      this.state.player.coins = 0;
      console.log('Applied coin loss: all coins lost');
    }

    // Handle point gains
    if (outcome.includes('points')) {
      const pointMatch = outcome.match(/(\d+)\s*points/i);
      if (pointMatch) {
        const points = parseInt(pointMatch[1]);
        this.state.player.score = (this.state.player.score || 0) + points;
        console.log(`Applied point gain: +${points}`);
      }
    }

    // Handle random blessing gain
    if (outcome.includes('random Blessing')) {
      const blessings = registry.blessing;
      if (blessings.length > 0) {
        const randomBlessing = blessings[Math.floor(Math.random() * blessings.length)];
        // Add to owned blessings for later application to cards
        this.state.player.ownedBlessings = [...(this.state.player.ownedBlessings || []), randomBlessing.id];
        console.log(`Applied blessing gain: ${randomBlessing.label}`);
      }
    }

    // Handle random curse gain
    if (outcome.includes('random Curse')) {
      const curses = registry.curse;
      if (curses.length > 0) {
        const randomCurse = curses[Math.floor(Math.random() * curses.length)];
        this.state.player.curses = [...(this.state.player.curses || []), randomCurse.id];
        console.log(`Applied curse gain: ${randomCurse.label}`);
      }
    }

    // Handle random exploit gains
    if (outcome.includes('random Rare Exploit')) {
      const rareExploits = registry.exploit.filter(e => e.rarity === 'rare');
      if (rareExploits.length > 0) {
        const randomExploit = rareExploits[Math.floor(Math.random() * rareExploits.length)];
        this.state.player.exploits = [...(this.state.player.exploits || []), randomExploit.id];
        console.log(`Applied rare exploit gain: ${randomExploit.label}`);
      }
    }

    if (outcome.includes('random Uncommon Exploit')) {
      const uncommonExploits = registry.exploit.filter(e => e.rarity === 'uncommon');
      if (uncommonExploits.length > 0) {
        const randomExploit = uncommonExploits[Math.floor(Math.random() * uncommonExploits.length)];
        this.state.player.exploits = [...(this.state.player.exploits || []), randomExploit.id];
        console.log(`Applied uncommon exploit gain: ${randomExploit.label}`);
      }
    }

    if (outcome.includes('random Epic Exploit')) {
      const epicExploits = registry.exploit.filter(e => e.rarity === 'epic');
      if (epicExploits.length > 0) {
        const randomExploit = epicExploits[Math.floor(Math.random() * epicExploits.length)];
        this.state.player.exploits = [...(this.state.player.exploits || []), randomExploit.id];
        console.log(`Applied epic exploit gain: ${randomExploit.label}`);
      }
    }

    // Handle shuffle/discard count reductions
    if (outcome.includes('shuffle count is permanently reduced')) {
      this.state.player.shuffles = Math.max(0, (this.state.player.shuffles || 3) - 1);
      console.log('Applied shuffle count reduction: -1');
    }

    if (outcome.includes('discard and shuffle counts are reduced')) {
      this.state.player.shuffles = Math.max(0, (this.state.player.shuffles || 3) - 1);
      this.state.player.discards = Math.max(0, (this.state.player.discards || 2) - 1);
      console.log('Applied shuffle and discard count reduction: -1 each');
    }

    // Handle chance-based effects
    if (outcome.includes('25% chance') || outcome.includes('50% chance')) {
      const chance = outcome.includes('25%') ? 0.25 : 0.5;
      if (Math.random() < chance) {
        if (outcome.includes('card with a value of 1, 5, or 10 is permanently removed')) {
          // Remove a random card with value 1, 5, or 10 from deck
          const deck = this.state.piles?.deck?.cards || [];
          const targetValues = [1, 5, 10];
          const validCards = deck.filter(card => targetValues.includes(card.value));
          if (validCards.length > 0) {
            const cardToRemove = validCards[Math.floor(Math.random() * validCards.length)];
            const index = deck.indexOf(cardToRemove);
            if (index !== -1) {
              deck.splice(index, 1);
              console.log(`Applied chance effect: removed card ${cardToRemove.value} from deck`);
            }
          }
        }

        if (outcome.includes('also receive a random Curse')) {
          const curses = registry.curse;
          if (curses.length > 0) {
            const randomCurse = curses[Math.floor(Math.random() * curses.length)];
            this.state.player.curses = [...(this.state.player.curses || []), randomCurse.id];
            console.log(`Applied chance effect: gained curse ${randomCurse.label}`);
          }
        }
      }
    }
  }

  // Public getters
  getCurrentActivity(): EncounterActivity | null {
    return this.flowState.currentActivity;
  }

  getFlowState(): EncounterFlowState {
    return { ...this.flowState };
  }

  isFlowComplete(): boolean {
    return this.flowState.phase === 'complete';
  }

  getUpdatedGameState(): GameState {
    return this.state;
  }

  /**
   * Called when the entire encounter flow is complete to advance to next encounter
   * This triggers the encounter reset and progression
   */
  onFlowComplete(): GameState {
    // Only set pendingEncounterReset for the next encounter; do NOT increment currentEncounter/currentTrial here.
    if (this.state.run) {
      const maxEncountersPerTrial = 3; // From encounter system config
      // Calculate the next encounter number (sequential, not incremented here)
      const encounterNumber = ((this.state.run.currentTrial - 1) * maxEncountersPerTrial) + this.state.run.currentEncounter + 1;

      console.log(`(FIXED) Setting pendingEncounterReset for encounter ${encounterNumber} (Trial ${this.state.run.currentTrial}, Encounter ${this.state.run.currentEncounter})`);

      // Reset encounter flow for next encounter
      this.flowState = {
        phase: 'encounter',
        queuedActivities: [],
        currentActivity: null,
        completedActivities: []
      };

      // Update run state
      if (this.state.run.encounterFlow) {
        this.state.run.encounterFlow.active = false;
        this.state.run.encounterFlow.phase = 'encounter';
      }

      // Set pendingEncounterReset for the scoring system to handle the reset and progression
      this.state.meta = this.state.meta || {};
      this.state.meta.pendingEncounterReset = encounterNumber;
    }

    return this.state;
  }
}