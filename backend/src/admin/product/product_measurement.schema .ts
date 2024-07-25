import { Column, Model, Table, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Products } from './product.schema';
import { MeasurementData } from './interfaces/product.measurement';

@Table({ paranoid: false, tableName: 'product_measurements' })
export class ProductsMeasurement extends Model<ProductsMeasurement> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Products)
  @Column
  product_id: number;

  @BelongsTo(() => Products)
  product: Products;

  @Column
  type: number;

  @Column(DataType.ARRAY(DataType.STRING))
  product_measurement: MeasurementData[];

  @Column
  extra_material: string;

  @Column
  material_price: string;

  @Column
  area_sq_inches: string;

  @Column
  area_sq_meters: string;

  @Column
  total_material_sq_meters: string;

  @Column
  cost: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @Column
  deleted_at: Date;
}
