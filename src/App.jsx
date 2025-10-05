
import React, { useState } from 'react';
import { EngineEventProvider, GameScreen, CoronataWelcomeScreen, FortuneSelectionScreen, HowToPlay, Glossary, Options } from './ui';
import RunHistoryScreen from './ui/RunHistoryScreen';
import { EngineController } from './engine/engineController';
import { startGameSession } from './engine/persistenceManager';
import { registry } from './registry/index';
import { createDefaultCoronataPiles } from './engine/gameInitialization';
// Helper to generate a RegistryConfig for Coronata with piles, cards, and initialCards
function createCoronataRegistryConfig() {
  const pilesObj = createDefaultCoronataPiles();
  const allCards = [];
  const pilesArray = Object.values(pilesObj).map(pile => {
    // Collect all cards for the global card list
    if (pile.cards && pile.cards.length > 0) {
      for (const card of pile.cards) {
        allCards.push(card);
      }
    }
    return {
      id: pile.id,
      type: pile.type,
      rules: pile.rules,
      meta: pile.meta,
      initialCards: pile.cards ? pile.cards.map(card => card.id) : []
    };
  });
  // Remove duplicate cards (shouldn't be any, but just in case)
  const uniqueCards = Array.from(new Map(allCards.map(card => [card.id, card])).values());
  // Convert to CardConfig[] with all Card fields
  const cardsArray = uniqueCards.map(card => ({
    id: card.id,
    suit: card.suit,
    value: card.value,
    faceUp: card.faceUp,
    design: card.design,
    tags: card.tags,
    meta: card.meta,
    blessings: card.blessings,
    autoPlay: card.autoPlay
  }));
  return {
    piles: pilesArray,
    cards: cardsArray,
    // Add any other config properties needed by the engine here
  };
}
// Debug utilities
import './debug/gameDebug';
// Removed unused imports: gameModeProfiles, reactLogo, vieLogo, setupCoronataEngine
import './App.css';



function App() {
  // Always Coronata mode, always show welcome first
  const [showCoronataWelcome, setShowCoronataWelcome] = useState(true);
  const [showFortuneSelection, setShowFortuneSelection] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFortune, setSelectedFortune] = useState(null);

  // Engine always in Coronata mode
  const engine = React.useMemo(() => {
    // Construct a valid RegistryConfig for Coronata with 'piles'
    // Use the full RegistryConfig with piles, cards, and initialCards
    const coronataConfig = createCoronataRegistryConfig();
    // Flatten the registry object into a single array of entries
    const allRegistryEntries = Object.values(registry).flat();
    const engineController = new EngineController({
      registryConfig: coronataConfig,
      registryEntries: allRegistryEntries,
      customHandlers: {}
    }, 'coronata');
    window.engine = engineController; // Attach to window.engine for UI
    window.gameEngine = engineController; // (legacy, for compatibility)
    return engineController;
  }, []);

  // Handlers for navigation
  const handleCoronataStart = () => {
    setShowCoronataWelcome(false);
    setShowFortuneSelection(true);
  };
  const handleCoronataBack = () => {
    setShowCoronataWelcome(true);
    setShowFortuneSelection(false);
    setShowHowToPlay(false);
    setShowGlossary(false);
    setShowHistory(false);
    setShowOptions(false);
  };
  const handleFortuneSelected = (fortune) => {
    setSelectedFortune(fortune);
    setShowFortuneSelection(false);
  try { startGameSession(); } catch { /* ignore */ }
  };
  const handleFortuneBack = () => {
    setShowCoronataWelcome(true);
    setShowFortuneSelection(false);
  };
  const handleShowHowToPlay = () => {
    setShowCoronataWelcome(false);
    setShowHowToPlay(true);
  };
  const handleShowGlossary = () => {
    setShowCoronataWelcome(false);
    setShowGlossary(true);
  };
  const handleShowHistory = () => {
    setShowCoronataWelcome(false);
    setShowHistory(true);
  };
  const handleShowOptions = () => {
    setShowCoronataWelcome(false);
    setShowOptions(true);
  };
  const handleBackToWelcome = () => {
    setShowHowToPlay(false);
    setShowGlossary(false);
    setShowHistory(false);
    setShowOptions(false);
    setShowCoronataWelcome(true);
  };

  // Show Coronata welcome screen
  if (showCoronataWelcome) {
    return (
      <CoronataWelcomeScreen
        onStart={handleCoronataStart}
        onHowToPlay={handleShowHowToPlay}
        onGlossary={handleShowGlossary}
        onHistory={handleShowHistory}
        onOptions={handleShowOptions}
      />
    );
  }
  if (showHowToPlay) {
    return <HowToPlay onBack={handleBackToWelcome} />;
  }
  if (showGlossary) {
    return <Glossary onBack={handleBackToWelcome} />;
  }
  if (showHistory) {
    return <RunHistoryScreen onBack={handleBackToWelcome} />;
  }
  if (showOptions) {
    return <Options onBack={handleBackToWelcome} engine={engine} />;
  }
  if (showFortuneSelection) {
    return (
      <FortuneSelectionScreen
        onFortuneSelected={handleFortuneSelected}
        onBack={handleFortuneBack}
      />
    );
  }
  // Show game screen
  return (
    <EngineEventProvider engine={engine}>
      <GameScreen 
        onNavigateToWelcome={handleCoronataBack}
        selectedFortune={selectedFortune}
      />
    </EngineEventProvider>
  );
}

export default App
