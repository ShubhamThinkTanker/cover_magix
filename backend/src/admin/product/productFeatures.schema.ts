import { Column, Model, Table, DataType, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Products } from './product.schema';
import { FabricsMaterial } from '../fabric/fabricMaterial.schema';
import { Tie_Down } from '../tie_downs/tie_downs.schema';
import { Grommets } from '../grommets/grommets.schema';

@Table({ paranoid: false, tableName: 'Product_Features', deletedAt: "deleted_at" })
export class ProductsFeatures extends Model<ProductsFeatures> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Products)
  @Column
  product_id: number;

  @BelongsTo(() => Products)
  product: Products;

  @ForeignKey(() => FabricsMaterial)
  @Column(DataType.ARRAY(DataType.INTEGER))
  fabric_id: number[];

  @BelongsTo(() => FabricsMaterial)
  fabric: FabricsMaterial;

  @ForeignKey(() => Tie_Down)
  @Column(DataType.ARRAY(DataType.INTEGER))
  tie_down_id: number[];

  @BelongsTo(() => Tie_Down)
  tie_down: Tie_Down;

  @ForeignKey(() => Grommets)
  @Column(DataType.ARRAY(DataType.INTEGER))
  grommet_id: number[];

  @BelongsTo(() => Grommets)
  grommet: Grommets;

  @Column
  meta_data: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @Column
  deleted_at: Date;
}
