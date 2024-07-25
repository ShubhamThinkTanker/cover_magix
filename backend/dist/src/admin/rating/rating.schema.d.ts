import { Model } from 'sequelize-typescript';
import { Products } from '../product/product.schema';
export declare class Rating extends Model<Rating> {
    id: number;
    rating: number;
    comment: string;
    images: string[];
    product_id: number;
    product: Products;
    status: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
