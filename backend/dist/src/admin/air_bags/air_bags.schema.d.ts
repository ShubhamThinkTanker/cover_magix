import { Model } from 'sequelize-typescript';
export declare class Air_bags extends Model<Air_bags> {
    id: number;
    product_id: number;
    size: string;
    quantity: number;
    price: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
