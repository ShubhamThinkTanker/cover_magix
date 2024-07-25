import { Column, Model, Table, CreatedAt, UpdatedAt, DeletedAt, ForeignKey } from "sequelize-typescript";
import {Products} from '../product/product.schema'

@Table({paranoid: false, tableName: 'zippers', deletedAt: 'deleted_at'})
export class Zipper extends Model<Zipper>{

  @Column({primaryKey: true, autoIncrement: true})
  id: number;

  @ForeignKey(() => Products)
  @Column
  product_id: number;

  @Column
  zipper_name: string;

  @Column
  zipper_image: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;

}