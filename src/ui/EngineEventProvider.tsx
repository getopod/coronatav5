import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { EngineController } from '../engine/engineController';
import { EngineEvent } from '../engine/eventSystem';

type EngineEventContextType = {
  event: EngineEvent | null;
  engine: EngineController;
};

const EngineEventContext = createContext<EngineEventContextType | null>(null);

interface EngineEventProviderProps {
  engine: EngineController;
  children: ReactNode;
}

export function EngineEventProvider({ engine, children }: EngineEventProviderProps) {
  const [event, setEvent] = useState<EngineEvent | null>(null);
  const engineRef = useRef(engine);

  useEffect(() => {
    const consumer = (evt: EngineEvent) => setEvent(evt);
    engineRef.current.addUIConsumer(consumer);
    return () => {
      // Remove consumer if needed (not implemented in engine yet)
    };
  }, []);

  return (
    <EngineEventContext.Provider value={{ event, engine: engineRef.current }}>
      {children}
    </EngineEventContext.Provider>
  );
}

export function useEngineEvent() {
  return useContext(EngineEventContext);
}
