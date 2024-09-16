import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import LokiTransport from 'winston-loki';

@Injectable()
export class LoggerService {
  private readonly logger = createLogger({
    level: 'info',
    format: format.combine(
      format.timestamp(),
      format.json(),
      LoggerService.logFormat(), // Custom log format
    ),
    transports: [
      new LokiTransport({
        host: 'http://loki:3100',
        labels: { job: 'nestjs-logs' },
        json: true,
      }),
    ],
  });

  info(message: string, context?: any): void {
    this.logger.info(message, { context });
  }

  error(
    message: string,
    traceOrContext?: string | { trace?: string; [key: string]: any },
  ) {
    // Verificar si el segundo parámetro es un string o un objeto
    if (typeof traceOrContext === 'string') {
      this.logger.error(message, { trace: traceOrContext });
    } else {
      this.logger.error(message, traceOrContext);
    }
  }
  ƒ;

  // Custom log formatting
  static logFormat() {
    return format.printf(({ level, message, context }) => {
      const baseMessage = `[${level}] ${message}`;
      const request = ` Request: ${JSON.stringify(context?.request || '')}`;
      const response = ` Response: ${JSON.stringify(context?.response || '')}`;

      return `${baseMessage}\n${request}\n${response}`;
    });
  }
}
