import { Admin } from './auth.schema';
export declare class AuthService {
    private adminModel;
    constructor(adminModel: typeof Admin);
    is_exist_email(reqbody: {
        email: string;
    }): Promise<Admin>;
    updateResetTokenValuesForForgotPassword(token_data: any, reqbody: any): Promise<boolean>;
    is_exist_admin_reset_token(token: any): Promise<false | Admin>;
    admin_password_reset(reqbody: any): Promise<boolean>;
    updateAdminProfile(reqbody: any): Promise<boolean>;
}
