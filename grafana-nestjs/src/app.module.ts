import { Module } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { MetricsController } from './logger/metrics.controller';
import { MetricsService } from './logger/metrics.service';
import { LoggingInterceptor } from './logger/logging.interceptor';

@Module({
  imports: [],
  providers: [
    LoggerService,
    MetricsService,
    {
      provide: 'ILoggerService', // Token para la interfaz
      useClass: LoggingInterceptor, // Implementación que se inyectará
    },
  ],
  controllers: [MetricsController],
})
export class AppModule {}
