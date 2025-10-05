// Keyword-Based Registry Format
// Registry entries using atomic keywords instead of narrative descriptions

import type { RegistryEntry } from './index';
import type { KeywordBreakdown } from './registry-interfaces';

// Keyword-based registry entry interface
export interface KeywordRegistryEntry {
  id: string;
  label: string;
  type: 'exploit' | 'blessing' | 'fear' | 'danger' | 'fortune' | 'curse' | 'wander' | 'feat';
  rarity: string;
  category: string;
  completed: boolean;
  keywords: KeywordBreakdown;
  effects: any[]; // Keep existing effects for backward compatibility
}

// Conversion function: narrative description -> keyword breakdown
export function convertToKeywords(entry: RegistryEntry): KeywordRegistryEntry {
  // This would be a large mapping function that analyzes the description
  // and effects to generate appropriate keywords
  // For now, return a placeholder structure
  return {
    id: entry.id,
    label: entry.label,
    type: entry.type as any,
    rarity: entry.rarity,
    category: entry.category,
    completed: entry.completed,
    keywords: {
      triggers: [],
      effects: [],
      modifiers: []
    },
    effects: entry.effects
  };
}

// Utility to generate keyword-based description from keywords
export function generateKeywordDescription(keywords: KeywordBreakdown): string {
  const parts: string[] = [];

  // Add trigger information
  if (keywords.triggers.length > 0) {
    parts.push(`Triggers: ${keywords.triggers.join(', ')}`);
  }

  // Add effect information
  if (keywords.effects.length > 0) {
    parts.push(`Effects: ${keywords.effects.join(', ')}`);
  }

  // Add modifier information
  if (keywords.modifiers.length > 0) {
    parts.push(`Modifiers: ${keywords.modifiers.join(', ')}`);
  }

  return parts.join(' | ');
}

// Registry with keyword-based entries (placeholder - would be populated by conversion)
export const keywordRegistry: KeywordRegistryEntry[] = [];

// Function to populate keyword registry from existing registry
export function populateKeywordRegistry(): void {
  // Convert all existing registry entries to keyword format
  // This would be called during initialization
  keywordRegistry.length = 0; // Clear existing

  // Import existing registries
  import('./registry').then(({ exploits, blessings, fears, dangers, fortunes, curses, wanders, feats }) => {
    // Convert exploits
    exploits.forEach(exploit => {
      keywordRegistry.push(convertToKeywords(exploit));
    });

    // Convert blessings
    blessings.forEach(blessing => {
      keywordRegistry.push(convertToKeywords(blessing));
    });

    // Convert fears
    fears.forEach(fear => {
      keywordRegistry.push(convertToKeywords(fear));
    });

    // Convert dangers
    dangers.forEach(danger => {
      keywordRegistry.push(convertToKeywords(danger));
    });

    // Convert fortunes
    fortunes.forEach(fortune => {
      keywordRegistry.push(convertToKeywords(fortune));
    });

    // Convert curses
    curses.forEach(curse => {
      keywordRegistry.push(convertToKeywords(curse));
    });

    // Convert wanders
    wanders.forEach(wander => {
      keywordRegistry.push(convertToKeywords(wander));
    });

    // Convert feats
    feats.forEach(feat => {
      keywordRegistry.push(convertToKeywords(feat));
    });
  });
}