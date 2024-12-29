type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private isProd = process.env.NODE_ENV === 'production';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
  }

  private log(level: LogLevel, message: string, data?: any) {
    const logEntry = this.formatLog(level, message, data);

    if (this.isProd) {
      // En producción, podríamos enviar los logs a un servicio externo
      // Por ahora, solo usamos console con información estructurada
      console.log(JSON.stringify(logEntry));
    } else {
      // En desarrollo, usamos console con colores para mejor legibilidad
      const colors = {
        info: '\x1b[36m', // cyan
        warn: '\x1b[33m', // yellow
        error: '\x1b[31m', // red
        debug: '\x1b[35m', // magenta
      };
      
      console.log(
        `${colors[level]}[${logEntry.level.toUpperCase()}]\x1b[0m`,
        `[${logEntry.timestamp}]`,
        message,
        data ? '\nData:' : '',
        data ? data : ''
      );
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    if (!this.isProd) {
      this.log('debug', message, data);
    }
  }
}

export const logger = Logger.getInstance();
