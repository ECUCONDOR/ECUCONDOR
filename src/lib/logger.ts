type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  component?: string;
  data?: unknown;
  error?: {
    message: string;
    stack?: string;
    name: string;
    cause?: unknown;
  };
}

class Logger {
  private static instance: Logger;
  private isProd = process.env.NODE_ENV === 'production';
  private logFile = './logs/app.log';
  private maxLogSize = 10 * 1024 * 1024; // 10MB

  private constructor() {
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.dirname(this.logFile);
      
      // Crear directorio de logs si no existe
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Rotar logs si el archivo es muy grande
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size > this.maxLogSize) {
          const backupFile = `${this.logFile}.${new Date().toISOString().replace(/[:.]/g, '-')}`;
          fs.renameSync(this.logFile, backupFile);
        }
      }
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatError(error: Error): LogEntry['error'] {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    };
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data === 'object' && data !== null) {
      return JSON.parse(JSON.stringify(data, (key, value) => {
        // Sanitizar datos sensibles
        if (
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('secret')
        ) {
          return '[REDACTED]';
        }
        return value;
      }));
    }
    return data;
  }

  private formatLog(level: LogLevel, message: string, component?: string, data?: unknown, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      component,
      data: data ? this.sanitizeData(data) : undefined,
      error: error ? this.formatError(error) : undefined,
    };
  }

  private log(level: LogLevel, message: string, component?: string, data?: unknown, error?: Error) {
    const logEntry = this.formatLog(level, message, component, data, error);

    if (this.isProd && typeof window === 'undefined') {
      const fs = require('fs');
      fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
    } else {
      const consoleMethod = level === 'error' ? 'error' :
                           level === 'warn' ? 'warn' :
                           level === 'debug' ? 'debug' : 'log';
      
      const style = level === 'error' ? 'color: red; font-weight: bold' :
                    level === 'warn' ? 'color: orange; font-weight: bold' :
                    level === 'debug' ? 'color: blue' : 'color: green';

      console[consoleMethod](
        `%c[${logEntry.timestamp}] ${level.toUpperCase()}${component ? ` [${component}]` : ''}: ${message}`,
        style,
        data ? { data } : '',
        error ? { error } : ''
      );
    }
  }

  info(message: string, component?: string, data?: unknown) {
    this.log('info', message, component, data);
  }

  warn(message: string, component?: string, data?: unknown) {
    this.log('warn', message, component, data);
  }

  error(message: string, component?: string, data?: unknown, error?: Error) {
    this.log('error', message, component, data, error);
  }

  debug(message: string, component?: string, data?: unknown) {
    if (!this.isProd) {
      this.log('debug', message, component, data);
    }
  }
}

export const logger = Logger.getInstance();

// Exportar loggers específicos para componentes
export const componentLoggers = {
  api: {
    info(message: string, data?: unknown) {
      logger.info(message, 'API', data);
    },
    warn(message: string, data?: unknown) {
      logger.warn(message, 'API', data);
    },
    error(message: string, data?: unknown, error?: Error) {
      logger.error(message, 'API', data, error);
    },
    debug(message: string, data?: unknown) {
      logger.debug(message, 'API', data);
    }
  },
  db: {
    info(message: string, data?: unknown) {
      logger.info(message, 'DB', data);
    },
    warn(message: string, data?: unknown) {
      logger.warn(message, 'DB', data);
    },
    error(message: string, data?: unknown, error?: Error) {
      logger.error(message, 'DB', data, error);
    },
    debug(message: string, data?: unknown) {
      logger.debug(message, 'DB', data);
    }
  },
  auth: {
    info(message: string, data?: unknown) {
      logger.info(message, 'AUTH', data);
    },
    warn(message: string, data?: unknown) {
      logger.warn(message, 'AUTH', data);
    },
    error(message: string, data?: unknown, error?: Error) {
      logger.error(message, 'AUTH', data, error);
    },
    debug(message: string, data?: unknown) {
      logger.debug(message, 'AUTH', data);
    }
  },
  ui: {
    info(message: string, data?: unknown) {
      logger.info(message, 'UI', data);
    },
    warn(message: string, data?: unknown) {
      logger.warn(message, 'UI', data);
    },
    error(message: string, data?: unknown, error?: Error) {
      logger.error(message, 'UI', data, error);
    },
    debug(message: string, data?: unknown) {
      logger.debug(message, 'UI', data);
    }
  },
};
