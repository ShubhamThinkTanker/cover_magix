"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = exports.OrderStatus = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const order_schema_1 = require("./order.schema");
const dateFormat_1 = require("../../../Helper/dateFormat");
const sequelize_2 = require("sequelize");
const activity_log_schema_1 = require("../activity_log/activity_log.schema");
const activity_log_service_1 = require("../activity_log/activity_log.service");
const activityLogger_1 = require("../../../Helper/activityLogger");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["PROCESSING"] = "processing";
    OrderStatus["SHIPPED"] = "shipped";
    OrderStatus["DELIVERED"] = "delivered";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
let OrderService = exports.OrderService = class OrderService {
    constructor(orderModel, ActivityLogModel, activityLogService, acivityLogger) {
        this.orderModel = orderModel;
        this.ActivityLogModel = ActivityLogModel;
        this.activityLogService = activityLogService;
        this.acivityLogger = acivityLogger;
    }
    async createOrder(createOrderDto) {
        try {
            const { productId, userId, firstName, lastName, email, phoneNumber, productName, price, description, stock, totalAmount, orderDate, address, city, state, zipcode, country, appliedCoupenId, IGST, SGST, returnStatus, orderStatus } = createOrderDto;
            if (productId) {
                const newOrder = await this.orderModel.create({
                    product_id: productId,
                    user_id: userId,
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone_number: phoneNumber,
                    product_name: productName,
                    price: price,
                    description: description,
                    stock: stock,
                    total_amount: totalAmount,
                    order_date: orderDate,
                    address: address,
                    city: city,
                    state: state,
                    zipcode: zipcode,
                    country: country,
                    applied_coupen_id: appliedCoupenId,
                    IGST: IGST,
                    SGST: SGST,
                    return_status: returnStatus,
                    order_status: orderStatus,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
                return newOrder;
            }
            else {
                throw new Error('This Product is not available');
            }
        }
        catch (error) {
            console.error('Error creating Order:', error);
            throw new common_1.BadRequestException('Could not create Order.');
        }
    }
    async allOrderListing(reqUser, reqbody) {
        try {
            let orderColumn = reqbody.order_column || 'id';
            let sortOrder = reqbody.order_direction === 'desc' ? 'DESC' : 'ASC';
            let filterValue = reqbody.search || '';
            let offset = parseInt(reqbody.per_page) * (parseInt(reqbody.current_page) - 1);
            let limit = parseInt(reqbody.per_page) || 5;
            let order = [[orderColumn, sortOrder]];
            let whereClause = { deleted_at: null };
            if (filterValue) {
                whereClause[sequelize_2.Op.or] = [
                    {
                        first_name: { [sequelize_2.Op.like]: `%${filterValue}%` },
                        last_name: { [sequelize_2.Op.like]: `%${filterValue}%` },
                    },
                ];
            }
            const { count, rows } = await this.orderModel.findAndCountAll({
                where: whereClause,
                attributes: [
                    'id',
                    'product_id',
                    'user_id',
                    'first_name',
                    'last_name',
                    'email',
                    'phone_number',
                    'product_name',
                    'price',
                    'description',
                    'stock',
                    'total_amount',
                    'order_date',
                    'address',
                    'city',
                    'state',
                    'zipcode',
                    'country',
                    'applied_coupen_id',
                    'IGST',
                    'SGST',
                    'return_status',
                    'order_status',
                    'created_at',
                    'updated_at',
                ],
                offset: offset,
                order: order,
                limit: limit,
                raw: true,
                nest: true,
            });
            const formattedRows = rows.map(row => ({
                ...row,
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(row.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(row.updated_at))
            }));
            return {
                totalRecords: count,
                order_listing: formattedRows,
            };
        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
    async getOrderById(reqUser, id) {
        try {
            const data = await this.orderModel.findOne({ where: { id, deleted_at: null } });
            if (!data) {
                throw new Error('Order not found');
            }
            const formattedData = {
                ...data.get(),
                created_at: (0, dateFormat_1.formatTimestamp)(new Date(data.created_at)),
                updated_at: (0, dateFormat_1.formatTimestamp)(new Date(data.updated_at)),
            };
            return formattedData;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async updateOrderById(orderId, reqBody) {
        try {
            const order = await this.orderModel.findByPk(orderId);
            if (!order) {
                throw new common_1.NotFoundException('Order not found');
            }
            await order.update(reqBody);
            return order;
        }
        catch (error) {
            console.error('Error:', error);
            throw new common_1.BadRequestException('Could not update order.');
        }
    }
    async deleteOrderById(reqUser, orderId) {
        try {
            const order = await this.orderModel.findByPk(orderId);
            if (!order) {
                throw new Error('Order not found');
            }
            await order.destroy();
        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
    async findByStatus(order_status) {
        try {
            const orders = await this.orderModel.findAll({
                where: { order_status },
            });
            return orders;
        }
        catch (error) {
            console.error('Error:', error);
            throw new Error('Something went wrong');
        }
    }
};
__decorate([
    activityLogger_1.ActivityLogger.createLog('Order', 'Listing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "allOrderListing", null);
__decorate([
    activityLogger_1.ActivityLogger.createLog('Order', 'Listing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrderService.prototype, "getOrderById", null);
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(order_schema_1.Orders)),
    __param(1, (0, sequelize_1.InjectModel)(activity_log_schema_1.ActivityLog)),
    __metadata("design:paramtypes", [Object, Object, activity_log_service_1.ActivityLogService,
        activityLogger_1.ActivityLogger])
], OrderService);
//# sourceMappingURL=order.service.js.map