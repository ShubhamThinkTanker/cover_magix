import { Model } from 'sequelize-typescript';
export declare class Fabrics extends Model<Fabrics> {
    id: number;
    fabric_name: string;
    material: string;
    ideal_for: string;
    feature: string;
    water_proof: number;
    uv_resistant: number;
    weight: string;
    warranty: string;
    fabric_type: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
