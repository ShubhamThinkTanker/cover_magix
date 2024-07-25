import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, ForeignKey } from 'sequelize-typescript';
import { Fabrics } from './fabric.schema';

@Table({ paranoid: false , tableName: 'fabric_Materials',deletedAt: "deleted_at" })
export class FabricsMaterial extends Model<FabricsMaterial> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @ForeignKey(() => Fabrics)
  @Column
  fabric_id: number;

  @Column
  color_name: string;
    
  @Column
  color: string;

  @Column
  fabric_image: string;

  @Column(DataType.ARRAY(DataType.STRING))
  color_suggestions: string[];
  
  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;
}
