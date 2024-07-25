import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';

@Table({ timestamps: true, paranoid: false , tableName: 'admins' })
export class Admin extends Model<Admin> {
  @Column({
    type: DataType.UUID,
    defaultValue: Sequelize.literal('uuid_generate_v4()'), // Assuming you are using PostgreSQL and have uuid-ossp extension installed
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @Column
  email: string;

  @Column
  first_name: string;

  @Column
  last_name: string;

  @Column
  password_hash: string;

  @Column
  api_token: string;

  @Column
  api_token_expires: Date;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}
