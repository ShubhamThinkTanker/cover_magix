import { Column, Model, Table, DataType, Sequelize, CreatedAt, UpdatedAt, DeletedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Products } from '../product/product.schema';
import { User } from '../user_auth/auth.schema';

@Table({ paranoid: false, tableName: 'orders', deletedAt: "deleted_at" })
export class Orders extends Model<Orders> {

    @Column({ primaryKey: true, autoIncrement: true })
    id: number;

    @ForeignKey(() => Products)
    @Column
    product_id: number;

    @BelongsTo(() => Products)
    product: Products;

    @ForeignKey(() => User)
    @Column
    user_id: number;

    @BelongsTo(() => User)
    user: User;

    @Column
    first_name: string;

    @Column
    last_name: string;

    @Column
    email: string;

    @Column
    phone_number: string;

    @Column
    product_name: string;

    @Column
    price: number;

    @Column
    description: string;

    @Column
    stock: number;

    @Column
    total_amount: number;

    @Column
    order_date: Date;

    @Column
    address: string;

    @Column
    city: string;

    @Column
    state: string;

    @Column
    zipcode: string;

    @Column
    country: string;

    @Column
    applied_coupen_id: number;

    // @Column
    // promo_code_id: number;

    @Column
    IGST: number;

    @Column
    SGST: number;

    @Column({
        type: DataType.ENUM('true', 'false'),
        defaultValue: 'false'
    })
    return_status: string;

    @Column({
        type: DataType.ENUM('pending','processing','shipped','delivered','cancelled'),
        defaultValue: 'pending'
    })
    order_status: string;

    @CreatedAt
    created_at: Date;

    @UpdatedAt
    updated_at: Date;

    @Column
    deleted_at: Date;
}
