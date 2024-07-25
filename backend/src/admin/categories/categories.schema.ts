import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, HasMany } from 'sequelize-typescript';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';

@Table({ paranoid: false , tableName: 'categories',deletedAt: "deleted_at" })
export class Categories extends Model<Categories> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  category_name: string;

  @Column
  category_slug_url: string;

  @Column
  status: number;

  @Column
  include_store_menu: number;
  
  @Column
  Position: number;
  
  @Column
  description: string;

  @Column
  category_image: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;

  @HasMany(() => Sub_Categories)
  sub_categories: Sub_Categories[];
}
