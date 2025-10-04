
import React from 'react';
import { registry } from '../registry/index';
import { useEngineEvent } from './EngineEventProvider';
import { Card } from './Card';
import { getMovableStack, validateMove, refillHandFromDeck } from '../engine/moveLogic';
import { PlayerHUD } from './PlayerHUD';
import TradeScreen from './TradeScreen';
import WanderScreen from './WanderScreen';
import FortuneSwapActivity from './FortuneSwapActivity';
import { endGameSession } from '../engine/persistenceManager';
import { EncounterFlowManager } from '../engine/encounterFlow';
import { startNewRun, checkEncounterCompletion, progressEncounter, checkRunCompletion, selectEncounter, resetEncounterState } from '../engine/encounterSystem';
import './GameScreen.css';

// Helper to safely get piles as an array of any
const getPiles = (piles: any): any[] => Array.isArray(piles) ? piles : Object.values(piles || {});

interface GameScreenProps {
  onNavigateToWelcome?: () => void;
  selectedFortune?: any;
}




export function GameScreen({ onNavigateToWelcome, selectedFortune }: GameScreenProps = {}) {

  // --- Hooks: always call at the top, unconditionally ---
  const ctx = useEngineEvent();
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = React.useState<string | null>(null);
  const [dragOverPileId, setDragOverPileId] = React.useState<string | null>(null);
  const [shakeCardId, setShakeCardId] = React.useState<string | null>(null);
  // Ref to store shake timeout
  const shakeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [highlightedDestinations, setHighlightedDestinations] = React.useState<string[]>([]);
  const [showResignModal, setShowResignModal] = React.useState(false);
  const [showRunRecap, setShowRunRecap] = React.useState(false);
  // Choice screen state
  const [currentScreen, setCurrentScreen] = React.useState<'game' | 'choice' | 'trade' | 'wander' | 'fortune-swap'>('game');
  // Debug/Testing features
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  const [selectedBlessingForCard, setSelectedBlessingForCard] = React.useState<string>('');
  const [selectedCardForBlessing, setSelectedCardForBlessing] = React.useState<string>('');
  const [registryEffectLog, setRegistryEffectLog] = React.useState<any[]>([]);
  const [showRegistryLog, setShowRegistryLog] = React.useState(false);
  // Zoom state for floating zoom window
  const [zoomLevel, setZoomLevel] = React.useState(100);
  // Provide fallback values for engine, event, config for hook dependencies
  const engine = ctx?.engine ?? ({} as any);
  const event = ctx?.event ?? null;
  const config = engine?.config ?? {};
  // Detect if Coronata mode is active (define unconditionally for hooks)
  const isCoronata = config?.rules === 'coronata';
  // Use event dependency to re-render when engine state changes
  const gameState = React.useMemo(() => engine?.state ?? {}, [engine?.state, event]);

  // Debug/Testing handlers
  const handleApplyBlessingToCard = () => {
    if (!selectedBlessingForCard || !selectedCardForBlessing) return;

    const blessingEffect = {
      type: 'apply_blessing_to_card',
      target: selectedCardForBlessing,
      value: selectedBlessingForCard
    };

    engine.state = engine.effectEngine.applyEffects([blessingEffect], engine.state);
    engine.emitEvent('stateChange', engine.state);

    console.log(`Debug: Applied blessing ${selectedBlessingForCard} to card ${selectedCardForBlessing}`);
    setSelectedBlessingForCard('');
    setSelectedCardForBlessing('');
  };

  const handleJumpToScreen = (screen: string) => {
    switch (screen) {
      case 'trade':
        setCurrentScreen('trade');
        break;
      case 'wander':
        setCurrentScreen('wander');
        break;
      case 'fortune-swap':
        setCurrentScreen('fortune-swap');
        break;
      case 'game':
        setCurrentScreen('game');
        break;
      default:
        console.log(`Unknown screen: ${screen}`);
    }
  };

  const handleJumpToEncounter = (trial: number, encounter: number) => {
    if (!engine?.state?.run) return;

    // Update run state to jump to specific encounter
    engine.state.run.currentTrial = trial;
    engine.state.run.currentEncounter = encounter;

    // Generate new encounter
    const newEncounter = selectEncounter(engine.state.run, undefined, undefined, Object.values(registry).flat());
    engine.state.run.encounter = newEncounter;

    engine.emitEvent('stateChange', engine.state);
    console.log(`Debug: Jumped to Trial ${trial}, Encounter ${encounter}`);
  };

  // Registry effect logging
  React.useEffect(() => {
    if (!showRegistryLog) return;

    const handleRegistryEffect = (event: any) => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: event.type,
        payload: event.payload,
        effect: event.effect || 'unknown'
      };
      setRegistryEffectLog(prev => [...prev.slice(-49), logEntry]); // Keep last 50 entries
    };

    // Listen to engine events that might involve registry effects
    engine?.eventEmitter?.on('move', handleRegistryEffect);
    engine?.eventEmitter?.on('on_play_from_hand', handleRegistryEffect);
    engine?.eventEmitter?.on('on_foundation_play', handleRegistryEffect);
    engine?.eventEmitter?.on('on_tableau_play', handleRegistryEffect);

    return () => {
      engine?.eventEmitter?.off('move', handleRegistryEffect);
      engine?.eventEmitter?.off('on_play_from_hand', handleRegistryEffect);
      engine?.eventEmitter?.off('on_foundation_play', handleRegistryEffect);
      engine?.eventEmitter?.off('on_tableau_play', handleRegistryEffect);
    };
  }, [showRegistryLog, engine]);
  const cardHeight = config?.cardHeight ?? 72;
  const overlapPercent = 0.5; // 50% overlap
  const tableauRowHeight = 14 * (cardHeight * overlapPercent);
  // Debug logging
  console.log('GameScreen rendering with engine state:', gameState);
  console.log('Engine config:', config);
  console.log('Last engine event:', event);
  console.log('Selected fortune:', selectedFortune);
  console.log('Is Coronata mode:', isCoronata);

  // Integrate selected fortune into game state for registry effects
  React.useEffect(() => {
    // Only run logic if all conditions are met
    if (!selectedFortune || !engine?.state?.player || !isCoronata) return;
    const currentFortunes = engine.state.player.fortunes || [];
    // Only add if not already present (avoid duplicates)
    if (!currentFortunes.includes(selectedFortune.id)) {
      console.log('Adding selected fortune to player registry:', selectedFortune.label);
      // Add the fortune to player registry
      engine.state.player.fortunes = [...currentFortunes, selectedFortune.id];
      // Set as active fortune for immediate effects processing
      engine.state.player.activeFortune = selectedFortune.id;
      console.log('Added fortune to player registry and set as active, calling applyImmediateEffects');
      // Apply immediate effects for the new fortune
      engine.applyImmediateEffects([selectedFortune.id]);
      console.log('Immediate effects applied, player coins:', engine.state.player.coins);
      // Refill hand if maxHandSize was increased
      if (engine.state.player.maxHandSize && engine.state.player.maxHandSize > 5) {
        const refilledState = refillHandFromDeck(engine.state);
        engine.state = refilledState;
        console.log('Hand refilled after fortune application, new hand size:', engine.state.piles.hand?.cards?.length || 0);
      }
      // Emit state change to trigger re-render and effect processing
      engine.emitEvent('stateChange', engine.state);
      console.log('Player fortunes updated:', engine.state.player.fortunes);
    }
  }, [selectedFortune, engine, isCoronata]);

  // Auto-start first encounter when entering game screen
  React.useEffect(() => {
    if (!engine?.state || !selectedFortune || !isCoronata) return;

    // Check if we need to start a new run (no existing run state)
    if (!engine.state.run || !engine.state.run.encounter) {
      console.log('Auto-starting first encounter...');
      try {
        const registryEntries = Object.values(registry).flat();
        engine.state = startNewRun(engine.state, 1, registryEntries);
        engine.emitEvent('stateChange', engine.state);
        console.log('First encounter started successfully');
      } catch (error) {
        console.error('Failed to auto-start first encounter:', error);
      }
    }
  }, [selectedFortune, engine, isCoronata]);

  // Auto-progress to next encounter when current encounter is completed
  React.useEffect(() => {
    if (!engine?.state?.run?.encounter || !isCoronata) return;

    const isCompleted = checkEncounterCompletion(engine.state);

    if (isCompleted && !engine.state.run.encounterFlow?.active) {
      console.log('Encounter completed, auto-progressing to next encounter...');
      try {
        const registryEntries = Object.values(registry).flat();
        engine.state.run = progressEncounter(engine.state.run, undefined, registryEntries);

        // Reset player score for new encounter
        engine.state = resetEncounterState(engine.state);

        // Check if run is now completed
        if (checkRunCompletion(engine.state.run)) {
          console.log('🎉 Run completed! All encounters finished.');
          engine.emitEvent('win', engine.state);
        } else {
          console.log('Progressed to next encounter successfully');
        }

        engine.emitEvent('stateChange', engine.state);
      } catch (error) {
        console.error('Failed to auto-progress encounter:', error);
      }
    }
  }, [gameState.player?.score, gameState.run?.encounter?.scoreGoal, engine, isCoronata]);

  // Responsive scaling effect
  React.useEffect(() => {
    const handleResize = () => {
      const gameScreen = document.querySelector('.game-screen-root') as HTMLElement;
      if (!gameScreen) return;

      const minWidth = 266; // Minimum width to show all cards
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Calculate scale factor to fit content while respecting minimum width
      let scaleX = viewportWidth / minWidth;
      let scaleY = viewportHeight / 600; // Approximate game height
      let scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
      // Ensure we don't go below minimum width
      if (viewportWidth < minWidth) {
        scale = viewportWidth / minWidth;
      }
      // Apply scaling
      if (scale < 1) {
        gameScreen.style.transform = `translate(-50%, -50%) scale(${scale})`;
        gameScreen.style.transformOrigin = 'center center';
      } else {
        gameScreen.style.transform = 'translate(-50%, -50%)';
      }
    };
    // Initial resize
    handleResize();
    // Add resize listener
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only render fallback UI after all hooks have been called
  if (!ctx) return <div>No engine context</div>;

  // --- State hooks ---

  // --- Registry-driven effect HUD ---
  // Get only truly active effects from game state (equipped exploits, active fears/dangers, etc.)
  // const activeEffects: any[] = React.useMemo(() => {
  //   const effects: any[] = [];
  //   const player = gameState.player || {};
  //   const encounter = gameState.run?.encounter || {} as any;
  //   // Get effects from equipped exploits
  //   if (player.exploits && Array.isArray(player.exploits)) {
  //     player.exploits.forEach((exploitId: string) => {
  //       const exploit = registry.exploit.find((e: any) => e.id === exploitId);
  //       if (exploit && exploit.effects) {
  //         exploit.effects.forEach((eff: any) => {
  //           effects.push({
  //             ...eff,
  //             label: exploit.label,
  //             description: exploit.description,
  //             type: exploit.type,
  //             id: exploit.id,
  //             source: 'exploit'
  //           });
  //         });
  //       }
  //     });
  //   }
  //   // Get effects from active fear/danger
  //   if (encounter.fear) {
  //     const fear = registry.fear.find((f: any) => f.id === encounter.fear);
  //     if (fear && fear.effects) {
  //       fear.effects.forEach((eff: any) => {
  //         effects.push({
  //           ...eff,
  //           label: fear.label,
  //           description: fear.description,
  //           type: fear.type,
  //           id: fear.id,
  //           source: 'fear'
  //         });
  //       });
  //     }
  //   }
  //   if (encounter.danger) {
  //     const danger = registry.danger.find((d: any) => d.id === encounter.danger);
  //     if (danger && danger.effects) {
  //       danger.effects.forEach((eff: any) => {
  //         effects.push({
  //           ...eff,
  //           label: danger.label,
  //           description: danger.description,
  //           type: danger.type,
  //           id: danger.id,
  //           source: 'danger'
  //         });
  //       });
  //     }
  //   }
  //   // Get effects from active curses
  //   if (player.curses && Array.isArray(player.curses)) {
  //     player.curses.forEach((curseId: string) => {
  //       const curse = registry.curse.find((c: any) => c.id === curseId);
  //       if (curse && curse.effects) {
  //         curse.effects.forEach((eff: any) => {
  //           effects.push({
  //             ...eff,
  //             label: curse.label,
  //             description: curse.description,
  //             type: curse.type,
  //             id: curse.id,
  //             source: 'curse'
  //           });
  //         });
  //       }
  //     });
  //   }
  //   return effects;
  // }, [gameState]);

  
  // Choice screen states


  
  // Function to trigger shake animation for invalid moves
  // Helper function to check if a move actually succeeded despite exceptions
  const checkMoveSuccess = (cardId: string, beforeState: any) => {
    // Find the pile and index of the card before the move
    let beforePileId = null;
    let beforeIndex = null;
    for (const [pileId, pile] of Object.entries(beforeState.piles)) {
      const pileAny = pile as any;
      if (Array.isArray(pileAny.cards)) {
        const idx = pileAny.cards.findIndex((card: any) => card.id === cardId);
        if (idx !== -1) {
          beforePileId = pileId;
          beforeIndex = idx;
          break;
        }
      }
    }
    // Find the pile and index of the card after the move
    let afterPileId = null;
    let afterIndex = null;
    for (const [pileId, pile] of Object.entries(engine.state.piles)) {
      const pileAny = pile as any;
      if (Array.isArray(pileAny.cards)) {
        const idx = pileAny.cards.findIndex((card: any) => card.id === cardId);
        if (idx !== -1) {
          afterPileId = pileId;
          afterIndex = idx;
          break;
        }
      }
    }
    // If the card is in the same pile and position, the move failed
    if (beforePileId === afterPileId && beforeIndex === afterIndex) {
      return false; // move failed
    }
    // Otherwise, the move succeeded
    return true;
  };

  const triggerShake = (cardId: string) => {
    // Only shake if the card is present in the UI (visible in any pile)
    const cardIsVisible = Object.values(gameState.piles || {}).some((pile: any) =>
      Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
    );
    if (!cardIsVisible) return;

    // Prevent overlapping shakes by clearing any existing timeout
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = null;
    }
    setShakeCardId(cardId);
    shakeTimeoutRef.current = setTimeout(() => {
      setShakeCardId(null);
      shakeTimeoutRef.current = null;
    }, 600);
  };

  // Handle trade screen actions
  const handleTradeBack = () => {
    // Check if we're in an encounter flow context
    if (gameState.run?.encounterFlow?.active) {
      // Use EncounterFlowManager to progress to next activity
      const flowManager = new EncounterFlowManager(gameState);

      // Complete the current trade activity
      flowManager.completeCurrentActivity({ skipped: true });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        const updatedState = flowManager.onFlowComplete();
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: !flowManager.isFlowComplete(),
              phase: newFlowState.phase,
              currentActivity: newFlowState.currentActivity,
              queuedActivities: newFlowState.queuedActivities,
              completedActivities: newFlowState.completedActivities
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    } else {
      // Fallback to legacy behavior
      setCurrentScreen('choice');
    }
  };

  const handleTradePurchase = (item: any, cost: number) => {
    console.log('Purchased item:', item, 'for', cost, 'coins');
    
    // Check if player has enough coins
    const currentCoins = gameState.player?.coins || 0;
    if (currentCoins < cost) {
      console.warn('Not enough coins for purchase:', { required: cost, available: currentCoins });
      return;
    }
    
    // Apply purchase effects through the engine's effect system
    const purchaseEffects = [
      { type: 'award_coin', value: -cost }, // Deduct coins
      { type: 'add_item', target: item.type, value: item.id } // Add item to inventory
    ];
    
    // Apply item's own effects if it has any
    if (item.effects && Array.isArray(item.effects)) {
      purchaseEffects.push(...item.effects);
    }
    
    // Use engine to apply all effects properly
    engine.state = engine.effectEngine.applyEffects(purchaseEffects, engine.state);
    
    // Emit events for UI updates
    engine.emitEvent('stateChange', engine.state);
    engine.emitEvent('trade_purchase', { item: item.id, cost, newCoinBalance: engine.state.player.coins });
    
    console.log('Purchase completed:', { item: item.id, newCoinBalance: engine.state.player.coins });
  };

  const handleBlessingApplication = (blessingId: string, cardId: string) => {
    console.log('Applying blessing to card:', { blessingId, cardId });
    
    // Find the card in the appropriate pile
    let targetCard = null;
    let targetPile = null;
    
    // Check draw pile
    if (gameState.piles.draw.cards.some((card: any) => card.id === cardId)) {
      targetCard = gameState.piles.draw.cards.find((card: any) => card.id === cardId);
      targetPile = 'draw';
    }
    // Check discard pile
    else if (gameState.piles.discard.cards.some((card: any) => card.id === cardId)) {
      targetCard = gameState.piles.discard.cards.find((card: any) => card.id === cardId);
      targetPile = 'discard';
    }
    // Check hand
    else if (gameState.piles.hand.cards.some((card: any) => card.id === cardId)) {
      targetCard = gameState.piles.hand.cards.find((card: any) => card.id === cardId);
      targetPile = 'hand';
    }
    
    if (!targetCard || !targetPile) {
      console.error('Card not found for blessing application:', cardId);
      return;
    }
    
    // Apply blessing to card through engine
    const blessingEffect = {
      type: 'apply_blessing_to_card',
      target: cardId,
      value: blessingId
    };
    
    engine.state = engine.effectEngine.applyEffects([blessingEffect], engine.state);
    
    // Emit events for UI updates
    engine.emitEvent('stateChange', engine.state);
    engine.emitEvent('blessing_applied', { blessingId, cardId, pile: targetPile });
    
    console.log('Blessing application completed:', { blessingId, cardId, pile: targetPile });
  };

  const handleTradeSell = (item: any, value: number) => {
    console.log('Sold item:', item, 'for', value, 'coins');
    
    // Apply sale effects through the engine's effect system
    const saleEffects = [
      { type: 'award_coin', value: value }, // Add coins
      { type: 'remove_item', target: item.type, value: item.id } // Remove item from inventory
    ];
    
    // Apply any negative effects from losing the item
    if (item.effects && Array.isArray(item.effects)) {
      // Create inverse effects for item removal
      const inverseEffects = item.effects.map((effect: any) => ({
        ...effect,
        value: effect.value ? -effect.value : effect.value
      }));
      saleEffects.push(...inverseEffects);
    }
    
    // Use engine to apply all effects properly
    engine.state = engine.effectEngine.applyEffects(saleEffects, engine.state);
    
    // Emit events for UI updates
    engine.emitEvent('stateChange', engine.state);
    engine.emitEvent('trade_sale', { item: item.id, value, newCoinBalance: engine.state.player.coins });
    
    console.log('Sale completed:', { item: item.id, newCoinBalance: engine.state.player.coins });
  };

  // Handle wander screen actions
  const handleWanderBack = () => {
    // Check if we're in an encounter flow context
    if (gameState.run?.encounterFlow?.active) {
      // Use EncounterFlowManager to progress to next activity
      const flowManager = new EncounterFlowManager(gameState);

      // Complete the current wander activity
      flowManager.completeCurrentActivity({ skipped: true });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        const updatedState = flowManager.onFlowComplete();
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: !flowManager.isFlowComplete(),
              phase: newFlowState.phase,
              currentActivity: newFlowState.currentActivity,
              queuedActivities: newFlowState.queuedActivities,
              completedActivities: newFlowState.completedActivities
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'trade') {
          setCurrentScreen('trade');
        } else if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    } else {
      // Fallback to legacy behavior
      setCurrentScreen('choice');
    }
  };

  const handleWanderChoice = (wanderId: string, choice: string, outcome: string) => {
    console.log('Wander choice made:', { wanderId, choice, outcome });
    
    // Create a copy of the current state to modify
    const newState = { ...engine.state };
    
    // Find the wander in the registry to get its effects
    const wander = registry.wander?.find(w => w.id === wanderId);
    if (!wander) {
      console.warn('Wander not found in registry:', wanderId);
      return;
    }
    
    // Get the effects for the chosen outcome
    let wanderEffects: any[] = [];
    
    // Check if the wander has structured effects for this choice
    if (wander.effects && Array.isArray(wander.effects)) {
      wanderEffects = wander.effects.filter((effect: any) => 
        !effect.condition || effect.condition.choice === choice
      );
    }
    
    // If no structured effects, try to parse from results
    if (wanderEffects.length === 0 && wander.results && wander.results[choice]) {
      // Parse simple text outcomes for basic effects
      const result = wander.results[choice];
      if (result.includes('coin')) {
        const coinMatch = result.match(/(\+|-)?(\d+)\s*coin/i);
        if (coinMatch) {
          const value = parseInt(coinMatch[2]) * (coinMatch[1] === '-' ? -1 : 1);
          wanderEffects.push({ type: 'award_coin', value });
        }
      }
    }
    
    // Apply wander effects through the engine
    if (wanderEffects.length > 0) {
      engine.state = engine.effectEngine.applyEffects(wanderEffects, engine.state);
    }
    
    // Emit events for UI updates
    engine.emitEvent('stateChange', engine.state);
    engine.emitEvent('wander_complete', { wanderId, choice, outcome, effects: wanderEffects });
    
    console.log('Wander completed:', { wanderId, choice, effects: wanderEffects });
    
    // Parse common outcome patterns
    if (outcome.includes('Gain') && outcome.includes('Coin')) {
      const coinMatch = outcome.match(/(\d+)\s*Coin/i);
      if (coinMatch) {
        const coinAmount = parseInt(coinMatch[1]);
        newState.player.coins = (newState.player.coins || 0) + coinAmount;
        console.log(`Applied wander effect: +${coinAmount} coins`);
      }
    }
    
    if (outcome.includes('lose') && outcome.includes('Coin')) {
      const coinMatch = outcome.match(/lose.*?(\d+)\s*Coin/i) || outcome.match(/(\d+)\s*Coin.*?lose/i);
      if (coinMatch) {
        const coinAmount = parseInt(coinMatch[1]);
        newState.player.coins = Math.max(0, (newState.player.coins || 0) - coinAmount);
        console.log(`Applied wander effect: -${coinAmount} coins`);
      }
    }
    
    if (outcome.includes('all of your Coin')) {
      newState.player.coins = 0;
      console.log('Applied wander effect: lost all coins');
    }
    
    if (outcome.includes('Gain a random Rare Exploit')) {
      // This would need proper registry lookup for rare exploits
      // For now, just log the effect
      console.log('Applied wander effect: would gain rare exploit (needs implementation)');
    }
    
    if (outcome.includes('Gain a random Curse')) {
      // This would need proper registry lookup for curses
      // For now, just log the effect
      console.log('Applied wander effect: would gain curse (needs implementation)');
    }
    
    // Update engine state
    engine.state = newState;
    
    // Check if wander choice triggered any scoring effects and update encounter progress
    if (engine.scoringSystem) {
      const updatedState = engine.scoringSystem.updateEncounterProgress(newState);
      if (updatedState !== newState) {
        engine.state = updatedState;
        console.log('Wander choice triggered encounter progress update');
      }
    }
    
    engine.emitEvent('stateChange', engine.state);
    
    console.log('Wander effects applied, returning to game');
    setCurrentScreen('game');
  };

  // Handle fortune swap screen actions
  const handleFortuneSwapBack = () => {
    // Check if we're in an encounter flow context
    if (gameState.run?.encounterFlow?.active) {
      // Use EncounterFlowManager to progress to next activity
      const flowManager = new EncounterFlowManager(gameState);

      // Complete the current fortune swap activity
      flowManager.completeCurrentActivity({ skipped: true });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        const updatedState = flowManager.onFlowComplete();
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: !flowManager.isFlowComplete(),
              phase: newFlowState.phase,
              currentActivity: newFlowState.currentActivity,
              queuedActivities: newFlowState.queuedActivities,
              completedActivities: newFlowState.completedActivities
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'trade') {
          setCurrentScreen('trade');
        } else if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    } else {
      // Fallback to legacy behavior
      setCurrentScreen('choice');
    }
  };

  const handleFortuneSwapSelection = (fortuneId: string) => {
    console.log('Fortune swap selected:', fortuneId);

    // Apply fortune swap through encounter flow manager
    if (gameState.run?.encounterFlow?.active) {
      const flowManager = new EncounterFlowManager(gameState);

      // Complete the fortune swap activity with the selected fortune
      flowManager.completeCurrentActivity({ selectedFortune: fortuneId });

      // If flow is now complete, immediately advance to next encounter
      if (flowManager.isFlowComplete()) {
        const updatedState = flowManager.onFlowComplete();
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: false,
              phase: 'encounter',
              currentActivity: null,
              queuedActivities: [],
              completedActivities: []
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        setCurrentScreen('game');
      } else {
        // Otherwise, update game state with new flow state and continue
        const updatedState = flowManager.getUpdatedGameState();
        const newFlowState = flowManager.getFlowState();
        engine.state = {
          ...updatedState,
          run: {
            ...updatedState.run,
            encounterFlow: {
              active: !flowManager.isFlowComplete(),
              phase: newFlowState.phase,
              currentActivity: newFlowState.currentActivity,
              queuedActivities: newFlowState.queuedActivities,
              completedActivities: newFlowState.completedActivities
            }
          }
        };
        engine.emitEvent('stateChange', engine.state);
        if (newFlowState.currentActivity?.type === 'trade') {
          setCurrentScreen('trade');
        } else if (newFlowState.currentActivity?.type === 'wander') {
          setCurrentScreen('wander');
        } else {
          setCurrentScreen('game');
        }
      }
    }

    console.log('Fortune swap completed, returning to game');
  };

  // Function to find all valid move destinations for a card
  const findValidMoves = (cardId: string): string[] => {
    const fromPileId = getPiles(engine.state.piles).find((pile: any) => 
      Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
    )?.id;
    
    if (!fromPileId) {
      console.log('Card not found in any pile:', cardId);
      return [];
    }
    
    console.log('Finding valid moves for card', cardId, 'from pile', fromPileId);
    const validDestinations: string[] = [];
    
    // Test all possible destination piles
    getPiles(engine.state.piles).forEach((pile: any) => {
      // Skip the source pile, deck/stock piles, and waste pile (can't move cards there manually)
      if (pile.id === fromPileId || pile.type === 'stock' || pile.type === 'deck' || pile.type === 'waste') return;
      
      const move = { from: fromPileId, to: pile.id, cardId };
      
      // Use the engine's move validation logic directly
      try {
        console.log('Testing move:', move);
        const isValid = validateMove(move, engine.state);
        console.log('Move valid?', isValid);
        
        if (isValid) {
          validDestinations.push(pile.id);
          console.log('Added valid destination:', pile.id);
        }
      } catch (e) {
        console.error('Error validating move:', e);
        // Move is invalid, skip this destination
      }
    });
    
    console.log('Found valid destinations:', validDestinations);
    return validDestinations;
  };
  // Card click handler (select/deselect or move if card selected)
  const handleCardClick = (cardId: string, pileId: string) => {
    console.log('=== CARD CLICK DEBUG ===');
    console.log('Card ID:', cardId);
    console.log('Pile ID:', pileId);
    console.log('Selected card ID:', selectedCardId);
    
    if (selectedCardId && selectedCardId !== cardId) {
      // Block moves to deck pile (stock)
      const targetPile = getPiles(gameState.piles).find((pile: any) => pile.id === pileId);
      if (targetPile && (targetPile.type === 'stock' || targetPile.type === 'deck')) {
        triggerShake(selectedCardId);
        return;
      }
      // Try to move selected card to this pile
      const fromPileId = getPiles(engine.state.piles).find((pile: any) =>
        Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === selectedCardId)
      )?.id;
      if (fromPileId) {
        // Test move validation BEFORE attempting the move
        const testMove = { from: fromPileId, to: pileId, cardId: selectedCardId };
        let isValid = false;
        try {
          isValid = validateMove(testMove, engine.state);
        } catch (validationError) {
          isValid = false;
        }
        if (!isValid) {
          triggerShake(selectedCardId);
          setSelectedCardId(null);
          return;
        }
        // Use gameState as beforeState (true snapshot)
        const beforeState = gameState;
        // If valid, attempt the move and update state using return value
        try {
          // Use moveCard to get new state
          let newState = engine.moveCard(engine.state, { from: fromPileId, to: pileId, cardId: selectedCardId });
          // If the card was played from the hand, refill hand and update state
          const handPile = getPiles(beforeState.piles).find((pile: any) => pile.type === 'hand');
          if (handPile && handPile.cards.some((card: any) => card.id === selectedCardId)) {
            newState = refillHandFromDeck(newState);
          }
          engine.state = newState;
          if (engine.emitEvent) engine.emitEvent('stateChange', engine.state);
          setSelectedCardId(null);
          setHighlightedDestinations([]);
        } catch (e) {
          // Only shake if the move truly failed (not if it succeeded but threw)
          if (!checkMoveSuccess(selectedCardId, beforeState)) {
            triggerShake(selectedCardId);
          }
          setSelectedCardId(null);
          setHighlightedDestinations([]);
        }
      }
    } else if (selectedCardId === cardId) {
      setSelectedCardId(null);
    } else {
      setSelectedCardId(cardId);
    }
  };

  // Pile click handler (for moving selected card to empty pile)
  const handlePileClick = (pileId: string) => {
    if (selectedCardId) {
      // Block moves to deck pile (stock)
      const targetPile = getPiles(engine.state.piles).find((pile: any) => pile.id === pileId);
      if (targetPile && (targetPile.type === 'stock' || targetPile.type === 'deck')) {
        triggerShake(selectedCardId);
        return;
      }
      const fromPileId = getPiles(engine.state.piles).find((pile: any) => 
        Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === selectedCardId)
      )?.id;
      if (fromPileId) {
        try {
          engine.moveCard({ from: fromPileId, to: pileId, cardId: selectedCardId });
          setSelectedCardId(null);
        } catch (e) {
          if (!checkMoveSuccess(selectedCardId, gameState)) {
            triggerShake(selectedCardId);
          }
          setSelectedCardId(null); // Deselect card after failed move
        }
      }
    }
  };

  // Helper function to check if a card should be highlighted as part of a movable stack
  const isCardInMovableStack = (cardId: string, pileId: string): boolean => {
    if (!selectedCardId) return false;
    
    const pile = getPiles(gameState.piles).find((p: any) => p.id === pileId);
    if (!pile) return false;
    
    // Get the movable stack from the selected card
    const movableStack = getMovableStack(pile, selectedCardId);
    return movableStack.some((card: any) => card.id === cardId);
  };

  // Background click handler (deselect card when clicking empty areas)
  const handleBackgroundClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    // Only deselect if clicking directly on the background container,
    // not on any child elements (cards, piles, etc.)
    if (
      ('target' in e && 'currentTarget' in e && e.target === e.currentTarget && selectedCardId) ||
      (e.type === 'keydown' && selectedCardId)
    ) {
      setSelectedCardId(null);
    }
  };

  // Enhanced card double-click handler (auto-move with intelligent destination detection)
  const handleCardDoubleClick = (cardId: string) => {
    // Prevent double-click interference with normal selection by adding a small delay
    setTimeout(() => {
      setHighlightedDestinations([]);
      const validMoves = findValidMoves(cardId);
      if (validMoves.length === 0) {
        triggerShake(cardId);
        return;
      }
      // Special case for aces: if multiple foundation moves are available, just pick the first one
      const foundationMoves = validMoves.filter(pileId => {
        const pile = getPiles(engine.state.piles).find((p: any) => p.id === pileId);
        return pile && typeof pile === 'object' && 'type' in pile && pile.type === 'foundation';
      });
      const card = getPiles(engine.state.piles)
        .flatMap((pile: any) => pile.cards)
        .find((c: any) => c.id === cardId);
      if (card?.value === 1 && foundationMoves.length > 0) {
        const fromPile = getPiles(engine.state.piles).find((pile: any) =>
          Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
        );
        const fromPileId = fromPile && typeof fromPile === 'object' && 'id' in fromPile ? fromPile.id : undefined;
        if (fromPileId) {
          try {
            engine.moveCard({ from: fromPileId, to: foundationMoves[0], cardId });
            setSelectedCardId(null);
          } catch (e) {
            if (!checkMoveSuccess(cardId, gameState)) {
              triggerShake(cardId);
            }
            setSelectedCardId(null);
          }
        }
        return;
      }
      if (validMoves.length === 1) {
        const fromPile = getPiles(engine.state.piles).find((pile: any) =>
          Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
        );
        const fromPileId = fromPile && typeof fromPile === 'object' && 'id' in fromPile ? fromPile.id : undefined;
        if (fromPileId) {
          try {
            engine.moveCard({ from: fromPileId, to: validMoves[0], cardId });
            setSelectedCardId(null);
          } catch (e) {
            if (!checkMoveSuccess(cardId, gameState)) {
              triggerShake(cardId);
            }
            setSelectedCardId(null);
          }
        }
      } else {
        // Multiple valid moves - highlight destinations for user selection, do NOT shake
        setHighlightedDestinations(validMoves);
        setSelectedCardId(cardId);
        setTimeout(() => {
          setHighlightedDestinations([]);
        }, 5000);
      }
    }, 100);
  };

  // Drag handlers
  const handleDragStart = (cardId: string) => {
    setDraggedCardId(cardId);
  };
  const handleDragEnd = () => {
    setDraggedCardId(null);
    setDragOverPileId(null);
  };
  const handleDragOver = (pileId: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPileId(pileId);
  };
  const handleDrop = (pileId: string) => {
    if (draggedCardId) {
      // Find source pile
    const fromPileId = getPiles(engine.state.piles).find((pile: any) => Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === draggedCardId))?.id;
      if (fromPileId) {
        try {
          console.log('Drag drop: moving card', draggedCardId, 'from', fromPileId, 'to', pileId);
          engine.moveCard({ from: fromPileId, to: pileId, cardId: draggedCardId });
          console.log('Drag drop successful');
        } catch (e: any) {
          console.error('Drag drop failed:', e);
          // Check if the move actually succeeded despite the exception
          if (checkMoveSuccess(draggedCardId, gameState)) {
            console.log('Drag drop actually succeeded despite exception');
          } else {
            triggerShake(draggedCardId);
          }
        }
      }
    }
    setDraggedCardId(null);
    setDragOverPileId(null);
    setSelectedCardId(null);
  };
  // Example: render piles and player state
  const piles = gameState.piles || {};
  // const player = gameState.player || {}; // Remove duplicate


  // Separate piles by type
  console.log('GameScreen - piles before separation:', piles);
  console.log('GameScreen - available pile types:', Object.values(piles).map((p: any) => p.type));
  
  const pileArray = getPiles(piles);
  const tableauPiles = pileArray.filter((pile: any) => pile && pile.type === 'tableau').sort((a: any, b: any) => a.id.localeCompare(b.id));
  const deckPile = pileArray.find((pile: any) => pile && (pile.type === 'deck' || pile.type === 'stock'));
  const wastePile = pileArray.find((pile: any) => pile && pile.type === 'waste');
  const handPile = pileArray.find((pile: any) => pile && pile.type === 'hand');
  
  console.log('GameScreen - deckPile found:', deckPile);
  console.log('GameScreen - deckPile cards:', deckPile?.cards?.length || 0);
  console.log('GameScreen - handPile found:', handPile);
  console.log('GameScreen - handPile cards:', handPile?.cards?.length || 0);
  const foundationPiles = pileArray.filter((pile: any) => pile && pile.type === 'foundation').sort((a: any, b: any) => a.id.localeCompare(b.id));

  // Debug deck pile
  console.log('Debug deck pile:', deckPile);
  console.log('All pile types:', Object.values(piles).map((p: any) => ({ id: p.id, type: p.type, cardCount: p.cards?.length || 0 })));

  // Draw from deck to waste
  const handleDrawFromDeck = () => {
    if (!deckPile || deckPile.cards.length === 0) return;
    // Remove top card from deck, flip face up, add to waste
    const newDeck = [...deckPile.cards];
    const topCard = newDeck.pop();
    if (!topCard) return;
    const card = { ...topCard, faceUp: true };
    let newWaste = wastePile ? [...wastePile.cards] : [];
    newWaste.push(card);
    // Ensure the new top card in the deck is always face down
    if (newDeck.length > 0) {
      newDeck[newDeck.length - 1].faceUp = false;
    }
    // Update piles
    const newPiles = { ...engine.state.piles };
    newPiles[deckPile.id] = { ...deckPile, cards: newDeck };
    if (wastePile) {
      newPiles[wastePile.id] = { ...wastePile, cards: newWaste };
    } else {
      // Create waste pile if missing
      newPiles['waste'] = { id: 'waste', type: 'waste', cards: newWaste };
    }
    engine.state.piles = newPiles;
    engine.emitEvent('stateChange', engine.state);
  };

  // Shuffle waste pile back into deck
  const handleShuffleDeck = () => {
    if (!wastePile || wastePile.cards.length === 0 || !deckPile) return;
    if ((gameState.player.shuffles || 0) <= 0) {
      return;
    }
    
    // Move all waste cards back to deck face down
    const wasteCards = [...wastePile.cards].map(card => ({ ...card, faceUp: false }));
    // Shuffle the cards
    // Use cryptographically secure random number generator for shuffling
    // Use cryptographically secure random number generator for shuffling
    // window.crypto.getRandomValues is the browser-standard CSPRNG (see: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues)
    // This is the recommended approach for secure randomness in browsers, equivalent to Node.js crypto.randomBytes for this use case.
    for (let i = wasteCards.length - 1; i > 0; i--) {
      const randArray = new Uint32Array(1);
      window.crypto.getRandomValues(randArray);
      const j = Math.floor((randArray[0] / (0xFFFFFFFF + 1)) * (i + 1));
      [wasteCards[i], wasteCards[j]] = [wasteCards[j], wasteCards[i]];
    }
    
    // Update piles and consume shuffle
    const newPiles = { ...engine.state.piles };
    newPiles[deckPile.id] = { ...deckPile, cards: wasteCards };
    newPiles[wastePile.id] = { ...wastePile, cards: [] };
    engine.state.piles = newPiles;
    
    // Consume shuffle count
    const newPlayer = { ...engine.state.player };
    newPlayer.shuffles = (newPlayer.shuffles || 0) - 1;
    engine.state.player = newPlayer;
    
    engine.emitEvent('stateChange', engine.state);
    console.log('Deck shuffled! Shuffles remaining:', newPlayer.shuffles);
  };

  // Zoom handler for floating zoom window
  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseInt(event.target.value);
    setZoomLevel(newZoom);
    
    // Apply zoom to the game screen
    const gameScreen = document.querySelector('.game-screen-root') as HTMLElement;
    if (gameScreen) {
      gameScreen.style.transform = `translate(-50%, -50%) scale(${newZoom / 100})`;
    }
  };

  return (
  <div 
    className="game-screen-root" 
    data-tableau-row-height={tableauRowHeight}
    onClick={handleBackgroundClick}
    aria-label="Game area"
  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleBackgroundClick(e); }}
  >
      {/* Floating Zoom Window */}
      <div className="floating-zoom-window">
        <input
          type="range"
          min="50"
          max="150"
          value={zoomLevel}
          onChange={handleZoomChange}
          className="floating-zoom-slider"
          title={`Zoom: ${zoomLevel}%`}
        />
        <span className="floating-zoom-value">{zoomLevel}%</span>
      </div>
      {/* Registry-driven Effect HUD - HIDDEN PER USER REQUEST */}
      {/*
      <div
        className="effect-hud"
        role="region"
        aria-label="Active Effects"
        aria-live="polite"
        ref={effectFeedbackRef}
      >
        <div className="effect-hud-title">Active Effects</div>
        {activeEffects.length === 0 ? (
          <div className="effect-hud-empty">No active effects</div>
        ) : (
          <div className="effect-hud-categories">
            {Object.entries(effectsByCategory).map(([cat, effects]) => (
              <div key={cat} className="effect-hud-category">
                <div className="effect-hud-category-header clickable" onClick={() => toggleCategory(cat)}>
                  {collapsedCategories[cat] ? '▶' : '▼'} {cat} ({effects.length})
                </div>
                {!collapsedCategories[cat] && (
                  <ul className="effect-hud-list">
                    {effects.map((eff, idx) => (
                      <li key={eff.id + '-' + idx} className="effect-hud-item">
                        {eff.icon ? (
                          <span className="effect-hud-icon">{eff.icon}</span>
                        ) : (
                          <span className="effect-hud-dot">•</span>
                        )}
                        <span>
                          <span className="effect-hud-label">{eff.label}</span>
                          <span className="effect-hud-type">{eff.type}</span>
                          <div className="effect-hud-desc">{eff.description}</div>
                          {eff.condition && (
                            <div className="effect-hud-cond">
                              Condition: {typeof eff.condition === 'string' ? eff.condition : JSON.stringify(eff.condition)}
                            </div>
                          )}
                          {eff.value !== undefined && (
                            <div className="effect-hud-value">
                              Value: {eff.value}
                            </div>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      */}
      <div className="deck-area">
        {/* Deck */}
        <div>
          <div className="pile-cards">
            {deckPile && deckPile.cards.length > 0 ? (
              <Card
                key={deckPile.cards[deckPile.cards.length - 1].id}
                id={deckPile.cards[deckPile.cards.length - 1].id}
                suit={deckPile.cards[deckPile.cards.length - 1].suit}
                value={deckPile.cards[deckPile.cards.length - 1].value}
                faceUp={deckPile.cards[deckPile.cards.length - 1].faceUp}
                design={isCoronata && !deckPile.cards[deckPile.cards.length - 1].faceUp ? 'coronata' : deckPile.cards[deckPile.cards.length - 1].design}
                shake={shakeCardId === deckPile.cards[deckPile.cards.length - 1].id}
                onClick={() => handleDrawFromDeck()}
                draggable={false}
              />
            ) : (
              // Show shuffle button when deck is empty and waste has cards
              wastePile && wastePile.cards.length > 0 ? (
                <div 
                  className="shuffle-button"
                  onClick={handleShuffleDeck}
                  title={`Shuffle waste pile back into deck (${gameState.player.shuffles || 0} shuffles remaining)`}
                >
                  ♻️<br/>Shuffle
                </div>
              ) : (
                <span>(empty)</span>
              )
            )}
          </div>
        </div>
  
        {/* Waste */}
        <div>
          <div className="pile-cards">
            {wastePile && wastePile.cards.length > 0 ? (
              <Card
                key={wastePile.cards[wastePile.cards.length - 1].id}
                id={wastePile.cards[wastePile.cards.length - 1].id}
                suit={wastePile.cards[wastePile.cards.length - 1].suit}
                value={wastePile.cards[wastePile.cards.length - 1].value}
                faceUp={wastePile.cards[wastePile.cards.length - 1].faceUp}
                design={isCoronata && !wastePile.cards[wastePile.cards.length - 1].faceUp ? 'coronata' : wastePile.cards[wastePile.cards.length - 1].design}
                selected={selectedCardId === wastePile.cards[wastePile.cards.length - 1].id}
                shake={shakeCardId === wastePile.cards[wastePile.cards.length - 1].id}
                draggable={wastePile.cards[wastePile.cards.length - 1].faceUp}
                onClick={() => handleCardClick(wastePile.cards[wastePile.cards.length - 1].id, wastePile.id)}
                onDoubleClick={() => handleCardDoubleClick(wastePile.cards[wastePile.cards.length - 1].id)}
                onDragStart={() => handleDragStart(wastePile.cards[wastePile.cards.length - 1].id)}
                onDragEnd={handleDragEnd}
              />
            ) : <div className="card-outline" />}
          </div>
        </div>
        {/* Spacer for increased gap between waste and foundation */}
        <div className="waste-foundation-gap" />
  {/* Foundations */}
  <div className="foundation-area">
          {foundationPiles.map((pile: any, idx: number) => (
            <div 
              key={pile.id} 
              className={[
                idx === 0 ? "foundation-pile first-foundation" : "foundation-pile",
                highlightedDestinations.includes(pile.id) ? "pile valid-destination" : "pile"
              ].join(" ")}
              onClick={() => handlePileClick(pile.id)}
            >
              <div className="pile-cards">
                {pile.cards.length > 0 ? (
                  <Card
                    key={pile.cards[pile.cards.length - 1].id}
                    id={pile.cards[pile.cards.length - 1].id}
                    suit={pile.cards[pile.cards.length - 1].suit}
                    value={pile.cards[pile.cards.length - 1].value}
                    faceUp={pile.cards[pile.cards.length - 1].faceUp}
                    design={isCoronata && !pile.cards[pile.cards.length - 1].faceUp ? 'coronata' : pile.cards[pile.cards.length - 1].design}
                    selected={selectedCardId === pile.cards[pile.cards.length - 1].id}
                    shake={shakeCardId === pile.cards[pile.cards.length - 1].id}
                    onClick={() => handleCardClick(pile.cards[pile.cards.length - 1].id, pile.id)}
                  />
                ) : (
                  <div className="card-outline foundation-suit-container" onClick={() => handlePileClick(pile.id)}>
                    <span className="foundation-suit-symbol">
                      {pile.rules?.suit === 'hearts' && '♥'}
                      {pile.rules?.suit === 'diamonds' && '♦'}
                      {pile.rules?.suit === 'clubs' && '♣'}
                      {pile.rules?.suit === 'spades' && '♠'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resign confirmation modal */}
      {showResignModal && (
        <div className="modal-overlay" onClick={() => setShowResignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Resign Run?</h2>
            <p>Are you sure you want to end this run? Your progress will be lost.</p>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel"
                onClick={() => setShowResignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button confirm"
                onClick={() => {
                  setShowResignModal(false);
                  setShowRunRecap(true);
                }}
              >
                Resign
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Run recap modal */}
      {showRunRecap && (
        <div className="modal-overlay">
          <div className="modal-content run-recap">
            <h2>Run Summary</h2>
            <div className="recap-stats">
              <div className="stat-item">
                <label>Final Score:</label>
                <span>{gameState.player?.score || 0}</span>
              </div>
              <div className="stat-item">
                <label>Coins Earned:</label>
                <span>{gameState.player?.coins || 0}</span>
              </div>
              <div className="stat-item">
                <label>Cards Moved:</label>
                <span>{gameState.history?.length || 0}</span>
              </div>
              <div className="stat-item">
                <label>Shuffles Used:</label>
                <span>{3 - (gameState.player?.shuffles || 3)}</span>
              </div>
            </div>
            <div className="modal-buttons">
              <button 
                className="modal-button confirm"
                onClick={() => {
                  // End the game session and save to history
                  try {
                    const gameData = {
                      score: gameState.player?.score || 0,
                      coinsEarned: gameState.player?.coins || 0,
                      encountersCompleted: gameState.player?.encountersCompleted || 0,
                      exploitsGained: gameState.player?.exploits || [],
                      blessingsGained: gameState.player?.blessings || [],
                      fearsGained: gameState.player?.fears || [],
                      selectedFortune: selectedFortune
                    };
                    
                    // Save as resigned since this is triggered from resign button
                    endGameSession('resigned', gameData);
                    console.log('Game session ended and saved to history');
                  } catch (error) {
                    console.error('Error saving game session:', error);
                  }
                  
                  // Navigate back to welcome screen
                  if (onNavigateToWelcome) {
                    onNavigateToWelcome();
                  } else {
                    window.location.reload(); // Fallback for non-Coronata modes
                  }
                }}
              >
                Return to Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Player Hand Area (only for Coronata) */}
      {isCoronata && handPile && (
        <div className="player-hand-area">
          <div className="hand-cards">
            {handPile.cards.length > 0 ? (
              handPile.cards.map((card: any, index: number) => (
                <Card
                  key={card.id}
                  id={card.id}
                  suit={card.suit}
                  value={card.value}
                  faceUp={card.faceUp}
                  design={card.faceUp ? card.design : 'coronata'}
                  selected={selectedCardId === card.id}
                  shake={shakeCardId === card.id}
                  draggable={card.faceUp}
                  onClick={() => handleCardClick(card.id, handPile.id)}
                  onDoubleClick={() => handleCardDoubleClick(card.id)}
                  onDragStart={() => handleDragStart(card.id)}
                  onDragEnd={handleDragEnd}
                  style={{ 
                    marginLeft: index > 0 ? '-20px' : '0',
                    zIndex: index + 1,
                    position: 'relative'
                  }}
                />
              ))
            ) : (
              <div className="hand-empty">No cards in hand</div>
            )}
          </div>
        </div>
      )}
      
      {/* Tableau row */}
  <div className="tableau-row">
        {tableauPiles.map((pile: any) => (
          <div
            key={pile.id}
            className={[
              dragOverPileId === pile.id ? 'tableau-pile drag-over' : 'tableau-pile',
              highlightedDestinations.includes(pile.id) ? 'pile valid-destination' : 'pile'
            ].join(' ')}
            onDragOver={e => handleDragOver(pile.id, e)}
            onDrop={() => handleDrop(pile.id)}
            onClick={() => handlePileClick(pile.id)}
          >
            <div className="pile-cards-vertical">
              {pile.cards.length > 0 ? (
                pile.cards.map((card: any) => (
                  <Card
                    key={card.id}
                    id={card.id}
                    suit={card.suit}
                    value={card.value}
                    faceUp={card.faceUp}
                    design={isCoronata && !card.faceUp ? 'coronata' : card.design}
                    selected={selectedCardId === card.id || isCardInMovableStack(card.id, pile.id)}
                    shake={shakeCardId === card.id}
                    draggable={card.faceUp}
                    onClick={() => handleCardClick(card.id, pile.id)}
                    onDoubleClick={() => handleCardDoubleClick(card.id)}
                    onDragStart={() => handleDragStart(card.id)}
                    onDragEnd={handleDragEnd}
                  />
                ))
              ) : (
                <div className="card-outline" onClick={() => handlePileClick(pile.id)} />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Player HUD */}
      {isCoronata && (
        <PlayerHUD
          gameState={gameState}
          selectedFortune={selectedFortune}
          onNavigateToWelcome={onNavigateToWelcome}
          onShowRunRecap={() => setShowRunRecap(true)}
          onOpenTrade={() => setCurrentScreen('trade')}
          onOpenWander={() => setCurrentScreen('wander')}
          onNextEncounter={() => {
            // Actually advance to the next encounter using EncounterFlowManager
            if (engine && gameState.run?.encounterFlow) {
              const flowManager = new EncounterFlowManager(engine.state);
              // Complete the flow and advance to the next encounter
              const updatedState = flowManager.onFlowComplete();
              // Update engine state and encounterFlow
              engine.state = {
                ...updatedState,
                run: {
                  ...updatedState.run,
                  encounterFlow: {
                    active: false,
                    phase: 'encounter',
                    currentActivity: null,
                    queuedActivities: [],
                    completedActivities: []
                  }
                }
              };
              // Emit state change for React/UI update
              engine.emitEvent('stateChange', engine.state);
              setCurrentScreen('game');
            }
          }}
        />
      )}

      {/* Debug Panel Toggle Button */}
      <button
        className="debug-toggle-button"
        onClick={() => setShowDebugPanel(!showDebugPanel)}
        title="Toggle Debug Panel"
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '8px 12px',
          background: '#333',
          color: '#fff',
          border: '1px solid #666',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        🐛 Debug
      </button>

      {/* Debug Panel */}
      {showDebugPanel && (
        <div
          className="debug-panel"
          style={{
            position: 'fixed',
            top: '50px',
            right: '10px',
            width: '400px',
            maxHeight: '80vh',
            overflowY: 'auto',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            padding: '15px',
            borderRadius: '8px',
            zIndex: 999,
            fontSize: '12px'
          }}
        >
          <h3 style={{ margin: '0 0 15px 0', color: '#ffd700' }}>Debug Panel</h3>

          {/* Blessing Application */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ffed4e' }}>Apply Blessing to Card</h4>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
              <select
                value={selectedBlessingForCard}
                onChange={(e) => setSelectedBlessingForCard(e.target.value)}
                style={{ flex: 1, padding: '4px', fontSize: '11px' }}
              >
                <option value="">Select Blessing</option>
                {Object.values(registry.blessing || {}).flat().map((blessing: any) => (
                  <option key={blessing.id} value={blessing.id}>
                    {blessing.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedCardForBlessing}
                onChange={(e) => setSelectedCardForBlessing(e.target.value)}
                style={{ flex: 1, padding: '4px', fontSize: '11px' }}
              >
                <option value="">Select Card</option>
                {Object.values(gameState.piles || {}).flatMap((pile: any) =>
                  pile.cards?.map((card: any) => (
                    <option key={card.id} value={card.id}>
                      {card.id} ({pile.id})
                    </option>
                  )) || []
                )}
              </select>
            </div>
            <button
              onClick={handleApplyBlessingToCard}
              disabled={!selectedBlessingForCard || !selectedCardForBlessing}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Apply Blessing
            </button>
          </div>

          {/* Jump to Screen */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ffed4e' }}>Jump to Screen</h4>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {['game', 'trade', 'wander', 'fortune-swap'].map(screen => (
                <button
                  key={screen}
                  onClick={() => handleJumpToScreen(screen)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  {screen.charAt(0).toUpperCase() + screen.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Jump to Encounter */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ffed4e' }}>Jump to Encounter</h4>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <span>Trial:</span>
              <input
                type="number"
                min="1"
                max="5"
                defaultValue="1"
                id="debug-trial-input"
                style={{ width: '50px', padding: '2px', fontSize: '11px' }}
              />
              <span>Encounter:</span>
              <input
                type="number"
                min="1"
                max="3"
                defaultValue="1"
                id="debug-encounter-input"
                style={{ width: '50px', padding: '2px', fontSize: '11px' }}
              />
              <button
                onClick={() => {
                  const trial = parseInt((document.getElementById('debug-trial-input') as HTMLInputElement)?.value || '1');
                  const encounter = parseInt((document.getElementById('debug-encounter-input') as HTMLInputElement)?.value || '1');
                  handleJumpToEncounter(trial, encounter);
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Jump
              </button>
            </div>
          </div>

          {/* Registry Effect Logging */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#ffed4e' }}>Registry Effect Log</h4>
            <button
              onClick={() => setShowRegistryLog(!showRegistryLog)}
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                background: showRegistryLog ? '#f44336' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              {showRegistryLog ? 'Stop Logging' : 'Start Logging'}
            </button>
            {showRegistryLog && registryEffectLog.length > 0 && (
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '5px',
                borderRadius: '3px',
                fontSize: '10px'
              }}>
                {registryEffectLog.slice(-10).map((entry, idx) => (
                  <div key={idx} style={{ marginBottom: '3px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    <div><strong>{entry.timestamp.split('T')[1].split('.')[0]}</strong> - {entry.type}</div>
                    <div style={{ color: '#ccc', fontSize: '9px' }}>
                      {entry.effect} → {entry.payload?.cardId || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Game State */}
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#ffed4e' }}>Current State</h4>
            <div style={{ fontSize: '10px', lineHeight: '1.4' }}>
              <div>Screen: {currentScreen}</div>
              <div>Score: {gameState.player?.score || 0}</div>
              <div>Coins: {gameState.player?.coins || 0}</div>
              <div>Trial: {gameState.run?.currentTrial || 0}</div>
              <div>Encounter: {gameState.run?.currentEncounter || 0}</div>
              <div>Encounter Type: {gameState.run?.encounter?.type || 'N/A'}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Resign confirmation modal */}
      {showResignModal && (
        <div className="modal-overlay" onClick={() => setShowResignModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Resign Run?</h2>
            <p>Are you sure you want to end this run? Your progress will be lost.</p>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel"
                onClick={() => setShowResignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-button confirm"
                onClick={() => {
                  setShowResignModal(false);
                  setShowRunRecap(true);
                }}
              >
                Resign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Screen - overlay when not in game mode */}
      {currentScreen === 'trade' && (
        <div className="screen-overlay">
          <TradeScreen
            onBack={handleTradeBack}
            onPurchase={handleTradePurchase}
            onSell={handleTradeSell}
            onBlessingApplication={handleBlessingApplication}
            playerCoin={gameState.player?.coins || 0}
            equippedExploits={gameState.player?.exploits?.map((id: string) =>
              registry.exploit.find((e: any) => e.id === id)).filter((item: any): item is any => item !== undefined) || []}
            gameState={gameState}
          />
        </div>
      )}

      {currentScreen === 'wander' && (
        <div className="screen-overlay">
          <WanderScreen
            onChoiceMade={handleWanderChoice}
            onBack={handleWanderBack}
          />
        </div>
      )}

      {currentScreen === 'fortune-swap' && (
        <div className="screen-overlay">
          <FortuneSwapActivity
            currentFortune={gameState.player?.activeFortune ? registry.fortune.find(f => f.id === gameState.player.activeFortune) : undefined}
            availableFortunes={gameState.run?.encounterFlow?.currentActivity?.data?.options || []}
            onFortuneSelected={handleFortuneSwapSelection}
            onBack={handleFortuneSwapBack}
          />
        </div>
      )}
    </div>
  );
}
