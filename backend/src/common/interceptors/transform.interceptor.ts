import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T> | T> {
    const response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((data) => {
        // If data is already structured or raw stream, return directly
        if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
          return data;
        }
        return {
          success: true,
          statusCode: response?.statusCode || 200,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
