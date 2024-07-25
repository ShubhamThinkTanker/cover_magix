import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { User } from './auth.schema';

@Table({ timestamps: true, paranoid: false , tableName: 'user_addresses' })
export class User_Address extends Model<User_Address> {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => User)
  @Column
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  street_address: string;

  @Column
  city: string;

  @Column
  state: string;

  @Column
  zip: string;

  @Column
  country: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}
