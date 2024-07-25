import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Products } from '../product/product.schema';
import { ENUM } from 'sequelize';

@Table({ paranoid: false, tableName: 'ratings', deletedAt: "deleted_at" })
export class Rating extends Model<Rating> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  rating: number;

  @Column
  comment: string;

  @Column(DataType.ARRAY(DataType.STRING))
  images: string[];;

  @ForeignKey(() => Products)
  @Column
  product_id: number;

  @BelongsTo(() => Products)
  product: Products;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  })
  status: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @Column
  deleted_at: Date;
}
