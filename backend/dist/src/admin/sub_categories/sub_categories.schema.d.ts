import { Model } from 'sequelize-typescript';
import { Categories } from '../categories/categories.schema';
export declare class Sub_Categories extends Model<Sub_Categories> {
    id: number;
    category_id: number;
    category: Categories;
    sub_category_name: number;
    sub_catetgory_slug_url: string;
    sub_category_image: string;
    description: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
