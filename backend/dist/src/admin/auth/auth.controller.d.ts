import { AuthService } from './auth.service';
import { CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { Request, Response } from 'express';
import { PasswordService } from '../../../Helper/password.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    static passwordService: PasswordService;
    adminLogin(req: Request, res: Response): Promise<CustomErrorResponse>;
    adminForgotPassword(req: any, res: Response): Promise<CustomErrorResponse | CustomResponse>;
    adminResetPassword(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse>;
    updateAdminProfile(req: any, res: Response): Promise<Success | CustomResponse>;
    catch(error: any): void;
}
