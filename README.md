# Coronata - a rogue-like solitaite game based on Klondike.

A modern React/TypeScript solitaire game with enhanced Coronata progression mechanics, featuring dynamic card interactions, custom scoring systems, and immersive gameplay elements.

## 🎮 Features

### Core Solitaire Mechanics
- **Enhanced Card Movement**: Smooth drag-and-drop with foundation auto-selection
- **Smart Auto-Placement**: Aces automatically find correct foundations
- **Advanced Scoring**: Triple scoring for untouched foundation cards
- **Stack Moves**: Full stack movement validation and scoring
- **Shuffle System**: Limited shuffles with strategic gameplay

### Coronata Progression System
- **Fortune Selection**: Choose from 3 random fortunes before encounters
- **Fear Encounters**: Strategic card-based challenges
- **Trade System**: 4 exploits, 3 blessings, 2 curses with upgrade options
- **Exploration**: Wander mechanics for discovery gameplay
- **Run Progression**: Complete runs with recap and statistics

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Modal System**: Clean overlays for confirmations and information
- **Visual Feedback**: Card highlighting and smooth animations
- **Game Controls**: Resign functionality with proper navigation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/[your-username]/fresh-game.git
cd fresh-game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Build for web
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── engine/                  # Unified game engine with auto-configuration
│   ├── engineController.ts  # Central game state management
│   ├── gameModeProfiles.ts  # Game mode configurations (Klondike, Coronata)
│   ├── enhancedScoring.ts   # Enhanced scoring system with Coronata features
│   ├── effectEngine.ts      # Registry effect processing system
│   ├── eventSystem.ts       # Event-driven architecture
│   ├── moveLogic.ts         # Card movement validation
│   └── types.ts            # Unified type definitions
├── ui/                      # React components
│   ├── GameScreen.tsx       # Main game interface with responsive scaling
│   ├── PlayerHUD.tsx        # Enhanced HUD with encounter info & progress
│   ├── Card.tsx            # Card component with shake animations
│   ├── CoronataWelcome.tsx  # Welcome screen with navigation
│   └── GameModeMenu.tsx     # Mode selection interface
├── registry/                # Game content registry
│   ├── registry.ts         # Exploits, curses, blessings, fortunes
│   └── index.ts            # Registry type definitions
└── assets/                 # Static assets

mobile/                      # React Native mobile app
├── Coronatafresh/          # Mobile implementation
└── README.md               # Mobile-specific documentation
```

## 🎯 Game Mechanics

### Scoring System
- **Base Score**: Standard points for card moves
- **Triple Score**: 3x multiplier for foundation cards never moved to tableau
- **Stack Scoring**: All cards in a stack move contribute to score
- **Shuffle Penalty**: Limited shuffles affect final score

### Card Movement
- **Foundation Auto-Selection**: Clicking any foundation finds the correct pile
- **Drag and Drop**: Smooth card movement with visual feedback
- **Move Validation**: Real-time validation with highlighted destinations
- **Undo/Redo**: Complete move history management

### Coronata Features
- **Registry System**: Dynamic content loading for fortunes, exploits, and blessings
- **Progression Tracking**: Run statistics and achievement system
- **Strategic Choices**: Post-encounter decision making
- **Resource Management**: Coins, upgrades, and progression mechanics

## 🔧 Development

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: CSS Modules with game-specific themes
- **Mobile**: React Native + Expo
- **Testing**: Jest + React Testing Library
- **Build**: Vite with hot module replacement

### Code Quality
- **TypeScript**: Full type safety throughout codebase
- **ESLint**: Code quality and consistency enforcement
- **Codacy Integration**: Automated code review and analysis
- **Component Architecture**: Modular, reusable component design

### Key Components
- **EngineController**: Unified game engine with auto-configuration based on game mode
- **GameModeProfiles**: Configuration system that automatically enables features per mode
- **EnhancedScoring**: Auto-integrating scoring system for Coronata features
- **EffectEngine**: Registry-driven effect processing for exploits, curses, and blessings
- **GameScreen**: Main game interface with responsive scaling and 266px minimum width
- **PlayerHUD**: Enhanced HUD showing encounter info, progress bar, and player resources
- **Card**: Individual card component with shake animations for invalid moves

## 🎮 Game Modes

### Standard Solitaire
Classic Klondike solitaire with enhanced mechanics and modern UI.

### Coronata Mode
Enhanced gameplay with:
- Pre-encounter fortune selection
- Fear-based challenges
- Trade and exploration mechanics
- Progressive difficulty scaling
- Achievement and progression tracking

## 📱 Mobile Support

The game includes a React Native mobile version with:
- Touch-optimized card interactions
- Responsive design for all screen sizes
- Native performance optimization
- Platform-specific UI adaptations

## 🛠️ Configuration

### Environment Variables
```bash
# Development
NODE_ENV=development
VITE_GAME_MODE=coronata

# Production
NODE_ENV=production
VITE_BUILD_TARGET=web
```

### Game Configuration
Game modes and mechanics can be configured through:
- `src/engine/gameModeProfiles.ts` - Unified game mode definitions with auto-configuration
- `src/registry/registry.ts` - Content registry with exploits, curses, blessings, fortunes
- `src/engine/enhancedScoring.ts` - Auto-integrating Coronata scoring system
- `src/App.jsx` - Main application with simplified engine initialization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure code passes Codacy analysis

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- Built with modern React and TypeScript
- Enhanced solitaire mechanics inspired by classic card games
- Coronata progression system for strategic depth
- Mobile-first responsive design principles

## 🐛 Bug Reports & Feature Requests

Please use the [GitHub Issues](https://github.com/[your-username]/fresh-game/issues) page to report bugs or request features.

## 📊 Current Status

### ✅ Completed Features
- Unified engine architecture with auto-configuration based on game mode
- Core solitaire mechanics with enhanced card movement and validation
- Foundation auto-selection and smart card placement
- Responsive design with automatic scaling (266px minimum width)
- PlayerHUD with encounter info, full-width progress bar, and resource tracking
- Shake animations for invalid move feedback
- Enhanced scoring system with auto-integration for Coronata mode
- Proper deck initialization and card dealing for hand management
- Complete resign functionality with run recap
- Modal system for UI interactions

### 🚧 In Development
- Registry item effects system (exploits, curses, blessings, fortunes)
- Coin earning mechanics and balance tracking system
- Complete Trade Screen with all upgrade options
- Wander mechanics for exploration gameplay
- Encounter progression and scoring system
- Fortune Selection Screen implementation
- Mobile app optimization and testing

---

**Ready to play?** Clone the repo and start your Coronata journey! 🎴✨
