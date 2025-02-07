import { Model } from 'sequelize-typescript';
import { Products } from '../product/product.schema';
import { User } from '../user_auth/auth.schema';
export declare class Orders extends Model<Orders> {
    id: number;
    product_id: number;
    product: Products;
    user_id: number;
    user: User;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    product_name: string;
    price: number;
    description: string;
    stock: number;
    total_amount: number;
    order_date: Date;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    applied_coupen_id: number;
    IGST: number;
    SGST: number;
    return_status: string;
    order_status: string;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date;
}
