// Registry interfaces for keyword-based system

export interface KeywordBreakdown {
  triggers: string[];
  effects: string[];
  modifiers: string[];
}

export interface RegistryEntry {
  id: string;
  label: string;
  description: string;
  type: string;
  rarity: string;
  category: string;
  completed: boolean;
  tags: string[];
  choices: any[];
  results: any;
  effects: any[];
}