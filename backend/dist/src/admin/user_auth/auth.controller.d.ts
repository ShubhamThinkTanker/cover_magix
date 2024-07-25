import { UserAuthService } from './auth.service';
import { CustomCatchBlockErrorMessage, CustomErrorResponse, CustomResponse, Success } from '../../../Helper/commonResponse';
import { User } from './auth.schema';
import { Request, Response } from 'express';
import { PasswordService } from '../../../Helper/password.service';
export declare class UserAuthController {
    private readonly authService;
    constructor(authService: UserAuthService);
    static passwordService: PasswordService;
    userLogin(req: Request, res: Response): Promise<CustomErrorResponse>;
    userRegister(req: any, res: Response): Promise<CustomErrorResponse>;
    getAllUserList(req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
    userEditProfile(req: any, res: Response): Promise<Success | CustomErrorResponse | CustomResponse>;
    googleAuth(req: any): Promise<void>;
    googleAuthRedirect(req: any): Promise<User>;
    facebookAuth(req: any): Promise<void>;
    facebookAuthRedirect(req: any): Promise<User>;
    addUserAddress(req: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserAddressList(req: any, res: Response): Promise<Success | CustomResponse | CustomCatchBlockErrorMessage>;
}
