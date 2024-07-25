import { Model } from 'sequelize-typescript';
import { Categories } from '../categories/categories.schema';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';
import { ProductsImage } from './productImage.schema';
export declare class Products extends Model<Products> {
    id: number;
    category_id: number;
    category: Categories;
    sub_category_id: number;
    sub_category: Sub_Categories;
    product_name: string;
    product_slug_url: string;
    description: string;
    product_price: number;
    meta_data: string;
    rating: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    images: ProductsImage[];
}
