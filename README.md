# Fresh Game - Solitaire with Coronata Features

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
├── core_engine/          # Enhanced game engine with Coronata features
├── engine/              # Base solitaire engine
├── ui/                  # React components
│   ├── GameScreen.tsx   # Main game interface
│   ├── Card.tsx         # Card component
│   └── CoronataWelcome.tsx # Welcome screen
├── registry/            # Game content registry
└── assets/             # Static assets

mobile/                  # React Native mobile app
├── Coronatafresh/      # Mobile implementation
└── README.md           # Mobile-specific documentation
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
- **EngineController**: Core game state management
- **GameScreen**: Main game interface with card interactions
- **Card**: Individual card component with drag/drop support
- **Modal System**: Reusable overlay components for UI

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
- `src/engine/gameModeProfiles.ts` - Game mode definitions
- `src/registry/registry.ts` - Content registry management
- `src/core_engine/gameInitialization.ts` - Coronata setup

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
- Core solitaire mechanics with enhanced card movement
- Foundation auto-selection and smart card placement
- Advanced scoring system with multipliers
- Complete resign functionality with run recap
- Modal system for UI interactions
- Proper navigation between game screens

### 🚧 In Development
- Fortune Selection Screen implementation
- Post-Fear Choice Selection system
- Complete Trade Screen with all options
- Exploration and Wander mechanics
- Mobile app optimization and testing

---

**Ready to play?** Clone the repo and start your Coronata journey! 🎴✨