import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Products } from '../product/product.schema';

@Table({ paranoid: false, tableName: 'banners', deletedAt: "deleted_at" })
export class Banners extends Model<Banners> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column({
    type: DataType.ENUM('first', 'second', 'third'),
    defaultValue: 'first'
  })
  banner_type: string;

  @Column(DataType.ARRAY(DataType.STRING))
  banner_images: string[];

  @Column({
    type: DataType.ENUM('active', 'inactive'),
    defaultValue: 'active'
  })
  banner_status : string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @Column
  deleted_at: Date;

  @Column
  created_by: number;

  @Column
  updated_by: number;
}