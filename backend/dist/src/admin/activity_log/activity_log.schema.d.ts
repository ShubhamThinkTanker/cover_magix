import { Model } from 'sequelize-typescript';
export declare class ActivityLog extends Model<ActivityLog> {
    id: number;
    user_id: string;
    module: string;
    action: string;
    message: string;
    ip_address: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
