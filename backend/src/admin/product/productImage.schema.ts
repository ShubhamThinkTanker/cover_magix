import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Products } from './product.schema';

@Table({ paranoid: false, tableName: 'product_images', deletedAt: "deleted_at" })
export class ProductsImage extends Model<ProductsImage> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Products)
  @Column
  product_id: number;

  @BelongsTo(() => Products)
  product: Products;

  @Column(DataType.ARRAY(DataType.STRING))
  product_image: string[];

  // @Column(DataType.STRING)
  // how_to_measure: string;

  @Column(DataType.ARRAY(DataType.STRING))
  default_image: string[];

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @Column
  deleted_at: Date;
}