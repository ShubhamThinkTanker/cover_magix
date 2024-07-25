import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt } from 'sequelize-typescript';

@Table({ paranoid: false , tableName: 'deck_types',deletedAt: "deleted_at" })
export class DeckType extends Model<DeckType> {

  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  deck_name: string;

  @Column
  price: string;

  @Column
  deck_image: string;
  
  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date ;

  @Column
  deleted_at: Date ;
}
