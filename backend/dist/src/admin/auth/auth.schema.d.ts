import { Model } from 'sequelize-typescript';
export declare class Admin extends Model<Admin> {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    password_hash: string;
    api_token: string;
    api_token_expires: Date;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
