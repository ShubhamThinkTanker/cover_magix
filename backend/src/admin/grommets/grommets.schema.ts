import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';

@Table({ paranoid: false , tableName: 'grommets',deletedAt: "deleted_at" })
export class Grommets extends Model<Grommets> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  grommet_name: string;

  @Column
  price: string;

  @Column
  grommet_image: string;
  
  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;
}
