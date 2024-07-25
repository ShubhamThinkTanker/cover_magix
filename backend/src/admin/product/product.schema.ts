import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt , ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
// import { Categories } from '../categories/categories.schema';
// import { Sub_Categories } from '../sub_categories/sub_categories.schema';
import { Categories } from '../categories/categories.schema';
import { Sub_Categories } from '../sub_categories/sub_categories.schema';
import { ProductsImage } from './productImage.schema';

@Table({ paranoid: false , tableName: 'products',deletedAt: "deleted_at" })
export class Products extends Model<Products> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Categories)
  @Column
  category_id: number;

  @BelongsTo(() => Categories)
  category: Categories;

  @ForeignKey(() => Sub_Categories)
  @Column
  sub_category_id: number; 

  @BelongsTo(() => Sub_Categories)
  sub_category: Sub_Categories;
  
  @Column
  product_name: string;

  @Column
  product_slug_url: string;

  @Column
  description: string;

  @Column
  product_price : number;

  // @Column
  // sale_price : number;

  // @Column
  // retail_price : number;

  // @Column
  // stocks : number;

  @Column
  meta_data : string;

  @Column
  rating : number;
  
  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;

  @HasMany(() => ProductsImage)
  images: ProductsImage[];
}