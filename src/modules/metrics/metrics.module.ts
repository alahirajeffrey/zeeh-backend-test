import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  PrometheusModule,
  makeHistogramProvider,
  makeCounterProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { MetricsInterceptor } from 'src/common';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
  ],
  providers: [
    // request latency (method, url, status)
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'url', 'status'], // <-- FIXED
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),

    // total requests
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'url', 'status'], // <-- FIXED
    }),

    // error requests
    makeCounterProvider({
      name: 'http_requests_errors_total',
      help: 'Total number of failed HTTP requests',
      labelNames: ['method', 'url', 'status'], // <-- FIXED
    }),

    // in-progress requests
    makeGaugeProvider({
      name: 'http_requests_in_progress',
      help: 'Number of in-progress HTTP requests',
      labelNames: ['method', 'url'],
    }),

    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class MetricsModule {}
