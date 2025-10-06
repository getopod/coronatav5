# Coronata Master Doc
**Version 4.0 (Complete Rebalanced Edition)**  
*Last Updated: October 3, 2025*

## The Complete Guide to Coronata
This document contains every rule, mechanic, balance detail, and implementation specification for Coronata. It serves as the canonical reference for players, designers, developers, and AI agents.

**Coronata** is a solitaire-roguelike that transforms Klondike patience into a strategic campaign experience. Each run is a journey through 15 encounters across 5 trials, where narrative events and mechanical modifiers create unique challenges. The game features a comprehensive economy, 9-level ascension system, and data-driven registry that makes every run feel distinct.

---

## 🎯 Core Game Loop

### **Run Structure (5 Trials)**
```
Trial 1: Fear → [1 Trade + 2 Wanders in random order] → Fear → [1 Trade + 2 Wanders in random order] → Danger → [Fortune Swap (mandatory) + 50% chance for bonus Trade]
Trial 2: Fear → [1 Trade + 2 Wanders in random order] → Fear → [1 Trade + 2 Wanders in random order] → Danger → [Fortune Swap (mandatory) + 50% chance for bonus Trade]  
Trial 3: Fear → [1 Trade + 2 Wanders in random order] → Fear → [1 Trade + 2 Wanders in random order] → Danger → [Fortune Swap (mandatory) + 50% chance for bonus Trade]
Trial 4: Fear → [1 Trade + 2 Wanders in random order] → Fear → [1 Trade + 2 Wanders in random order] → Danger → [Fortune Swap (mandatory) + 50% chance for bonus Trade]
Trial 5: Fear → [1 Trade + 2 Wanders in random order] → Fear → [1 Trade + 2 Wanders in random order] → Danger → [Fortune Swap (mandatory) + 50% chance for bonus Trade] → [Final Trade] → Usurper
```

**Total Encounters**: 15 (10 Fears + 4 Dangers + 1 Usurper)  
**Trade Opportunities**: 5 guaranteed + up to 5 bonus + 1 final = 6-11 total trades  
**Wander Events**: 10 total (2 per trial cycle)
**Fortune Swaps**: 4 mandatory (after each Danger)
**Progression**: Each encounter awards coins and unlocks new strategic options

---

## 💰 Complete Economy System

### **Starting Resources**
- **Coins**: 50 (immediate purchasing power)
- **Hand Size**: 5 cards
- **Shuffles**: 3 per encounter  
- **Discards**: 3 per encounter
- **Fortune**: 1 (selected at run start)

### **Encounter Rewards**
| Encounter Type | Coin Reward | Score Bonus |
|---------------|-------------|-------------|
| Fear          | 25 coins    | 50 points   |
| Danger        | 40 coins    | 100 points  |
| Usurper       | 60 coins    | 200 points  |

### **Total Coin Flow Per Run (Base Level)**
- Starting: 50 coins
- 10 Fears: 10 × 25 = 250 coins  
- 4 Dangers: 4 × 40 = 160 coins
- 1 Usurper: 60 coins
- **Total Available**: **520 coins per run**

### **Item Pricing Structure (Base Level)**
| Item Type | Cost Range | Examples |
|-----------|------------|----------|
| Common Exploits | 30-50 coins | Basic score bonuses |
| Uncommon Exploits | 60-90 coins | Conditional effects |
| Rare Exploits | 100-150 coins | Powerful synergies |
| Legendary Exploits | 180-250 coins | Game-changing abilities |
| Blessings | 15-40 coins | Card-specific permanent upgrades |
| Curse Removal | 60-120 coins | Escalating cost per removal |
| Hand Size +1 | 80 coins | Permanent upgrade |
| Shuffle +1 | 40 coins | Extra resource per encounter |
| Discard +1 | 40 coins | Extra resource per encounter |

### **Purchasing Power Analysis (Base Level)**

**Trade 1** (after Fear 1): **75 coins available**
- Can buy: 2-3 weak items OR 1 decent item OR save for later
- Examples: 2 common exploits + blessing OR 1 uncommon exploit

**Trade 2** (after Fear 3): **125 coins available**
- Can buy: Mix of decent items OR save for amazing item  
- Examples: 1 rare exploit OR 2 uncommon items

**Trade 3** (after Danger 1): **165 coins available**
- Can buy: 1 amazing item OR multiple decent upgrades
- Examples: 1 legendary exploit OR hand size + rare exploit

**Trade 4** (after Fear 6): **215 coins available**
- Can buy: Build synergies and fine-tune loadout
- Examples: Multiple rare items or legendary + utility

**Trade 5** (after Fear 8): **275 coins available**
- Can buy: Final power spike or complete build optimization
- Examples: Top-tier legendary + support items

**Final Trade** (before Usurper): **335 coins available**
- Can buy: Last-minute optimizations and Usurper preparation
- Focus: Items that specifically help with final encounter

---

## 🎯 Scoring System

### **Smoothed Score Goals**
For encounter $i$:
$$\text{ScoreGoal}_i = S_{base} \times (1.25)^{(i-1)} \times D_{mod} \times A_{scale}$$

Where:
- $S_{base}$: 120 (achievable base score)
- Growth rate: 25% per encounter (smooth progression)
- $D_{mod}$: Encounter modifier (1.0 for Fear, 1.2 for Danger, 1.5 for Usurper)
- $A_{scale}$: Ascension scaling (1.0 + 0.1 × AscensionLevel)

### **Score Goals Table (Base Level)**

| Encounter | Type | Base Goal | Final Goal |
|-----------|------|-----------|------------|
| 1         | Fear | 120       | 120        |
| 2         | Fear | 150       | 150        |
| 3         | Danger| 188       | 225        |
| 4         | Fear | 234       | 234        |
| 5         | Fear | 293       | 293        |
| 6         | Danger| 366       | 439        |
| 7         | Fear | 458       | 458        |
| 8         | Fear | 572       | 572        |
| 9         | Danger| 715       | 858        |
| 10        | Fear | 894       | 894        |
| 11        | Fear | 1118      | 1118       |
| 12        | Danger| 1397      | 1676       |
| 13        | Fear | 1746      | 1746       |
| 14        | Fear | 2183      | 2183       |
| 15        | Usurper| 2728     | 4092       |

### **Scoring Precedence**
1. Compute base score (card face value or foundation multiplier)
2. Apply additive modifiers (sum all +X bonuses from registry effects)
3. Apply multiplicative modifiers (product of all Nx bonuses from registry effects)
4. Evaluate special tokens (basePlusBeneath, card-specific blessings, etc.)

**Foundation Multiplier**: Foundation plays score 2× base value by default (can be modified by registry effects) Foundation plays score 3x base value if that card has not been played to a tableau yet this encounter.

---

## 🏔️ Ascension System (9 Levels)

### **Level 0: Base Game**
- Normal gameplay as specified above
- All systems functioning at baseline values

### **Level 1: "Merchant's Tax"**
- **Challenge**: Economic pressure begins
- **Effects**: 
  - All item costs +25%
  - Starting coins: 40 (down from 50)
- **Reward**: Unlocks "Ascension Explorer" achievement

### **Level 2: "Scarce Resources"**
- **Challenge**: Resource limitations
- **Effects**:
  - Item costs +50%
  - Starting shuffles: 2 (down from 3)
  - Score goals +10%
- **Reward**: Unlocks "Resource Manager" title

### **Level 3: "Hostile Markets"**
- **Challenge**: Trade system becomes difficult
- **Effects**:
  - Item costs +75%
  - Trade reroll costs double
  - Only 3 exploits offered per trade (down from 4)
  - Score goals +20%
- **Reward**: Unlocks rare "Merchant's Bane" exploit

### **Level 4: "Cursed Luck"**
- **Challenge**: Negative effects appear
- **Effects**:
  - Item costs +100%
  - Start each run with 1 random curse
  - Curse removal costs +50%
  - Score goals +30%
- **Reward**: Unlocks "Curse Breaker" achievement

### **Level 5: "Diminished Fortune"**
- **Challenge**: Core mechanics weakened
- **Effects**:
  - Item costs +125%
  - Fortune effects reduced by 25%
  - Starting hand size: 4 (down from 5)
  - Score goals +40%
- **Reward**: Unlocks legendary "Phoenix Rising" fortune

### **Level 6: "Twisted Trials"**
- **Challenge**: Encounters become more dangerous
- **Effects**:
  - Item costs +150%
  - All Danger encounters gain one additional negative effect
  - Starting discards: 2 (down from 3)
  - Score goals +50%
- **Reward**: Unlocks "Trial Master" title

### **Level 7: "Apex Challenge"**
- **Challenge**: Multiple handicaps
- **Effects**:
  - Item costs +175%
  - Start with 2 random curses
  - Fortune must be swapped every 2 encounters (not just after Dangers)
  - Score goals +65%
- **Reward**: Unlocks exclusive "Apex Predator" cosmetic theme

### **Level 8: "Master's Gauntlet"**
- **Challenge**: Near-impossible conditions
- **Effects**:
  - Item costs +200%
  - All Fear encounters gain Fear-level negative modifiers
  - Maximum hand size capped at 4
  - Score goals +80%
- **Reward**: Unlocks "Gauntlet Survivor" achievement

### **Level 9: "Transcendent Ordeal"**
- **Challenge**: The ultimate test
- **Effects**:
  - Item costs +250%
  - Start with 3 random curses
  - No blessing purchases allowed
  - Usurper gains 2 additional random Danger effects
  - Score goals +100% (double difficulty)
- **Reward**: Unlocks "Transcendent" title and exclusive ending

### **Ascension Rewards**
- **Completion Rewards**: Unique cosmetics, titles, exclusive registry items
- **Prestige Currency**: "Ascension Tokens" earned for meta-progression
- **Unlock Tiers**: New registry content locked behind ascension levels
- **Leaderboards**: Global rankings for highest ascension completed

---

## 🎴 Core Vocabulary

- **Deck**: Standard 52-card deck (A=1...K=13), face-down draw pile
- **Hand**: Cards held between draws (default size 5, adjustable)
- **Waste**: Face-up pile for discarded cards from deck cycling
- **Tableau**: 7 Klondike-style columns for card placement
- **Foundation**: 4 suit-based scoring piles (Ace to King)
- **Encounter**: Single gameplay challenge (Fear/Danger/Usurper)
- **Trial**: Group of 3 encounters (Fear-Fear-Danger)
- **Run**: Complete playthrough (5 trials + final Usurper = 15 encounters)

### **Registry Items**
- **Fortune**: Persistent run-level modifier (choose 1 at start, mandatory swap after Dangers)
- **Exploit**: Powerful passive/triggered effects (max 4 equipped at once)
- **Blessing**: Card-specific permanent upgrades applied to individual cards
- **Curse**: Negative modifiers affecting gameplay (can be removed for coins)
- **Fear**: Lightweight encounter modifiers with single effects
- **Danger**: Heavyweight multi-effect encounter modifiers with higher rewards
- **Wander**: Narrative choice-based events with multiple outcomes
- **Feat**: Achievements awarded for completing specific objectives

---

## 🔄 Post-Encounter Flow

### **After Fear Encounters**
1. Receive 25 coins reward
2. **Choose encounter flow**: 1 Trade + 2 Wander events
3. **Random order**: Game randomizes whether Trade or Wanders come first
4. **No backtracking**: Once you leave Trade window, cannot return
5. **Wander selection**: Game randomly selects wander events, player chooses responses

### **After Danger Encounters**  
1. Receive 40 coins reward
2. **Mandatory Fortune Swap**: Must exchange current fortune for new one
3. **50% Bonus Trade**: Coin flip determines if additional trade opportunity appears
4. **Fortune Pool**: Available fortunes exclude current one and recently used ones

### **Before Usurper (Final Encounter)**
1. Receive 40 coins from final Danger
2. Complete mandatory fortune swap
3. **Final Trade**: Guaranteed final shopping opportunity
4. **Usurper Preparation**: Last chance to optimize build for ultimate challenge

### **Trade Window Structure**
- **4 Exploits**: Randomly selected from available pool (excluding equipped ones)
- **3 Blessings**: Randomly selected from available pool
- **2 Curses**: Randomly selected from available pool (for players who want risk/reward)
- **Utility Options**: Hand size, shuffles, discards, curse removal
- **Reroll**: 50 coins + 25 per previous reroll (escalating cost)

### **Wander Event Structure**
- **Random Selection**: Game chooses event from appropriate difficulty pool
- **Multiple Outcomes**: Most wanders offer 2-3 choice options
- **Consequences**: Choices affect coins, items, or temporary modifiers
- **Narrative Continuity**: Some wanders reference previous choices or current build

---

## ✨ Blessing System

### **Card-Specific Upgrades**
Blessings are **permanent upgrades applied to individual cards**, not consumable global effects.

### **Application Process**
1. **Purchase**: Buy blessing from Trade window for 15-40 coins
2. **Target Selection**: Choose specific card from Hand, Draw Pile, or Discard Pile
3. **Permanent Attachment**: Blessing becomes part of that card for remainder of run
4. **Visual Indicators**: Blessed cards display sparkle effects and blessing counts
5. **Stacking**: Multiple different blessings can be applied to same card

### **Blessing Categories**
- **Score Enhancers**: Add flat points or multipliers to card plays
- **Special Abilities**: Grant unique effects when card is played
- **Conditional Bonuses**: Activate based on play location or game state
- **Resource Generators**: Award coins or other resources when triggered

### **Strategic Considerations**
- **High-Value Targets**: Apply to Kings, Aces, or frequently played cards
- **Synergy Building**: Combine blessings for multiplicative effects
- **Risk Management**: Consider card accessibility and play frequency
- **Build Optimization**: Align blessings with fortune and exploit choices

---

## 🎮 Detailed Game Mechanics

### **Card Movement Rules**
- **Tableau Building**: Descending rank, alternating colors (Red-Black-Red...)
- **Foundation Building**: Ascending rank by suit (A-2-3...Q-K)
- **Empty Tableau Rule**: Only Kings can be placed on empty tableau columns
- **Stack Movement**: Properly sequenced cards can be moved together
- **Foundation Priority**: Foundation plays score higher (2× base value default)

### **Resource Management**
- **Shuffles**: Recycle waste pile back into deck (limited per encounter)
- **Discards**: Remove cards from hand back to waste pile (limited per encounter)  
- **Hand Size**: Number of cards drawn from deck (upgradeable via trade)
- **Coins**: Primary currency for trade purchases and upgrades

### **Win Conditions**
- **Encounter Victory**: Reach or exceed score goal within move/time limits
- **Run Victory**: Complete all 15 encounters including final Usurper
- **Perfect Run**: Complete run without failing any encounters
- **Ascension Victory**: Complete run at specific ascension level

### **Failure Conditions**
- **Score Failure**: End encounter below required score threshold  
- **Resource Depletion**: Run out of moves with no valid plays
- **Curse Accumulation**: Acquire too many curses without removal
- **Time Limit**: Exceed maximum time per encounter (if enabled)

---

## 📊 Balance Philosophy

### **Smooth Progression**
The 25% score growth eliminates frustrating difficulty spikes while maintaining steady challenge escalation.

### **Meaningful Choices**
Every trade offers multiple viable strategies rather than obvious optimal purchases.

### **Build Diversity**
Registry effects support multiple distinct playstyles and synergy combinations.

### **Risk/Reward Balance**
Curses and dangerous wanders offer high-power options for skilled players willing to accept downsides.

### **Ascension Depth**
9 difficulty levels provide infinite replay value while preserving core game balance.

---

## 🎯 Implementation Notes

### **Engine Requirements**
- Modular registry system supporting dynamic effect loading
- State management for persistent run progression
- Event-driven architecture for complex effect interactions
- Save/load system for run persistence and statistics tracking

### **UI Requirements**  
- Responsive design supporting mobile and desktop gameplay
- Clear visual feedback for registry effects and blessing attachments
- Intuitive navigation between game states and menus
- Accessibility features for diverse player needs

### **Performance Considerations**
- Efficient card rendering for smooth animations
- Optimized effect processing for complex registry interactions
- Lazy loading for large registry datasets
- Memory management for extended play sessions

---

## 📈 Future Expansion Plans

### **Additional Game Modes**
- **Classic Solitaire**: Traditional Klondike without roguelike elements
- **Speed Runs**: Time-limited encounters with different balancing
- **Puzzle Mode**: Predetermined scenarios with specific solutions
- **Multiplayer**: Competitive or cooperative variants

### **Registry Expansion**
- **Seasonal Events**: Limited-time registry items and encounters
- **Community Content**: Player-created registry entries and challenges
- **Thematic Sets**: Coherent groups of related registry items
- **Advanced Synergies**: Complex multi-item combinations and effects

### **Meta-Progression**
- **Collection System**: Permanent unlocks spanning multiple runs
- **Achievement Tiers**: Nested objectives with escalating rewards
- **Customization Options**: Visual themes, card backs, table designs
- **Statistics Tracking**: Detailed analytics and personal records

---

*This document represents the complete, authoritative specification for Coronata. All implementations should conform to these specifications. For questions or clarifications, consult the development team.*

### **Item Pricing Structure**
| Item Type | Cost Range | Examples |
|-----------|------------|----------|
| Common Exploits | 30-50 coins | Basic score bonuses |
| Uncommon Exploits | 60-90 coins | Conditional effects |
| Rare Exploits | 100-150 coins | Powerful synergies |
| Legendary Exploits | 180-250 coins | Game-changing abilities |
| Blessings | 15-40 coins | Tactical modifiers |
| Curse Removal | 60-120 coins | Escalating cost |
| Hand Size +1 | 80 coins | Permanent upgrade |
| Shuffle +1 | 40 coins | Extra resource |
| Discard +1 | 40 coins | Extra resource |

### **Purchasing Power Analysis**

**Trade 1** (after Fear 1): **75 coins available**
- Can buy: 2-3 weak items OR 1 decent item OR save for later
- Examples: 2 common exploits + blessing OR 1 uncommon exploit

**Trade 2** (after Fear 3): **125 coins available**
- Can buy: Mix of decent items OR save for amazing item  
- Examples: 1 rare exploit OR 2 uncommon items

**Trade 3** (after Danger 1): **165 coins available**
- Can buy: 1 amazing item OR multiple decent upgrades
- Examples: 1 legendary exploit OR hand size + rare exploit

**Trade 4** (after Fear 6): **215 coins available**
- Can buy: Build synergies and fine-tune loadout
- Examples: Multiple rare items or legendary + utility

**Trade 5** (after Fear 8): **275 coins available**
- Can buy: Final power spike or complete build optimization
- Examples: Top-tier legendary + support items

---

## 🎯 Scoring System

### **Smoothed Score Goals**
For encounter $i$:
$$\text{ScoreGoal}_i = S_{base} \times (1.25)^{(i-1)} \times D_{mod}$$

Where:
- $S_{base}$: 120 (achievable base score)
- Growth rate: 25% per encounter (smooth progression)
- $D_{mod}$: Danger modifier (1.0 for Fear, 1.2 for Danger, 1.5 for Usurper)

### **Score Goals Table**

| Encounter | Type | Base Goal | Final Goal |
|-----------|------|-----------|------------|
| 1         | Fear | 120       | 120        |
| 2         | Fear | 150       | 150        |
| 3         | Danger| 188       | 225        |
| 4         | Fear | 234       | 234        |
| 5         | Fear | 293       | 293        |
| 6         | Danger| 366       | 439        |
| 7         | Fear | 458       | 458        |
| 8         | Fear | 572       | 572        |
| 9         | Danger| 715       | 858        |
| 10        | Fear | 894       | 894        |
| 11        | Fear | 1118      | 1118       |
| 12        | Danger| 1397      | 1676       |
| 13        | Fear | 1746      | 1746       |
| 14        | Fear | 2183      | 2183       |
| 15        | Usurper| 2728     | 4092       |

### **Scoring Precedence**
1. Compute base score (card face value or foundation multiplier)
2. Apply additive modifiers (sum all +X bonuses)
3. Apply multiplicative modifiers (product of all Nx bonuses)
4. Evaluate special tokens (basePlusBeneath, etc.)

**Foundation Multiplier**: Foundation plays score 2× base value by default

---

## 🎴 Core Vocabulary

- **Deck**: Standard 52-card deck (A=1...K=13), face-down draw pile
- **Hand**: Cards held between draws (default size 5)
- **Discard**: Face-up pile for discarded cards
- **Tableau**: 7 Klondike-style columns for card placement
- **Foundation**: 4 suit-based scoring piles (Ace to King)
- **Encounter**: Single gameplay challenge (Fear/Danger/Usurper)
- **Trial**: Group of 3 encounters (Fear-Fear-Danger)
- **Run**: Complete playthrough (5 trials + final Usurper)

### **Registry Items**
- **Fortune**: Persistent run-level modifier (choose 1, swap after Dangers)
- **Exploit**: Powerful passive/triggered effects (max 4 equipped)
- **Blessing**: Tactical one-time or limited-use modifiers
- **Curse**: Negative modifiers affecting gameplay
- **Fear**: Lightweight encounter modifiers
- **Danger**: Heavyweight multi-effect encounter modifiers
- **Wander**: Narrative choice-based events
- **Feat**: Achievements awarded for completing objectives

---

## 🚀 Ascension System (9 Levels)

### **Ascension Level Effects**

**Level 0** (Base): Normal gameplay

**Level 1 - "Merchant's Tax"**:
- All item costs +20%
- Coin rewards +10%

**Level 2 - "Scarce Resources"**:
- Item costs +40%, Coin rewards +15%
- Starting shuffles: 2 (down from 3)

**Level 3 - "Hostile Markets"**:
- Item costs +60%, Coin rewards +20%
- Trade reroll costs double, 1 less item per trade

**Level 4 - "Cursed Luck"**:
- Item costs +80%, Coin rewards +25%
- Start with 1 random curse, Curse removal +50% cost

**Level 5 - "Diminished Fortune"**:
- Item costs +100%, Coin rewards +30%
- Fortune effects -25%, Hand size starts at 4

**Level 6 - "Twisted Trials"**:
- Item costs +120%, Coin rewards +35%
- Score goals +15%, Dangers gain extra effects

**Level 7 - "Apex Challenge"**:
- Item costs +150%, Coin rewards +40%
- Score goals +30%, Start with 2 curses
- Fortune swap every 2 encounters

**Level 8 - "Master's Gauntlet"**:
- Item costs +200%, Coin rewards +50%
- Score goals +50%, All encounters gain Fear modifiers
- Max hand size: 4

**Level 9 - "Transcendent Ordeal"**:
- Item costs +300%, Coin rewards +75%
- Score goals +100%, Start with 3 curses
- No blessing purchases, Usurper gains 2 extra effects

---

## 🎮 Technical Architecture

### **Registry System**
- **registry/registry.ts**: Unified content registry for all game items
- Registry effects are processed by the effect engine
- Each entry has `id`, `label`, `description`, `type`, `rarity`, `effects`

### **Unified Engine Architecture**
- **engineController.ts**: Central game state and logic dispatcher
- **effectEngine.ts**: Processes all registry effects with built-in handlers
- **moveLogic.ts**: Card movement validation and execution
- **eventSystem.ts**: Event-driven registry effect triggers
- **enhancedScoring.ts**: Implements scoring formula and modifiers

### **UI Components**
- **GameScreen.tsx**: Main game interface with card interactions
- **Card.tsx**: Interactive card component with drag/drop

---



### Registry System
- **registry/registry.ts**: Unified content registry for exploits, blessings, fears, curses, fortunes, wanders, feats. Each entry has `id`, `label`, `description`, `type`, `rarity`, `effects`.
- Registry effects are pure functions processed by the unified engine architecture.
- Registry entries include comprehensive effect definitions with conditions, actions, and targets.

### Unified Engine Architecture
- **src/engine/**: Single unified engine directory with auto-configuration
- **engineController.ts**: Central game engine with registry effects processing and active effect filtering
- **enhancedScoring.ts**: Coronata scoring system with registry integration
- **effectEngine.ts**: Built-in handlers for registry effects (award_score, award_coin, modify_setting, etc.)
- **App.jsx**: Main app flow, loads exploits from registry and initializes EngineController

### UI Components
- **GameScreen.tsx**: Main game interface with responsive design
- **PlayerHUD.tsx**: Game status display with encounter info, progress bar, and resources
- **TradeScreen.tsx, WanderScreen.tsx**: Trading and wandering interfaces
- **HowToPlay.tsx**: Game tutorial and rules explanation

---
- **engine.js**: Executes tasks, loads agents, integrates registry.
- **registry/tasks.yaml**: Declarative agent workflow definitions.
- **Content Agents**: ExpanderAgent, CompressorAgent, ParaphraseAgent, ToneAgent.
- **Development Agents**: CoreLogicAgent, RefinerAgent, TestGeneratorAgent, DocumentationAgent.
- Agents run automatically via git hooks and npm scripts:
  - ValidatorAgent: post-test

---
- **Testing**:
  - Playwright: E2E tests in `tests/*.spec.ts`
  - AI Agents: ValidatorAgent runs post-test, CritiqueAgent pre-commit, FactCheck/Style/Translator pre-push
- **Manual agent runs**: CLI and npm scripts for targeted validation.

---

## Scoring Goals System
- **scoreGoals.ts**: Implements Real Master Doc formula for encounter scoring goals.
- **reducer.ts**: Sets `currentEncounterGoal` at encounter start.
- **GameEngine HUD**: Displays goal and progress bar.
- **Testing**: UI testing blocked by reference errors in GameEngine.tsx (structure now mostly fixed, reference errors remain).

---

## Current State & Recommendations

- **Registry Effects System**: Core implementation complete with active effect filtering and scoring integration
- **UI Components**: PlayerHUD fixed with proper encounter info layout, GameScreen fixed for deck display
- **Unified Engine**: Single /engine/ architecture with auto-configuration and registry processing
- **Trade & Wander**: Existing screens available, may need updates to match current specifications
- **Remaining**: Complete registry effects handlers, coin mechanics, encounter progression

**Recommendations**:
- Complete event-based effect handlers for registry system
- Implement comprehensive coin earning and tracking
- Ensure all registry effects are properly integrated and tested
- Validate encounter progression and scoring mechanics

---

## File Patterns & Integration Points

- Registry content: Unified registry in `src/registry/registry.ts` with comprehensive effect definitions
- Game logic: Registry effects processed by unified engine architecture in `src/engine/`
- State mutations: Handled by EngineController and effect engine
- Effect handling: Registry effects processed with condition checking and active filtering
- Build system: Vite with React plugin and TypeScript support
- Registry loading: App.jsx imports and initializes exploits from registry
- Engine integration: EngineController processes active effects and applies during gameplay

---

## Onboarding & Best Practices
- Review this Master Doc for architecture, workflow, and agent integration.
- Use npm scripts and CLI for agent validation and testing.
- Keep registry content modular and pure.
- Validate all changes through appropriate agents before committing.
- Update `.env` with required API keys for agent functionality.

---

## Last Updated
September 29, 2025

---

This Master Doc is complete, current, and accurate. For any new features, agent additions, or registry updates, follow the patterns and workflows described above.
# Coronata — The Rulebook, Reference, and Design Guide (Unified Edition)

## Version: 2.1 (Unified)

Last updated: 2025-09-23

This document merges the most up-to-date, structured, and implementation-focused content from the 2025 master doc with the detailed explanations, examples, and explicit board/UI descriptions from the 1.0 doc. All rules, terminology, and design guidance are preserved, clarified, and unified for players, designers, and developers. 

**Note:** All win/loss logic and registry effects are now handled by state and the effect engine (`effectEngine.ts`). Legacy modules such as WinConditions, RegistryEngine, and ScoringEngine have been removed from the codebase and are no longer referenced in the implementation or documentation.

---

## Table of Contents

- Introduction
- Audience and Scope
- Core Concepts and Vocabulary
- Game Structure and Flow
- Detailed Rules and Board/UI Descriptions
- Registry Categories (Exploits, Fortunes, Blessings, Curses, Fears, Dangers, Wanders, Feats)
- Effects and Conditions (Engine Contract, Rule Language)
- Scoring and Coin (Precedence, Formula, Examples, Scaling)
- Trade, Wander, Gamble, Shop: How Offers Work
- UX and Expected Interactions
- Accessibility and Feedback
- Persistent Progress, Feats, and Run History
- Balancing, Difficulty Curves, and Tuning Recommendations
- Playtesting Checklist and Tests to Include
- Glossary of Registry Keys and Tokens
- Appendix, AI Handover, and Schema
- Advanced Developer & AI Handover Sections

---

## Introduction


Coronata is a solitaire-roguelike that builds on Klondike-style patience. Each run is a short campaign: trials of encounters modify the base solitaire game with narrative and mechanical twists. The game is driven by a data-first registry: items, threats, and events are described in a content registry and interpreted by the game engine. All win/loss logic and registry effects are now handled directly by state and the effect engine (`effectEngine.ts`). Legacy modules such as WinConditions, RegistryEngine, and BoardEngine have been removed from the codebase and are no longer referenced in the implementation or documentation.

### Audience and Scope

- **Players:** This doc explains the rules and UX so someone who has never seen Coronata can play and understand mechanics and goals.
- **Designers:** Clarifies how registry entries must be authored and what behaviors are expected from the engine.
- **Developers:** Describes the contract the engine must implement to evaluate effects and conditions.

This document is the canonical, long-form guide to Coronata. It describes essential rules, terminology, expected user flows, registry contracts, and design guidance for players, designers, and developers. It is updated to reflect the latest scoring, registry, and gameplay systems.

---

## Core Concepts and Vocabulary

- **Deck:** Standard 52-card deck (A=1 ... K=13). The face-down stack of cards to draw from.
- **Hand:** Default size 5. Cards held between draws. Playing a card to tableau or foundation immediately triggers a refill draw (if the deck has cards and drawing is permitted).
- **Discard pile:** Face-up pile of discarded cards. When the deck is exhausted, the discard pile becomes the deck after a shuffle (costs 1 shuffle resource).
- **Tableau:** Klondike-style columns. Placement rules can be modified by registry effects. Cards placed here may score differently than foundation plays.
- **Foundation:** Scoring area with stricter placement rules; foundation plays score higher (default 2× base value).
- **Encounter:** A single, contained gameplay challenge (either a Fear or a Danger) where special rules from the registry apply.
- **Trial:** A group of 3 Encounters (Fear, Fear, Danger). A typical run contains 3 Trials.
- **Run:** The entire playthrough from start (Fortune selection) to final Usurper (boss).
- **Fortune:** A persistent, run-level modifier chosen at run start and optionally replaced after Dangers.
- **Exploit:** A persistent item with passive or triggered effects for the run (max 4 equipped).
- **Blessing:** A tactical, often one-time modifier that attaches to a card or triggers once.
- **Curse:** A negative modifier applied to the player during a run or encounter.
- **Fear:** A lightweight encounter modifier applied to Fear encounters.
- **Danger:** A heavyweight encounter modifier applied to Danger encounters (often multi-effect).
- **Wander:** A narrative event (choice-based) that yields deterministic outcomes.
- **Feat:** A trackable achievement awarded when a player meets specific in-run objectives.

---

## Game Structure and Flow

Each run proceeds through a series of Trials and Encounters, with persistent and encounter-level modifiers shaping the experience. The canonical flow is as follows:

1. **Start a Run:**
   - Player chooses 1 Fortune (from 3 random options) before the first encounter.
   - The deck is fully shuffled and the player's hand is drawn up to the configured hand size (default 5).

2. **Trials and Encounters:**
   - Each run contains 3 Trials.
   - Each Trial contains 3 Encounters: Fear, Fear, Danger (in that order).
   - After each Fear (and before the next Fear), the player chooses one of three options: Trade, Wander, or Gamble. Trade offers a controlled shop interaction; Wander is a narrative event with choices; Gamble is a skip option that grants a 25% scoring bonus.
   - After a Danger, the player is offered a new set of Fortunes and may choose to swap the current Fortune.

3. **End of Run:**
   - After completing all Trials, the player faces a Final Usurper (end boss). Completing the final encounter finalizes scoring and awards Feats.

**Clarifications and Details:**

- The deck is shuffled at the start of the run and again before each encounter to ensure a fresh random order.
- Drawing a card (including automatic draw to refill hand) always takes from the top of the deck.
- Deck click behavior: Clicking the deck reveals the top card and places it on the discard pile. Repeated clicks reveal the next top card (classic solitaire pattern).
- When the deck is empty and the discard pile contains cards, the player may shuffle the discard pile back into the deck. Each shuffle consumes one shuffle resource (default 3 per encounter).
- Discard Hand: The UI supports an explicit 'Discard Hand' action that takes your entire current hand, places it back on top of the deck, shuffles, then draws a fresh hand of the same size. Using this action consumes one discard resource (default 3 per encounter).
- The discard pile remains visible unless a Curse or Fear explicitly hides it.
- Foundation and Tableau placement follow Klondike-style rules unless overridden by registry effects. Foundation plays score higher (by default, 2× base value for the first play).
- Invalid moves are not allowed and should provide clear UI feedback (card shake or highlight). The engine must not accept illegal plays.

---

## Detailed Rules and Board/UI Descriptions

### Deck, Draws, and Shuffle Behavior

- **Deck composition:** Standard 52 cards.
- **Initial shuffle:** The deck is shuffled at the start of the run and again before each encounter to ensure fresh random order for that encounter.
- **Drawing:** When a card is drawn (including automatic draw to refill hand), it is taken from the top of the deck.
- **Deck click behavior:** Clicking the deck reveals the top card and places it on the discard pile. Repeated clicks reveal the next top card (classic solitaire pattern).
- **Exhausted deck:** When the deck is empty and the discard pile contains cards, the player may shuffle the discard pile back into the deck. Each shuffle consumes one shuffle resource (default 3 per encounter).
- **Shuffles:** Default shuffles per encounter is 3. Certain effects can grant or consume extra shuffles.

### Hand and Discards

- **Hand size:** Default is 5. Playing a card to tableau or foundation immediately triggers a refill draw (if the deck has cards and drawing is permitted).
- **Discard action:** The UI supports an explicit "Discard Hand" action that takes your entire current hand, places it back on top of the deck, shuffles, then draws a fresh hand of the same size. Using this action consumes one discard resource (default 3 per encounter).
- **Discard pile visibility:** The discard pile remains visible unless a Curse or Fear explicitly hides it.

### Tableau and Foundation Rules

- **Tableau placement:** Follows typical Klondike-style placement unless an effect overrides these rules. Some registry entries allow free tableau placement or change placement logic.
- **Foundation placement:** Foundations often have stricter suit or ascending rules; foundation plays score higher (by default, 2× base value for the first play).

### Move Resolution and Invalid Actions

- Invalid moves are not allowed and should provide clear UI feedback (card shake or highlight). The engine must not accept illegal plays.

### Board Layout and User Interface

- The play area is organized into three horizontal rows for clarity and classic solitaire feel:
    1. **Top row:** Deck (face-down stack), Waste (face-up discard pile), and Foundations (one for each suit).
    2. **Middle row:** Hand (each card displayed as a separate pile).
    3. **Bottom row:** Tableau columns (seven columns, each a vertical pile).
- **Deck and Waste piles are visually stacked:** All cards in these piles overlap in the same spot, with a solid background to prevent cards underneath from showing through.
- **The tableau row background is transparent:** Only the cards and their piles are visible against the page background.
- **Debug overlays and developer tools are not present in the production UI.**
- **The rest of the board background uses a casino-green color for thematic consistency.**
- **All controls and counters remain visible and accessible as described below.**

---

## Registry Categories, Effects, and Engine Contract

### Registry Categories

- **Exploits:** Persistent run items (max 4 equipped). Passive or triggered effects.
- **Fortunes:** Run-defining modifiers (1 active, can swap after Dangers).
- **Blessings:** Tactical, often one-time modifiers. Attach to cards or trigger once.
- **Curses:** Negative modifiers; restrict actions or impose costs.
- **Fears:** Encounter-scoped light modifiers.
- **Dangers:** Encounter-scoped heavy modifiers (multi-effect).
- **Wanders:** Narrative events with choices and deterministic outcomes.
- **Feats:** Trackable achievements, awarded for in-run objectives.

### Effects and Conditions (Engine Contract)

**Effect Object Structure:**
- `action`: Operation (gain, lose, draw, discard, modify, block, restrict, require, return, skip, reveal, transfer, shuffle, unlock, override, allow, etc.)
- `target`: Domain (coin, score, handSize, shuffleCount, discards, tableau, foundation, deck, card, pile, play, suit, scoreTarget, event, etc.)
- `value`: Numeric, modifier string ("2x", "0.5x"), special token ("basePlusBeneath"), etc.
- `condition`: Predicate for when effect applies (phase, location, event, etc.)
- `duration`, `meta`: Optional

**Evaluation Semantics:**
- Conditions are checked first. The engine implements a `passesCondition(condition, context)` function. `context` includes current phase (start, draw, play, discard, score), the card involved, current location, source and target of moves, and run-level state (active Fortune/Exploits/Curses).
- Additive modifiers are summed, then multiplicative, then special tokens.
- Effects triggered by the same event are evaluated in a deterministic order: registry-specified order, then global deterministic tie-break (internal id order).
- For scoring, additive modifiers are applied first, then multiplicative modifiers, then special tokens.

**Supported Effect Families:**
- gain / lose: change numeric resources like coin or counters.
- draw / discard: move cards between zones.
- modify: change numeric properties like handSize, shuffleCount, discards, score, shuffleLimit.
- block / restrict / require: prevent or restrict certain plays or actions.
- return / transfer / reveal / shuffle / unlock / override: various structural effects that manipulate card positions, visibility, or rules.

**Registry Entry Examples:**
```json
{
  "id": "feat-foundation-flush",
  "label": "Foundation Flush",
  "type": "feat",
  "description": "Play five cards to the foundation in a single encounter.",
  "effects": [
    { "action": "award_score", "value": 100 },
    { "action": "award_coin", "value": 25 },
    { "action": "modify_setting", "target": "shufflesLeft", "value": 1, "priority": 0 }
  ]
}
{
  "id": "blessing-midas-touch",
  "label": "The Midas Touch",
  "type": "blessing",
  "description": "Foundation play scores 4× base value.",
  "effects": [
    { "action": "score_multiplier", "target": "foundation", "value": 4 }
  ]
}
{
  "id": "wander-forked-road",
  "label": "The Forked Road",
  "type": "wander",
  "choices": [
    { "label": "Left", "effects": [ { "action": "award_coin", "value": 10 } ] },
    { "label": "Right", "effects": [ { "action": "draw_cards", "value": 2 } ] }
  ]
}
```

---

## Scoring, Coin, and Worked Examples

### Scoring Precedence and Formula

Scoring is resolved in the following order:
1. Compute base score for the move (e.g., card face value or foundation multiplier).
2. Apply additive modifiers (sum all additive deltas from Fortunes, Exploits, Blessings, etc.).
3. Apply multiplicative modifiers (product of all multiplicative factors).
4. Evaluate special tokens or contextual expressions (e.g., `basePlusBeneath`).

**Foundation Multiplier:** Foundation plays score higher (default 2× base value, can be increased by registry effects).

**Scoring Formula:**
For encounter $i$:
$$
	ext{ScoreGoal}_i = (S_{base} + A_{add} \times N_{plays}) \times M_{mult} \times P_{enc} \times D_{mod}
$$

Where:
- $S_{base}$: 273 (75% of max possible score)
- $A_{add}$: Additive bonus per play
- $M_{mult}$: Multiplier
- $N_{plays}$: Number of scoring plays (20–25)
- $P_{enc}$: Encounter scaling
- $D_{mod}$: Danger modifier

**Score Goal Table:**
| Encounter | Score Goal (rounded) |
|-----------|---------------------|
| 1         | 112                 |
| 2         | 149                 |
| 3         | 224                 |
| 4         | 769                 |
| 5         | 878                 |
| 6         | 988                 |
| 7         | 3511                |
| 8         | 3830                |
| 9         | 4022                |
| 10        | 5107                |

**Worked Example:**
Suppose a 7 is played to tableau. Active modifiers:
- Fortune grants +2 additive on tableau plays.
- Exploit grants 2× on tableau plays.
- Blessing on the card grants `basePlusBeneath` (base + value beneath = 7 + 6 = 13).

Evaluation:
1. base = 7
2. additive: 7 + 2 = 9
3. multiplicative: 9 × 2 = 18
4. If `basePlusBeneath` replaces base, then base = 13, additive: 13 + 2 = 15, multiplicative: 15 × 2 = 30

---

## Trade, Wander, Gamble, Shop: How Offers Work


### Trade (Updated)

- After each Fear encounter, the player may choose Trade.
- Trade window offers:
  - 4 Exploits (randomly drawn, not already equipped; appearance chance based on rarity)
  - 3 Blessings (randomly drawn)
  - 2 Curses (randomly drawn)
  - Run upgrades: +1 hand size, +1 shuffle count, or +1 discard (for the rest of the run, purchasable)
  - Curse removal: Pay to remove up to 2 Curses per visit (cost escalates with each removal)
  - Reroll: Pay to reroll the offered items (cost escalates with each reroll)
  - Unlocks: Some exploits, fears, and dangers only appear after the player completes the feat that unlocks them
  - Sell Exploits: Player may sell equipped exploits for coins at a reduced value (less than purchase price)

- Exploits already equipped cannot appear for purchase.
- Shop inventory is randomly generated per visit, with rarity affecting appearance rates (Common: 50%, Uncommon: 30%, Rare: 15%, Legendary: 5%).
- Selling exploits is allowed; sale price is lower than purchase price.
- Coins are not offered for direct purchase, but are gained by selling exploits or as event rewards.

- There is no maximum number of exploits a player can equip.

- After leaving the trade window, the player returns to the main encounter flow (next encounter or post-encounter choice). Purchased items are added to inventory/equipped. Shop inventory may refresh for future trades.

### Wander

- Narrative event with deterministic outcomes.
- Typically presents two or more options (e.g., gain coin, draw, receive an item, gain a curse, etc.).
- Choices and outcomes are defined in the registry and may trigger further events or effects.

### Gamble

- Continue to the next encounter without trading or wandering.
- Gain a 25% bonus multiplier to scoring for that encounter only.
- This is a "skip" option that provides a scoring reward for bypassing Trade and Wander opportunities.

### Shop

- Shop is available after certain encounters (usually after Dangers or as a Trade option).
- Player may buy registry entries (Blessings, Exploits, etc.), shuffles, or upgrades using coins.
- Shop offers, prices, and reroll costs are registry-driven and may scale with run progress.

---

## UX, Accessibility, and Feedback








- The board displays: deck, discard pile, hand, tableau, foundation, score, coin, shuffles left, discards left, current Fortune, active Exploits (unlimited), and a compact view of active Curses, Fears, and Dangers.


  - Shuffle control becomes active when deck is empty and discard contains cards (consumes a shuffle resource).


- Exploits, Fears, and Dangers do not repeat in a run unless registry logic allows.



- Invalid moves must produce an unambiguous visual and audio cue (shake, red glow, and short text tooltip).


---




- Progress is tracked per-account and affects all future runs (e.g., new starting Fortunes or available Blessings).
- Certain powerful items or effects may be restricted to prevent imbalance.



- Each Feat has a coin and score reward, and some may unlock new registry entries.

```json
{
  "id": "feat-foundation-flush",


  "description": "Play five cards to the foundation in a single encounter.",



}


- After each run, players receive a detailed breakdown of their performance, including score, coin earned, Feats completed, and registry entries unlocked.
- The history log allows players to review past runs, re-examine choices, and learn from mistakes.






- The game should offer multiple difficulty levels or adjustable parameters to cater to different player skill levels and preferences.



- Use playtests to tune Fortune/Exploit power. Prefer small, incremental modifiers (e.g., +1 coin on tableau) over large, complex transforms.





- Verify all rules and mechanics function as described, with particular attention to edge cases or complex interactions.
- Confirm that scoring, coin, and resource systems are working and balanced.
- Ensure all registry categories (Fortunes, Blessings, Exploits, etc.) are properly implemented and have meaningful impact.
- Test with varying numbers of players (if applicable) to ensure scaling works correctly.
- Validate all user interface elements are clear, functional, and accessible.
- Check that all audio and visual feedback cues are working and appropriately timed.
- Ensure the game is playable with keyboard navigation alone, and that all controls are reachable and usable.
- Test screen reader compatibility with all relevant UI elements and modals.
- Verify that high-contrast and other accessibility options function as intended.
- Deck/discard/shuffle mechanics:
  - Draw until deck exhausted, shuffle cost consumed, deck refilled from discard, state counters updated.
  - Discard hand behavior consumes discards and refills the hand.
- Scoring tests: additive + multiplicative + special tokens.
- Registry validation tests: every entry has id, label, and well-formed effects.
- Edge cases to test:
  - Conflicting effects (two effects change same setting).
  - Resource exhaustion (draw when deck empty).
  - Ordering ties (two additive modifiers).
  - Wanders with nested choices that themselves trigger wanders.
  - Effects that reference non-existent items (e.g., remove blessing not owned).

### Glossary of Registry Keys and Tokens

- **Keys:**
  - `baseScore`: The base score value of a card or action, before modifiers.
  - `additiveModifier`: A flat bonus or penalty applied to a score or value.
  - `multiplicativeModifier`: A factor by which a score or value is multiplied.
  - `scoreGoal`: The target score for an encounter or objective.
  - `shuffleCount`: The number of times the deck has been shuffled.
  - `discardCount`: The number of cards in the discard pile.
- **Tokens:**
  - `basePlusBeneath`: The base value plus the value of the card beneath (if any).
  - `nextCardValue`: The value of the next card to be drawn, if known.
  - `currentPhase`: The current phase of the game (e.g., draw, play, discard, score).
  - `activeFortune`: The currently active Fortune and its effects.
  - `exhausted`: A condition indicating the deck has no cards left to draw.

---

## Appendix, AI Handover, and Schema

### Default Values and Design Decisions

- **Hand size:** 5
- **Deck shuffles per encounter:** 3
- **Discard resources per encounter:** 3
- **Foundation base score multiplier:** 2×
- **Default coin rewards for Feats:** 50, 100, 200 (scaling with difficulty)
- Foundation plays score higher by default to encourage strategic use of the foundation.
- The discard pile is always visible to provide information and strategic options, unless explicitly hidden by an effect.
- Invalid moves are not allowed and must provide clear feedback to the player.
- Interest rate per encounter: 20% (applied to coins at the end of each encounter).

### Handover & Release Checklist

- Ensure all registry entries are complete, validated, and tested.
- Verify effects, conditions, and durations are correctly implemented and documented.
- Confirm scoring formula and precedence are correctly applied.
- Check new UI elements, modals, and HUD components are integrated and functional.
- Registry validator passes on registry file.
- All tests pass.
- Demo: runnable local playthrough of a sample encounter.
- README with run/build/test instructions.

### Developer Quickstart

**Setup:**
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Use `npm run dev` to start the development server.
4. Use `npm run test` to run tests.
5. Use `npm run validate:registry` to validate registry entries.

**Registry Authoring Guide:**
- Add new entries to `src/registry-new.ts`, `src/registry-part2.ts`, or `src/registry-part3.ts`.
- Ensure each entry has `id`, `label`, `type`, and well-formed `effects`.
- Validate new entries with the registry validator before committing.

**Change Log:**
- Track major changes in the change log section.

**Troubleshooting:**
- If validation fails, check schema compliance and effect structure.
- For UI issues, verify HUD and modal integration.

**Contact:**
- Maintainer: getopod
- Contact: [your email or preferred contact method]

### Handover Schema and Example Entries

```json
{
  "registry": {
    "fortunes": [...],
    "blessings": [...],
    "exploits": [...],
    "curses": [...],
    "fears": [...],
    "dangers": [...],
    "wanders": [...],
    "feats": [...]
  },
  "scoring": {
    "baseScore": 273,
    "additivePerPlay": 10,
    "multiplicativeBase": 2,
    "encounterScaling": [1.0, 1.1, 1.2, 1.3],
    "dangerModifier": 0.9
  },
  "ui": {
    "handSize": 5,
    "deckShuffles": 3,
    "discardResources": 3,
    "foundationMultiplier": 2
  }
}
```

#### Example Registry Entries

- **Feat Example:**

```json
{
  "id": "feat-foundation-flush",
  "label": "Foundation Flush",
  "type": "feat",
  "description": "Play five cards to the foundation in a single encounter.",
  "effects": [
    { "action": "award_score", "value": 100 },
    { "action": "award_coin", "value": 25 },
    { "action": "modify_setting", "target": "shufflesLeft", "value": 1, "priority": 0 }
  ]
}
```

- **Blessing Example:**

```json
{
  "id": "blessing-midas-touch",
  "label": "The Midas Touch",
  "type": "blessing",
  "description": "Foundation play scores 4× base value.",
  "effects": [
    { "action": "score_multiplier", "target": "foundation", "value": 4 }
  ]
}
```

- **Wander Example:**

```json
{
  "id": "wander-forked-road",
  "label": "The Forked Road",
  "type": "wander",
  "choices": [
    { "label": "Left", "effects": [ { "action": "award_coin", "value": 10 } ] },
    { "label": "Right", "effects": [ { "action": "draw_cards", "value": 2 } ] }
  ]
}
```

#### Minimal Sample Game-State JSON

```json
{
  "playerId": "player1",
  "handSize": 5,
  "shufflesLeft": 3,
  "discardsLeft": 3,
  "deckCount": 40,
  "discardCount": 0,
  "coins": 0,
  "score": 0,
  "activeBlessings": [],
  "activeCurses": [],
  "encounter": { "fortunes": [], "dangers": [], "blessings": [] }
}
```

#### Engine Contract & Implementation Notes

- `applyEffects(registryEntry: RegistryEntry, ctx: EngineContext): { ctx: EngineContext, events: EngineEvent[] }` — pure function preferred; returns new context and event list for UI.
- `evaluateCondition(cond: string, ctx: EngineContext): boolean`
- `resolveValue(valueToken: string | number, ctx): number`
- All registry entries must have `id`, `label`, `type`.
- Strict dev-mode: validator runs on project start + CI.
- Runtime unknown action: log warning + no-op (optionally hard-fail in CI).
- Add `schemas/registry.schema.json` and validate `src/registry.ts`.
- Implement UI event consumers to animate events.
- Add tests and add CI job to run `npm test` and registry validation.
- Produce demo script: `npm run demo` that runs a headless encounter and prints events.

---


[Clarification Added]: Players may only draw one card per turn.

---

## Advanced Developer & AI Handover Sections

### Registry Schema Summary

All registry entries must conform to the following schema (see `schemas/registry.schema.json`):
- `id` (string, required)
- `label` (string, required)
- `type` (string, required: exploit, fortune, blessing, curse, fear, danger, wander, feat)
- `description` (string)
- `effects` (array of effect objects, required)
- `rarity`, `category`, `completed`, `tags`, `choices`, `results`, `visibility` (optional)

Each effect object must have:
- `action` (string, required)
- `target` (string, required)
- `value`, `condition`, `duration`, `meta` (optional)

### Registry Validation Instructions

Validate registry entries using the schema:
- Run: `npm run validate:registry` or use `registryValidator.ts`
- All entries must pass validation before release.

### Test Coverage Reference

Test files are in `src/__tests__/` and `tests/`. Coverage includes:
- Engine contract and effect resolution
- Registry entry validation
- UI and accessibility
- Edge cases and error handling

### Content Expansion Guidelines

When generating new registry entries:
- Maintain balance in rarity and effect types
- Feats must never upgrade player abilities
- Narrative tone should match existing entries
- Validate all new entries before adding

### Versioning and Change Log

Track major changes to rules, registry, or engine contract in this section.
- [2025-09-23] Unified doc, registry overhaul, engine contract update
- [Add future changes here]

### Integration Points

Registry entries are defined in:
- `src/registry-new.ts`, `src/registry-part2.ts`, `src/registry-part3.ts`, `Current Registry.json`
- Engine loads/merges these files at runtime
- UI reads registry for modals, HUD, and gameplay logic

### Known Issues / TODOs

- [List any current limitations, bugs, or areas for improvement]
- [Add future TODOs here]

### Maintainer / Contact Info

- Maintainer: getopod
- Contact: [your email or preferred contact method]

### AI Handover Instructions

- Use this document and registry files to generate a new, fully-compliant version of Coronata
- Follow schema and validation requirements
- Maintain all design constraints and gameplay balance
- Add new content only after validating and testing
- Update change log and known issues as needed