// Klondike Solitaire core logic (shared between web, desktop, and mobile)

// Card suits and ranks
export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Card object
export function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false });
    }
  }
  return deck;
}

// Shuffle deck
export function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Initial Klondike Solitaire setup
export function dealSolitaire(deck) {
  const tableau = Array(7).fill().map(() => []);
  let deckIndex = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[deckIndex++];
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }
  const stock = deck.slice(deckIndex);
  return { tableau, stock, waste: [], foundations: [[], [], [], []] };
}

// Move card logic, win check, etc. can be added here
// Helper: get card color
export function getCardColor(card) {
  return (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
}

// Helper: get rank index
export function getRankIndex(card) {
  return RANKS.indexOf(card.rank);
}

// Validate move from tableau to tableau
export function canMoveTableauCard(card, destPile) {
  if (destPile.length === 0) {
    return card.rank === 'K'; // Only Kings can be placed on empty tableau
  }
  const top = destPile[destPile.length - 1];
  return getCardColor(card) !== getCardColor(top) && getRankIndex(card) === getRankIndex(top) - 1;
}

// Validate move to foundation
export function canMoveToFoundation(card, foundation) {
  if (foundation.length === 0) {
    return card.rank === 'A'; // Only Aces can be placed on empty foundation
  }
  const top = foundation[foundation.length - 1];
  return card.suit === top.suit && getRankIndex(card) === getRankIndex(top) + 1;
}

// Move card from tableau to tableau
export function moveTableauToTableau(tableau, fromCol, cardIdx, toCol) {
  const movingCards = tableau[fromCol].slice(cardIdx);
  if (!canMoveTableauCard(movingCards[0], tableau[toCol])) return false;
  tableau[toCol] = tableau[toCol].concat(movingCards);
  tableau[fromCol] = tableau[fromCol].slice(0, cardIdx);
  // Flip next card if needed
  if (tableau[fromCol].length && !tableau[fromCol][tableau[fromCol].length - 1].faceUp) {
    tableau[fromCol][tableau[fromCol].length - 1].faceUp = true;
  }
  return true;
}

// Move card from tableau to foundation
export function moveTableauToFoundation(tableau, col, foundations) {
  const card = tableau[col][tableau[col].length - 1];
  for (let i = 0; i < foundations.length; i++) {
    if (canMoveToFoundation(card, foundations[i])) {
      foundations[i].push(card);
      tableau[col].pop();
      // Flip next card if needed
      if (tableau[col].length && !tableau[col][tableau[col].length - 1].faceUp) {
        tableau[col][tableau[col].length - 1].faceUp = true;
      }
      return true;
    }
  }
  return false;
}

// Move card from waste to tableau
export function moveWasteToTableau(waste, tableau, toCol) {
  const card = waste[waste.length - 1];
  if (canMoveTableauCard(card, tableau[toCol])) {
    tableau[toCol].push(card);
    waste.pop();
    return true;
  }
  return false;
}

// Move card from waste to foundation
export function moveWasteToFoundation(waste, foundations) {
  const card = waste[waste.length - 1];
  for (let i = 0; i < foundations.length; i++) {
    if (canMoveToFoundation(card, foundations[i])) {
      foundations[i].push(card);
      waste.pop();
      return true;
    }
  }
  return false;
}

// Draw card from stock to waste
export function drawFromStock(stock, waste) {
  if (stock.length === 0) return false;
  const card = stock.pop();
  card.faceUp = true;
  waste.push(card);
  return true;
}

// Reset stock from waste (when stock is empty)
export function resetStockFromWaste(stock, waste) {
  while (waste.length) {
    const card = waste.pop();
    card.faceUp = false;
    stock.unshift(card);
  }
}

// Check win condition
export function checkWin(foundations) {
  return foundations.every(f => f.length === 13);
}

// Classic scoring system

// Face value scoring system
export function getInitialScore() {
  return 0;
}

// Helper: get card face value
export function getCardFaceValue(card) {
  const idx = RANKS.indexOf(card.rank);
  return idx === 0 ? 1 : idx + 1; // Ace = 1, 2 = 2, ..., K = 13
}

// Track which cards have scored
export function updateScoreForPlay(card, score, playedTableau, playedFoundation) {
  const key = card.suit + card.rank;
  if (!playedTableau.has(key)) {
    score += getCardFaceValue(card);
    playedTableau.add(key);
  }
  return score;
}

export function updateScoreForFoundation(card, score, playedFoundation) {
  const key = card.suit + card.rank;
  if (!playedFoundation.has(key)) {
    score += getCardFaceValue(card) * 2;
    playedFoundation.add(key);
  }
  return score;
}

// Auto-move eligible cards to foundations
export function autoMoveToFoundation(tableau, waste, foundations) {
  let moved = false;
  // Try tableau cards
  for (let col = 0; col < tableau.length; col++) {
    if (tableau[col].length) {
      const card = tableau[col][tableau[col].length - 1];
      for (let i = 0; i < foundations.length; i++) {
        if (canMoveToFoundation(card, foundations[i])) {
          foundations[i].push(card);
          tableau[col].pop();
          if (tableau[col].length && !tableau[col][tableau[col].length - 1].faceUp) {
            tableau[col][tableau[col].length - 1].faceUp = true;
          }
          moved = true;
          break;
        }
      }
    }
  }
  // Try waste card
  if (waste.length) {
    const card = waste[waste.length - 1];
    for (let i = 0; i < foundations.length; i++) {
      if (canMoveToFoundation(card, foundations[i])) {
        foundations[i].push(card);
        waste.pop();
        moved = true;
        break;
      }
    }
  }
  return moved;
}

// Save/load game state (simple JSON serialization)
export function serializeGameState(state) {
  return JSON.stringify(state);
}

export function deserializeGameState(json) {
  return JSON.parse(json);
}

// Statistics tracking
// History tracking
export function getInitialHistory() {
  return { wins: 0, losses: 0, bestScore: 0 };
}

export function updateHistory(history, result, score) {
  if (result === 'win') {
    history.wins += 1;
    if (score > history.bestScore) history.bestScore = score;
  } else if (result === 'loss') {
    history.losses += 1;
  }
  return history;
}

// Feats logic for unlocking card backs
