import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { ip, method, url, body } = request;
    const correlationId = uuidv4();
    request.correlationId = correlationId;

    // Log the incoming request
    this.loggerService.info(
      `Incoming request: ${method} ${url} ${correlationId}`,
      {
        request: {
          body,
          ip,
        },
      },
    );

    const now = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        const duration = Date.now() - now;

        // Log the response details
        this.loggerService.info(
          `Response sent: ${method} ${url} ${correlationId} ${response.statusCode}`,
          {
            response: {
              body: responseBody,
              statusCode: response.statusCode,
              duration,
            },
          },
        );
      }),
      catchError((error) => {
        const duration = Date.now() - now;
        const statusCode = error?.status || HttpStatus.INTERNAL_SERVER_ERROR;

        // Log the error response details
        this.loggerService.error(
          `Error occurred: ${method} ${url} ${correlationId} ${statusCode}`,
          {
            response: {
              message: error.message,
              stack: error.stack,
              statusCode,
            },
            duration,
          },
        );

        // Re-throw the error to ensure it reaches the global error handler
        return throwError(() => error);
      }),
    );
  }
}
