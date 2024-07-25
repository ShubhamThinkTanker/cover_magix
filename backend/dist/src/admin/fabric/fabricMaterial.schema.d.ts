import { Model } from 'sequelize-typescript';
export declare class FabricsMaterial extends Model<FabricsMaterial> {
    id: number;
    fabric_id: number;
    color_name: string;
    color: string;
    fabric_image: string;
    color_suggestions: string[];
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
