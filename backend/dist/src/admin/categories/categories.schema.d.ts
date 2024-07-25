import { Model } from 'sequelize-typescript';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';
export declare class Categories extends Model<Categories> {
    id: number;
    category_name: string;
    category_slug_url: string;
    status: number;
    include_store_menu: number;
    Position: number;
    description: string;
    category_image: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    sub_categories: Sub_Categories[];
}
