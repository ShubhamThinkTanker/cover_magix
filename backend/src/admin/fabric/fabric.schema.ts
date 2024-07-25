
import { Column, Model, Table,  Sequelize, CreatedAt, UpdatedAt, DeletedAt, DataType } from 'sequelize-typescript';

@Table({ paranoid: false , tableName: 'fabrics',deletedAt: "deleted_at" })
export class Fabrics extends Model<Fabrics> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  fabric_name: string;

  @Column
  material: string;

  @Column
  ideal_for: string;

  @Column
  feature: string;

  @Column
  water_proof: number;

  @Column
  uv_resistant: number;

  @Column
  weight: string;
  

  @Column
  warranty: string;

  @Column
  fabric_type: number;
  
  
  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;
}
