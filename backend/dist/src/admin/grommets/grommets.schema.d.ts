import { Model } from 'sequelize-typescript';
export declare class Grommets extends Model<Grommets> {
    id: number;
    grommet_name: string;
    price: string;
    grommet_image: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
