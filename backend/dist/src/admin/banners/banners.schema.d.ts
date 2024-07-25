import { Model } from 'sequelize-typescript';
export declare class Banners extends Model<Banners> {
    id: number;
    banner_type: string;
    banner_images: string[];
    banner_status: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
    created_by: number;
    updated_by: number;
}
