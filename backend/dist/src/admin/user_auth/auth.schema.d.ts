import { Model } from 'sequelize-typescript';
export declare class User extends Model<User> {
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
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
