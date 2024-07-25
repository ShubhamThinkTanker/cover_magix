import { Orders } from './order.schema';
import { CreateOrderDto } from './dto/createorder.dto';
import { ActivityLog } from '../activity_log/activity_log.schema';
import { ActivityLogService } from '../activity_log/activity_log.service';
import { ActivityLogger } from 'Helper/activityLogger';
export declare enum OrderStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare class OrderService {
    private orderModel;
    private ActivityLogModel;
    private activityLogService;
    private acivityLogger;
    constructor(orderModel: typeof Orders, ActivityLogModel: typeof ActivityLog, activityLogService: ActivityLogService, acivityLogger: ActivityLogger);
    createOrder(createOrderDto: CreateOrderDto): Promise<Orders>;
    allOrderListing(reqUser: any, reqbody: any): Promise<{
        totalRecords: number;
        order_listing: {
            created_at: string;
            updated_at: string;
            id: number;
            product_id: number;
            product: import("../product/product.schema").Products;
            user_id: number;
            user: import("../user_auth/auth.schema").User;
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
            deleted_at: Date;
            createdAt?: any;
            updatedAt?: any;
            deletedAt?: any;
            version?: any;
            _attributes: Orders;
            dataValues: Orders;
            _creationAttributes: Orders;
            isNewRecord: boolean;
            sequelize: import("sequelize").Sequelize;
            _model: import("sequelize").Model<Orders, Orders>;
        }[];
    }>;
    getOrderById(reqUser: any, id: any): Promise<{
        created_at: string;
        updated_at: string;
        id: number;
        product_id: number;
        product: import("../product/product.schema").Products;
        user_id: number;
        user: import("../user_auth/auth.schema").User;
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
        deleted_at: Date;
        createdAt?: any;
        updatedAt?: any;
        deletedAt?: any;
        version?: any;
        _attributes: Orders;
        dataValues: Orders;
        _creationAttributes: Orders;
        isNewRecord: boolean;
        sequelize: import("sequelize").Sequelize;
        _model: import("sequelize").Model<Orders, Orders>;
    }>;
    updateOrderById(orderId: number, reqBody: any): Promise<Orders>;
    deleteOrderById(reqUser: any, orderId: number): Promise<void>;
    findByStatus(order_status: string): Promise<Orders[]>;
}
