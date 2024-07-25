import { Column, Model, Table, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'activity_logs', timestamps: true })  // Set timestamps to true
export class ActivityLog extends Model<ActivityLog> {

    @Column({ primaryKey: true, autoIncrement: true })
    id: number;

    @Column({
        type: DataType.STRING,
    })
    user_id: string;

    @Column({
        type: DataType.STRING,
    })
    module: string;

    @Column({
        type: DataType.STRING,
    })
    action: string;

    @Column({
        type: DataType.STRING,
    })
    message: string;

    @Column({
        type: DataType.STRING,
    })
    ip_address: string;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    created_at: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: 'updated_at'
    })
    updated_at: Date;

    @Column({
        type: DataType.DATE,
        field: 'deleted_at'
    })
    deleted_at: Date;
}
