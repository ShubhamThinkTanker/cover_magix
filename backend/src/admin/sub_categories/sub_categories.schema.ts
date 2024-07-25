import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Categories } from '../categories/categories.schema';

@Table({ paranoid: false , tableName: 'sub_categories',deletedAt: "deleted_at" })
export class Sub_Categories extends Model<Sub_Categories> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Categories)
  @Column
  category_id: number;

  @BelongsTo(() => Categories)
  category: Categories;

  @Column
  sub_category_name: number;

  @Column
  sub_catetgory_slug_url: string;

  @Column
  sub_category_image: string;

  @Column
  description: string;
  
  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;

 
}
