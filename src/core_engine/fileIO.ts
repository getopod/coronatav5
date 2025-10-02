
/**
 * Cross-platform file IO for game state (browser + Node/Electron).
 *
 * Extensibility:
 * - Supports localStorage in browser, fs in Node/Electron.
 * - Unified API for save/load operations.
 * - Can be extended for other storage backends.
 *
 * Usage:
 *   saveGame(state, keyOrPath);
 *   loadGame(keyOrPath);
 */

import { GameState } from './types';


const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions?.node;

/**
 * Save game state to storage.
 * @param state GameState to save
 * @param keyOrPath Storage key (browser) or file path (Node)
 * @returns true if successful, false otherwise
 */
export function saveGame(state: GameState, keyOrPath: string): boolean {
  try {
    const data = JSON.stringify(state);
    if (isBrowser) {
      window.localStorage.setItem(keyOrPath, data);
      return true;
    } else if (isNode) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      fs.writeFileSync(keyOrPath, data, 'utf8');
      return true;
    }
    // Fallback: unsupported
    return false;
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.error('Error saving game:', e);
    }
    return false;
  }
}

/**
 * Load game state from storage.
 * @param keyOrPath Storage key (browser) or file path (Node)
 * @returns GameState if found, null otherwise
 */
export function loadGame(keyOrPath: string): GameState | null {
  try {
    if (isBrowser) {
      const data = window.localStorage.getItem(keyOrPath);
      if (!data) return null;
      return JSON.parse(data);
    } else if (isNode) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      if (!fs.existsSync(keyOrPath)) return null;
      const data = fs.readFileSync(keyOrPath, 'utf8');
      return JSON.parse(data);
    }
    // Fallback: unsupported
    return null;
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.error('Error loading game:', e);
    }
    return null;
  }
}
