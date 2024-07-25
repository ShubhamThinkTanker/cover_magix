import { Model } from 'sequelize-typescript';
export declare class Tie_Down extends Model<Tie_Down> {
    id: number;
    tie_down_name: string;
    price: string;
    tie_down_image: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
