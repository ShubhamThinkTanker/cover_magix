import { Model } from "sequelize-typescript";
export declare class Zipper extends Model<Zipper> {
    id: number;
    product_id: number;
    zipper_name: string;
    zipper_image: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
