import { Column, Model, Table, DataType, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Products } from './product.schema';
import { CustomField } from './interfaces/productFeaturesInterface';

@Table({ paranoid: false, tableName: 'product_features_masters', deletedAt: "deleted_at" })
export class ProductsFeaturesMaster extends Model<ProductsFeaturesMaster> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Products)
  @Column
  product_id: number;

  @BelongsTo(() => Products)
  product: Products;

  @Column(DataType.ARRAY(DataType.STRING))
  modules: string[];

  @Column(DataType.ARRAY(DataType.STRING))
  features: string[];

  @Column(DataType.ARRAY(DataType.STRING))
  custom_fields: CustomField[];

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @Column
  deleted_at: Date;
}
