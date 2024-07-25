import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';

@Table({ paranoid: false , tableName: 'promo_codes',deletedAt: "deleted_at" })
export class Promo_code extends Model<Promo_code> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.ENUM('first_order', 'cat', 'sub_cat','pro'),
  })
  promo_type: string;

  @Column
  code: string;

  @Column
  description: string;

  @Column
  max_user: number;

  @Column({
    type: DataType.ENUM('pending', 'process', 'active', 'expired'),
  })
  status: string;

  @Column
  header_Promo: boolean;

  @Column(DataType.ARRAY(DataType.INTEGER)) 
  itemId: number[];

  @Column(DataType.ARRAY(DataType.INTEGER))
  productId: number[];

  @Column
  end_date: Date;

  @Column
  start_date: Date;
  
  @Column
  discount_per: number;

  @Column
  created_by: number;

  @Column
  updated_by: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}
