
import React, { useState, useEffect, useMemo } from 'react'
import { EngineEventProvider, GameScreen, CoronataWelcomeScreen, FortuneSelectionScreen, HowToPlay, Glossary, History } from './ui';
import { EngineController } from './core_engine/engineController';
import { makeKlondikeRegistryConfig } from '../test/engine/testUtils';
import { GameModeMenu } from './ui/GameModeMenu';
import { setupCoronataEngine } from './core_engine/gameInitialization';
import { logInfo, logError } from './core_engine/persistentLogger';
// Removed unused imports: gameModeProfiles, reactLogo, vieLogo
import './App.css';


function App() {
  logInfo('App', 'Application starting up - Coronata Solitaire Engine');
  
  const [selectedMode, setSelectedMode] = useState(null);
  const [showCoronataWelcome, setShowCoronataWelcome] = useState(false);
  const [showFortuneSelection, setShowFortuneSelection] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFortune, setSelectedFortune] = useState(null);

  // Log state changes for debugging
  useEffect(() => {
    logInfo('App', 'State changed', {
      selectedMode,
      showCoronataWelcome,
      showFortuneSelection,
      showHowToPlay,
      showGlossary,
      showHistory,
      selectedFortune: selectedFortune ? selectedFortune.label : 'null'
    });
  }, [selectedMode, showCoronataWelcome, showFortuneSelection, showHowToPlay, showGlossary, showHistory, selectedFortune]);
  // Create engine instance for selected mode
  const engine = useMemo(() => {
    // For demo, use Klondike registry config for all modes (replace with correct config per mode)
    const config = makeKlondikeRegistryConfig();
    const engineController = new EngineController({
      registryConfig: config,
      registryEntries: [],
      customHandlers: {}
    }, selectedMode || 'klondike'); // Changed from 'string' to 'klondike'
    
    // Initialize Coronata-specific features if mode is coronata
    if (selectedMode === 'coronata') {
      try {
        setupCoronataEngine(engineController, {
          variant: 'coronata',
          difficulty: 1,
          seed: Date.now().toString()
        });
        console.log('Coronata engine setup completed:', engineController.state);
        logInfo('App', 'Coronata engine setup completed successfully');
      } catch (error) {
        console.error('Error setting up Coronata engine:', error);
        logError('App', 'Failed to setup Coronata engine', error);
      }
    }
    
    // Expose engine to window for debugging
    window.gameEngine = engineController;
    
    return engineController;
  }, [selectedMode]);

  // Handle mode selection
  const handleModeSelect = (mode) => {
    logInfo('App', `Game mode selected: ${mode}`);
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
    logInfo('App', `Fortune selected: ${fortune.label}`, fortune);
    logInfo('App', 'State before fortune selection', {
      selectedMode,
      showCoronataWelcome,
      showFortuneSelection,
      showHowToPlay,
      showGlossary,
      showHistory
    });
    setSelectedFortune(fortune);
    setShowFortuneSelection(false);
    
    // Add a timeout to log state after the update
    setTimeout(() => {
      logInfo('App', 'State after fortune selection', {
        selectedMode,
        showCoronataWelcome,
        showFortuneSelection: false, // We know this will be false
        showHowToPlay,
        showGlossary,
        showHistory,
        selectedFortune: fortune
      });
    }, 100);
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
  if (selectedMode && !showCoronataWelcome && !showFortuneSelection && !showHowToPlay && !showGlossary && !showHistory) {
    logInfo('App', 'Showing game screen', { selectedMode, selectedFortune });
    
    // Temporary debug component
    return (
      <div style={{ padding: '20px', background: '#222', color: '#fff', minHeight: '100vh' }}>
        <h1>DEBUG: Game Screen Reached!</h1>
        <p>Selected Mode: {selectedMode}</p>
        <p>Selected Fortune: {selectedFortune ? selectedFortune.label : 'None'}</p>
        <p>Engine: {engine ? 'Available' : 'Missing'}</p>
        <button onClick={handleGameToWelcome} style={{ padding: '10px 20px', margin: '10px' }}>
          Back to Welcome
        </button>
        
        {/* Try to render the actual game screen */}
        <div style={{ marginTop: '20px', border: '2px solid #555', padding: '10px' }}>
          <h3>Attempting to render GameScreen:</h3>
          <EngineEventProvider engine={engine}>
            <GameScreen 
              onNavigateToWelcome={handleGameToWelcome}
              selectedFortune={selectedFortune}
            />
          </EngineEventProvider>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  logError('App', 'Unexpected app state', { 
    selectedMode, showCoronataWelcome, showFortuneSelection, 
    showHowToPlay, showGlossary, showHistory, selectedFortune 
  });
  return <div>Loading...</div>;
}

export default App
