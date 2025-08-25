import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Histogram, Counter, Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly histogram: Histogram<string>,

    @InjectMetric('http_requests_total')
    private readonly requestsTotal: Counter<string>,

    @InjectMetric('http_requests_errors_total')
    private readonly requestsErrors: Counter<string>,

    @InjectMetric('http_requests_in_progress')
    private readonly inProgress: Gauge<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.route?.path || request.url;

    this.inProgress.labels(method, url).inc(); // increment in-progress

    return next.handle().pipe(
      tap(() => {
        const status = context.switchToHttp().getResponse().statusCode;
        const duration = (Date.now() - start) / 1000;

        // record metrics
        this.histogram.labels(method, url, String(status)).observe(duration);
        this.requestsTotal.labels(method, url, String(status)).inc();
      }),
      catchError((err) => {
        const status = context.switchToHttp().getResponse().statusCode || 500;
        const duration = (Date.now() - start) / 1000;

        // record error metrics
        this.histogram.labels(method, url, String(status)).observe(duration);
        this.requestsTotal.labels(method, url, String(status)).inc();
        this.requestsErrors.labels(method, url, String(status)).inc();

        this.inProgress.labels(method, url).dec(); // decrement even on error
        throw err;
      }),
      tap(() => {
        this.inProgress.labels(method, url).dec(); // decrement on success
      }),
    );
  }
}
