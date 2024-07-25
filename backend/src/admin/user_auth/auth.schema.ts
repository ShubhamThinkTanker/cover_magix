import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, IsNull } from 'sequelize-typescript';

@Table({ timestamps: true, paranoid: true , tableName: 'users' })
export class User extends Model<User> {
  @Column({ primaryKey: true, autoIncrement: true })
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
  mobile_no: string;

  @Column
  company: string;

  @Column
  api_token: string;

  @Column
  api_token_expires: Date;

  @Column({ allowNull: true })
  googleId: string;

  @Column({ allowNull: true })
  facebookId: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}
