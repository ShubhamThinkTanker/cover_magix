import { Model } from 'sequelize-typescript';
import { Products } from './product.schema';
export declare class ProductsImage extends Model<ProductsImage> {
    id: number;
    product_id: number;
    product: Products;
    product_image: string[];
    default_image: string[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
