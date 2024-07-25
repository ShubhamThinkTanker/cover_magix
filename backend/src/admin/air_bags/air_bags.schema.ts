import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt ,ForeignKey} from 'sequelize-typescript';
import { Products } from '../product/product.schema';

@Table({ paranoid: false , tableName: 'air_bags',deletedAt: "deleted_at" })
export class Air_bags extends Model<Air_bags> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Products)
  @Column
  product_id: number;

  @Column
  size: string;

  @Column
  quantity: number;

  @Column
  price: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;
}
