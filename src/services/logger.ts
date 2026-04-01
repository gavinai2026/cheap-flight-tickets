import { captureException, captureMessage, addBreadcrumb } from './crashReporting';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel = __DEV__ ? 'debug' : 'warn';

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
  }

  debug(message: string, data?: Record<string, any>) {
    if (!this.shouldLog('debug')) return;
    console.debug(`[${this.context}]`, message, data || '');
    addBreadcrumb(this.context, message, data, 'debug');
  }

  info(message: string, data?: Record<string, any>) {
    if (!this.shouldLog('info')) return;
    console.log(`[${this.context}]`, message, data || '');
    addBreadcrumb(this.context, message, data, 'info');
  }

  warn(message: string, data?: Record<string, any>) {
    if (!this.shouldLog('warn')) return;
    console.warn(`[${this.context}]`, message, data || '');
    addBreadcrumb(this.context, message, data, 'warning');
    captureMessage(`[${this.context}] ${message}`, 'warning');
  }

  error(message: string, error?: unknown, data?: Record<string, any>) {
    if (!this.shouldLog('error')) return;
    console.error(`[${this.context}]`, message, error, data || '');
    if (error instanceof Error) {
      captureException(error, { context: this.context, message, ...data });
    } else if (error) {
      captureMessage(`[${this.context}] ${message}: ${String(error)}`, 'error');
    } else {
      captureMessage(`[${this.context}] ${message}`, 'error');
    }
  }
}

export const createLogger = (context: string) => new Logger(context);
export default Logger;
