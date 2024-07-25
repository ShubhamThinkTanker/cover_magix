import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Admin } from '../src/admin/auth/auth.schema';
declare global {
    namespace Express {
        interface Request {
            user: Admin | null;
        }
    }
}
export declare class EnsureAdminAuthenticatedMiddleware implements NestMiddleware {
    private adminModel;
    constructor(adminModel: typeof Admin);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
