import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as multer from 'multer';

@Injectable()
export class MultipleFilesInterceptor implements NestInterceptor {
  constructor(private readonly fields: { name: string, maxCount: number }[]) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const multerFields = this.fields.map(field => ({
      name: field.name,
      maxCount: field.maxCount,
    }));

    return new Observable(observer => {
      const upload = multer().fields(multerFields);
      upload(request, response, err => {
        if (err) {
          observer.error(err);
        } else {
          observer.next(next.handle());
          observer.complete();
        }
      });
    });
  }
}
