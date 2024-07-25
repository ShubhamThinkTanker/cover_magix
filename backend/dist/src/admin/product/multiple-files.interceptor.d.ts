import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class MultipleFilesInterceptor implements NestInterceptor {
    private readonly fields;
    constructor(fields: {
        name: string;
        maxCount: number;
    }[]);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
