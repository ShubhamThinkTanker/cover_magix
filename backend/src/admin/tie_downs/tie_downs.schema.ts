import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';

@Table({ paranoid: false , tableName: 'tie_downs',deletedAt: "deleted_at" })
export class Tie_Down extends Model<Tie_Down> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  tie_down_name: string;

  @Column
  price: string;

  @Column
  tie_down_image: string;
  
  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;
}
