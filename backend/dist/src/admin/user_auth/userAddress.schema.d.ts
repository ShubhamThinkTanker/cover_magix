import { Model } from 'sequelize-typescript';
import { User } from './auth.schema';
export declare class User_Address extends Model<User_Address> {
    id: number;
    user_id: number;
    user: User;
    street_address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
