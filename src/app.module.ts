import { Module } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import {
  AuthModule,
  HealthModule,
  InsightsModule,
  MetricsModule,
  StatementModule,
} from './modules';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    StatementModule,
    InsightsModule,
    HealthModule,
    MetricsModule,
    ConfigModule.forRoot({ isGlobal: true }),
    // rate limiter i.e 10 requests every 60 seconds
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
