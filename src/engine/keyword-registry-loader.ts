// Keyword-Based Registry Loader
// Handles loading and processing registry items with keyword descriptions

import type { RegistryEntry } from '../registry/index';
import type { KeywordBreakdown } from '../registry/registry-interfaces';

// Keyword parsing utilities
export class KeywordParser {
  static parseKeywordDescription(description: string): KeywordBreakdown {
    const keywords: KeywordBreakdown = {
      triggers: [],
      effects: [],
      modifiers: []
    };

    // Parse format: "Triggers: trigger1, trigger2 | Effects: effect1, effect2 | Modifiers: mod1, mod2"
    const sections = description.split(' | ');

    for (const section of sections) {
      const [category, values] = section.split(': ');
      if (!values) continue;

      const keywordList = values.split(', ').map(k => k.trim());

      switch (category.toLowerCase()) {
        case 'triggers':
          keywords.triggers = keywordList;
          break;
        case 'effects':
          keywords.effects = keywordList;
          break;
        case 'modifiers':
          keywords.modifiers = keywordList;
          break;
      }
    }

    return keywords;
  }

  static isKeywordFormat(description: string): boolean {
    // Check if description follows keyword format
    return description.includes('Triggers:') ||
           description.includes('Effects:') ||
           description.includes('Modifiers:');
  }

  static generateNarrativeDescription(keywords: KeywordBreakdown): string {
    // Convert keywords back to narrative for backward compatibility
    const parts: string[] = [];

    if (keywords.triggers.length > 0) {
      parts.push(`Activated by: ${keywords.triggers.join(', ')}`);
    }

    if (keywords.effects.length > 0) {
      parts.push(`Provides: ${keywords.effects.join(', ')}`);
    }

    if (keywords.modifiers.length > 0) {
      parts.push(`Modified by: ${keywords.modifiers.join(', ')}`);
    }

    return parts.join('. ') + '.';
  }
}

// Enhanced registry entry with keyword support
export interface KeywordRegistryEntry extends RegistryEntry {
  keywords?: KeywordBreakdown;
  originalDescription?: string; // Keep original for backward compatibility
}

// Registry loader with keyword support
export class KeywordRegistryLoader {
  private static registryCache: Map<string, KeywordRegistryEntry[]> = new Map();

  static loadRegistryWithKeywords(
    registryItems: RegistryEntry[],
    useKeywords: boolean = true
  ): KeywordRegistryEntry[] {
    const cacheKey = `registry_${useKeywords}`;

    if (this.registryCache.has(cacheKey)) {
      return this.registryCache.get(cacheKey)!;
    }

    const processedItems: KeywordRegistryEntry[] = registryItems.map(item => {
      const processedItem: KeywordRegistryEntry = { ...item };

      if (useKeywords && KeywordParser.isKeywordFormat(item.description)) {
        // Parse keyword description
        processedItem.keywords = KeywordParser.parseKeywordDescription(item.description);
        processedItem.originalDescription = item.description;
      } else {
        // Generate keywords from narrative description (for backward compatibility)
        processedItem.keywords = this.generateKeywordsFromNarrative(item);
        processedItem.originalDescription = item.description;
      }

      return processedItem;
    });

    this.registryCache.set(cacheKey, processedItems);
    return processedItems;
  }

  private static generateKeywordsFromNarrative(item: RegistryEntry): KeywordBreakdown {
    // Basic keyword generation from narrative descriptions
    // This would be expanded to handle more complex parsing
    const keywords: KeywordBreakdown = {
      triggers: [],
      effects: [],
      modifiers: []
    };

    const desc = item.description.toLowerCase();

    // Extract triggers
    if (desc.includes('when') || desc.includes('on ') || desc.includes('after')) {
      keywords.triggers.push('event-based');
    }
    if (desc.includes('first') || desc.includes('next')) {
      keywords.triggers.push('conditional');
    }

    // Extract effects
    if (desc.includes('bonus') || desc.includes('+') || desc.includes('gain')) {
      keywords.effects.push('bonus');
    }
    if (desc.includes('score') || desc.includes('points')) {
      keywords.effects.push('scoring');
    }
    if (desc.includes('coin') || desc.includes('currency')) {
      keywords.effects.push('currency');
    }
    if (desc.includes('draw') || desc.includes('reveal')) {
      keywords.effects.push('visibility');
    }

    // Extract modifiers
    if (desc.includes('cannot') || desc.includes('no ') || desc.includes('disable')) {
      keywords.modifiers.push('restriction');
    }
    if (desc.includes('permanent') || desc.includes('always')) {
      keywords.modifiers.push('permanent');
    }
    if (desc.includes('temporary') || desc.includes('next')) {
      keywords.modifiers.push('temporary');
    }

    return keywords;
  }

  static getRegistryByType(
    registryItems: KeywordRegistryEntry[],
    type: string
  ): KeywordRegistryEntry[] {
    return registryItems.filter(item => item.type === type);
  }

  static getRegistryByRarity(
    registryItems: KeywordRegistryEntry[],
    rarity: string
  ): KeywordRegistryEntry[] {
    return registryItems.filter(item => item.rarity === rarity);
  }

  static searchByKeywords(
    registryItems: KeywordRegistryEntry[],
    searchKeywords: string[]
  ): KeywordRegistryEntry[] {
    return registryItems.filter(item => {
      if (!item.keywords) return false;

      const allItemKeywords = [
        ...item.keywords.triggers,
        ...item.keywords.effects,
        ...item.keywords.modifiers
      ];

      return searchKeywords.some(searchKeyword =>
        allItemKeywords.some(itemKeyword =>
          itemKeyword.toLowerCase().includes(searchKeyword.toLowerCase())
        )
      );
    });
  }

  static clearCache(): void {
    this.registryCache.clear();
  }
}

// Utility functions for registry operations
export function loadKeywordRegistry(registryItems: RegistryEntry[]): KeywordRegistryEntry[] {
  return KeywordRegistryLoader.loadRegistryWithKeywords(registryItems, true);
}

export function loadNarrativeRegistry(registryItems: RegistryEntry[]): KeywordRegistryEntry[] {
  return KeywordRegistryLoader.loadRegistryWithKeywords(registryItems, false);
}

export function getRegistryDescription(item: KeywordRegistryEntry, useKeywords: boolean = true): string {
  if (useKeywords && item.keywords) {
    return KeywordParser.generateNarrativeDescription(item.keywords);
  }
  return item.originalDescription || item.description;
}