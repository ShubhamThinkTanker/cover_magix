import { User } from './auth.schema';
import { Sequelize } from 'sequelize';
import { User_Address } from './userAddress.schema';
export declare class UserAuthService {
    private userModel;
    private userAddressModel;
    constructor(userModel: typeof User, userAddressModel: typeof User_Address);
    is_exist_email(reqbody: {
        email: string;
    }): Promise<User>;
    updateResetTokenValuesForForgotPassword(token_data: any, reqbody: any): Promise<boolean>;
    is_exist_user_reset_token(token: any): Promise<false | User>;
    allUserList(reqbody: any): Promise<{
        totalRecords: number;
        address_listing: {
            created_at: string;
            updated_at: string;
            id: number;
            email: string;
            first_name: string;
            last_name: string;
            password_hash: string;
            mobile_no: string;
            company: string;
            api_token: string;
            api_token_expires: Date;
            googleId: string;
            facebookId: string;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: User;
            dataValues: User;
            _creationAttributes: User;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<User, User>;
        }[];
    }>;
    user_password_reset(reqbody: any): Promise<boolean>;
    update_user_profile(reqbody: any): Promise<boolean>;
    create(user: Partial<User>): Promise<User>;
    findOneByEmail(email: string): Promise<User>;
    findOrCreate(user: Partial<User>): Promise<User>;
    findOrCreateForFacebook(user: Partial<User>): Promise<User>;
    addUserAddress(reqBody: any): Promise<User_Address>;
    userAddressList(reqbody: any): Promise<{
        totalRecords: number;
        users: {
            created_at: string;
            updated_at: string;
            id: number;
            user_id: number;
            user: User;
            street_address: string;
            city: string;
            state: string;
            zip: string;
            country: string;
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: User_Address;
            dataValues: User_Address;
            _creationAttributes: User_Address;
            isNewRecord: boolean;
            sequelize: Sequelize;
            _model: import("sequelize").Model<User_Address, User_Address>;
        }[];
    }>;
}
