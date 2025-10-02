# Engine Coverage Checklist for Supported Card Games

This checklist helps validate that the engine supports all required mechanics for each target game.

## Universal Features
- [ ] Configurable pile/zone types and counts
- [ ] Custom pile rules (stacking, alternation, suit, value, etc.)
- [ ] Multi-deck support
- [ ] Custom card sets
- [ ] Flexible move logic (single/multi-card, special moves)
- [ ] Pluggable win/loss conditions
- [ ] Custom scoring systems
- [ ] Registry/config-driven rules and effects
- [ ] Event system for state changes and UI
- [ ] Undo/redo support
- [ ] Dynamic pile creation/removal
- [ ] Flexible game setup (initial deal, redeals, resets)

## Game-Specific Features

### Klondike
- [ ] Standard tableau/foundation/waste/deck setup
- [ ] Alternating color, descending value stacking
- [ ] Foundation building by suit, ascending value
- [ ] Win: all cards in foundation

### Spider
- [ ] Multiple decks
- [ ] Suit stacking
- [ ] Multi-card moves
- [ ] Win: all cards in foundation

### FreeCell
- [ ] Free cells
- [ ] Any card to empty tableau
- [ ] Win: all cards in foundation

### Yukon
- [ ] Multi-card moves
- [ ] No stock
- [ ] Win: all cards in foundation

### Forty Thieves
- [ ] Double deck
- [ ] Strict tableau rules
- [ ] Win: all cards in foundation

### Double Klondike
- [ ] Double deck
- [ ] Standard Klondike rules

### Eight Off & Baker’s Game
- [ ] Free cells
- [ ] Suit stacking
- [ ] Win: all cards in foundation

### Pyramid
- [ ] Triangular tableau
- [ ] Pairing to 13
- [ ] Win: clear pyramid

### TriPeaks
- [ ] Peaks tableau
- [ ] Up/down moves
- [ ] Win: clear tableau

### Golf
- [ ] Single tableau
- [ ] Up/down moves
- [ ] Scoring system

### Scorpion
- [ ] Multi-card moves
- [ ] Tableau manipulation
- [ ] Win: all cards in foundation

### Canfield
- [ ] Reserve pile
- [ ] Tableau/foundation rules
- [ ] Win: all cards in foundation

### Accordion
- [ ] Dynamic pile creation/removal
- [ ] Compressing moves
- [ ] Win: one pile remains

### Montana
- [ ] Shifting tableau
- [ ] Win: ordered tableau

### Carpet
- [ ] Carpet tableau
- [ ] Win: all cards in foundation

### Crescent
- [ ] Crescent tableau
- [ ] Win: all cards in foundation

### Baker’s Dozen
- [ ] Tableau setup
- [ ] Win: all cards in foundation

### Monte Carlo
- [ ] Pairing moves
- [ ] Win: clear tableau

### Coronata
- [ ] Registry-driven effects
- [ ] Custom resources (coin, shuffles, discards)
- [ ] Campaign/run mode
- [ ] Feats, exploits, dangers, etc.

### Scopa
- [ ] Custom card set
- [ ] Capture/matching logic
- [ ] Scoring system

---

Use this checklist to validate engine coverage as you build and test each module.
