import React from 'react';
import { registry } from '../registry/index';
import { useEngineEvent } from './EngineEventProvider';
import { Card } from './Card';
import { getMovableStack, validateMove } from '../engine/moveLogic';
import { PlayerHUD } from './PlayerHUD';
import { GameState } from '../engine/types'; // Changed from core_engine to engine
import TradeScreen from './TradeScreen';
import WanderScreen from './WanderScreen';
import { endGameSession } from '../engine/persistenceManager';
import { EncounterFlowManager } from '../engine/encounterFlow';
import './GameScreen.css';

interface GameScreenProps {
  onNavigateToWelcome?: () => void;
  selectedFortune?: any;
}

export function GameScreen({ onNavigateToWelcome, selectedFortune }: GameScreenProps = {}) {
  // Always declare hooks and variables at the top level
  const ctx = useEngineEvent();
  if (!ctx) return <div>No engine context</div>;
  const { engine, event } = ctx;
  const config = engine.config || {};
  
  // Cast engine state to extended GameState for Coronata features
  // Use event dependency to re-render when engine state changes
  const gameState = React.useMemo(() => engine.state as GameState, [engine.state, event]);
  // const player = gameState.player || {}; // Remove duplicate, use inside useMemo or where needed
  const cardHeight = config.cardHeight || 72;
  const overlapPercent = 0.5; // 50% overlap
  const tableauRowHeight = 14 * (cardHeight * overlapPercent);
  
  // Debug logging
  console.log('GameScreen rendering with engine state:', gameState);
  console.log('Engine config:', config);
  console.log('Last engine event:', event);
  console.log('Selected fortune:', selectedFortune);
  
  // Detect if Coronata mode is active
  const isCoronata = (config.rules === 'coronata');
  console.log('Is Coronata mode:', isCoronata);

  // --- State hooks ---
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);
  const [draggedCardId, setDraggedCardId] = React.useState<string | null>(null);
  const [dragOverPileId, setDragOverPileId] = React.useState<string | null>(null);
  const [shakeCardId, setShakeCardId] = React.useState<string | null>(null);
  const [highlightedDestinations, setHighlightedDestinations] = React.useState<string[]>([]);
  const [showResignModal, setShowResignModal] = React.useState(false);
  const [showRunRecap, setShowRunRecap] = React.useState(false);
  
  // Zoom state for floating zoom window
  const [zoomLevel, setZoomLevel] = React.useState(100);

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
  const [currentScreen, setCurrentScreen] = React.useState<'game' | 'choice' | 'trade' | 'wander'>('game');
  
  // Integrate selected fortune into game state for registry effects
  React.useEffect(() => {
    if (selectedFortune && engine.state.player && isCoronata) {
      const currentFortunes = engine.state.player.fortunes || [];
      
      // Only add if not already present (avoid duplicates)
      if (!currentFortunes.includes(selectedFortune.id)) {
        console.log('Adding selected fortune to player registry:', selectedFortune.label);
        
        // Add the fortune to player registry
        engine.state.player.fortunes = [...currentFortunes, selectedFortune.id];
        
        // Emit state change to trigger re-render and effect processing
        engine.emitEvent('stateChange', engine.state);
        
        console.log('Player fortunes updated:', engine.state.player.fortunes);
      }
    }
  }, [selectedFortune, engine, isCoronata]);

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
  
  // Function to trigger shake animation for invalid moves
  // Helper function to check if a move actually succeeded despite exceptions
  const checkMoveSuccess = (cardId: string, beforeState: any) => {
    // Check if the card still exists in its original position
    const cardStillInOriginalPosition = Object.values(beforeState.piles).some((pile: any) => 
      pile.cards && pile.cards.some((card: any) => card.id === cardId)
    ) && Object.values(engine.state.piles).some((pile: any) => 
      pile.cards && pile.cards.some((card: any) => card.id === cardId)
    ) && JSON.stringify(beforeState.piles) === JSON.stringify(engine.state.piles);
    
    // If the card is no longer in the same position or the state changed, the move succeeded
    return !cardStillInOriginalPosition || engine.state !== beforeState;
  };

  const triggerShake = (cardId: string) => {
    console.log('Triggering shake for card:', cardId);
    setShakeCardId(cardId);
    setTimeout(() => {
      console.log('Clearing shake for card:', cardId);
      setShakeCardId(null);
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
      
      // Update game state with new flow state
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
      
      // Emit state change for React updates
      engine.emitEvent('stateChange', engine.state);
      
      // Check if flow is complete or has next activity
      if (flowManager.isFlowComplete()) {
        // Flow complete, return to game
        setCurrentScreen('game');
      } else if (newFlowState.currentActivity?.type === 'wander') {
        // Next activity is wander, show wander screen
        setCurrentScreen('wander');
      } else {
        // No more activities or unknown state, return to game
        setCurrentScreen('game');
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
      
      // Update game state with new flow state
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
      
      // Emit state change for React updates
      engine.emitEvent('stateChange', engine.state);
      
      // Check if flow is complete or has next activity
      if (flowManager.isFlowComplete()) {
        // Flow complete, return to game
        setCurrentScreen('game');
      } else if (newFlowState.currentActivity?.type === 'trade') {
        // Next activity is trade, show trade screen
        setCurrentScreen('trade');
      } else if (newFlowState.currentActivity?.type === 'wander') {
        // Next activity is another wander, stay on wander screen with new content
        setCurrentScreen('wander');
      } else {
        // No more activities or unknown state, return to game
        setCurrentScreen('game');
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

  // Function to find all valid move destinations for a card
  const findValidMoves = (cardId: string): string[] => {
    const fromPileId = Object.values(engine.state.piles).find((pile: any) => 
      Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
    )?.id;
    
    if (!fromPileId) {
      console.log('Card not found in any pile:', cardId);
      return [];
    }
    
    console.log('Finding valid moves for card', cardId, 'from pile', fromPileId);
    const validDestinations: string[] = [];
    
    // Test all possible destination piles
    Object.values(engine.state.piles).forEach((pile: any) => {
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
      const targetPile = Object.values(gameState.piles).find((pile: any) => pile.id === pileId);
      console.log('Target pile:', targetPile);
      
      if (targetPile && (targetPile.type === 'stock' || targetPile.type === 'deck')) {
        console.log('BLOCKED: Cannot move to stock/deck pile');
        triggerShake(selectedCardId);
        return;
      }
      
      // Try to move selected card to this pile
      const fromPileId = Object.values(engine.state.piles).find((pile: any) => 
        Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === selectedCardId)
      )?.id;
      
      console.log('From pile ID:', fromPileId);
      
      if (fromPileId) {
        // Test move validation BEFORE attempting the move
        const testMove = { from: fromPileId, to: pileId, cardId: selectedCardId };
        console.log('Testing move:', testMove);
        
        try {
          const isValid = validateMove(testMove, engine.state);
          console.log('Move validation result:', isValid);
          
          if (!isValid) {
            console.log('BLOCKED: Move failed validation');
            triggerShake(selectedCardId);
            setSelectedCardId(null);
            return;
          }
        } catch (validationError) {
          console.error('Validation error:', validationError);
          triggerShake(selectedCardId);
          setSelectedCardId(null);
          return;
        }
        
        // If clicking on a foundation, try the specific foundation clicked
        const targetPile = Object.values(engine.state.piles).find((pile: any) => pile.id === pileId);
        if (targetPile?.type === 'foundation') {
          console.log('Foundation clicked:', pileId);
          try {
            console.log('Attempting move from', fromPileId, 'to foundation', pileId, 'for card', selectedCardId);
            engine.moveCard({ from: fromPileId, to: pileId, cardId: selectedCardId });
            console.log('Move successful to foundation:', pileId);
            setSelectedCardId(null);
            setHighlightedDestinations([]);
          } catch (e) {
            console.error('Foundation move failed:', e);
            // Check if the move actually succeeded despite the exception
            const beforeState = gameState; // Use the React state as "before" reference
            if (checkMoveSuccess(selectedCardId, beforeState)) {
              console.log('Move actually succeeded despite exception');
              setSelectedCardId(null);
              setHighlightedDestinations([]);
            } else {
              triggerShake(selectedCardId);
              setSelectedCardId(null);
            }
          }
        } else {
          // Regular move to non-foundation pile
          try {
            console.log('Attempting move from', fromPileId, 'to', pileId, 'for card', selectedCardId);
            console.log('Before move - Player score:', gameState.player?.score || 0);
            engine.moveCard({ from: fromPileId, to: pileId, cardId: selectedCardId });
            console.log('Move successful! After move - Player score:', engine.state.player?.score || 0);
            setSelectedCardId(null);
            setHighlightedDestinations([]); // Clear highlights after successful move
          } catch (e) {
            console.error('Move failed:', e);
            // Check if the move actually succeeded despite the exception
            const beforeState = gameState; // Use the React state as "before" reference
            if (checkMoveSuccess(selectedCardId, beforeState)) {
              console.log('Move actually succeeded despite exception');
              setSelectedCardId(null);
              setHighlightedDestinations([]);
            } else {
              triggerShake(selectedCardId);
              setSelectedCardId(null); // Deselect card after failed move
            }
          }
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
      const targetPile = Object.values(engine.state.piles).find((pile: any) => pile.id === pileId);
      if (targetPile && (targetPile.type === 'stock' || targetPile.type === 'deck')) {
        triggerShake(selectedCardId);
        return;
      }
      
      const fromPileId = Object.values(engine.state.piles).find((pile: any) => 
        Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === selectedCardId)
      )?.id;
      
      if (fromPileId) {
        try {
          engine.moveCard({ from: fromPileId, to: pileId, cardId: selectedCardId });
          setSelectedCardId(null);
        } catch (e) {
          triggerShake(selectedCardId);
          setSelectedCardId(null); // Deselect card after failed move
        }
      }
    }
  };

  // Helper function to check if a card should be highlighted as part of a movable stack
  const isCardInMovableStack = (cardId: string, pileId: string): boolean => {
    if (!selectedCardId) return false;
    
    const pile = Object.values(gameState.piles).find((p: any) => p.id === pileId);
    if (!pile) return false;
    
    // Get the movable stack from the selected card
    const movableStack = getMovableStack(pile, selectedCardId);
    return movableStack.some((card: any) => card.id === cardId);
  };

  // Background click handler (deselect card when clicking empty areas)
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the background container,
    // not on any child elements (cards, piles, etc.)
    if (e.target === e.currentTarget && selectedCardId) {
      setSelectedCardId(null);
    }
  };

  // Enhanced card double-click handler (auto-move with intelligent destination detection)
  const handleCardDoubleClick = (cardId: string) => {
    // Prevent double-click interference with normal selection by adding a small delay
    setTimeout(() => {
      // Clear any existing highlights
      setHighlightedDestinations([]);
      
      // Find all valid moves for this card
      const validMoves = findValidMoves(cardId);
      
      if (validMoves.length === 0) {
        // No valid moves - shake to indicate invalid move
        triggerShake(cardId);
        return;
      }
    
      // Special case for aces: if multiple foundation moves are available, just pick the first one
      const foundationMoves = validMoves.filter(pileId => {
        const pile = Object.values(engine.state.piles).find((p: any) => p.id === pileId);
        return pile?.type === 'foundation';
      });
      
      const card = Object.values(engine.state.piles)
        .flatMap((pile: any) => pile.cards)
        .find((c: any) => c.id === cardId);
      
      if (card?.value === 1 && foundationMoves.length > 0) {
        // Ace with available foundation(s) - auto-place on first available foundation
        const fromPileId = Object.values(engine.state.piles).find((pile: any) => 
          Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
        )?.id;
        
        if (fromPileId) {
          try {
            console.log('Auto-moving ace', cardId, 'from', fromPileId, 'to first available foundation', foundationMoves[0]);
            engine.moveCard({ from: fromPileId, to: foundationMoves[0], cardId });
            setSelectedCardId(null);
          } catch (e) {
            console.error('Ace auto-move failed:', e);
            // Check if the move actually succeeded despite the exception
            if (checkMoveSuccess(cardId, gameState)) {
              console.log('Ace auto-move actually succeeded despite exception');
              setSelectedCardId(null);
            } else {
              triggerShake(cardId);
            }
          }
        }
        return;
      }
      
      if (validMoves.length === 1) {
        // Single valid move - auto-move there without highlighting
        const fromPileId = Object.values(engine.state.piles).find((pile: any) => 
          Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === cardId)
        )?.id;
        
        if (fromPileId) {
          try {
            console.log('Auto-moving card', cardId, 'from', fromPileId, 'to', validMoves[0]);
            engine.moveCard({ from: fromPileId, to: validMoves[0], cardId });
            setSelectedCardId(null);
          } catch (e) {
            console.error('Auto-move failed:', e);
            // Check if the move actually succeeded despite the exception
            if (checkMoveSuccess(cardId, gameState)) {
              console.log('Auto-move actually succeeded despite exception');
              setSelectedCardId(null);
            } else {
              triggerShake(cardId);
            }
          }
        }
      } else {
        // Multiple valid moves - highlight destinations for user selection
        console.log('Multiple valid moves found:', validMoves.length, 'destinations');
        setHighlightedDestinations(validMoves);
        setSelectedCardId(cardId); // Select the card so user can click destination
        
        // Clear highlights after 5 seconds if no action taken
        setTimeout(() => {
          setHighlightedDestinations([]);
        }, 5000);
      }
    }, 100); // Small delay to prevent interference with single clicks
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
      const fromPileId = Object.values(engine.state.piles).find((pile: any) => Array.isArray(pile.cards) && pile.cards.some((card: any) => card.id === draggedCardId))?.id;
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
  
  const tableauPiles = Object.values(piles)
    .filter((pile: any) => pile.type === 'tableau')
    .sort((a: any, b: any) => a.id.localeCompare(b.id));
  const deckPile = Object.values(piles).find((pile: any) => pile.type === 'deck' || pile.type === 'stock');
  const wastePile = Object.values(piles).find((pile: any) => pile.type === 'waste');
  const handPile = Object.values(piles).find((pile: any) => pile.type === 'hand');
  
  console.log('GameScreen - deckPile found:', deckPile);
  console.log('GameScreen - deckPile cards:', deckPile?.cards?.length || 0);
  console.log('GameScreen - handPile found:', handPile);
  console.log('GameScreen - handPile cards:', handPile?.cards?.length || 0);
  const foundationPiles = Object.values(piles)
    .filter((pile: any) => pile.type === 'foundation')
    .sort((a: any, b: any) => a.id.localeCompare(b.id));

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
            // For testing purposes, complete the current encounter and move to the next one
            console.log('Testing: Moving to next encounter');
            if (engine) {
              // This is a simplified implementation for testing
              setCurrentScreen('game');
            }
          }}
        />
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
            equippedExploits={gameState.player?.exploits?.map(id => 
              registry.exploit.find(e => e.id === id)).filter((item): item is any => item !== undefined) || []}
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
    </div>
  );
}
