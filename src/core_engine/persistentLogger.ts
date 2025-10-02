/**
 * Persistent Logging System for Coronata Game
 * Ensures continuous logging to logfreshgame.txt with failsafe mechanisms
 */

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  component: string;
  message: string;
  data?: any;
}

class PersistentLogger {
  private static instance: PersistentLogger;
  private logQueue: LogEntry[] = [];
  private isProcessing = false;
  private maxRetries = 5;
  private retryDelay = 1000; // 1 second
  private logInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    this.startPeriodicLogging();
    this.setupErrorHandlers();
  }

  public static getInstance(): PersistentLogger {
    if (!PersistentLogger.instance) {
      PersistentLogger.instance = new PersistentLogger();
    }
    return PersistentLogger.instance;
  }

  private setupErrorHandlers(): void {
    // Catch unhandled errors and log them
    window.addEventListener('error', (event) => {
      this.log('ERROR', 'Window', `Unhandled error: ${event.error?.message || event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log('ERROR', 'Promise', `Unhandled promise rejection: ${event.reason}`, {
        reason: event.reason
      });
    });
  }

  private startPeriodicLogging(): void {
    // Process log queue every 2 seconds
    this.logInterval = setInterval(() => {
      this.processLogQueue();
    }, 2000);

    // Also log a heartbeat every 30 seconds to ensure logging is active
    setInterval(() => {
      this.log('DEBUG', 'Logger', 'Heartbeat - logging system active');
    }, 30000);
  }

  public log(level: LogEntry['level'], component: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    };

    // Always log to console immediately
    const consoleMessage = `[${entry.timestamp}] ${level} [${component}] ${message}`;
    switch (level) {
      case 'ERROR':
        console.error(consoleMessage, data);
        break;
      case 'WARN':
        console.warn(consoleMessage, data);
        break;
      case 'DEBUG':
        console.debug(consoleMessage, data);
        break;
      default:
        console.log(consoleMessage, data);
    }

    // Add to queue for file logging
    this.logQueue.push(entry);

    // If queue is getting large, process immediately
    if (this.logQueue.length > 50) {
      this.processLogQueue();
    }
  }

  private async processLogQueue(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) return;
    
    this.isProcessing = true;
    const entries = [...this.logQueue];
    this.logQueue = [];

    try {
      await this.writeToFile(entries);
    } catch (error) {
      console.error('Failed to write logs to file:', error);
      // Put entries back in queue for retry
      this.logQueue.unshift(...entries);
    } finally {
      this.isProcessing = false;
    }
  }

  private async writeToFile(entries: LogEntry[]): Promise<void> {
    const logText = entries.map(entry => {
      const dataStr = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
      return `[${entry.timestamp}] ${entry.level} [${entry.component}] ${entry.message}${dataStr}`;
    }).join('\n') + '\n';

    // Try multiple methods to write to file
    const methods = [
      () => this.writeViaElectron(logText),
      () => this.writeViaFetch(logText),
      () => this.writeViaLocalStorage(entries)
    ];

    let lastError;
    for (const method of methods) {
      try {
        await method();
        return; // Success!
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    throw lastError;
  }

  private async writeViaElectron(logText: string): Promise<void> {
    // Check if running in Electron environment
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      await (window as any).electronAPI.appendToLog(logText);
      return;
    }
    throw new Error('Electron API not available');
  }

  private async writeViaFetch(logText: string): Promise<void> {
    // Try to write via a local server endpoint
    const response = await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: logText
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private async writeViaLocalStorage(entries: LogEntry[]): Promise<void> {
    // Fallback: store in localStorage with rotation
    const storageKey = 'logfreshgame_backup';
    const maxStorageEntries = 1000;
    
    try {
      const existingLogs = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const newLogs = [...existingLogs, ...entries].slice(-maxStorageEntries);
      localStorage.setItem(storageKey, JSON.stringify(newLogs));
    } catch (error) {
      throw new Error(`LocalStorage failed: ${error}`);
    }
  }

  public exportLogs(): LogEntry[] {
    // Return logs from localStorage backup
    try {
      return JSON.parse(localStorage.getItem('logfreshgame_backup') || '[]');
    } catch {
      return [];
    }
  }

  public clearLogs(): void {
    this.logQueue = [];
    localStorage.removeItem('logfreshgame_backup');
  }

  public destroy(): void {
    if (this.logInterval) {
      clearInterval(this.logInterval);
      this.logInterval = null;
    }
    this.processLogQueue(); // Final flush
  }
}

// Create global logger instance
export const logger = PersistentLogger.getInstance();

// Create convenience functions
export const logInfo = (component: string, message: string, data?: any) => 
  logger.log('INFO', component, message, data);

export const logWarn = (component: string, message: string, data?: any) => 
  logger.log('WARN', component, message, data);

export const logError = (component: string, message: string, data?: any) => 
  logger.log('ERROR', component, message, data);

export const logDebug = (component: string, message: string, data?: any) => 
  logger.log('DEBUG', component, message, data);

// Auto-start logging
logger.log('INFO', 'Logger', 'Persistent logging system initialized successfully');