// Event system for engine state changes and UI updates
export type EngineEventType =
  | 'move'
  | 'stateChange'
  | 'win'
  | 'loss'
  | 'score'
  | 'encounter_completed'
  | 'encounter_started'
  | 'run_completed'
  | 'custom';

export interface EngineEvent {
  type: EngineEventType;
  payload: any;
}

export type EventHandler = (event: EngineEvent) => void;

export class EventEmitter {
  private handlers: { [type: string]: EventHandler[] } = {};

  on(type: EngineEventType, handler: EventHandler) {
    if (!this.handlers[type]) this.handlers[type] = [];
    this.handlers[type].push(handler);
  }

  off(type: EngineEventType, handler: EventHandler) {
    if (!this.handlers[type]) return;
    this.handlers[type] = this.handlers[type].filter(h => h !== handler);
  }

  emit(event: EngineEvent) {
    const handlers = this.handlers[event.type] || [];
    handlers.forEach(h => h(event));
  }
}