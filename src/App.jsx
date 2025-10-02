
import React, { useState } from 'react';
import { EngineEventProvider, GameScreen, CoronataWelcomeScreen, FortuneSelectionScreen, HowToPlay, Glossary, History } from './ui';
import { EngineController } from './engine/engineController';
import { makeKlondikeRegistryConfig } from '../test/engine/testUtils';
import { GameModeMenu } from './ui/GameModeMenu';
import { startGameSession } from './core_engine/persistenceManager';
import { exploits } from './registry/registry'; // Import registry items
// Removed unused imports: gameModeProfiles, reactLogo, vieLogo, setupCoronataEngine
import './App.css';


function App() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [showCoronataWelcome, setShowCoronataWelcome] = useState(false);
  const [showFortuneSelection, setShowFortuneSelection] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFortune, setSelectedFortune] = useState(null);
  // Create engine instance for selected mode
  const engine = React.useMemo(() => {
    // For demo, use Klondike registry config for all modes (replace with correct config per mode)
    const config = makeKlondikeRegistryConfig();
    const engineController = new EngineController({
      registryConfig: config,
      registryEntries: exploits, // Use actual exploits from registry
      customHandlers: {}
    }, selectedMode || 'klondike'); // Engine will auto-configure based on game mode
    
    console.log(`${selectedMode || 'klondike'} engine initialized with profile:`, engineController.config);
    console.log('Registry entries loaded:', exploits.length, 'exploits');
    
    // Expose engine to window for debugging
    window.gameEngine = engineController;
    
    return engineController;
  }, [selectedMode]);

  // Handle mode selection
  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    if (mode === 'coronata') {
      setShowCoronataWelcome(true);
    }
    // For other modes, go directly to game
  };

  // Handle Coronata welcome actions
  const handleCoronataStart = () => {
    setShowCoronataWelcome(false);
    setShowFortuneSelection(true);
  };

  const handleCoronataBack = () => {
    setSelectedMode(null);
    setShowCoronataWelcome(false);
    setShowFortuneSelection(false);
    setShowHowToPlay(false);
    setShowGlossary(false);
    setShowHistory(false);
  };

  // Handle Fortune Selection actions
  const handleFortuneSelected = (fortune) => {
    setSelectedFortune(fortune);
    setShowFortuneSelection(false);
    
    // Start a new game session for persistence
    try {
      startGameSession();
      console.log('New game session started');
    } catch (error) {
      console.error('Error starting game session:', error);
    }
    
    console.log('Fortune selected:', fortune);
  };

  const handleFortuneBack = () => {
    setShowCoronataWelcome(true);
    setShowFortuneSelection(false);
  };

  // Handle navigation back to welcome from game
  const handleGameToWelcome = () => {
    if (selectedMode === 'coronata') {
      setShowCoronataWelcome(true);
    } else {
      setSelectedMode(null);
    }
  };

  // Handle navigation to different screens from welcome
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

  // Handle back navigation from sub-screens
  const handleBackToWelcome = () => {
    setShowHowToPlay(false);
    setShowGlossary(false);
    setShowHistory(false);
    setShowCoronataWelcome(true);
  };

  // Show game mode menu
  if (!selectedMode) {
    return <GameModeMenu onSelect={handleModeSelect} />;
  }

  // Show Coronata welcome screen
  if (selectedMode === 'coronata' && showCoronataWelcome) {
    return (
      <CoronataWelcomeScreen 
        onStart={handleCoronataStart}
        onHowToPlay={handleShowHowToPlay}
        onGlossary={handleShowGlossary}
        onHistory={handleShowHistory}
        onOptions={() => alert('Options will be implemented soon!')}
        onBack={handleCoronataBack}
      />
    );
  }

  // Show HowToPlay screen
  if (selectedMode === 'coronata' && showHowToPlay) {
    return <HowToPlay onBack={handleBackToWelcome} />;
  }

  // Show Glossary screen
  if (selectedMode === 'coronata' && showGlossary) {
    return <Glossary onBack={handleBackToWelcome} />;
  }

  // Show History screen
  if (selectedMode === 'coronata' && showHistory) {
    return <History onBack={handleBackToWelcome} />;
  }

  // Show Fortune Selection screen
  if (selectedMode === 'coronata' && showFortuneSelection) {
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
        onNavigateToWelcome={handleGameToWelcome}
        selectedFortune={selectedFortune}
      />
    </EngineEventProvider>
  );
}

export default App
