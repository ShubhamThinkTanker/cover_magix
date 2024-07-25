import { Model } from 'sequelize-typescript';
export declare class Promo_code extends Model<Promo_code> {
    id: number;
    promo_type: string;
    code: string;
    description: string;
    max_user: number;
    status: string;
    header_Promo: boolean;
    itemId: number[];
    productId: number[];
    end_date: Date;
    start_date: Date;
    discount_per: number;
    created_by: number;
    updated_by: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
