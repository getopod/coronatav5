
import React, { useState } from 'react';
import { EngineEventProvider, GameScreen, CoronataWelcome } from './ui';
import { EngineController } from './engine/engineController';
import { makeKlondikeRegistryConfig } from '../test/engine/testUtils';
import { GameModeMenu } from './ui/GameModeMenu';
import { setupCoronataEngine } from './core_engine/gameInitialization';
// Removed unused imports: gameModeProfiles, reactLogo, vieLogo
import './App.css';


function App() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [showCoronataWelcome, setShowCoronataWelcome] = useState(false);
  // Create engine instance for selected mode
  const engine = React.useMemo(() => {
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
      } catch (error) {
        console.error('Error setting up Coronata engine:', error);
      }
    }
    
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
  };

  const handleCoronataBack = () => {
    setSelectedMode(null);
    setShowCoronataWelcome(false);
  };

  // Handle navigation back to welcome from game
  const handleGameToWelcome = () => {
    if (selectedMode === 'coronata') {
      setShowCoronataWelcome(true);
    } else {
      setSelectedMode(null);
    }
  };

  // Show game mode menu
  if (!selectedMode) {
    return <GameModeMenu onSelect={handleModeSelect} />;
  }

  // Show Coronata welcome screen
  if (selectedMode === 'coronata' && showCoronataWelcome) {
    return (
      <CoronataWelcome 
        onStart={handleCoronataStart}
        onBack={handleCoronataBack}
      />
    );
  }

  // Show game screen
  return (
    <EngineEventProvider engine={engine}>
      <GameScreen onNavigateToWelcome={handleGameToWelcome} />
    </EngineEventProvider>
  );
}

export default App
