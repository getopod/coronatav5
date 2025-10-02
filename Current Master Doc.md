# Coronata Master Doc
#
## Essential Implementation & Deployment Checklist

This section lists everything required to build, test, and deploy Coronata from scratch, ensuring no ambiguity or missing pieces for developers, designers, and AI agents.

---

### 1. Game Design & Rules
- Complete gameplay rules, win/loss conditions, and edge cases
- Scoring system details, including formulas and encounter goals
- Full glossary of terms and mechanics

### 2. Registry Content
- Schema for all registry types (exploits, blessings, curses, fortunes, fears, dangers, wanders, feats)
- Example entries for each type
- At least one full set of content for a playable run
- Balancing guidelines for rarity, effect strength, and encounter difficulty

### 3. Effect Engine Contract
- Function signatures, context, and expected output for effects
- List of supported actions and conditions
- Example effect implementations and test cases

### 4. Game State & Actions
- TypeScript interfaces for all state objects
- List and description of all reducer actions and payloads
- Example state transitions for key actions

### 5. UI/UX Specifications
- Wireframes or mockups for all screens and modals
- Component breakdowns and interaction flows
- Accessibility requirements (contrast, ARIA, keyboard navigation)
- Animation and feedback guidelines

### 6. Asset Manifest
- List of required images, icons, sounds, and fonts
- File naming conventions and recommended formats
- Licensing notes for third-party assets

### 7. Agent System
- Table of all agents, their responsibilities, and trigger points
- Example agent output/report for code, docs, and registry validation
- Instructions for adding new agents

### 8. Testing & Validation
- List of required unit, integration, and E2E tests
- Acceptance criteria for each major feature
- Manual QA steps for pre-release validation
- Agent validation workflow

### 9. Deployment Instructions
- Step-by-step guide for building and deploying (Vite, hosting, environment variables, API keys)
- Example `.env` file with all required keys and secrets
- Production optimization notes

### 10. Backend/API Contract (if needed)
- API endpoints, payloads, and authentication for persistent features
- Example server implementation or mock API responses

### 11. Localization/Internationalization
- How to add new languages (UI string files, agent translation workflow)
- Example translation file and process

### 12. Maintenance & Update Workflow
- How to update registry content, agents, or game logic post-launch
- Versioning and change log conventions

### 13. Security & Privacy
- Handling of user data, API keys, and agent fallbacks
- Recommendations for securing deployment and agent API calls

### 14. Troubleshooting & Support
- Common setup/build/deployment errors and solutions
- How to report bugs or request features

### 15. Release & Change Log
- Section for tracking major changes, releases, and migration notes

### 16. Advanced Developer Notes
- Performance optimization tips
- Accessibility best practices
- Security considerations

---

## Project Overview
Coronata is a modular, AI-powered solitaire card game built with TypeScript and React. It features a robust agent system for automated validation, content registry, and a comprehensive CI/CD pipeline for game logic verification.

---



### Registry System
- **registry.ts (+ registry-new/part2/part3)**: Modular content registry for exploits, blessings, fears, curses, fortunes. Each entry has `id`, `name`, `description`, `rarity`, `effect`.
- Registry effects are pure functions, explicit state return.
- Registry content split across three files; always update all when adding content.

- **App.tsx**: Main app flow (welcome → fortune selection → game engine).
- **GameEngine.tsx**: Main game UI, hosts HUD, modals (trade, shop, glossary), and encounter goal/progress bar.
- **TableauColumn.tsx**: Drag-and-drop card interaction.
- **Modal Components**: TradeModal.tsx, WanderModal.tsx, RunHistoryModal.tsx, RunStatsModal.tsx for trading, wandering, run history, and run stats.

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
- **Trade, Wander, Run History, Run Stats**: Complete and integrated.
- **Scoring goals**: Formula and HUD integration complete; UI testing blocked by reference errors.
- **Run history logic**: Commented out due to type errors.
- **Remaining**: Blessing indicators, HUD expansion, encounter progression, feat tracking.
- **Recommendations**:
  - Fix remaining reference errors in GameEngine.tsx to enable UI testing.
  - Ensure all registry and effect logic remains pure and modular.
  - Continue agent-driven validation for all major features.

---

## File Patterns & Integration Points
- Registry content: Always update all three registry files when adding game content.
- Game logic: Changes to `heuristics.ts` automatically trigger ValidatorAgent.
- State mutations: Only via reducer actions.
- Effect handling: Registry effects must be pure functions with explicit state return.
- Vite: Build system with React plugin and TypeScript support.
- OpenAI API: All agents require `OPENAI_KEY` environment variable.
- Git hooks: Husky integration for automated agent execution.
- CLI: `cli/coronata.js` provides programmatic access to agent system.

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