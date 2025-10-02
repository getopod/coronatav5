// Central Registry: All game content in one place

// --- Types ---
export interface RegistryEffect {
  action: string;
  target: string;
  value?: any;
  condition?: Record<string, any>;
  oneShot?: boolean;
}

export type RegistryEntry =
  | {
      id: string;
      label: string;
      description: string;
      type: 'feat';
      rarity: string;
      category: string;
      completed: boolean;
      tags: string[];
      choices: any[];
      results: Record<string, any>;
      effects: RegistryEffect[];
      visibility?: 'visible' | 'hidden';
      variant?: string;
    }
  | {
      id: string;
      label: string;
      description: string;
      type: string;
      rarity: string;
      category: string;
      completed: boolean;
      tags: string[];
      choices: any[];
      results: Record<string, any>;
      effects: RegistryEffect[];
      variant?: string;
    };

// --- Registry Arrays ---
import {
  exploits,
  blessings,
  fears,
  dangers,
  fortunes,
  curses,
  feats,
  wanders
} from './registry';

export const registry = {
  exploit: exploits,
  blessing: blessings,
  fear: fears,
  danger: dangers,
  fortune: fortunes,
  curse: curses,
  feat: feats,
  wander: wanders
};

export type RegistryCategory = keyof typeof registry;

// Usage: registry['exploit'], registry['blessing'], etc.
